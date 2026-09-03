import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Cloud, Loader2, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const { setUser, setAccessToken } = useAuthStore();
  const navigate = useNavigate();

  // AUTOMATIC OFFICE BYPASS: If a default token is hardcoded in Vercel, auto-login instantly!
  useEffect(() => {
    const defaultToken = import.meta.env.VITE_DEFAULT_TOKEN;
    if (defaultToken && !localStorage.getItem('vikram_token')) {
      handleAutoLogin(defaultToken);
    }
  }, []);

  const handleAutoLogin = async (token: string) => {
    setLoading(true);
    try {
      const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      setUser(userInfo.data);
      setAccessToken(token.trim());
      toast.success(`Office Auto-Login successful, ${userInfo.data.name}!`);
      navigate('/drive');
    } catch (error) {
      console.error('Auto-login token expired or invalid');
    } finally {
      setLoading(false);
    }
  };

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        setUser(userInfo.data);
        setAccessToken(tokenResponse.access_token);
        toast.success(`Welcome to your cloud, ${userInfo.data.name}!`);
        navigate('/drive');
      } catch (error) {
        toast.error('Failed to fetch user profile.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error('Google Login Failed.');
      setLoading(false);
    },
  });

  const handleManualTokenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      toast.error('Please enter a valid access token.');
      return;
    }
    handleAutoLogin(manualToken);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
          
          <div className="flex flex-col items-center mb-8">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-tr from-brand-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-500/20"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <Cloud className="text-white w-8 h-8" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Vikram Patel Drive</h1>
            <p className="text-slate-400 text-sm">Your files. Your cloud. Your control.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Authenticating secure office session...</p>
            </div>
          ) : !showTokenInput ? (
            <div className="space-y-4">
              <button
                onClick={() => login()}
                className="w-full bg-white hover:bg-slate-50 text-slate-900 rounded-xl py-3.5 font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <button
                onClick={() => setShowTokenInput(true)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl py-3 font-semibold flex items-center justify-center gap-2 text-sm transition-colors border border-slate-700"
              >
                <KeyRound className="w-4 h-4 text-brand-400" />
                Office Login (Use Access Token)
              </button>
            </div>
          ) : (
            <form onSubmit={handleManualTokenLogin} className="space-y-4">
              <div className="text-left">
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Paste Google OAuth Token:</label>
                <input
                  type="password"
                  placeholder="ya29.a0..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTokenInput(false)}
                  className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl py-3 font-semibold text-sm transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-lg"
                >
                  Login <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure Office Firewall Bypass Enabled
          </div>
        </div>
      </motion.div>
    </div>
  );
}