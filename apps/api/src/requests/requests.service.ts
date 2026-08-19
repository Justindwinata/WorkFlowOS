import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto, UpdateRequestStatusDto } from './dto/request.dto';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRequestDto, userId: string, workspaceId: string) {
    return this.prisma.request.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        priority: dto.priority || 'medium',
        requesterId: userId,
        workspaceId,
      },
      include: { requester: true, approvals: true },
    });
  }

  async findAll(
    workspaceId: string,
    status?: string,
    priority?: string,
    type?: string,
    search?: string,
    limit = 100,
    offset = 0,
  ) {
    const where: any = { workspaceId, deletedAt: null };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.request.findMany({
      where,
      include: { requester: true, approvals: { include: { approver: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string, workspaceId: string) {
    const request = await this.prisma.request.findFirst({
      where: { id, workspaceId },
      include: { requester: true, approvals: { include: { approver: true } } },
    });

    if (!request) {
      throw new NotFoundException('Request tidak ditemukan');
    }

    return request;
  }

  async updateStatus(id: string, dto: UpdateRequestStatusDto, workspaceId: string) {
    const request = await this.prisma.request.findFirst({
      where: { id, workspaceId },
    });

    if (!request) {
      throw new NotFoundException('Request tidak ditemukan');
    }

    return this.prisma.request.update({
      where: { id },
      data: { status: dto.status },
      include: { requester: true, approvals: true },
    });
  }

  async delete(id: string, workspaceId: string) {
    const request = await this.prisma.request.findFirst({
      where: { id, workspaceId },
    });

    if (!request) {
      throw new NotFoundException('Request tidak ditemukan');
    }

    await this.prisma.request.delete({ where: { id } });
    return { message: 'Request berhasil dihapus' };
  }
}
