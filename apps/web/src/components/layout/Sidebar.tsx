'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@ui';
import {
  BarChart2,
  LayoutDashboard,
  Users,
  Users2,
  FolderOpen,
  CheckSquare,
  FileText,
  AlertCircle,
  CheckCircle,
  Bell,
  ScrollText,
  Settings,
  Clock,
} from 'lucide-react';

const routes = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/users', icon: Users, label: 'Users' },
  { href: '/teams', icon: Users2, label: 'Teams' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/requests', icon: FileText, label: 'Requests' },
  { href: '/incidents', icon: AlertCircle, label: 'Incidents' },
  { href: '/approvals', icon: CheckCircle, label: 'Approvals' },
  { href: '/sla', icon: Clock, label: 'SLA' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/audit-log', icon: ScrollText, label: 'Audit Log' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-background h-screen sticky top-0 overflow-y-auto">
      <nav className="space-y-2 p-4">
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted',
              )}
            >
              <Icon className="h-4 w-4" />
              {route.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
