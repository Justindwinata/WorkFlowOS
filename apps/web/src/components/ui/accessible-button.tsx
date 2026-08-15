'use client';

import React from 'react';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function AccessibleButton({
  children,
  onClick,
  variant = 'default',
  className,
  disabled,
  type = 'button',
  ...rest
}: AccessibleButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const variants: Record<string, string> = {
    default: 'bg-primary text-on-primary hover:bg-primary/90',
    destructive: 'bg-destructive text-on-destructive hover:bg-destructive/90',
    outline: 'border border-outline-variant bg-surface hover:bg-surface-container-high',
    secondary: 'bg-secondary text-on-secondary hover:bg-secondary/80',
    ghost: 'hover:bg-surface-container-high text-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  const cn = (...classes: (string | undefined | false | null)[]) =>
    classes.filter(Boolean).join(' ');

  return (
    <button
      onClick={onClick}
      className={cn(baseStyles, variants[variant], className)}
      disabled={disabled}
      type={type}
      {...rest}
    >
      {children}
    </button>
  );
}
