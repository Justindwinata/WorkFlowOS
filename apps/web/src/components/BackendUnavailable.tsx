'use client';

import React, { useEffect, useState } from 'react';
import { useBackendStatus } from '@/lib/api-health';
import { AlertCircle, RefreshCw, Server } from 'lucide-react';
import { ActionButton } from '@ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function BackendUnavailableState({ 
  title = 'Backend Tidak Tersedia', 
  description = 'Tidak dapat terhubung ke server. Silakan coba lagi nanti.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  const { status, lastCheck, checkBackend } = useBackendStatus();
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    if (status === 'unavailable') {
      setShowRetry(true);
    } else if (status === 'available') {
      setShowRetry(false);
    }
  }, [status]);

  const handleRetry = () => {
    setShowRetry(false);
    // This will trigger a fresh check
    window.location.reload();
  };

  if (status === 'available') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Server className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            <p>Status: <span className="font-medium text-destructive">Tidak Tersedia</span></p>
            {lastCheck && (
              <p>Terakhir diperiksa: {lastCheck.toLocaleTimeString()}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <ActionButton 
              variant="outline" 
              className="flex-1" 
              onClick={handleRetry}
              disabled={!showRetry}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Coba Lagi
            </ActionButton>
            
            <ActionButton 
              variant="default" 
              className="flex-1" 
              onClick={() => window.location.reload()}
            >
              Muat Ulang Halaman
            </ActionButton>
          </div>
          
          {showRetry && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Mencoba menghubungkan kembali...</p>
              <div className="flex justify-center mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}