export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  roleId: string;
  workspaceId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  status: string;
  role: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type RequestStatus = 'draft' | 'submitted' | 'approval' | 'in_progress' | 'completed' | 'rejected';
export type RequestType = 'it_access' | 'laptop' | 'software' | 'procurement' | 'hr' | 'finance';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'escalated' | 'resolved' | 'closed';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | null;
  projectId: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskLabel {
  id: string;
  name: string;
  color?: string;
}

export interface NotificationData {
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}
