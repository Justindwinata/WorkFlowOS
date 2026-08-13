import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SlaService } from './sla.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('sla')
@Controller('sla')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SlaController {
  constructor(private readonly slaService: SlaService) {}

  @Post()
  @ApiOperation({ summary: 'Create SLA definition' })
  async create(@Body() dto: { name: string; responseTarget: number; resolutionTarget: number; warningThreshold: number }) {
    return this.slaService.create(dto.name, dto.responseTarget, dto.resolutionTarget, dto.warningThreshold);
  }

  @Get()
  @ApiOperation({ summary: 'List all SLA definitions' })
  async findAll() {
    return this.slaService.findAll();
  }

  @Get(':name/check')
  @ApiOperation({ summary: 'Check SLA breach status for elapsed time' })
  async check(@Param('name') name: string, @Body() dto: { elapsedMinutes: number }) {
    return this.slaService.checkBreach(name, dto.elapsedMinutes);
  }
}
