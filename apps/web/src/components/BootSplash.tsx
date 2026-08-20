'use client';

import React from 'react';
import { ActionButton } from '@ui';

export function BootSplash({
  message = 'Memuat aplikasi...',
  error,
  onRetry,
}: {
  message?: string;
  error?: string | null;
  onRetry?: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-24">
      <h1 className="text-4xl font-bold">WorkFlowOS</h1>
      <p className="mt-4 text-xl">Enterprise Work Management & Service Operations Platform</p>
      {error ? (
        <div className="mt-8 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-md">{error}</p>
          {onRetry && (
            <ActionButton onClick={onRetry} variant="outline">
              Coba Lagi
            </ActionButton>
          )}
        </div>
      ) : (
        <div className="mt-8 flex items-center gap-3 text-muted-foreground">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm">{message}</p>
        </div>
      )}
    </main>
  );
}