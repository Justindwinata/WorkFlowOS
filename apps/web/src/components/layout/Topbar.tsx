'use client';

import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@ui';
import { LogOut, Bell } from 'lucide-react';
import Link from 'next/link';

export function Topbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="border-b bg-background h-16 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-xl font-bold">
          WorkFlowOS
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-muted rounded-md">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
