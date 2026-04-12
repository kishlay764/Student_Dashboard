import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Play, 
    Pause, 
    RotateCcw, 
    Volume2, 
    VolumeX
} from "lucide-react";
import { cn } from "../utils/cn";
import API_BASE_URL from "../config";

const Focus = () => {
    const [seconds, setSeconds] = useState(1500);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState("work"); // work, break
    const [ambient, setAmbient] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        let interval = null;
        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds(prev => prev - 1);
            }, 1000);
        } else if (seconds === 0) {
            setIsActive(false);
            
            // Award EXP logic
            if (mode === "work") {
                fetch(`${API_BASE_URL}/api/auth/award-exp`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ exp: 50 }) // Full page focus awards more!
                }).catch(err => console.error(err));
            }

            const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
            audio.play().catch(e => console.log("Audio play blocked"));
        }
        return () => clearInterval(interval);
    }, [isActive, seconds, mode, token]);

    const formatTime = (s) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min}:${sec < 10 ? "0" : ""}${sec}`;
    };

    const toggle = () => setIsActive(!isActive);
    const reset = () => {
        setIsActive(false);
        setSeconds(mode === "work" ? 1500 : 300);
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient Background Glow */}
            <motion.div 
                animate={{ 
                    scale: isActive ? [1, 1.2, 1] : 1,
                    opacity: isActive ? [0.1, 0.2, 0.1] : 0.05 
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className={cn(
                    "absolute w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000",
                    mode === "work" ? "bg-blue-600" : "bg-emerald-600"
                )}
            />

            {/* Main Zen UI */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-12 w-full max-w-lg">
                <div className="space-y-4">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400"
                    >
                        {mode === "work" ? "Focusing" : "Resting"}
                    </motion.h1>
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-[12rem] font-black tracking-tighter text-slate-900 dark:text-slate-100 leading-none tabular-nums select-none"
                    >
                        {formatTime(seconds)}
                    </motion.div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-8">
                    <button 
                        onClick={reset}
                        className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-all active:scale-90"
                    >
                        <RotateCcw size={24} />
                    </button>

                    <button 
                        onClick={toggle}
                        className={cn(
                            "w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all shadow-2xl active:scale-95",
                            isActive 
                                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900" 
                                : "bg-blue-600 text-white shadow-blue-500/20"
                        )}
                    >
                        {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
                    </button>

                    <button 
                        onClick={() => setAmbient(!ambient)}
                        className={cn(
                            "p-4 rounded-2xl transition-all active:scale-90",
                            ambient 
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" 
                                : "bg-slate-100 dark:bg-slate-900 text-slate-500"
                        )}
                    >
                        {ambient ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </button>
                </div>

                {/* Mode Toggles */}
                <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <button 
                        onClick={() => { setMode("work"); reset(); }}
                        className={cn(
                            "px-8 py-2.5 rounded-xl text-xs font-bold transition-all",
                            mode === "work" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-400"
                        )}
                    >
                        Work
                    </button>
                    <button 
                        onClick={() => { setMode("break"); reset(); }}
                        className={cn(
                            "px-8 py-2.5 rounded-xl text-xs font-bold transition-all",
                            mode === "break" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-400"
                        )}
                    >
                        Break
                    </button>
                </div>

                <AnimatePresence>
                    {ambient && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/20 px-4 py-2 rounded-full flex items-center gap-3"
                        >
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Ambient Rain Playing</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 text-slate-400">
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold">2/4</span>
                    <span className="text-[10px] uppercase tracking-widest">Sessions</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold">50m</span>
                    <span className="text-[10px] uppercase tracking-widest">Total Focused</span>
                </div>
            </div>
        </div>
    );
};

export default Focus;
