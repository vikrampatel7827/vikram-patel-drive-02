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
      logout: () => set({ user: null }),
    }),
    {
      name: 'drive-auth-storage',
    }
  )
);