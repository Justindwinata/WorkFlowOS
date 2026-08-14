'use client';

import React from 'react';
import { Button } from '@ui';
import { cn } from '@ui';

interface ActionButtonProps {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ActionButton({ label, icon, onClick, variant = 'ghost', size = 'sm', className }: ActionButtonProps) {
  return (
    <Button variant={variant} size={size} className={cn('gap-1', className)} onClick={onClick}>
      {icon}
      {label && <span className="ml-1">{label}</span>}
    </Button>
  );
}