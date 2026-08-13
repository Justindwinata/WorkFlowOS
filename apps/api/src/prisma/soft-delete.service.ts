import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

const SOFT_DELETE_ENTITIES = ['User', 'Team', 'Project', 'Task', 'Request', 'Incident'];

@Injectable()
export class SoftDeleteService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  onModuleInit() {
    this.prisma.$use(async (params, next) => {
      if (!params.model || !SOFT_DELETE_ENTITIES.includes(params.model)) {
        return next(params);
      }

      if (params.action === 'findUnique' || params.action === 'findFirst') {
        params.action = 'findFirst';
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};
        if (params.args.where.deletedAt === undefined) {
          params.args.where.deletedAt = null;
        }
      }

      if (params.action === 'findMany' || params.action === 'count') {
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};
        if (params.args.where.deletedAt === undefined) {
          params.args.where.deletedAt = null;
        }
      }

      if (params.action === 'delete') {
        const target = await (this.prisma as any)[params.model.toLowerCase()].findFirst({
          where: params.args?.where,
        });
        if (target) {
          try {
            await this.auditLog.create('soft_delete', params.model, target.id, 'system', `Soft deleted ${params.model}`);
          } catch {}
        }
        params.action = 'update';
        params.args = { ...params.args, data: { deletedAt: new Date() } };
      }

      if (params.action === 'deleteMany') {
        params.action = 'updateMany';
        if (!params.args.data) params.args.data = {};
        params.args.data.deletedAt = new Date();
      }

      return next(params);
    });
  }

  async hardDelete(model: string, id: string, actorId: string) {
    const lower = model.toLowerCase();
    await this.auditLog.create('hard_delete', model, id, actorId, `Hard deleted ${model}`);
    return (this.prisma as any)[lower].delete({ where: { id } });
  }

  async restore(model: string, id: string, actorId: string) {
    const lower = model.toLowerCase();
    await this.auditLog.create('restore', model, id, actorId, `Restored ${model}`);
    return (this.prisma as any)[lower].update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
