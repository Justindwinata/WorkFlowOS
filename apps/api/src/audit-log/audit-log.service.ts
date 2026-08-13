import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async create(action: string, entity: string, entityId: string, actorId: string, summary?: string) {
    return this.prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        actorId,
        summary,
      },
    });
  }

  async findAll(workspaceId: string, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: { actor: { workspaceId } },
      include: { actor: { select: { id: true, email: true, firstName: true, lastName: true } } },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
