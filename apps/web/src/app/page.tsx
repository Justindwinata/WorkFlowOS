'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { BootSplash } from '@/components/BootSplash';

export default function HomePage() {
  const router = useRouter();
  const { status, initError, refreshUser, clearInitError } = useAuthStore();

  useEffect(() => {
    if (status !== 'checking') {
      router.replace(status === 'authenticated' ? '/dashboard' : '/login');
    }
  }, [status, router]);

  const handleRetry = useCallback(() => {
    clearInitError();
    refreshUser();
  }, [clearInitError, refreshUser]);

  if (status === 'checking') {
    return <BootSplash message="Memverifikasi sesi..." />;
  }

  if (initError) {
    return <BootSplash error={initError} onRetry={handleRetry} />;
  }

  return <BootSplash message="Mengalihkan..." />;
}