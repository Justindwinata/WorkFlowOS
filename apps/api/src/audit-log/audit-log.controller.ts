import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('audit-log')
@Controller('audit-log')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('view_audit_log', 'admin')
  @ApiOperation({ summary: 'Daftar semua audit log' })
  async findAll(
    @CurrentUser('workspaceId') workspaceId: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditLogService.findAll(workspaceId, limit);
  }

  @Get('entity/:entity/:entityId')
  @ApiOperation({ summary: 'Audit log berdasarkan entity' })
  async findByEntity(
    @Param('entity') entity: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditLogService.findByEntity(entity, entityId);
  }

  @Get('actor/:actorId')
  @ApiOperation({ summary: 'Audit log berdasarkan actor' })
  async findByActor(@Param('actorId') actorId: string) {
    return this.auditLogService.findByActor(actorId);
  }
}
