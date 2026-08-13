import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto, UpdateRequestStatusDto } from './dto/request.dto';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRequestDto, userId: string) {
    return this.prisma.request.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        priority: dto.priority || 'medium',
        requesterId: userId,
      },
      include: { requester: true, approvals: true },
    });
  }

  async findAll(userId?: string) {
    return this.prisma.request.findMany({
      where: userId ? { requesterId: userId } : {},
      include: { requester: true, approvals: { include: { approver: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: { requester: true, approvals: { include: { approver: true } } },
    });

    if (!request) {
      throw new NotFoundException('Request tidak ditemukan');
    }

    return request;
  }

  async updateStatus(id: string, dto: UpdateRequestStatusDto) {
    const request = await this.prisma.request.findUnique({
      where: { id },
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

  async delete(id: string) {
    const request = await this.prisma.request.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Request tidak ditemukan');
    }

    await this.prisma.request.delete({ where: { id } });
    return { message: 'Request berhasil dihapus' };
  }
}
