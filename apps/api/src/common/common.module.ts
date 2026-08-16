import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TransactionalService } from './utils/transactional.service';

@Module({
  imports: [PrismaModule],
  providers: [TransactionalService],
  exports: [TransactionalService],
})
export class CommonModule {}