import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  @ApiOperation({ summary: 'Liveness probe - service is running' })
  async health(@Res() res: Response) {
    const result = await this.healthService.check();
    return res.status(200).json(result);
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Readiness probe - dependencies are ready' })
  async readiness(@Res() res: Response) {
    const result = await this.healthService.readiness();
    return res.status(result.status === 'ready' ? 200 : 503).json(result);
  }
}
