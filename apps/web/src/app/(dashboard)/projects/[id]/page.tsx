'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, PriorityBadge, ActionButton } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Users, FileText, AlertTriangle, CheckCircle, TrendingUp, Clock, BarChart2, AlertCircle, UserCheck, FileChartColumn, Edit, Trash2, Plus, MessageCircle, Calendar, ArrowLeft, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  team: { name: string; id: string };
  owner: { username: string; firstName?: string; lastName?: string };
  dueDate?: string;
  tasks: { id: string; title: string; status: string; priority: string; assignee: { username: string } }[];
  members: { user: { username: string; firstName?: string; lastName?: string }; role: string }[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', dueDate: '' });

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', params.id],
    queryFn: () => apiClient.get<any>(`/projects/${params.id}`),
    enabled: !!params.id,
  });

  const updateProject = useMutation({
    mutationFn: (data: any) => apiClient.patch(`/projects/${params.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', params.id] });
      setIsEditing(false);
    },
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/projects/${id}`),
    onSuccess: () => router.push('/projects'),
  });

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" /></div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat project</div>;
  if (!project) return <div className="p-4">Project tidak ditemukan</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject.mutate(editForm);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-md mb-lg">
        <div>
          <div className="flex items-center gap-xs font-metadata text-metadata text-on-surface-variant mb-xs">
            <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => router.push('/projects')}>Projects</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-on-surface">{project.name}</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface">{project.name}</h1>
          <p className="text-on-surface-variant font-body-base mt-xs">{project.description}</p>
        </div>
        <div className="flex items-center gap-sm shrink-0">
          {isEditing ? (
            <>
              <ActionButton icon={<Save className="h-4 w-4" />} onClick={() => updateProject.mutate(editForm)}>Save</ActionButton>
              <ActionButton icon={<X className="h-4 w-4" />} variant="ghost" onClick={() => { setIsEditing(false); setEditForm({ name: project.name, description: project.description || '', dueDate: project.dueDate || '' }); }}>Cancel</ActionButton>
            </>
          )} : (
            <>
              <ActionButton icon={<Edit className="h-4 w-4" />} variant="outline" onClick={() => { setEditForm({ name: project.name, description: project.description || '', dueDate: project.dueDate || '' }); setIsEditing(true); }}>Edit</ActionButton>
              <ActionButton icon={<Trash2 className="h-4 w-4" />} variant="destructive" onClick={() => { if (confirm('Delete project?')) deleteProject.mutate(project.id); }}>Delete</ActionButton>
              <ActionButton icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.push('/projects')}>Back</ActionButton>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={(e) => { e.preventDefault(); updateProject.mutate(editForm); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Name</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Due Date</label>
              <input
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
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
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" className="px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground" onClick={() => setIsEditing(false)}>Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</button>
          </div>
        </form>
      )} : (
        <div className="space-y-6">
          {/* Project Header */}
          <Card className="border border-outline-variant rounded-lg p-lg mb-lg shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-md gap-md">
              <div>
                <div className="flex items-center gap-sm mb-xs">
                  <StatusBadge status={project.status} />
                  <span className="text-outline font-metadata text-metadata">ID: {project.id}</span>
                </div>
                <h1 className="font-display-lg text-display-lg text-on-surface">{project.name}</h1>
                <p className="text-on-surface-variant font-body-base mt-xs">{project.description}</p>
              </div>
              <div className="flex gap-sm">
                <ActionButton icon={<Edit className="h-4 w-4" />} onClick={() => setIsEditing(true)}>Edit Project</ActionButton>
                <ActionButton icon={<Plus className="h-4 w-4" />} variant="outline">Manage Members</ActionButton>
                <ActionButton icon={<Edit className="h-4 w-4" />} variant="outline">Edit Project</ActionButton>
              </div>
            </Card>

            {/* Project Meta */}
            <Card className="border border-outline-variant rounded-lg p-lg mb-lg shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-md gap-md">
                <div>
                  <div className="flex items-center gap-sm mb-xs">
                    <StatusBadge status={project.status} />
                    <span className="text-outline font-metadata text-metadata">ID: {project.id}</span>
                  </div>
                  <h1 className="font-display-lg text-display-lg text-on-surface">{project.name}</h1>
                  <p className="text-on-surface-variant font-body-base mt-xs">{project.description}</p>
                </div>
                <div className="flex gap-sm">
                  <ActionButton icon={<Users className="h-4 w-4" />}>Manage Members</ActionButton>
                  <ActionButton icon={<Edit className="h-4 w-4" />} variant="outline">Edit Project</ActionButton>
                </div>
              </Card>

              {/* Project Meta */}
              <Card className="border border-outline-variant rounded-lg p-lg mb-lg shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-md border-t border-outline-variant pt-md">
                  <div>
                    <p className="font-metadata text-metadata text-outline mb-unit">Owner</p>
                    <div className="flex items-center gap-sm">
                      <img alt="Owner" className="w-6 h-6 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTaXLfhKOivMXNqe5ceV0gCFlwZ3-o7zmM3B3Nl1HRDsn1jStfY6YKtKO6W4XQB54hCL24JYGU9xxLYLYfmzcofru8q-z5rrEiowuKhDFfDxfc6gIfO_ueMe27kfckaW4SThoOg0iJ-_QKq8q1ASFZwPqIMtWghIasdcl_HtgFk47c48JjegtElKjykOpux2xmm9ArHVbB3vkyt2ySjNggk0-EdhNuIc8PqeB8XFI973t1q2ge3q3K" />
                      <span className="font-body-sm text-body-sm text-on-surface font-medium">{project.owner?.username || 'Sarah Jenkins'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-metadata text-metadata text-outline mb-unit">Due Date</p>
                    <span className="font-body-sm text-body-sm text-on-surface font-medium">{project.dueDate ? format(new Date(project.dueDate), 'MMM d, yyyy') : 'Not set'}</span>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-unit">
                      <p className="font-metadata text-metadata text-outline">Progress</p>
                      <span className="font-metadata text-metadata text-primary font-bold">65%</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tasks Table */}
              <Card className="border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="px-md py-sm border-b border-surface-variant flex justify-between items-center bg-surface-bright">
                  <h3 className="font-section-title text-section-title text-on-surface">Tasks ({project.tasks?.length || 0})</h3>
                  <div className="flex items-center gap-sm">
                    <ActionButton icon={<Plus className="h-4 w-4" />}>Add Task</ActionButton>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-surface-container-low border-b border-surface-variant font-metadata text-metadata text-on-surface-variant uppercase">
                        <tr>
                          <th className="px-md py-sm font-medium whitespace-nowrap">Task</th>
                          <th className="px-md py-sm font-medium whitespace-nowrap">Status</th>
                          <th className="px-md py-sm font-medium whitespace-nowrap">Priority</th>
                          <th className="px-md py-sm font-medium whitespace-nowrap">Assignee</th>
                          <th className="px-md py-sm font-medium whitespace-nowrap">Due Date</th>
                          <th className="px-md py-sm font-medium whitespace-nowrap text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-surface-variant">
                        {project.tasks?.slice(0, 10).map((task: any) => (
                          <tr key={task.id} className="hover:bg-surface-bright transition-colors cursor-pointer">
                            <td className="px-md py-sm">
                              <div className="font-medium">{task.title}</div>
                            </td>
                            <td className="px-md py-sm">
                              <StatusBadge status={task.status} />
                            </td>
                            <td className="px-md py-sm">
                              <PriorityBadge priority={task.priority} />
                            </td>
                            <td className="px-md py-sm">
                              <div className="flex items-center gap-xs">
                                <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-metadata text-metadata border border-outline-variant">{task.assignee?.username?.charAt(0).toUpperCase()}</div>
                                <span>{task.assignee?.username}</span>
                              </div>
                            </td>
                            <td className="px-md py-sm">{task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}</td>
                            <td className="px-md py-sm text-right">
                              <button className="text-outline hover:text-on-surface transition-colors opacity-0 group-hover:opacity-100 p-1">
                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {(!project.tasks || project.tasks.length === 0) && (
                          <tr>
                            <td colSpan={6} className="px-md py-8 text-center text-muted-foreground">Belum ada task</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-md py-sm border-t border-surface-variant flex justify-between items-center bg-surface-bright">
                    <span className="font-body-sm text-body-sm text-secondary">Showing 1 to {Math.min(project.tasks?.length || 0, 10)} of {project.tasks?.length || 0} entries</span>
                    <div className="flex items-center gap-unit">
                      <button className="px-2 py-1 border border-outline-variant rounded bg-surface-container-lowest text-secondary hover:bg-surface-container-low disabled:opacity-50" disabled>Prev</button>
                      <button className="px-3 py-1 border border-primary bg-primary-container text-on-primary rounded">1</button>
                      <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest text-secondary hover:bg-surface-container-low">2</button>
                      <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest text-secondary hover:bg-surface-container-low">3</button>
                      <button className="px-2 py-1 border border-outline-variant rounded bg-surface-container-lowest text-secondary hover:bg-surface-container-low">Next</button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}