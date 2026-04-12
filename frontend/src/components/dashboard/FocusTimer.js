import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, Music, Volume2, VolumeX, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import API_BASE_URL from "../../config";

const FocusTimer = () => {
  const [seconds, setSeconds] = useState(1500);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // work, shortBreak, longBreak
  const [musicEnabled, setMusicEnabled] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      // Award EXP for successful work session
      if (mode === 'work') {
        fetch(`${API_BASE_URL}/api/auth/award-exp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ exp: 20 })
        }).catch(err => console.error("Failed to award EXP"));
      }
      
      const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
      audio.play().catch(e => console.log("Audio play blocked"));
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, mode, token]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(mode === 'work' ? 1500 : mode === 'shortBreak' ? 300 : 900);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setSeconds(newMode === 'work' ? 1500 : newMode === 'shortBreak' ? 300 : 900);
  };

  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const progress = (seconds / (mode === 'work' ? 1500 : mode === 'shortBreak' ? 300 : 900)) * 100;

  return (
    <div className="card space-y-6 overflow-hidden relative">
      {/* Decorative Background Icon */}
      <div className="absolute top-[-20px] right-[-20px] opacity-5 dark:opacity-10 text-blue-600">
        <Clock size={120} />
      </div>

      <div className="flex items-center justify-between relative z-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Focus Session
          <Zap size={18} className="text-blue-600" />
        </h2>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => switchMode('work')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${mode === 'work' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            Work
          </button>
          <button 
            onClick={() => switchMode('shortBreak')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${mode === 'shortBreak' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            Break
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-4 relative">
        {/* Progress Ring and Timer */}
        <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform">
                <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800"
                />
                <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={552.92}
                    initial={{ strokeDashoffset: 552.92 }}
                    animate={{ strokeDashoffset: 552.92 - (552.92 * (100 - progress)) / 100 }}
                    transition={{ duration: 1, ease: "linear" }}
                    className="text-blue-600"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tighter tabular-nums">
                    {formatTime(seconds)}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">
                    {mode === 'work' ? 'Stay Focused' : 'Rest Up'}
                </span>
            </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 relative z-10">
        <Button 
            variant="secondary" 
            onClick={resetTimer}
            className="w-12 h-12 rounded-full p-0 flex items-center justify-center"
        >
            <RotateCcw size={20} />
        </Button>
        <Button 
            onClick={toggleTimer}
            className="w-16 h-16 rounded-full p-0 flex items-center justify-center scale-110 shadow-blue-500/20"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={isActive ? 'pause' : 'play'}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                >
                    {isActive ? <Pause fill="currentColor" size={28} /> : <Play fill="currentColor" size={28} />}
                </motion.div>
            </AnimatePresence>
        </Button>
        <Button 
            variant={musicEnabled ? "primary" : "secondary"}
            onClick={() => setMusicEnabled(!musicEnabled)}
            className={`w-12 h-12 rounded-full p-0 flex items-center justify-center transition-all ${musicEnabled ? 'bg-blue-600 text-white' : ''}`}
        >
            {musicEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </Button>
      </div>

      <AnimatePresence>
        {musicEnabled && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Music size={16} className="text-blue-600 animate-pulse" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none">Ambient Music</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Deep Focus Lo-fi</p>
                    </div>
                </div>
                {/* Audio tag for actual sound could go here */}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FocusTimer;
