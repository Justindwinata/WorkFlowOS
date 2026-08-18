import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SoftDeleteService } from './soft-delete.service';

@Global()
@Module({
  providers: [PrismaService, SoftDeleteService],
  exports: [PrismaService, SoftDeleteService],
})
export class PrismaModule {}
