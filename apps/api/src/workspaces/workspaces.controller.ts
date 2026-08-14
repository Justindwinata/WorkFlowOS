import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Body } from '@nestjs/common';

@ApiTags('workspaces')
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @ApiOperation({ summary: 'List workspaces for current user' })
  async listUserWorkspaces(@CurrentUser('id') userId: string) {
    return this.workspacesService.findUserWorkspaces(userId);
  }

  @Post('switch')
  @ApiOperation({ summary: 'Switch current workspace' })
  async switchWorkspace(
    @CurrentUser('id') userId: string,
    @Body() dto: { workspaceId: string },
  ) {
    return this.workspacesService.switchWorkspace(userId, dto.workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace details' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.workspacesService.findOne(id, userId);
  }
}