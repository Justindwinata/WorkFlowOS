import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class SoftDeleteService {
  private readonly logger = new Logger(SoftDeleteService.name);

  constructor(private prisma: PrismaService) {}

  async hardDelete(model: string, id: string) {
    const key = `${model.charAt(0).toLowerCase() + model.slice(1)}s`;
    const modelAccess = (this.prisma as any)[key];
    if (!modelAccess) {
      throw new NotFoundException(`Model ${model} tidak ditemukan`);
    }

    this.logger.warn(`Hard deleting ${model}:${id}`);
    return modelAccess.delete({ where: { id } });
  }

  async restore(model: string, id: string) {
    const key = `${model.charAt(0).toLowerCase() + model.slice(1)}s`;
    const modelAccess = (this.prisma as any)[key];
    if (!modelAccess) {
      throw new NotFoundException(`Model ${model} tidak ditemukan`);
    }

    const existing = await modelAccess.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`${model} tidak ditemukan`);
    }

    this.logger.log(`Restoring ${model}:${id}`);
    return modelAccess.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}