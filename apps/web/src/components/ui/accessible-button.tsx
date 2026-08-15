'use client';

import { cn } from '../lib/utils';

interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function AccessibleButton({
  children,
  onClick,
  variant = 'default',
  className,
  disabled,
  'aria-label': ariaLabel,
}: AccessibleButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const variants: Record<string, string> = {
    default: 'bg-primary text-on-primary hover:bg-primary/90',
    destructive: 'bg-destructive text-on-destructive hover:bg-destructive/90',
    outline: 'border border-outline-variant bg-surface hover:bg-surface-container-high',
    secondary: 'bg-secondary text-on-secondary hover:bg-secondary/80',
    ghost: 'hover:bg-surface-container-high text-foreground',
  };

  return (
    <button
      onClick={onClick}
      className={cn(baseStyles, variants[variant], className)}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

import { cn } from '@ui';
