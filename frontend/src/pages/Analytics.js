import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    Target, 
    Zap, 
    ArrowUpRight, 
    Award,
    Trophy
} from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import API_BASE_URL from "../config";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from "chart.js";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/analytics/stats`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch analytics");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    // --- Chart Configurations ---
    const lineData = {
        labels: stats?.trend?.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
            label: "Tasks Completed",
            data: stats?.trend?.data || [0, 0, 0, 0, 0, 0, 0],
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: "#2563eb",
        }]
    };

    const doughnutData = {
        labels: ["Completed", "Pending"],
        datasets: [{
            data: stats ? [stats.completedTasks, stats.pendingTasks] : [1, 1],
            backgroundColor: ["#10b981", "#f1f5f9"],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#1e293b",
                padding: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                cornerRadius: 8,
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
            y: { grid: { color: "rgba(148, 163, 184, 0.1)" }, ticks: { color: "#94a3b8" } }
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 italic tracking-tight">Analytics</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Insights into your productivity patterns</p>
            </div>

            {/* Performance Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Level Progress", val: `Level ${stats?.level}`, icon: Award, color: "blue", trend: "+1 level" },
                    { label: "Active Streak", val: `${stats?.streak} Days`, icon: Zap, color: "orange", trend: "Top 5%" },
                    { label: "Completion Rate", val: `${stats?.completionRate}%`, icon: Target, color: "green", trend: "+12.5%" },
                    { label: "Total EXP", val: `${stats?.exp} XP`, icon: Trophy, color: "purple", trend: "In Progress" }
                ].map((item, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="card group hover:border-blue-500/30 transition-all cursor-default"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 bg-${item.color}-50 dark:bg-${item.color}-900/20 rounded-xl`}>
                                <item.icon size={20} className={`text-${item.color}-600`} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{item.val}</h3>
                        <div className="mt-4 flex items-center gap-1.5">
                            <ArrowUpRight size={14} className="text-green-500" />
                            <span className="text-xs font-semibold text-green-500">{item.trend}</span>
                            <span className="text-[10px] text-slate-400 ml-auto">This month</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Trend Chart */}
                <div className="lg:col-span-2 card">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 italic">Productivity Trend</h2>
                            <p className="text-xs text-slate-500">Tasks completed over the last 7 days</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white shadow-lg">Weekly</button>
                            <button className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">Monthly</button>
                        </div>
                    </div>
                    <div className="h-[300px] relative">
                        <Line data={lineData} options={chartOptions} />
                    </div>
                </div>

                {/* Distribution Chart */}
                <div className="card flex flex-col items-center justify-center text-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-8 italic self-start">Task Distribution</h2>
                    <div className="h-[220px] w-full relative mb-6">
                        <Doughnut data={doughnutData} options={{...chartOptions, cutout: '75%'}} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats?.completionRate}%</span>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Done</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 w-full gap-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{stats?.totalTasks}</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Solved</p>
                            <p className="text-lg font-bold text-blue-600">{stats?.completedTasks}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Productivity Grid (Heatmap) */}
            <div className="card">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 italic">Activity Heatmap</h2>
                        <p className="text-xs text-slate-500">Your engagement over the last few weeks</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Less <div className="flex gap-1"><div className="w-3 h-3 bg-slate-100 dark:bg-slate-800 rounded-sm"></div><div className="w-3 h-3 bg-blue-200 rounded-sm"></div><div className="w-3 h-3 bg-blue-400 rounded-sm"></div><div className="w-3 h-3 bg-blue-600 rounded-sm"></div></div> More
                    </div>
                </div>
                
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-2 min-w-[800px]">
                        {Array.from({ length: 26 }).map((_, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-1.5 flex-1">
                                {Array.from({ length: 7 }).map((_, dayIndex) => {
                                    // Simulated intensity
                                    const intensities = ["bg-slate-100 dark:bg-slate-800", "bg-blue-100 dark:bg-blue-900/40", "bg-blue-300 dark:bg-blue-700/60", "bg-blue-500", "bg-blue-700"];
                                    const intensity = intensities[Math.floor(Math.random() * intensities.length)];
                                    return (
                                        <div 
                                            key={dayIndex} 
                                            className={`aspect-square w-full rounded-[4px] hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer ${intensity}`}
                                            title="Task intensity"
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;