export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const APP_NAME = 'WorkFlowOS';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  TEAMS: '/teams',
  PROJECTS: '/projects',
  TASKS: '/tasks',
  REQUESTS: '/requests',
  INCIDENTS: '/incidents',
  APPROVALS: '/approvals',
  NOTIFICATIONS: '/notifications',
  AUDIT_LOG: '/audit-log',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;
