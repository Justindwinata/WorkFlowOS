import React from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, isAuthenticated, logout, login, register } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    router.push('/dashboard');
  };

  const handleRegister = async (data: { email: string; username: string; password: string; firstName?: string; lastName?: string }) => {
    await register(data);
    router.push('/dashboard');
  };

  return {
    user,
    isAuthenticated,
    logout: handleLogout,
    login: handleLogin,
    register: handleRegister,
  };
}
