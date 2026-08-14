import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { QUERY_KEYS } from './query-client';
import { User } from '@types';

// Users hooks
export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.USERS,
    queryFn: () => apiClient.get<User[]>('/users'),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; username: string; password: string; firstName?: string; lastName?: string }) =>
      apiClient.post<User>('/users', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS }),
  });
}

// Tasks hooks
export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.TASKS,
    queryFn: () => apiClient.get<any[]>('/tasks', { params: projectId ? { projectId } : undefined }),
    enabled: !!projectId || true,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; projectId: string; priority?: string; dueDate?: string; assigneeIds?: string[] }) =>
      apiClient.post<any>('/tasks', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS }),
  });
}

// Requests hooks
export interface RequestData {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  requester: { username: string; email: string };
  approvals: { status: string; approver: { username: string } }[];
}

export function useRequests() {
  return useQuery({
    queryKey: QUERY_KEYS.REQUESTS,
    queryFn: () => apiClient.get<RequestData[]>('/requests'),
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; type: string; priority?: string }) =>
      apiClient.post<RequestData>('/requests', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS }),
  });
}

// Incidents hooks
export interface IncidentData {
  id: string;
  title: string;
  severity: string;
  priority: string;
  status: string;
  assignee?: { username: string };
}

export function useIncidents() {
  return useQuery({
    queryKey: QUERY_KEYS.INCIDENTS,
    queryFn: () => apiClient.get<IncidentData[]>('/incidents'),
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; severity?: string; affectedService?: string }) =>
      apiClient.post<IncidentData>('/incidents', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INCIDENTS }),
  });
}

// Approvals hooks
export interface ApprovalData {
  id: string;
  status: string;
  comment?: string;
  request: { title: string; requester: { username: string } };
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: QUERY_KEYS.APPROVALS,
    queryFn: () => apiClient.get<ApprovalData[]>('/approvals/pending'),
  });
}

export function useUpdateApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, comment }: { id: string; status: string; comment?: string }) =>
      apiClient.patch<ApprovalData>(`/approvals/${id}`, { status, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPROVALS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS });
    },
  });
}

// Notifications hooks
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS,
    queryFn: () => apiClient.get<NotificationData[]>('/notifications'),
  });
}

export function useUnreadNotifications() {
  return useQuery({
    queryKey: QUERY_KEYS.UNREAD_NOTIFICATION_COUNT,
    queryFn: () => apiClient.get<NotificationData[]>('/notifications/unread'),
  });
}

// Workspaces hooks
export function useWorkspaces() {
  return useQuery({
    queryKey: QUERY_KEYS.WORKSPACES,
    queryFn: () => apiClient.get<any[]>('/workspaces'),
  });
}

// SLA hooks
export function useSlaDefinitions() {
  return useQuery({
    queryKey: QUERY_KEYS.SLA,
    queryFn: () => apiClient.get<any[]>('/sla'),
  });
}

// Audit Log hooks
export function useAuditLogs() {
  return useQuery({
    queryKey: QUERY_KEYS.AUDIT_LOGS,
    queryFn: () => apiClient.get<any[]>('/audit-log'),
  });
}
