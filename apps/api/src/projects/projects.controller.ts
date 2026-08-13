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
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat project baru' })
  async create(@Body() dto: CreateProjectDto, @CurrentUser('workspaceId') workspaceId: string) {
    return this.projectsService.create(dto, workspaceId);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar semua project' })
  async findAll(@CurrentUser('workspaceId') workspaceId: string) {
    return this.projectsService.findAll(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail project' })
  async findOne(@Param('id') id: string, @CurrentUser('workspaceId') workspaceId: string) {
    return this.projectsService.findOne(id, workspaceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.projectsService.update(id, dto, workspaceId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus project' })
  async delete(@Param('id') id: string, @CurrentUser('workspaceId') workspaceId: string) {
    return this.projectsService.delete(id, workspaceId);
  }
}
