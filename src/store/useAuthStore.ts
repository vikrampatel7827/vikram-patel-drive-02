import { create } from 'zustand';

interface AuthState {
  user: any | null;
  accessToken: string | null;
  loading: boolean;
  setUser: (user: any | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // We save the session in local storage so you stay logged in after refreshing
  user: JSON.parse(localStorage.getItem('vikram_user') || 'null'),
  accessToken: localStorage.getItem('vikram_token') || null,
  loading: false,
  setUser: (user) => {
    localStorage.setItem('vikram_user', JSON.stringify(user));
    set({ user });
  },
  setAccessToken: (token) => {
    if (token) localStorage.setItem('vikram_token', token);
    else localStorage.removeItem('vikram_token');
    set({ accessToken: token });
  },
  setLoading: (loading) => set({ loading }),
  logout: () => {
    localStorage.removeItem('vikram_user');
    localStorage.removeItem('vikram_token');
    set({ user: null, accessToken: null });
  }
}));