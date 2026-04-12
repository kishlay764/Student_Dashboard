import React, { useState, useEffect } from 'react';

import { 
    DndContext, 
    closestCorners, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors,
} from '@dnd-kit/core';
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { 
    Plus, 
    CheckCircle2, 
    Circle,
    Columns,
    List
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../utils/cn';
import API_BASE_URL from "../config";

// --- Sortable Task Item ---
const SortableTask = ({ task, onToggle, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "group p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
                isDragging && "opacity-50 ring-2 ring-blue-500/50"
            )}
        >
            <div className="flex items-start gap-3">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle(task);
                    }}
                    className={cn(
                        "mt-0.5 transition-colors",
                        task.status === "Completed" ? "text-green-500" : "text-slate-300 hover:text-blue-500"
                    )}
                >
                    {task.status === "Completed" ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>
                <div className="flex-1 space-y-2">
                    <p className={cn(
                        "text-sm font-medium leading-tight",
                        task.status === "Completed" ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"
                    )}>
                        {task.text}
                    </p>
                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider",
                            task.priority === "High" ? "bg-red-50 dark:bg-red-900/20 text-red-600" : 
                            task.priority === "Medium" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : 
                            "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        )}>
                            {task.priority}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task._id);
                    }}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                >
                    <Plus size={16} className="rotate-45" />
                </button>
            </div>
        </div>
    );
};

// --- Column Component ---
const Column = ({ id, title, tasks, onToggle, onDelete }) => {
    return (
        <div className="flex flex-col gap-4 w-full min-w-[300px]">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 italic">{title}</h3>
                    <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500">
                        {tasks.length}
                    </span>
                </div>
            </div>

            <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                <div className="flex-1 space-y-3 p-2 bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors min-h-[500px]">
                    {tasks.map((task) => (
                        <SortableTask key={task._id} task={task} onToggle={onToggle} onDelete={onDelete} />
                    ))}
                    {tasks.length === 0 && (
                        <div className="h-24 flex items-center justify-center text-xs text-slate-400 font-medium italic">
                            Empty column
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
};

// --- Main Tasks Page (Kanban) ---
const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/tasks`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setTasks(data);
        } catch (err) {
            console.error("Failed to fetch tasks");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (task) => {
        const newStatus = task.status === "Completed" ? "To Do" : "Completed";
        try {
            const res = await fetch(`${API_BASE_URL}/api/tasks/${task._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data._id) {
                setTasks(prev => prev.map(t => t._id === task._id ? data : t));
            }
        } catch (err) {
            console.error("Update failed");
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            setTasks(prev => prev.filter(t => t._id !== id));
        } catch (err) {
            console.error("Delete failed");
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeTask = tasks.find(t => t._id === activeId);
        if (!activeTask) return;

        // Check if dropped over a column or another task
        const columns = [
            { id: "To Do", title: "To Do" },
            { id: "In Progress", title: "In Progress" },
            { id: "Completed", title: "Completed" }
        ];
        
        const overColumn = columns.find(c => c.id === overId);
        const overTask = tasks.find(t => t._id === overId);
        
        let newStatus = null;
        if (overColumn) {
            newStatus = overColumn.id;
        } else if (overTask) {
            newStatus = overTask.status;
        }

        if (newStatus && activeTask.status !== newStatus) {
            // Update UI optimistically
            setTasks(prev => prev.map(t => 
                t._id === activeId ? { ...t, status: newStatus } : t
            ));

            // Sync with Backend
            try {
                await fetch(`${API_BASE_URL}/api/tasks/${activeId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: newStatus })
                });
            } catch (err) {
                console.error("Backend sync failed");
                fetchTasks(); // Revert on failure
            }
        } else if (activeId !== overId) {
            // Reorder within the same column
            const oldIndex = tasks.findIndex(t => t._id === activeId);
            const newIndex = tasks.findIndex(t => t._id === overId);
            const newTasks = arrayMove(tasks, oldIndex, newIndex);
            setTasks(newTasks);

            // Sync reorder with backend
            try {
                await fetch(`${API_BASE_URL}/api/tasks/reorder`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ orderedIds: newTasks.map(t => t._id) })
                });
            } catch (err) {
                console.error("Reorder sync failed");
            }
        }
    };

    const columns = [
        { id: "To Do", title: "To Do" },
        { id: "In Progress", title: "In Progress" },
        { id: "Completed", title: "Completed" }
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 italic tracking-tight">Board</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your pipeline efficiently</p>
                </div>
                <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm">
                    <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-blue-600"><Columns size={18} /></button>
                    <button className="p-2 text-slate-400 hover:text-slate-600"><List size={18} /></button>
                </div>
            </div>

            <DndContext 
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
                    {columns.map(col => (
                        <Column 
                            key={col.id}
                            id={col.id}
                            title={col.title}
                            tasks={tasks.filter(t => t.status === col.id || (col.id === "To Do" && !t.status))}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            </DndContext>
        </div>
    );
};

export default Tasks;
