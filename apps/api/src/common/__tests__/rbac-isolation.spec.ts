import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsGuard } from '../guards/permissions.guard';
import { WorkspacePermissionsGuard } from '../guards/workspace-permissions.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

describe('RBAC Regression Coverage', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const mockContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as any;
  };

  const roles: Record<string, string[]> = {
    admin: ['manage_users', 'delete_users', 'create_task', 'edit_task', 'assign_task', 'view_all_tasks', 'approve_requests', 'view_audit_log', 'admin'],
    manager: ['create_task', 'edit_task', 'assign_task', 'view_all_tasks', 'view_users', 'manage_teams', 'approve_requests', 'view_audit_log'],
    member: ['create_task', 'edit_task', 'view_all_tasks', 'submit_requests', 'manage_incidents', 'assign_incidents'],
    viewer: ['view_all_tasks', 'view_users'],
  };

  it('allows access when no permissions required (any role)', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    for (const role of Object.keys(roles)) {
      const ctx = mockContext({ permissions: roles[role] });
      expect(guard.canActivate(ctx)).toBe(true);
    }
  });

  it.each(['admin', 'manager', 'member', 'viewer'])(
    '%s can access their own role-level permissions',
    (role) => {
      const perms = roles[role];
      for (const permission of perms) {
        (reflector.getAllAndOverride as jest.Mock).mockReturnValue([permission]);
        expect(guard.canActivate(mockContext({ permissions: perms }))).toBe(true);
      }
    },
  );

  it.each([
    ['manager', 'view_users', true],
    ['member', 'approve_requests', false],
    ['viewer', 'manage_teams', false],
    ['viewer', 'view_all_tasks', true],
    ['member', 'view_audit_log', false],
  ])('%s with permission %s is %s', (role, permission, allowed) => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([permission]);
    if (allowed) {
      expect(guard.canActivate(mockContext({ permissions: roles[role] }))).toBe(true);
    } else {
      expect(() => guard.canActivate(mockContext({ permissions: roles[role] }))).toThrow(ForbiddenException);
    }
  });

  it('throws ForbiddenException when user has no permissions object', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['create_task']);
    expect(() => guard.canActivate(mockContext({}))).toThrow(ForbiddenException);
  });

  it('uses OR semantics (any required permission suffices)', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['approve_requests', 'view_audit_log']);
    expect(guard.canActivate(mockContext({ permissions: ['approve_requests'] }))).toBe(true);
  });
});

describe('Workspace Isolation', () => {
  let guard: WorkspacePermissionsGuard;
  let reflector: Reflector;

  const mockPrisma = {
    userWorkspace: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacePermissionsGuard,
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    guard = module.get<WorkspacePermissionsGuard>(WorkspacePermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const mockContext = (user: any, params: any = {}, query: any = {}): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user, params, query }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as any;
  };

  it('denies access when user is not a member of target workspace', async () => {
    const user = {
      id: 'user-a',
      permissions: ['create_task'],
      workspaceId: 'workspace-a',
    };
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['create_task']);
    mockPrisma.userWorkspace.findUnique.mockResolvedValue(null);

    const ctx = mockContext(user, { workspaceId: 'workspace-b' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    expect(mockPrisma.userWorkspace.findUnique).toHaveBeenCalledWith({
      where: { userId_workspaceId: { userId: 'user-a', workspaceId: 'workspace-b' } },
    });
  });

  it('allows access when user is a member of target workspace with permission', async () => {
    const user = {
      id: 'user-a',
      permissions: ['create_task'],
      workspaceId: 'workspace-a',
    };
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['create_task']);
    mockPrisma.userWorkspace.findUnique.mockResolvedValue({
      id: 'm1',
      userId: 'user-a',
      workspaceId: 'workspace-b',
      roleId: 'role-2',
    });

    const ctx = mockContext(user, { workspaceId: 'workspace-b' });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('falls back to user workspace when no workspace param provided', async () => {
    const user = {
      id: 'user-a',
      permissions: ['create_task'],
      workspaceId: 'workspace-a',
    };
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['create_task']);

    const ctx = mockContext(user, {});
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(mockPrisma.userWorkspace.findUnique).not.toHaveBeenCalled();
  });

  it('denies when user lacks required permission even in own workspace', async () => {
    const user = {
      id: 'user-a',
      permissions: ['view_only'],
      workspaceId: 'workspace-a',
    };
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['create_task']);

    await expect(guard.canActivate(mockContext(user, {}))).rejects.toThrow(ForbiddenException);
  });

  it('workspace A user cannot access workspace B data via query param', async () => {
    const user = {
      id: 'user-a',
      permissions: ['create_task'],
      workspaceId: 'workspace-a',
    };
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['create_task']);
    mockPrisma.userWorkspace.findUnique.mockResolvedValue(null);

    const ctx = mockContext(user, {}, { workspaceId: 'workspace-b' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });
});