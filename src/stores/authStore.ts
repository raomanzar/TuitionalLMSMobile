import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { setAuthToken, setUnauthorizedHandler } from '@/services/axios/config';
import type { User_Type } from '@/types/auth.types';
import { secureStorage } from './middleware/secureStorage';

type AuthState = {
  token: string | null;
  user: User_Type | null;
  hasHydrated: boolean;
  actions: {
    signIn: (token: string, user?: User_Type) => void;
    signOut: () => void;
    setUser: (user: User_Type | null) => void;
    setHasHydrated: (value: boolean) => void;
  };
};

const STORAGE_KEY = 'auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      actions: {
        signIn: (token, user) => {
          setAuthToken(token);
          set({ token, user: user ?? null });
        },
        signOut: () => {
          setAuthToken(null);
          set({ token: null, user: null });
        },
        setUser: (user) => set({ user }),
        setHasHydrated: (value) => set({ hasHydrated: value }),
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => secureStorage),
      // Persist only data — actions and the hydration flag are runtime-only.
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setAuthToken(state.token);
        useAuthStore.setState({ hasHydrated: true });
      },
    },
  ),
);

// ─── Selectors ─────────────────────────────────────────────────
// Prefer these in components — they re-render only on the slice they read.
// `useAuthActions` returns a stable reference, safe to use in deps.

export const useAuthToken = () => useAuthStore((s) => s.token);
export const useAuthUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => Boolean(s.token));
export const useAuthHasHydrated = () => useAuthStore((s) => s.hasHydrated);
export const useAuthActions = () => useAuthStore((s) => s.actions);

// ─── Session-expiry bridge ────────────────────────────────────
// The axios response interceptor calls this when a token-carrying request
// comes back 401, so the store can clear auth — the protected-layout guard
// then handles the redirect to `/signin`. Wired here (not in axios/config.ts)
// to avoid a circular import: the store knows about axios, not vice versa.
setUnauthorizedHandler(() => {
  useAuthStore.getState().actions.signOut();
});
