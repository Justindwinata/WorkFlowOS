'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { QUERY_KEYS } from '@/lib/query-client';
import { StatusBadge, PriorityBadge } from '@/components/ui/tabs';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  project: { name: string };
  assignments: { user: { username: string } }[];
}

export default function MyWorkPage() {
  const username = useAuthStore((s) => s.user?.username);
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.TASKS,
    queryFn: () => apiClient.get<Task[]>('/tasks'),
  });

  const myTasks = useMemo(() => {
    if (!tasks || !username) return [];
    return tasks.filter((t: Task) =>
      t.assignments.some((a) => a.user.username === username),
    );
  }, [tasks, username]);

  const now = new Date();
  const overdue = myTasks.filter(
    (t: Task) => t.dueDate && new Date(t.dueDate) < now && !['done', 'cancelled'].includes(t.status),
  );
  const inProgress = myTasks.filter((t: Task) => ['in_progress', 'review'].includes(t.status));
  const pending = myTasks.filter((t: Task) => ['backlog', 'todo'].includes(t.status));

  if (isLoading) return <LoadingState message="Memuat tugas Anda..." />;

  if (isLoading) return <LoadingState message="Memuat tugas Anda..." />;
  if (error) return <ErrorState title="Data belum dapat dimuat" onRetry={() => {}} />;

  if (myTasks.length === 0) {
    return (
      <EmptyState
        title="Belum ada tugas untuk Anda"
        description="Ketika Anda ditugaskan ke sebuah task, tugas tersebut akan muncul di sini."
      />
    );
  }

  const sections = [
    { label: `Terlambat (${overdue.length})`, items: overdue, tone: 'text-destructive' },
    { label: `Sedang Berjalan (${inProgress.length})`, items: inProgress, tone: 'text-primary' },
    { label: `Menunggu (${pending.length})`, items: pending, tone: 'text-muted-foreground' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Work</h1>
        <p className="text-muted-foreground">Apa yang perlu Anda selesaikan?</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-3xl font-bold">{myTasks.length}</p>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-sm text-muted-foreground">Terlambat</p>
          <p className="text-3xl font-bold text-destructive">{overdue.length}</p>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-sm text-muted-foreground">Sedang Berjalan</p>
          <p className="text-3xl font-bold text-primary">{inProgress.length}</p>
        </div>
      </div>

      {sections.map((section) =>
        section.items.length > 0 ? (
          <div key={section.label}>
            <h2 className={`text-lg font-semibold mb-2 ${section.tone}`}>{section.label}</h2>
            <div className="divide-y border rounded-lg bg-card">
              {section.items.map((task: Task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.project?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                    {task.dueDate && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(task.dueDate).toLocaleDateString('id-ID')}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}
