import React, { useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { motion } from 'framer-motion';
import { Cloud, HardDrive, Clock, Star, Trash2, LogOut, Search, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';
import { googleLogout } from '@react-oauth/google';

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const sidebarFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    googleLogout();
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSidebarUploadTrigger = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      toast.success(`Selected ${e.target.files.length} file(s). Go to My Drive to watch them upload!`);
      navigate('/drive');
    }
  };

  const navItems = [
    { icon: HardDrive, label: 'My Drive', path: '/drive' },
    { icon: Clock, label: 'Recent', path: '/recent' },
    { icon: Star, label: 'Starred', path: '/starred' },
    { icon: Trash2, label: 'Trash', path: '/trash' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100 font-sans">
      
      {/* Hidden file input for sidebar + New button */}
      <input 
        type="file" 
        ref={sidebarFileInputRef} 
        onChange={handleSidebarUploadTrigger} 
        className="hidden" 
        multiple 
      />

      {/* Sidebar */}
      <motion.aside initial={{ x: -250 }} animate={{ x: 0 }} className="w-72 flex-shrink-0 border-r border-slate-800/80 bg-slate-900/90 backdrop-blur-xl flex flex-col shadow-2xl">
        <div className="h-20 flex items-center px-8 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-brand-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Cloud className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white block">Vikram Patel</span>
              <span className="text-xs font-bold text-brand-400 tracking-wider uppercase">Cloud Storage</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <button 
            onClick={() => sidebarFileInputRef.current?.click()}
            className="w-full bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white rounded-2xl py-3.5 px-5 flex items-center justify-center gap-3 font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-brand-500/25"
          >
            <Plus className="w-5 h-5 stroke-[3]" /> New Upload
          </button>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all", 
                isActive 
                  ? "bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-inner" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              <item.icon className="w-5 h-5" /> {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-5 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <img 
                src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name || 'V'}&background=0D8ABC&color=fff`} 
                alt="Profile" 
                className="w-10 h-10 rounded-2xl shrink-0 ring-2 ring-brand-500/30"
              />
              <div className="truncate">
                <p className="text-sm font-bold text-white truncate">{user?.name || 'Vikram Patel'}</p>
                <p className="text-xs text-slate-400 truncate font-medium">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        <header className="h-20 flex items-center justify-between px-8 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
              <input type="text" placeholder="Search your cloud encrypted vault..." className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-inner" />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto"><Outlet /></div>
      </main>
    </div>
  );
}