import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PermissionsGuard } from '../guards/permissions.guard';
import { WorkspaceIsolationGuard } from '../guards/workspace-isolation.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TokenService } from '../../auth/token.service';

describe('Security Regression Tests', () => {
  describe('PermissionsGuard (RBAC)', () => {
    let guard: PermissionsGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      guard = new PermissionsGuard(reflector);
    });

    it('allows access when no permissions required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = createMockContext({ user: { id: 'user-1', permissions: [] } });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('denies access when user has no permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['manage_users']);
      const context = createMockContext({ user: { id: 'user-1', permissions: [] } });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('denies access when user lacks required permission', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['manage_users']);
      const context = createMockContext({ user: { id: 'user-1', permissions: ['read_tasks'] } });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('allows access when user has required permission', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['manage_users']);
      const context = createMockContext({ user: { id: 'user-1', permissions: ['manage_users', 'read_tasks'] } });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('denies access when user object is missing', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['manage_users']);
      const context = createMockContext({});
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('WorkspaceIsolationGuard', () => {
    let guard: WorkspaceIsolationGuard;
    let reflector: Reflector;
    let prisma: { userWorkspace: { findUnique: jest.Mock } };

    beforeEach(() => {
      reflector = new Reflector();
      prisma = { userWorkspace: { findUnique: jest.fn() } } as any;
      guard = new WorkspaceIsolationGuard(reflector, prisma as any);
    });

    it('denies access when user is not logged in', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = createMockContext({});
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('allows access when user accesses own workspace', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = createMockContext({
        user: { id: 'user-1', workspaceId: 'ws-1', permissions: [] },
      });
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('denies access when user is not member of target workspace', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      prisma.userWorkspace.findUnique.mockResolvedValue(null);
      const context = createMockContext({
        user: { id: 'user-1', workspaceId: 'ws-1', permissions: [] },
        params: { workspaceId: 'ws-2' },
      });
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('allows access when user is member of target workspace', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      prisma.userWorkspace.findUnique.mockResolvedValue({ id: 'membership-1' });
      const context = createMockContext({
        user: { id: 'user-1', workspaceId: 'ws-1', permissions: [] },
        params: { workspaceId: 'ws-2' },
      });
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('denies access when user lacks required permission', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['manage_users']);
      const context = createMockContext({
        user: { id: 'user-1', workspaceId: 'ws-1', permissions: ['read_tasks'] },
      });
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('JwtAuthGuard', () => {
    it('throws UnauthorizedException when no user', () => {
      const guard = new JwtAuthGuard();
      expect(() => guard.handleRequest(null, null)).toThrow(UnauthorizedException);
    });

    it('returns user when valid', () => {
      const guard = new JwtAuthGuard();
      const user = { id: 'user-1', email: 'test@test.com' };
      expect(guard.handleRequest(null, user)).toEqual(user);
    });
  });

  describe('TokenService - Session Revocation', () => {
    let tokenService: TokenService;
    let jwtService: JwtService;

    beforeEach(() => {
      jwtService = new JwtService({ secret: 'test-secret-key-for-testing-purposes-only' });
      const configService = {
        get: jest.fn((key: string) => {
          if (key === 'JWT_ACCESS_SECRET') return 'test-access-secret';
          if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
          if (key === 'JWT_ACCESS_EXPIRATION') return '15m';
          if (key === 'JWT_REFRESH_EXPIRATION') return '7d';
          return null;
        }),
      } as any;
      tokenService = new TokenService(jwtService, configService);
    });

    it('generates valid access and refresh tokens', async () => {
      const payload = { sub: 'user-1', email: 'test@test.com', username: 'test', roleId: 'role-1', workspaceId: 'ws-1', version: 0 };
      const tokens = await tokenService.generateTokenPair(payload);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });

    it('verifies refresh token correctly', async () => {
      const payload = { sub: 'user-1', email: 'test@test.com', username: 'test', roleId: 'role-1', workspaceId: 'ws-1', version: 0 };
      const tokens = await tokenService.generateTokenPair(payload);
      const decoded = tokenService.verifyRefreshToken(tokens.refreshToken);
      expect(decoded.sub).toBe('user-1');
    });

    it('rejects invalid refresh token', () => {
      expect(() => tokenService.verifyRefreshToken('invalid-token')).toThrow();
    });

    it('token version mismatch causes refresh rejection', async () => {
      const payload = { sub: 'user-1', email: 'test@test.com', username: 'test', roleId: 'role-1', workspaceId: 'ws-1', version: 0 };
      const tokens = await tokenService.generateTokenPair(payload);
      const decoded = tokenService.verifyRefreshToken(tokens.refreshToken);
      expect(decoded.version).toBe(0);
    });
  });
});

function createMockContext(overrides: Partial<{ user: any; params: any; query: any; body: any }> = {}): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: overrides.user,
        params: overrides.params || {},
        query: overrides.query || {},
        body: overrides.body || {},
      }),
    }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  } as any;
}
