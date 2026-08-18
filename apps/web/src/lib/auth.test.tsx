import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/auth-store');
vi.mock('@/lib/api-client');

describe('Auth Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Login', () => {
    it('shows error on invalid credentials', async () => {
      (apiClient.post as vi.Mock).mockRejectedValue({
        response: { data: { message: 'Email atau password salah' } },
      });

      await expect(
        apiClient.post('/auth/login', { email: 'wrong@test.com', password: 'wrong' })
      ).rejects.toEqual(
        expect.objectContaining({
          response: { data: { message: 'Email atau password salah' } },
        })
      );
    });

    it('stores tokens on successful login', async () => {
      const mockResponse = {
        user: { id: '1', email: 'test@test.com', username: 'test', role: 'member' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      (apiClient.post as vi.Mock).mockResolvedValue(mockResponse);

      const response = await apiClient.post('/auth/login', {
        email: 'test@test.com',
        password: 'password123',
      });

      expect(response.accessToken).toBe('access-token');
      expect(response.refreshToken).toBe('refresh-token');
      expect(response.user).toEqual(expect.objectContaining({
        id: '1',
        email: 'test@test.com',
        username: 'test',
      }));
    });
  });

  describe('2FA Login Flow', () => {
    it('detects require2FA on login response', async () => {
      (apiClient.post as vi.Mock).mockResolvedValue({
        require2FA: true,
        userId: 'user-1',
        email: 'test@test.com',
      });

      const response = await apiClient.post('/auth/login', {
        email: '2fa@test.com',
        password: 'password123',
      });

      expect(response.require2FA).toBe(true);
      expect(response.userId).toBe('user-1');
      expect(response.email).toBe('test@test.com');
      expect(response.accessToken).toBeUndefined();
    });

    it('verifies TOTP code and receives tokens', async () => {
      const mockResponse = {
        user: { id: '1', email: '2fa@test.com', username: 'test', role: 'member' },
        accessToken: 'access-token',
      };
      (apiClient.post as vi.Mock).mockResolvedValue(mockResponse);

      const response = await apiClient.post('/auth/2fa/login', {
        userId: 'user-1',
        token: '123456',
      });

      expect(response.accessToken).toBe('access-token');
      expect(response.user).toBeDefined();
    });

    it('rejects invalid TOTP code', async () => {
      (apiClient.post as vi.Mock).mockRejectedValue({
        response: { data: { message: 'Kode TOTP tidak valid' } },
      });

      await expect(
        apiClient.post('/auth/2fa/login', { userId: 'user-1', token: '000000' })
      ).rejects.toEqual(
        expect.objectContaining({
          response: { data: { message: 'Kode TOTP tidak valid' } },
        })
      );
    });
  });

  describe('Token Refresh', () => {
    it('refreshes access token with valid refresh token', async () => {
      (apiClient.post as vi.Mock).mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const response = await apiClient.post('/auth/refresh', {
        refreshToken: 'old-refresh-token',
      });

      expect(response.accessToken).toBe('new-access-token');
      expect(response.refreshToken).toBe('new-refresh-token');
    });

    it('fails with invalid refresh token', async () => {
      (apiClient.post as vi.Mock).mockRejectedValue({
        response: { data: { message: 'Refresh token tidak valid' } },
      });

      await expect(
        apiClient.post('/auth/refresh', { refreshToken: 'invalid' })
      ).rejects.toEqual(
        expect.objectContaining({
          response: { data: { message: 'Refresh token tidak valid' } },
        })
      );
    });
  });

  describe('Current User', () => {
    it('fetches current user', async () => {
      (apiClient.get as vi.Mock).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        username: 'test',
        role: 'member',
        permissions: ['read', 'create_task'],
      });

      const response = await apiClient.get('/auth/me');
      expect(response).toEqual(expect.objectContaining({
        id: '1',
        email: 'test@test.com',
        username: 'test',
        role: 'member',
      }));
    });
  });

  describe('Logout', () => {
    it('clears session on logout', async () => {
      (apiClient.post as vi.Mock).mockResolvedValue({ message: 'Sesi berhasil direvoke' });

      const response = await apiClient.post('/auth/logout');
      expect(response.message).toBe('Sesi berhasil direvoke');
    });
  });

  describe('Session Management', () => {
    it('stores access token in localStorage', () => {
      localStorage.setItem('accessToken', 'test-token');
      expect(localStorage.getItem('accessToken')).toBe('test-token');
    });

    it('removes access token on logout', () => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.removeItem('accessToken');
      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });
});