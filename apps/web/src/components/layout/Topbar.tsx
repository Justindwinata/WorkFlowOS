'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@ui';
import { Menu, Bell, LogOut, Settings } from 'lucide-react';

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xl font-bold">
            WorkFlowOS
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-muted rounded-md">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-muted rounded-md"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
