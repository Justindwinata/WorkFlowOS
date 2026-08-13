import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, AssignTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat task baru' })
  async create(@Body() dto: CreateTaskDto, @CurrentUser('id') userId: string, @CurrentUser('workspaceId') workspaceId: string) {
    return this.tasksService.create(dto, userId, workspaceId);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar semua task' })
  async findAll(@Query('projectId') projectId?: string, @CurrentUser('workspaceId') workspaceId?: string) {
    return this.tasksService.findAll(projectId, workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail task' })
  async findOne(@Param('id') id: string, @CurrentUser('workspaceId') workspaceId: string) {
    return this.tasksService.findOne(id, workspaceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.tasksService.update(id, dto, workspaceId);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign user ke task' })
  async assignUser(
    @Param('id') id: string,
    @Body() dto: AssignTaskDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.tasksService.assignUser(id, dto, workspaceId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus task' })
  async delete(@Param('id') id: string, @CurrentUser('workspaceId') workspaceId: string) {
    return this.tasksService.delete(id, workspaceId);
  }
}
