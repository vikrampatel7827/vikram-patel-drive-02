import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { Shield, Key, Cloud } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [tokenInput, setTokenInput] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      toast.error("Please enter a valid access token");
      return;
    }
    
    // Inject the manual token into the Zustand store to authenticate
    useAuthStore.setState({ 
      user: { accessToken: tokenInput.trim() },
      loading: false 
    });
    
    toast.success("Vault Unlocked!");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-brand-500/10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-500/20 text-brand-400 rounded-2xl flex items-center justify-center mb-4">
            <Cloud className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Encrypted Vault</h1>
          <p className="text-slate-400 text-sm mt-2 text-center flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" /> Firewall Bypass Active
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Google Access Token</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste your active OAuth token..."
                className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-brand-500 transition-colors"
          >
            Access Secure Drive
          </button>
        </form>
      </motion.div>
    </div>
  );
}