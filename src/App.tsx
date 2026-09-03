import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import Drive from './pages/Drive';

function App() {
  const { user, loading, setLoading } = useAuthStore();

  useEffect(() => {
    // Since we are using local storage for Google Auth, it loads instantly
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{ 
        style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
      }} />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        {/* Protected Routes Wrapper */}
        <Route path="/" element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/drive" />} />
          <Route path="drive" element={<Drive />} />
          <Route path="recent" element={<div>Recent</div>} />
          <Route path="starred" element={<div>Starred</div>} />
          <Route path="trash" element={<div>Trash</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;