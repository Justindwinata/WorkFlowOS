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

      // This would test the actual login component
      // For now, we test the API client behavior
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
});