'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, PriorityBadge, ActionButton } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Edit, Trash2, MessageCircle, Calendar, ArrowLeft, Save, X, Check, Share2, Download, Clock, Build, Search, Timer } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Incident {
  id: string;
  title: string;
  description?: string;
  severity: string;
  priority: string;
  status: string;
  affectedService?: string;
  assignee?: { username: string; firstName?: string; lastName?: string };
  assigneeId?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', severity: '', priority: '', status: '', affectedService: '' });

  const { data: incident, isLoading, error } = useQuery({
    queryKey: ['incident', params.id],
    queryFn: () => apiClient.get<any>(`/incidents/${params.id}`),
    enabled: !!params.id,
  });

  const updateIncident = useMutation({
    mutationFn: (data: any) => apiClient.patch(`/incidents/${params.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', params.id] });
      setIsEditing(false);
    },
  });

  const deleteIncident = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/incidents/${id}`),
    onSuccess: () => router.push('/incidents'),
  });

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" /></div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat incident</div>;
  if (!incident) return <div className="p-4">Incident tidak ditemukan</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateIncident.mutate(editForm);
  };

  const severityMap: Record<string, { label: string; className: string }> = {
    critical: { label: 'Critical', className: 'bg-error-container text-on-error-container font-metadata text-metadata border border-error/20' },
    high: { label: 'High', className: 'bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-xl px-2 py-[2px] font-metadata text-metadata border border-tertiary/20' },
    medium: { label: 'Medium', className: 'bg-surface-variant text-on-surface-variant rounded-xl px-2 py-[2px] font-metadata text-metadata border border-outline-variant' },
    low: { label: 'Low', className: 'bg-surface-container text-on-surface-variant rounded-xl px-2 py-[2px] font-metadata text-metadata' },
  };

  const statusMap: Record<string, { label: string; className: string }> = {
    open: { label: 'Open', className: 'bg-red-100 text-red-800 dark:bg-red-900/30' },
    investigating: { label: 'Investigating', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30' },
    escalated: { label: 'Escalated', className: 'bg-red-100 text-red-800 dark:bg-red-900/30' },
    resolved: { label: 'Resolved', className: 'bg-green-100 text-green-800 dark:bg-green-900/30' },
    closed: { label: 'Closed', className: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30' },
  };

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" /></div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat incident</div>;
  if (!incident) return <div className="p-4">Incident tidak ditemukan</div>;

  const severityMeta = severityMap[incident.severity?.toLowerCase()] || { label: incident.severity, className: 'bg-default-100' };
  const statusMeta = statusMap[incident.status?.toLowerCase()] || { label: incident.status, className: 'bg-default-100' };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-md mb-lg">
        <div>
          <div className="flex items-center gap-xs font-metadata text-metadata text-on-surface-variant mb-xs">
            <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => router.push('/incidents')}>Incidents</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-on-surface">{incident.id}</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface">{incident.title}</h1>
        </div>
        <div className="flex items-center gap-sm shrink-0">
          {isEditing ? (
            <>
              <ActionButton icon={<Save className="h-4 w-4" />} onClick={() => updateIncident.mutate(editForm)}>Save</ActionButton>
              <ActionButton icon={<X className="h-4 w-4" />} variant="ghost" onClick={() => { setIsEditing(false); setEditForm({ title: incident.title, description: incident.description || '', severity: incident.severity, priority: incident.priority, status: incident.status, affectedService: incident.affectedService || '' }); }}>Cancel</ActionButton>
            </>
          )} : (
            <>
              <ActionButton icon={<Edit className="h-4 w-4" />} variant="outline" onClick={() => { setEditForm({ title: incident.title, description: incident.description || '', severity: incident.severity, priority: incident.priority, status: incident.status, affectedService: incident.affectedService || '' }); setIsEditing(true); }}>Edit</ActionButton>
              <ActionButton icon={<Trash2 className="h-4 w-4" />} variant="destructive" onClick={() => { if (confirm('Delete incident?')) deleteIncident.mutate(incident.id); }}>Delete</ActionButton>
              <ActionButton icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.push('/incidents')}>Back</ActionButton>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={(e) => { e.preventDefault(); updateIncident.mutate(editForm); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Title</label>
              <input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Severity</label>
              <select
                value={editForm.severity}
                onChange={(e) => setEditForm({ ...editForm, severity: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Priority</label>
              <select
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium">Affected Service</label>
              <input
                value={editForm.affectedService}
                onChange={(e) => setEditForm({ ...editForm, affectedService: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button type="button" className="px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground" onClick={() => setIsEditing(false)}>Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</button>
            </div>
          </form>
        )} : (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-md mb-xl">
            <div>
              <div className="flex items-center gap-sm mb-xs">
                <span className="px-2 py-0.5 rounded-xl bg-error-container text-on-error-container font-metadata text-[10px] font-bold uppercase flex items-center gap-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Critical
                </span>
                <span className="px-2 py-0.5 rounded-xl border border-outline-variant text-on-surface-variant font-metadata text-[10px] font-bold uppercase">
                  P1
                </span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface mb-xs">{incident.title}</h1>
              <p className="font-body-base text-body-base text-on-surface-variant flex items-center gap-xs">
                <span class="material-symbols-outlined text-[16px]">storage</span> {incident.affectedService}
              </p>
            </div>
            <div className="flex flex-wrap gap-sm">
              <ActionButton icon={<MessageCircle className="h-4 w-4" />}>Acknowledge</ActionButton>
              <ActionButton icon={<Edit className="h-4 w-4" />} onClick={() => { setEditForm({ title: incident.title, description: incident.description || '', severity: incident.severity, priority: incident.priority, status: incident.status, affectedService: incident.affectedService || '' }); setIsEditing(true); }}>Edit</ActionButton>
              <ActionButton icon={<Trash2 className="h-4 w-4" />} variant="destructive" onClick={() => { if (confirm('Delete incident?')) deleteIncident.mutate(incident.id); }}>Delete</ActionButton>
              <ActionButton icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.push('/incidents')}>Back</ActionButton>
            </div>
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
            {/* Center Canvas (Content) */}
            <div className="xl:col-span-8 flex flex-col gap-gutter">
              {/* Incident Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-sm">
                    <span className="material-symbols-outlined">timeline</span> Incident Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-md py-sm">
                    {/* Vertical Line */}
                    <div className="absolute left-[23px] top-4 bottom-4 w-px bg-outline-variant"></div>
                    {/* Steps */}
                    <div className="flex gap-md mb-lg relative">
                      <div className="w-4 h-4 rounded-full bg-outline-variant border-2 border-surface-container-lowest z-10 mt-1 shrink-0"></div>
                      <div>
                        <p className="font-body-base text-body-base font-semibold text-on-surface">Incident Created</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">System Monitor • 10:42 AM</p>
                        <p className="font-body-sm text-body-sm text-on-surface mt-xs">Automated alert triggered by high connection rejection rate on Main DB.</p>
                      </div>
                    </div>
                    <div className="flex gap-md mb-lg relative">
                      <div className="w-4 h-4 rounded-full bg-primary-container border-2 border-surface-container-lowest z-10 mt-1 shrink-0 animate-pulse"></div>
                      <div>
                        <p className="font-body-base text-body-base font-semibold text-on-surface flex items-center gap-xs">
                          Investigating <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-on-surface font-metadata text-[10px]">Current</span>
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Alex Santos • 10:45 AM</p>
                        <p className="font-body-sm text-body-sm text-on-surface mt-xs">Analyzing pg_stat_activity to identify blocked queries and idle transactions.</p>
                      </div>
                    </div>
                    <div className="flex gap-md relative opacity-50">
                      <div className="w-4 h-4 rounded-full border-2 border-outline-variant bg-surface-container-lowest z-10 mt-1 shrink-0"></div>
                      <div>
                        <p className="font-body-base text-body-base font-semibold text-on-surface">Resolved</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Pending...</p>
                      </div>
                    </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Root Cause & Resolution Plan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-sm">
                        <span className="material-symbols-outlined text-outline">search_insights</span> Root Cause
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-metadata text-metadata text-on-surface-variant mb-md uppercase tracking-wider">Initial Findings</p>
                      <p className="font-body-sm text-body-sm text-on-surface">
                        Spike in traffic from the reporting microservice caused a large number of long-running analytics queries to exhaust available pool connections. Connection pooling configuration on PgBouncer may be suboptimal for current load.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-sm">
                        <span className="material-symbols-outlined text-outline">build</span> Resolution Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-metadata text-metadata text-on-surface-variant mb-md uppercase tracking-wider">Proposed Steps</p>
                      <ul className="font-body-sm text-body-sm text-on-surface list-disc pl-md space-y-xs">
                        <li>Terminate idle transactions > 5 minutes.</li>
                        <li>Temporarily increase PgBouncer max_client_conn limit.</li>
                        <li>Isolate reporting traffic to read-replica DB.</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Related Tasks Table */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center bg-surface-bright">
                      <CardTitle className="flex items-center gap-sm">
                        <span className="material-symbols-outlined text-outline">task_alt</span> Related Tasks
                      </CardTitle>
                      <ActionButton icon={<MessageCircle className="h-4 w-4" />} variant="ghost">+ Add Task</ActionButton>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-surface-container-low font-metadata text-metadata text-on-surface-variant border-b border-surface-variant">
                            <tr>
                              <th className="py-sm px-md font-medium uppercase">Task ID</th>
                              <th className="py-sm px-md font-medium uppercase">Title</th>
                              <th className="py-sm px-md font-medium uppercase">Status</th>
                              <th className="py-sm px-md font-medium uppercase">Assignee</th>
                            </tr>
                          </thead>
                          <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-surface-variant">
                            <tr className="hover:bg-surface-bright transition-colors">
                              <td className="py-sm px-md text-primary">TSK-1102</td>
                              <td className="py-sm px-md">Kill locked queries in Postgres</td>
                              <td className="py-sm px-md">
                                <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] uppercase font-semibold">Done</span>
                              </td>
                              <td className="py-sm px-md">Alex Santos</td>
                            </tr>
                            <tr className="hover:bg-surface-bright transition-colors">
                              <td className="py-sm px-md text-primary">TSK-1103</td>
                              <td className="py-sm px-md">Review PgBouncer config</td>
                              <td className="py-sm px-md">
                                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] uppercase font-semibold">In Progress</span>
                              </td>
                              <td className="py-sm px-md">Sarah Jenkins</td>
                            </tr>
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                {/* Right Sidebar (Metadata) */}
                <div className="xl:col-span-4 flex flex-col gap-gutter">
                  {/* SLA & Status Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>SLA & Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-md pb-md border-b border-surface-variant">
                        <p className="font-metadata text-metadata text-on-surface-variant uppercase tracking-wider mb-xs">Status</p>
                        <div className="flex items-center gap-sm">
                          <span className="material-symbols-outlined text-primary text-[20px] animate-spin" style={{ animationDuration: '3s' }}>sync</span>
                          <span className="font-body-base text-body-base font-semibold text-on-surface">Investigating</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-metadata text-metadata text-on-surface-variant uppercase tracking-wider mb-sm flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[14px]">timer</span> SLA Time to Resolve
                        </p>
                        <div className="bg-surface-bright border border-surface-variant rounded-lg p-md text-center">
                          <span className="font-display-md text-display-md font-bold text-error block mb-xs">42m 15s</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">Remaining before breach</span>
                          <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-md overflow-hidden">
                            <div className="bg-error h-1.5 rounded-full" style={{ width: '75%' }}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Details Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="font-metadata text-metadata text-on-surface-variant mb-xs">Assignee</p>
                        <div className="flex items-center gap-sm">
                          <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[10px]">AS</div>
                          <span className="font-body-sm text-body-sm font-medium text-on-surface">Alex Santos</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-metadata text-metadata text-on-surface-variant mb-xs">Team</p>
                        <div className="flex items-center gap-sm">
                          <span className="material-symbols-outlined text-outline text-[18px]">hub</span>
                          <span className="font-body-sm text-body-sm text-on-surface">Platform Ops</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-metadata text-metadata text-on-surface-variant mb-xs">Created</p>
                        <span className="font-body-sm text-body-sm text-on-surface">Oct 24, 2023 - 10:42 AM</span>
                      </div>
                      <div>
                        <p className="font-metadata text-metadata text-on-surface-variant mb-xs">Tags</p>
                        <div className="flex gap-xs flex-wrap">
                          <span className="px-2 py-1 rounded-md bg-surface-container text-on-surface-variant font-metadata text-[11px]">database</span>
                          <span className="px-2 py-1 rounded-md bg-surface-container text-on-surface-variant font-metadata text-[11px]">production</span>
                          <span className="px-2 py-1 rounded-md bg-surface-container text-on-surface-variant font-metadata text-[11px]">outage</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}