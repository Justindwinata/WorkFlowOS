import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TransactionalService {
  constructor(private prisma: PrismaService) {}

  async runTransaction<T>(fn: (tx: any) => Promise<any>): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      try {
        return await fn(tx);
      } catch (error) {
        throw error;
      }
    });
  }
}