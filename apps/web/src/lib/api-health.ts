import { useCallback, useEffect, useRef, useState } from 'react';
import { checkApiHealth } from './health-check';

export type BackendStatus = 'checking' | 'available' | 'unavailable';

export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const mountedRef = useRef(false);

  const checkBackend = useCallback(async () => {
    const isAvailable = await checkApiHealth();
    if (!mountedRef.current) return;
    setStatus(isAvailable ? 'available' : 'unavailable');
    setLastCheck(new Date());
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    checkBackend();

    const interval = setInterval(() => {
      checkBackend();
    }, 30000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [checkBackend]);

  return { status, lastCheck, checkBackend };
}