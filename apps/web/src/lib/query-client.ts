import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const QUERY_KEYS = {
  USERS: ['users'],
  USER: (id: string) => ['user', id],
  TEAMS: ['teams'],
  TEAM: (id: string) => ['team', id],
  PROJECTS: ['projects'],
  PROJECT: (id: string) => ['project', id],
  TASKS: ['tasks'],
  TASK: (id: string) => ['task', id],
  REQUESTS: ['requests'],
  REQUEST: (id: string) => ['request', id],
  INCIDENTS: ['incidents'],
  INCIDENT: (id: string) => ['incident', id],
  APPROVALS: ['approvals'],
  APPROVAL: (id: string) => ['approval', id],
  NOTIFICATIONS: ['notifications'],
  UNREAD_NOTIFICATION_COUNT: ['unread-notifications'],
  AUDIT_LOGS: ['audit-logs'],
  WORKSPACES: ['workspaces'],
  CURRENT_WORKSPACE: ['current-workspace'],
  SLA: ['sla'],
} as const;
