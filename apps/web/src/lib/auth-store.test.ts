import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApi = apiClient as unknown as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

describe('auth-store status state machine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      status: 'checking',
      initError: null,
      require2FA: false,
      twoFactorUserId: null,
      twoFactorEmail: null,
    });
  });

  describe('refreshUser with no token', () => {
    it('transitions to unauthenticated when no token exists', async () => {
      localStorage.removeItem('accessToken');

      await useAuthStore.getState().refreshUser();

      const state = useAuthStore.getState();
      expect(state.status).toBe('unauthenticated');
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.initError).toBeNull();
    });
  });

  describe('refreshUser with valid token', () => {
    it('transitions to authenticated when /auth/me returns user', async () => {
      localStorage.setItem('accessToken', 'test-token');
      mockedApi.get.mockResolvedValueOnce({ id: '1', email: 'a@b.com', username: 'a' });

      await useAuthStore.getState().refreshUser();

      const state = useAuthStore.getState();
      expect(state.status).toBe('authenticated');
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('refreshUser with invalid/expired token', () => {
    it('transitions to unauthenticated and sets initError when /auth/me fails', async () => {
      localStorage.setItem('accessToken', 'bad-token');
      mockedApi.get.mockRejectedValueOnce(new Error('Network error'));

      await useAuthStore.getState().refreshUser();

      const state = useAuthStore.getState();
      expect(state.status).toBe('unauthenticated');
      expect(state.isAuthenticated).toBe(false);
      expect(state.initError).not.toBeNull();
      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });

  describe('login success', () => {
    it('transitions to authenticated and stores token', async () => {
      mockedApi.post.mockResolvedValueOnce({
        user: { id: '1', email: 'a@b.com', username: 'a' },
        accessToken: 'new-token',
      });

      await useAuthStore.getState().login('a@b.com', 'pass');

      const state = useAuthStore.getState();
      expect(state.status).toBe('authenticated');
      expect(state.isAuthenticated).toBe(true);
      expect(localStorage.getItem('accessToken')).toBe('new-token');
    });
  });

  describe('login 2FA required', () => {
    it('transitions to unauthenticated and sets 2FA state', async () => {
      mockedApi.post.mockResolvedValueOnce({
        require2FA: true,
        userId: 'user-1',
        email: 'a@b.com',
      });

      await useAuthStore.getState().login('a@b.com', 'pass');

      const state = useAuthStore.getState();
      expect(state.status).toBe('unauthenticated');
      expect(state.require2FA).toBe(true);
      expect(state.twoFactorUserId).toBe('user-1');
    });
  });

  describe('logout', () => {
    it('transitions to unauthenticated and clears token', async () => {
      useAuthStore.setState({ status: 'authenticated', isAuthenticated: true, user: { id: '1' } as any });
      localStorage.setItem('accessToken', 'token');
      mockedApi.post.mockResolvedValueOnce({});

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.status).toBe('unauthenticated');
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });

  describe('clearInitError', () => {
    it('clears initError without changing status', () => {
      useAuthStore.setState({ status: 'unauthenticated', initError: 'err' });
      useAuthStore.getState().clearInitError();
      expect(useAuthStore.getState().initError).toBeNull();
      expect(useAuthStore.getState().status).toBe('unauthenticated');
    });
  });
});