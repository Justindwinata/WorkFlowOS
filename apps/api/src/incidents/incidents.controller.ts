import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto, UpdateIncidentDto, AssignIncidentDto } from './dto/incident.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('incidents')
@Controller('incidents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat incident baru' })
  async create(@Body() dto: CreateIncidentDto, @CurrentUser('workspaceId') workspaceId: string) {
    return this.incidentsService.create(dto, workspaceId);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar semua incident' })
  async findAll(@CurrentUser('workspaceId') workspaceId: string) {
    return this.incidentsService.findAll(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail incident' })
  async findOne(@Param('id') id: string, @CurrentUser('workspaceId') workspaceId: string) {
    return this.incidentsService.findOne(id, workspaceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update incident' })
  async update(@Param('id') id: string, @Body() dto: UpdateIncidentDto, @CurrentUser('workspaceId') workspaceId: string) {
    return this.incidentsService.update(id, dto, workspaceId);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign user ke incident' })
  async assignUser(@Param('id') id: string, @Body() dto: AssignIncidentDto, @CurrentUser('workspaceId') workspaceId: string) {
    return this.incidentsService.assignUser(id, dto, workspaceId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus incident' })
  async delete(@Param('id') id: string, @CurrentUser('workspaceId') workspaceId: string) {
    return this.incidentsService.delete(id, workspaceId);
  }
}