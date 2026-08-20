'use client';

import { useEffect } from 'react';
import { ActionButton } from '@ui';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-24">
      <h1 className="text-4xl font-bold">WorkFlowOS</h1>
      <p className="mt-4 text-xl">Enterprise Work Management & Service Operations Platform</p>
      <div className="mt-8 flex flex-col items-center gap-4 text-center max-w-md">
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-md">
          Terjadi kesalahan saat memuat aplikasi. {error?.message ?? ''}
        </p>
        <ActionButton onClick={reset} variant="outline">
          Coba Lagi
        </ActionButton>
      </div>
    </main>
  );
}