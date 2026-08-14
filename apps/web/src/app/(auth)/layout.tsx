'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@ui';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={cn('min-h-screen flex flex-col')}>
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            WorkFlowOS
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Masuk</span>
            </Link>
            <Link href="/register">
              <span className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                Daftar
              </span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-background py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} WorkFlowOS. Semua hak dilindungi.
        </div>
      </footer>
    </div>
  );
}