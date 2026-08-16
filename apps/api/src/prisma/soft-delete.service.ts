import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

const SOFT_DELETE_MODELS = ['User', 'Team', 'Project', 'Task', 'Request', 'Incident'] as const;

@Injectable()
export class SoftDeleteService {
  private readonly logger = new Logger(SoftDeleteService.name);

  constructor(private prisma: PrismaService) {
    this.registerPrismaMiddleware();
  }

  /**
   * Prisma middleware to enforce soft-delete:
   * - findFirst/findUnique/findMany exclude deletedAt !== null by default
   * - delete/deleteMany become update(deletedAt = now)
   */
  private registerPrismaMiddleware() {
    this.prisma.$use(async (params: any, next: any) => {
      if (!SOFT_DELETE_MODELS.includes(params.model as any)) {
        return next(params);
      }

      // Read filters
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        params.action = 'findFirst';
        params.args = params.args || {};
        params.args.where = params.args.where || {};
        if (params.args.where.deletedAt === undefined) {
          params.args.where.deletedAt = null;
        }
      }

      if (params.action === 'findMany' || params.action === 'count') {
        params.args = params.args || {};
        params.args.where = params.args.where || {};
        if (params.args.where.deletedAt === undefined) {
          params.args.where.deletedAt = null;
        }
      }

      // Deletes become soft deletes
      if (params.action === 'delete') {
        params.action = 'update';
        params.args = params.args || {};
        params.args.data = { ...params.args.data, deletedAt: new Date() };
      }

      if (params.action === 'deleteMany') {
        params.action = 'updateMany';
        params.args = params.args || {};
        params.args.data = params.args.data || {};
        params.args.data.deletedAt = new Date();
      }

      return next(params);
    });
  }

  async hardDelete(model: string, id: string) {
    const key = this.resolveModelKey(model);
    const modelAccess = (this.prisma as any)[key];
    if (!modelAccess) {
      throw new Error(`Model ${model} tidak ditemukan`);
    }
    this.logger.warn(`Hard deleting ${model}:${id}`);
    return modelAccess.delete({ where: { id } });
  }

  async restore(model: string, id: string) {
    const key = this.resolveModelKey(model);
    const modelAccess = (this.prisma as any)[key];
    if (!modelAccess) {
      throw new Error(`Model ${model} tidak ditemukan`);
    }
    this.logger.log(`Restoring ${model}:${id}`);
    return modelAccess.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  private resolveModelKey(model: string): string {
    const base = model.charAt(0).toLowerCase() + model.slice(1);
    // Handle irregular pluralization
    if (base.endsWith('y')) return `${base.slice(0, -1)}ies`;
    return `${base}s`;
  }
}