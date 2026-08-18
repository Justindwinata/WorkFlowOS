import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, AssignTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTaskDto, userId: string, workspaceId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, workspaceId },
    });

    if (!project) {
      throw new NotFoundException('Project tidak ditemukan');
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
        creatorId: userId,
        priority: dto.priority || 'medium',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
      include: { assignments: { include: { user: true } }, comments: true },
    });

    return task;
  }

  async findAll(
    projectId?: string,
    workspaceId?: string,
    limit = 100,
    offset = 0,
    status?: string,
    priority?: string,
    assigneeId?: string,
    search?: string,
  ) {
    const where: any = {
      project: { workspaceId },
      deletedAt: null,
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assigneeId) {
      where.assignments = { some: { userId: assigneeId } };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.task.findMany({
      where,
      include: {
        assignments: { include: { user: true } },
        creator: { select: { id: true, username: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string, workspaceId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, project: { workspaceId } },
      include: { assignments: { include: { user: true } }, comments: { include: { author: true } }, creator: true },
    });

    if (!task) {
      throw new NotFoundException('Task tidak ditemukan');
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto, workspaceId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, project: { workspaceId } },
    });

    if (!task) {
      throw new NotFoundException('Task tidak ditemukan');
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title ?? task.title,
        description: dto.description ?? task.description,
        status: dto.status ?? task.status,
        priority: dto.priority ?? task.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : task.dueDate,
      },
      include: { assignments: { include: { user: true } } },
    });
  }

  async assignUser(id: string, dto: AssignTaskDto, workspaceId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, project: { workspaceId } },
    });

    if (!task) {
      throw new NotFoundException('Task tidak ditemukan');
    }

    return this.prisma.taskAssignment.create({
      data: { taskId: id, userId: dto.userId },
      include: { user: true },
    });
  }

  async delete(id: string, workspaceId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, project: { workspaceId } },
    });

    if (!task) {
      throw new NotFoundException('Task tidak ditemukan');
    }

    await this.prisma.task.delete({ where: { id } });
    return { message: 'Task berhasil dihapus' };
  }
}
