import { useState, useEffect } from "react";
import Timer from "../components/Timer";
import "../styles/dashboard.css";

function Dashboard() {

    const [task, setTask] = useState("")
    const [tasks, setTasks] = useState([])

    const token = localStorage.getItem("token")

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        const res = await fetch("/api/tasks", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (Array.isArray(data)) {
            setTasks(data)
        }
    }

    const addTask = async () => {
        if (task === "") return

        const res = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text: task })
        })

        const data = await res.json()
        if (data._id) {
            setTasks([...tasks, data])
            setTask("")
        }
    }

    return (
        <div className="dashboard">

            <h1>Dashboard</h1>

            <div className="card-container">

                <div className="card">
                    <h3>Total Tasks</h3>
                    <p>{tasks.length}</p>
                </div>

                <div className="card">
                    <h3>Completed</h3>
                    <p>0</p>
                </div>

            </div>

            <h2>Add Task</h2>

            <input
                className="task-input"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Enter task"
            />

            <button className="add-btn" onClick={addTask}>
                Add
            </button>

            <ul>
                {
                    tasks.map((t, i) => (
                        <li key={t._id || i}>{t.text}</li>
                    ))
                }
            </ul>

            <Timer />

        </div>
    )
}

export default Dashboard;