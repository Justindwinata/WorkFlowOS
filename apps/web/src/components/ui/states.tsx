'use client';

import React from 'react';
import { ActionButton } from './action-button';
import { AlertCircle, Search, RefreshCw, Lock, Clock, CheckCircle2, CloudOff } from 'lucide-react';

export function LoadingState({ message = 'Memuat...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4" />
      <p>{message}</p>
    </div>
  );
}

export function EmptyState({
  icon = <Search className="h-12 w-12" />,
  title = 'Belum ada data',
  description = 'Data belum tersedia',
  action,
}: {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground max-w-md mx-auto">
      <div className="mb-4 text-muted-foreground">{icon}</div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  title = 'Terjadi Kesalahan',
  description = 'Data belum dapat dimuat. Silakan coba lagi beberapa saat lagi.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {onRetry && <ActionButton icon={<RefreshCw className="h-4 w-4" />} onClick={onRetry}>Coba Lagi</ActionButton>}
    </div>
  );
}

export function PermissionDeniedState({
  title = 'Anda tidak memiliki akses',
  description = 'Halaman atau tindakan ini memerlukan izin khusus yang tidak terhubung dengan akun Anda.',
  onBack,
}: {
  title?: string;
  description?: string;
  onBack?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto">
      <Lock className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {onBack && <ActionButton variant="outline" onClick={onBack}>Kembali</ActionButton>}
    </div>
  );
}

export function SessionExpiredState({ onLoginAgain }: { onLoginAgain?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto">
      <Clock className="h-12 w-12 text-tertiary-container mb-4" />
      <h3 className="text-lg font-medium mb-2">Sesi Berakhir</h3>
      <p className="text-sm text-muted-foreground mb-4">Untuk alasan keamanan, sesi Anda telah berakhir karena tidak ada aktivitas.</p>
      {onLoginAgain && <ActionButton onClick={onLoginAgain}>Login Again</ActionButton>}
    </div>
  );
}

export function BackendUnavailableState({
  title = 'Backend Tidak Tersedia',
  description = 'Tidak dapat terhubung ke server. Silakan coba lagi nanti.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-4">
        <span className="material-symbols-outlined text-2xl text-destructive">cloud_off</span>
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <ActionButton icon={<RefreshCw className="h-4 w-4" />} onClick={onRetry}>
        Coba Lagi
      </ActionButton>
    </div>
  );
}

export function SuccessToast({ title, description }: { title: string; description?: string }) {
  return (
    <div className="fixed bottom-4 right-4 z-[1100] bg-surface-container-lowest border border-outline-variant shadow-soft rounded-lg p-4 flex items-center gap-3 max-w-sm">
      <div className="w-8 h-8 rounded-full bg-success-container flex items-center justify-center shrink-0">
        <CheckCircle2 className="h-5 w-5 text-on-success-container" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-metadata text-metadata text-on-surface font-semibold">{title}</p>
        {description && <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{description}</p>}
      </div>
      <button className="text-on-surface-variant hover:bg-surface-container-high p-xs rounded-full transition-colors">
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}
