'use client';

import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import { User } from '@types';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  status: AuthStatus;
  initError: string | null;
  // 2FA state
  require2FA: boolean;
  twoFactorUserId: string | null;
  twoFactorEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  verify2FALogin: (token: string) => Promise<void>;
  register: (data: { email: string; username: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  clear2FA: () => void;
  clearInitError: () => void;
}

function resolvedState(authStatus: AuthStatus, user: User | null, extra?: Partial<AuthState>): Partial<AuthState> {
  return {
    user,
    isAuthenticated: authStatus === 'authenticated',
    isLoading: authStatus === 'checking',
    status: authStatus,
    initError: null,
    ...extra,
  };
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  status: 'checking',
  initError: null,
  require2FA: false,
  twoFactorUserId: null,
  twoFactorEmail: null,

  login: async (email: string, password: string) => {
    const response = await apiClient.post<{ user: User; accessToken: string } | { require2FA: boolean; userId: string; email: string }>('/auth/login', { email, password });

    if ('require2FA' in response) {
      set({
        require2FA: true,
        twoFactorUserId: response.userId,
        twoFactorEmail: response.email,
        ...resolvedState('unauthenticated', null),
      });
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.accessToken);
    }
    set({
      ...resolvedState('authenticated', response.user),
      require2FA: false,
      twoFactorUserId: null,
      twoFactorEmail: null,
    });
  },

  verify2FALogin: async (token: string) => {
    const { twoFactorUserId } = useAuthStore.getState();
    if (!twoFactorUserId) {
      throw new Error('No 2FA session');
    }

    const response = await apiClient.post<{ user: User; accessToken: string }>('/auth/2fa/login', { userId: twoFactorUserId, token });

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.accessToken);
    }
    set({
      ...resolvedState('authenticated', response.user),
      require2FA: false,
      twoFactorUserId: null,
      twoFactorEmail: null,
    });
  },

  register: async (data) => {
    const response = await apiClient.post<{ user: User; accessToken: string }>('/auth/register', data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.accessToken);
    }
    set(resolvedState('authenticated', response.user));
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore logout API errors; clear local state regardless
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
    set({
      ...resolvedState('unauthenticated', null),
      require2FA: false,
      twoFactorUserId: null,
      twoFactorEmail: null,
    });
  },

  refreshUser: async () => {
    if (typeof window === 'undefined') {
      set(resolvedState('unauthenticated', null));
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      set(resolvedState('unauthenticated', null));
      return;
    }

    try {
      const user = await apiClient.get<User>('/auth/me');
      set(resolvedState('authenticated', user));
    } catch (error) {
      localStorage.removeItem('accessToken');
      const message = error instanceof Error ? error.message : 'Gagal memverifikasi sesi';
      set({ ...resolvedState('unauthenticated', null), initError: message });
    }
  },

  setUser: (user) => set({ ...resolvedState(user ? 'authenticated' : 'unauthenticated', user) }),

  clear2FA: () => set({ require2FA: false, twoFactorUserId: null, twoFactorEmail: null }),

  clearInitError: () => set({ initError: null }),
}));