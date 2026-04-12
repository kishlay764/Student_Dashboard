import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, CheckCircle2, Circle, Clock, TrendingUp, Zap, Flame } from "lucide-react";
import FocusTimer from "../components/dashboard/FocusTimer";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { cn } from "../utils/cn";

function Dashboard() {
    const [task, setTask] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Tasks
                const tasksRes = await fetch("/api/tasks", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const tasksData = await tasksRes.json();
                if (Array.isArray(tasksData)) setTasks(tasksData);

                // Fetch Stats
                const statsRes = await fetch("/api/analytics/stats", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const statsData = await statsRes.json();
                setStats(statsData);

            } catch (err) {
                console.error("Failed to fetch dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const addTask = async (e) => {
        if (e) e.preventDefault();
        if (task === "") return;

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ text: task, priority })
            });

            const data = await res.json();
            if (data._id) {
                setTasks([data, ...tasks]);
                setTask("");
                
                // Refresh stats
                const statsRes = await fetch("/api/analytics/stats", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const statsData = await statsRes.json();
                setStats(statsData);
            }
        } catch (err) {
            console.error("Failed to add task");
        }
    };

    const toggleStatus = async (t) => {
        // Improved logic: If completed -> To Do. Otherwise -> Completed.
        const newStatus = t.status === "Completed" ? "To Do" : "Completed";
        try {
            const res = await fetch(`/api/tasks/${t._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data._id) {
                setTasks(tasks.map(task => task._id === t._id ? data : task));
                // Refresh stats
                const statsRes = await fetch("/api/analytics/stats", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const statsData = await statsRes.json();
                setStats(statsData);
            }
        } catch (err) {
            console.error("Failed to update task status");
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`/api/tasks/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            setTasks(prev => prev.filter(t => t._id !== id));
            // Refresh stats
             const statsRes = await fetch("/api/analytics/stats", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const statsData = await statsRes.json();
            setStats(statsData);
        } catch (err) {
            console.error("Failed to delete task");
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };



    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 italic tracking-tight">Student Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Ready to crush your goals today?</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center gap-2 border border-blue-100 dark:border-blue-800/50">
                        <Zap size={18} className="text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Level {stats?.level || 1} • {stats?.exp || 0} Exp</span>
                    </div>
                    <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center gap-2 border border-orange-100 dark:border-orange-800/50">
                        <Flame size={18} className="text-orange-600" />
                        <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">{stats?.streak || 0} Day Streak</span>
                    </div>
                </div>
            </div>

            {/* Top Stats */}
            <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <div className="card bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none relative overflow-hidden group">
                    <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Completed Tasks</p>
                            <h3 className="text-4xl font-bold mt-1 tracking-tighter">{stats?.completedTasks || 0}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-blue-100 text-sm relative z-10">
                        <TrendingUp size={16} />
                        <span>Total: {tasks.length} tasks</span>
                    </div>
                </div>

                <div className="card relative overflow-hidden group">
                    <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Completion Rate</p>
                            <h3 className="text-4xl font-bold mt-1 text-slate-900 dark:text-slate-100 tracking-tighter">{stats?.completionRate || 0}%</h3>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                            <Zap className="text-green-600" size={24} />
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden relative z-10">
                        <div 
                            className="bg-green-500 h-full rounded-full shadow-[0_0_12px_rgba(34,197,94,0.4)] transition-all duration-1000" 
                            style={{ width: `${stats?.completionRate || 0}%` }}
                        ></div>
                    </div>
                </div>

                <div className="card relative overflow-hidden group">
                    <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Tasks</p>
                            <h3 className="text-4xl font-bold mt-1 text-slate-900 dark:text-slate-100 tracking-tighter">{stats?.pendingTasks || 0}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                            <Clock className="text-purple-600" size={24} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-slate-500 text-sm relative z-10">
                        <span className="text-purple-600 font-bold">Focus</span>
                        <span className="dark:text-slate-500 text-slate-400">• High priority remaining</span>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tasks Section */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            Recent Tasks
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-500">
                                {tasks.length}
                            </span>
                        </h2>
                    </div>

                    <form onSubmit={addTask} className="space-y-4">
                        <div className="flex gap-2">
                             <Input 
                                value={task}
                                onChange={(e) => setTask(e.target.value)}
                                placeholder="Add a new task..."
                                className="bg-slate-50 dark:bg-slate-950 px-5"
                            />
                            <Button type="submit" className="shrink-0 h-12 w-12 flex items-center justify-center rounded-xl shadow-blue-500/20">
                                <Plus size={24} />
                            </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Priority:</span>
                            {['Low', 'Medium', 'High'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                                        priority === p 
                                            ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent shadow-md" 
                                            : "bg-transparent text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </form>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : tasks.length > 0 ? (
                            tasks.slice(0, 5).map((t, i) => (
                                <motion.div 
                                    key={t._id || i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group"
                                >
                                    <button 
                                        onClick={() => toggleStatus(t)}
                                        className={cn(
                                        "transition-colors",
                                        t.status === "Completed" ? "text-green-500" : "text-slate-300 hover:text-blue-500"
                                    )}>
                                        {t.status === "Completed" ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                    </button>
                                    <span className={cn(
                                        "flex-1 font-medium transition-all",
                                        t.status === "Completed" ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-300"
                                    )}>
                                        {t.text}
                                    </span>
                                    <span className={cn(
                                        "text-xs px-2 py-1 rounded-lg font-bold",
                                        t.priority === "High" ? "bg-red-50 dark:bg-red-900/20 text-red-600" : 
                                        t.priority === "Medium" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : 
                                        "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                    )}>
                                        {t.priority}
                                    </span>
                                    <button 
                                        onClick={() => handleDelete(t._id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                                    >
                                        <Plus size={16} className="rotate-45" />
                                    </button>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                No tasks yet. Add one above!
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Focus Timer Section */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                >
                    <FocusTimer />
                    
                    {/* Activity Chart Placeholder */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Weekly Activity</h2>
                            <TrendingUp size={20} className="text-blue-600" />
                        </div>
                        <div className="h-48 w-full flex items-end justify-between gap-1 px-2">
                            {(stats?.trend?.data || [20, 40, 30, 50, 40, 60, 45]).map((value, i) => (
                                <div key={i} className="flex-1 space-y-2 flex flex-col items-center group">
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(value / (Math.max(...(stats?.trend?.data || [10]), 10))) * 100}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.1 }}
                                        className={cn(
                                            "w-full rounded-t-lg transition-all duration-300",
                                            i === 6 ? "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "bg-slate-200 dark:bg-slate-800"
                                        )}
                                    />
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {(stats?.trend?.labels || ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'])[i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default Dashboard;