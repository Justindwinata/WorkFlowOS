import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async findUserWorkspaces(userId: string) {
    const memberships = await this.prisma.userWorkspace.findMany({
      where: { userId },
      include: { workspace: true, role: true },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      role: m.role.name,
      current: m.current,
    }));
  }

  async switchWorkspace(userId: string, workspaceId: string) {
    const membership = await this.prisma.userWorkspace.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
      include: { workspace: true, role: true },
    });

    if (!membership) {
      throw new ForbiddenException('Anda tidak memiliki akses ke workspace ini');
    }

    await this.prisma.userWorkspace.updateMany({
      where: { userId, current: true },
      data: { current: false },
    });

    await this.prisma.userWorkspace.update({
      where: { userId_workspaceId: { userId, workspaceId } },
      data: { current: true },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { workspaceId, roleId: membership.roleId },
    });

    return {
      id: membership.workspace.id,
      name: membership.workspace.name,
      slug: membership.workspace.slug,
      role: membership.role.name,
    };
  }

  async findOne(id: string, userId: string) {
    const membership = await this.prisma.userWorkspace.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: id } },
      include: { workspace: true, role: true },
    });

    if (!membership) {
      throw new NotFoundException('Workspace tidak ditemukan');
    }

    return membership.workspace;
  }

  async createWorkspace(userId: string, name: string, slug: string) {
    const role = await this.prisma.role.findUnique({ where: { name: 'admin' } });
    if (!role) throw new NotFoundException('Role admin tidak ditemukan');

    const workspace = await this.prisma.workspace.create({
      data: { name, slug },
    });

    await this.prisma.userWorkspace.create({
      data: {
        userId,
        workspaceId: workspace.id,
        roleId: role.id,
        current: false,
      },
    });

    return workspace;
  }
}