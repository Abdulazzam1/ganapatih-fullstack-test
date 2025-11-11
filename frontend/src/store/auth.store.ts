// src/store/auth.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

// Buat store
export const useAuthStore = create<AuthState>()(
  // Gunakan 'persist' untuk menyimpan state di localStorage
  persist(
    (set) => ({
      accessToken: null,
      setToken: (token) => set({ accessToken: token }),
      logout: () => set({ accessToken: null }),
    }),
    {
      name: 'auth-storage', // Nama item di localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);