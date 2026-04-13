import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => {
        localStorage.setItem('auth_token', token);
        set({ token });
      },
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ token: null });
      },
    }),
    { name: 'auth-store' },
  ),
);
