import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/audit-log.dto';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAuditLogDto, actorId: string) {
    return this.prisma.auditLog.create({
      data: {
        action: dto.action,
        entity: dto.entity,
        entityId: dto.entityId,
        actorId,
        summary: dto.summary,
      },
      include: { actor: true },
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

  async findByEntity(entity: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entity, entityId },
      include: { actor: { select: { id: true, email: true, firstName: true, lastName: true } } },
      orderBy: { timestamp: 'desc' },
    });
  }

  async findByActor(actorId: string) {
    return this.prisma.auditLog.findMany({
      where: { actorId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }
}
