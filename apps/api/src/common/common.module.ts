import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TransactionalService } from './utils/transactional.service';

@Module({
  imports: [PrismaModule],
})
export class CommonModule {}