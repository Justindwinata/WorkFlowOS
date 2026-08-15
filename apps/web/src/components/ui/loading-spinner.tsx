'use client';

export function LoadingSpinner({ size = 'md', message }: { size?: 'sm' | 'md' | 'lg'; message?: string }) {
  const sizes = { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className={cn('animate-spin rounded-full border-4 border-primary border-t-transparent', sizes[size])} />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

import { cn } from '@ui';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title = 'Belum ada data', description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-on-surface mb-2">{title}</h3>
      {description && <p className="text-sm text-on-surface-variant mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
