'use client';

import React from 'react';
import { Button } from '@ui';
import { cn } from '@ui';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ActionButton({
  label,
  icon,
  onClick,
  variant = 'ghost',
  size = 'sm',
  className,
  type,
  disabled,
  children,
  ...rest
}: ActionButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn('gap-1', className)}
      onClick={onClick}
      type={type}
      disabled={disabled}
      {...rest}
    >
      {icon}
      {children || (label && <span className="ml-1">{label}</span>)}
    </Button>
  );
}