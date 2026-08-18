import { useState, useEffect, useCallback } from 'react';

export function useApiHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsHealthy(data.status === 'ok' || data.status === 'ready');
        setLastError(null);
      } else {
        setIsHealthy(false);
        setLastError(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      setIsHealthy(false);
      setLastError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, [checkHealth]);

  return { isHealthy, isLoading, lastError, checkHealth };
}

export function useBackendStatus() {
  const [status, setStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkBackend = useCallback(async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      
      const isAvailable = response.ok;
      setStatus(isAvailable ? 'available' : 'unavailable');
    } catch {
      setStatus('unavailable');
    } finally {
      setLastCheck(new Date());
    }
  }, []);

  useEffect(() => {
    checkBackend();
    
    const interval = setInterval(checkBackend, 30000);
    
    return () => clearInterval(interval);
  }, [checkBackend]);

  return { status, lastCheck, checkBackend };
}