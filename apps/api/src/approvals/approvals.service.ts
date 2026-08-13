import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApprovalDto, UpdateApprovalDto } from './dto/approval.dto';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApprovalDto, approverId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: dto.requestId },
    });

    if (!request) {
      throw new NotFoundException('Request tidak ditemukan');
    }

    const existing = await this.prisma.approval.findUnique({
      where: { requestId_approverId: { requestId: dto.requestId, approverId } },
    });

    if (existing) {
      throw new BadRequestException('Anda sudah memberikan approval untuk request ini');
    }

    return this.prisma.approval.create({
      data: {
        requestId: dto.requestId,
        approverId,
        status: 'pending',
        comment: dto.comment,
      },
      include: { approver: true, request: true },
    });
  }

  async findAll() {
    return this.prisma.approval.findMany({
      include: { approver: true, request: { include: { requester: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPending(approverId: string) {
    return this.prisma.approval.findMany({
      where: { approverId, status: 'pending' },
      include: { approver: true, request: { include: { requester: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const approval = await this.prisma.approval.findUnique({
      where: { id },
      include: { approver: true, request: { include: { requester: true } } },
    });

    if (!approval) {
      throw new NotFoundException('Approval tidak ditemukan');
    }

    return approval;
  }

  async update(id: string, dto: UpdateApprovalDto, approverId: string) {
    const approval = await this.prisma.approval.findUnique({
      where: { id },
    });

    if (!approval) {
      throw new NotFoundException('Approval tidak ditemukan');
    }

    if (approval.approverId !== approverId) {
      throw new BadRequestException('Anda tidak memiliki akses untuk mengubah approval ini');
    }

    const updated = await this.prisma.approval.update({
      where: { id },
      data: {
        status: dto.status,
        comment: dto.comment ?? approval.comment,
      },
      include: { approver: true, request: true },
    });

    if (dto.status === 'approved') {
      const allApprovals = await this.prisma.approval.findMany({
        where: { requestId: approval.requestId },
      });

      const allApproved = allApprovals.every((a) => a.status === 'approved');

      if (allApproved) {
        await this.prisma.request.update({
          where: { id: approval.requestId },
          data: { status: 'completed' },
        });
      }
    }

    return updated;
  }
}
