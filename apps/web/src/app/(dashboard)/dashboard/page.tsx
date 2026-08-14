'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, PriorityBadge, ActionButton } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Users, FileText, AlertTriangle, CheckCircle, TrendingUp, Clock, BarChart2, AlertCircle, UserCheck, FileChartColumn } from 'lucide-react';

interface DashboardStats {
  stats: {
    myTasksCount: number;
    overdueTasksCount: number;
    openRequestsCount: number;
    activeIncidentsCount: number;
    pendingApprovalsCount: number;
    slaAtRiskCount: number;
  };
  myTasks: any[];
  overdueTasks: any[];
  openRequests: any[];
  activeIncidents: any[];
  pendingApprovals: any[];
  teamWorkload: any[];
  slaAtRisk: any[];
  recentActivity: any[];
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  color?: string;
  href?: string;
}

function StatCard({ title, value, icon, description, color = 'primary', href }: StatCardProps) {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-900/30',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30',
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${colors[color as keyof typeof colors] || colors.primary}`}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

const colors = {
  primary: 'bg-primary/10 text-primary',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30',
  destructive: 'bg-red-100 text-red-800 dark:bg-red-900/30',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30',
};

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get<any>('/dashboard'),
  });

  const stats = data?.stats || {};
  const myTasks = data?.myTasks || [];
  const teamWorkload = data?.teamWorkload || [];
  const slaAtRisk = data?.slaAtRisk || [];
  const recentActivity = data?.recentActivity || [];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-destructive">Gagal memuat dashboard</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tugas Saya"
          value={stats.myTasksCount || 0}
          icon={<FileText className="h-5 w-5" />}
          color="info"
        />
        <StatCard
          title="Tugas Terlambat"
          value={stats.overdueTasksCount || 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="destructive"
        />
        <StatCard
          title="Request Terbuka"
          value={stats.openRequestsCount || 0}
          icon={<FileText className="h-5 w-5" />}
          color="warning"
        />
        <StatCard
          title="Incident Aktif"
          value={stats.activeIncidentsCount || 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="destructive"
        />
        <StatCard
          title="Approval Pending"
          value={stats.pendingApprovalsCount || 0}
          icon={<CheckCircle className="h-5 w-5" />}
          color="info"
        />
        <StatCard
          title="SLA At Risk"
          value={stats.slaAtRiskCount || 0}
          icon={<TrendingUp className="h-5 w-5" />}
          color="destructive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tugas Saya (Terbaru)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.myTasksCount === 0 ? (
                <p className="text-muted-foreground text-center py-4">Tidak ada tugas</p>
              ) : (
                myTasks.slice(0, 5).map((task: any) => (
                  <div key={task.id} className="flex justify-between items-center text-sm py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.project?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamWorkload.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Tidak ada data</p>
              ) : (
                teamWorkload.slice(0, 5).map((member: any) => (
                  <div key={member.userId} className="flex justify-between items-center text-sm py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{member.username}</p>
                        <p className="text-xs text-muted-foreground">{member.team}</p>
                      </div>
                    </div>
                    <span className="font-bold text-primary">{member.activeTasks}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>SLA At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slaAtRisk.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Tidak ada SLA berisiko</p>
              ) : (
                slaAtRisk.slice(0, 5).map((sla: any) => (
                  <div key={sla.id} className="p-3 rounded-lg border bg-destructive/10">
                    <p className="font-medium">{sla.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {sla.breached ? 'SLA TELAT' : `Peringatan: ${sla.elapsedMinutes} menit`}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">Approval pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Belum ada aktivitas</p>
              ) : (
                recentActivity.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="flex items-center gap-3 text-sm py-2 border-b last:border-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {log.actor?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{log.summary || `${log.action} ${log.entity}`}</p>
                      <p className="text-xs text-muted-foreground">{log.actor?.username} · {new Date(log.timestamp).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}