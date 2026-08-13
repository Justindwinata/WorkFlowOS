import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SoftDeleteService } from './soft-delete.service';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [AuditLogModule],
  providers: [PrismaService, SoftDeleteService],
  exports: [PrismaService, SoftDeleteService],
})
export class PrismaModule {}
