'use client';

import React, { useState } from 'react';
import { cn } from '@ui';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  className?: string;
}

export function Tabs({ tabs, defaultValue, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.id);

  return (
    <div className={cn('w-full', className)}>
      <nav className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="mt-4">{tabs.find((t) => t.id === activeTab)?.content}</div>
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
}

const statusMap: Record<string, { label: string; className: string }> = {
  backlog: { label: 'Backlog', className: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30' },
  todo: { label: 'Todo', className: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30' },
  review: { label: 'Review', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30' },
  done: { label: 'Done', className: 'bg-green-100 text-green-800 dark:bg-green-900/30' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 dark:bg-red-900/30' },
  open: { label: 'Open', className: 'bg-red-100 text-red-800 dark:bg-red-900/30' },
  investigating: { label: 'Investigating', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30' },
  escalated: { label: 'Escalated', className: 'bg-red-100 text-red-800 dark:bg-red-900/30' },
  resolved: { label: 'Resolved', className: 'bg-green-100 text-green-800 dark:bg-green-900/30' },
  closed: { label: 'Closed', className: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30' },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-800 dark:bg-green-900/30' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800 dark:bg-red-900/30' },
  changes_requested: { label: 'Changes Requested', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = statusMap[status.toLowerCase()] || { label: status, className: 'bg-default-100' };
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', meta.className)}>{meta.label}</span>;
}

interface PriorityBadgeProps {
  priority: string;
}

const priorityMap: Record<string, { label: string; className: string }> = {
  low: { label: 'Rendah', className: 'bg-green-100 text-green-800 dark:bg-green-900/30' },
  medium: { label: 'Sedang', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30' },
  high: { label: 'Tinggi', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30' },
  critical: { label: 'Kritis', className: 'bg-red-100 text-red-800 dark:bg-red-900/30' },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const meta = priorityMap[priority.toLowerCase()] || { label: priority, className: 'bg-default-100' };
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', meta.className)}>{meta.label}</span>;
}
