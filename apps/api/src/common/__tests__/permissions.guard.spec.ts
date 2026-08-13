import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionsGuard, { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } }],
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

  it('should allow access when no permissions required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    expect(guard.canActivate(mockContext({ permissions: ['admin'] }))).toBe(true);
  });

  it('should allow access when user has required permission', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['manage_users']);
    expect(guard.canActivate(mockContext({ permissions: ['manage_users'] }))).toBe(true);
  });

  it('should throw ForbiddenException when missing permission', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['manage_users']);
    expect(() => guard.canActivate(mockContext({ permissions: ['view_only'] }))).toThrow(
      ForbiddenException,
    );
  });
});
