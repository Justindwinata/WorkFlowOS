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

@ApiTags('incidents')
@Controller('incidents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat incident baru' })
  async create(@Body() dto: CreateIncidentDto) {
    return this.incidentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar semua incident' })
  async findAll() {
    return this.incidentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail incident' })
  async findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update incident' })
  async update(@Param('id') id: string, @Body() dto: UpdateIncidentDto) {
    return this.incidentsService.update(id, dto);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign user ke incident' })
  async assignUser(@Param('id') id: string, @Body() dto: AssignIncidentDto) {
    return this.incidentsService.assignUser(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus incident' })
  async delete(@Param('id') id: string) {
    return this.incidentsService.delete(id);
  }
}
