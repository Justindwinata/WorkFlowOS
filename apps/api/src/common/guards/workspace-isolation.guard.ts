import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Hardened workspace isolation guard.
 *
 * Enforces BOTH:
 *   1. the user has the required permission, AND
 *   2. the user is a member of the target workspace.
 */
@Injectable()
export class WorkspaceIsolationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('Anda harus login');
    }

    // 1. Permission check
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission =
        Array.isArray(user.permissions) &&
        requiredPermissions.some((p) => user.permissions.includes(p));
      if (!hasPermission) {
        throw new ForbiddenException('Anda tidak memiliki akses');
      }
    }

    // 2. Workspace membership check (from params, query, or body)
    const targetWorkspaceId =
      request.params?.workspaceId ||
      request.query?.workspaceId ||
      request.body?.workspaceId ||
      user.workspaceId;

    if (targetWorkspaceId && targetWorkspaceId !== user.workspaceId) {
      const membership = await this.prisma.userWorkspace.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId: targetWorkspaceId,
          },
        },
      });
      if (!membership) {
        throw new ForbiddenException('Anda tidak memiliki akses ke workspace ini');
      }
    }

    return true;
  }
}