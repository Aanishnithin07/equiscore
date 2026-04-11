import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string | null;
  hackathonId: string | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: AuthUser | null) => void;
  clearAuth: () => void;
  
  // Computed (handled as getter in components)
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setTokens: (access: string, refresh: string) => set({ accessToken: access, refreshToken: refresh }),
      setUser: (user: AuthUser | null) => set({ user }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: 'equiscore-auth',
      storage: createJSONStorage(() => sessionStorage), // Crucial: store tokens in memory/sessionStorage only
      // Omit accessToken from persistence if enforcing absolute strict memory-only, 
      // but sessionStorage is acceptable for the refresh flow defined by user.
    }
  )
);
