import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskCommentDto } from './dto/task-comment.dto';

@Injectable()
export class TaskCommentsService {
  constructor(private prisma: PrismaService) {}

  async create(taskId: string, dto: CreateTaskCommentDto, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task tidak ditemukan');

    return this.prisma.taskComment.create({
      data: {
        content: dto.content,
        taskId,
        authorId: userId,
      },
      include: { author: true },
    });
  }

  async findAll(taskId: string) {
    return this.prisma.taskComment.findMany({
      where: { taskId },
      include: { author: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}
