import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SoftDeleteService {
  constructor(private prisma: PrismaService) {}

  async hardDelete(model: string, id: string) {
    const key = `${model}s`;
    return (this.prisma as any)[key].delete({ where: { id } });
  }

  async restore(model: string, id: string) {
    const key = `${model}s`;
    return (this.prisma as any)[key].update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
