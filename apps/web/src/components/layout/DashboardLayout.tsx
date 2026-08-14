'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@ui';
import {
  LayoutDashboard,
  Users,
  Users2,
  FolderOpen,
  CheckSquare,
  FileText,
  AlertCircle,
  CheckCircle,
  Bell,
  History,
  Settings,
  Menu,
  X,
  Bell as BellIcon,
  LogOut,
  Settings as SettingsIcon,
  Search,
  HelpCircle,
} from 'lucide-react';
import { ActionButton } from '@ui';
import { useAuthStore } from '@/lib/auth-store';

const routes = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/users', icon: Users, label: 'Users' },
  { href: '/teams', icon: Users2, label: 'Teams' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/requests', icon: FileText, label: 'Requests' },
  { href: '/incidents', icon: AlertCircle, label: 'Incidents' },
  { href: '/approvals', icon: CheckCircle, label: 'Approvals' },
  { href: '/sla', icon: Bell, label: 'SLA' },
  { href: '/notifications', icon: BellIcon, label: 'Notifications' },
  { href: '/audit-log', icon: History, label: 'Audit Log' },
  { href: '/settings', icon: Settings, label: 'Settings' },
] as const;

export function Sidebar({ isMobileOpen, onClose }: { isMobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-[100] h-screen bg-background border-r border-outline-variant transition-all duration-200',
        isMobileOpen ? 'w-[280px] translate-x-0' : 'w-0 translate-x-[-100%] lg:w-[280px] lg:translate-x-0 lg:static lg:block',
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-outline-variant">
        <Link href="/dashboard" className="text-xl font-bold text-primary">
          WorkFlowOS
        </Link>
        <button
          className="lg:hidden p-2 text-on-surface-variant hover:bg-muted rounded-lg"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href;
            return (
              <li key={route.href}>
                <Link
                  href={route.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary border-l-4 border-primary'
                      : 'text-foreground/70 hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{route.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-outline-variant">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-sm font-medium">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">admin@workflowos.id</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-[200] h-16 bg-background/95 backdrop-blur-sm border-b border-outline-variant">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left: Menu + Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            className="lg:hidden p-2 text-on-surface-variant hover:bg-muted rounded-lg"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative hidden sm:block w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search WorkFlowOS..."
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-on-surface-variant hover:bg-muted rounded-lg transition-colors">
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>

          <HelpCircle className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer" />

          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-outline-variant">
            <div className="text-right">
              <p className="text-sm font-medium truncate max-w-[150px]">{user?.username}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user?.role}</p>
            </div>
            <button onClick={logout} className="p-2 text-on-surface-variant hover:bg-muted rounded-lg transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile user menu */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <button onClick={logout} className="p-2 text-on-surface-variant hover:bg-muted rounded-lg">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <><>{children}</></>; // Let auth layout handle redirect
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isMobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-surface p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}