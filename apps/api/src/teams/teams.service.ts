import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto, UpdateTeamDto, AddTeamMemberDto } from './dto/team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTeamDto, workspaceId: string) {
    const existing = await this.prisma.team.findFirst({
      where: { workspace: { id: workspaceId }, name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Tim dengan nama ini sudah ada');
    }

    return this.prisma.team.create({
      data: {
        name: dto.name,
        description: dto.description,
        workspaceId,
      },
      include: { members: true },
    });
  }

  async findAll(workspaceId: string) {
    return this.prisma.team.findMany({
      where: { workspaceId },
      include: { members: { include: { user: true } }, _count: { select: { projects: true } } },
    });
  }

  async findOne(id: string, workspaceId: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, workspaceId },
      include: { members: { include: { user: true } }, projects: true },
    });

    if (!team) {
      throw new NotFoundException('Tim tidak ditemukan');
    }

    return team;
  }

  async update(id: string, dto: UpdateTeamDto, workspaceId: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, workspaceId },
    });

    if (!team) {
      throw new NotFoundException('Tim tidak ditemukan');
    }

    return this.prisma.team.update({
      where: { id },
      data: {
        name: dto.name ?? team.name,
        description: dto.description ?? team.description,
      },
      include: { members: { include: { user: true } } },
    });
  }

  async addMember(id: string, dto: AddTeamMemberDto, workspaceId: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, workspaceId },
    });

    if (!team) {
      throw new NotFoundException('Tim tidak ditemukan');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const existing = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: dto.userId, teamId: id } },
    });

    if (existing) {
      throw new ConflictException('User sudah menjadi anggota tim');
    }

    return this.prisma.teamMember.create({
      data: {
        userId: dto.userId,
        teamId: id,
        role: dto.role || 'member',
      },
      include: { user: true },
    });
  }

  async removeMember(id: string, userId: string, workspaceId: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, workspaceId },
    });

    if (!team) {
      throw new NotFoundException('Tim tidak ditemukan');
    }

    await this.prisma.teamMember.delete({
      where: { userId_teamId: { userId, teamId: id } },
    });

    return { message: 'Anggota berhasil dihapus dari tim' };
  }

  async delete(id: string, workspaceId: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, workspaceId },
    });

    if (!team) {
      throw new NotFoundException('Tim tidak ditemukan');
    }

    await this.prisma.team.delete({ where: { id } });
    return { message: 'Tim berhasil dihapus' };
  }
}
