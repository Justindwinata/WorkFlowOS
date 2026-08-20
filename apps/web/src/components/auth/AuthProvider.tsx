'use client';

import React, { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { BootSplash } from '@/components/BootSplash';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { status, refreshUser } = useAuthStore();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  if (status === 'checking') {
    return <BootSplash message="Inisialisasi aplikasi..." />;
  }

  return <>{children}</>;
}