import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class WorkspacePermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.permissions || !user.workspaceId) {
      throw new ForbiddenException('Anda tidak memiliki akses');
    }

    const hasPermission = requiredPermissions.some((permission) =>
      user.permissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Anda tidak memiliki permission yang diperlukan');
    }

    const request = context.switchToHttp().getRequest();
    const workspaceId = request.params.workspaceId || request.query.workspaceId || user.workspaceId;

    if (workspaceId && workspaceId !== user.workspaceId) {
      const membership = await this.prisma.userWorkspace.findUnique({
        where: { userId_workspaceId: { userId: user.id, workspaceId } },
      });

      if (!membership) {
        throw new ForbiddenException('Anda tidak memiliki akses ke workspace ini');
      }
    }

    return true;
  }
}