import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, workspaceId: string) {
    const team = await this.prisma.team.findFirst({
      where: { id: dto.teamId, workspaceId },
    });

    if (!team) {
      throw new NotFoundException('Tim tidak ditemukan');
    }

    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        teamId: dto.teamId,
        workspaceId,
      },
    });
  }

  async findAll(workspaceId: string) {
    return this.prisma.project.findMany({
      where: { workspaceId },
      include: { team: true, _count: { select: { tasks: true } } },
    });
  }

  async findOne(id: string, workspaceId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, workspaceId },
      include: { team: true, tasks: { take: 10 } },
    });

    if (!project) {
      throw new NotFoundException('Project tidak ditemukan');
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto, workspaceId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, workspaceId },
    });

    if (!project) {
      throw new NotFoundException('Project tidak ditemukan');
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name ?? project.name,
        description: dto.description ?? project.description,
        status: dto.status ?? project.status,
      },
    });
  }

  async delete(id: string, workspaceId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, workspaceId },
    });

    if (!project) {
      throw new NotFoundException('Project tidak ditemukan');
    }

    await this.prisma.project.delete({ where: { id } });
    return { message: 'Project berhasil dihapus' };
  }
}
