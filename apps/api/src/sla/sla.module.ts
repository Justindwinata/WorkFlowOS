import { Module } from '@nestjs/common';
import { SlaController } from './sla.controller';
import { SlaService } from './sla.service';
import { SlaEnforcementService } from './sla-enforcement.service';

@Module({
  controllers: [SlaController],
  providers: [SlaService, SlaEnforcementService],
  exports: [SlaService, SlaEnforcementService],
})
export class SlaModule {}
