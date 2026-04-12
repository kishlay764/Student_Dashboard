import React from 'react';
import { Sun, Moon, Bell, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Read user from localStorage safely
  const userString = localStorage.getItem('user');
  let user = {};
  if (userString && userString !== 'undefined') {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }
  const userName = user.name || 'User';
  
  // Compute initials (e.g., "John Doe" -> "JD")
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="w-96 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Search tasks, analytics..."
          className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500/50 transition-all text-sm outline-none"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="h-8 w-[1px] bg-slate-200 dark:border-slate-800 mx-2"></div>

        {/* User Profile */}
        <button className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
            {initials}
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{userName}</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
