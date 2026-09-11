import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: { accessToken: string } | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      setLoading: (loading) => set({ loading }),
      logout: () => {
        set({ user: null });
        // Permanently destroy the ghost session in local storage
        localStorage.removeItem('drive-auth-storage');
        // Force a hard redirect to reset the router state
        window.location.href = '/login'; 
      },
    }),
    {
      name: 'drive-auth-storage',
    }
  )
);