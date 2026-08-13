import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaskLabelsService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, color?: string) {
    return this.prisma.taskLabel.create({
      data: { name, color },
    });
  }

  async findAll() {
    return this.prisma.taskLabel.findMany({ orderBy: { name: 'asc' } });
  }

  async addLabelToTask(taskId: string, labelId: string) {
    return this.prisma.$queryRaw`
      INSERT INTO _TaskToTaskLabel (A, B) VALUES (${taskId}, ${labelId})
    `;
  }

  async removeLabelFromTask(taskId: string, labelId: string) {
    return this.prisma.$queryRaw`
      DELETE FROM _TaskToTaskLabel WHERE A = ${taskId} AND B = ${labelId}
    `;
  }
}
