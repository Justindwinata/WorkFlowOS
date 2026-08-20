'use client';

import React, { useState } from 'react';
import { useBackendStatus } from '@/lib/api-health';
import { RefreshCw, Server, RotateCw } from 'lucide-react';
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
  const [retrying, setRetrying] = useState(false);

  if (status === 'checking' || status === 'available') {
    return null;
  }

  const handleRetry = async () => {
    setRetrying(true);
    await checkBackend();
    setRetrying(false);
    if (onRetry) {
      onRetry();
    }
  };

  const handleFullReload = () => {
    window.location.reload();
  };

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
              disabled={retrying}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
              Coba Lagi
            </ActionButton>

            <ActionButton
              variant="default"
              className="flex-1"
              onClick={handleFullReload}
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Muat Ulang Halaman
            </ActionButton>
          </div>

          {retrying && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Mencoba menghubungkan kembali...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}