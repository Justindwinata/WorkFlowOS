import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

export function useRedirectIfAuthenticated(target = '/dashboard') {
  const router = useRouter();
  const { status, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (status === 'authenticated' && isAuthenticated) {
      router.replace(target);
    }
  }, [status, isAuthenticated, router, target]);
}