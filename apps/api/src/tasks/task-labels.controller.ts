import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TaskLabelsService } from './task-labels.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('task-labels')
@Controller('task-labels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TaskLabelsController {
  constructor(private readonly taskLabelsService: TaskLabelsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new label' })
  async create(@Body() dto: { name: string; color?: string }) {
    return this.taskLabelsService.create(dto.name, dto.color);
  }

  @Get()
  @ApiOperation({ summary: 'List all labels' })
  async findAll() {
    return this.taskLabelsService.findAll();
  }

  @Post('tasks/:taskId/labels/:labelId')
  @ApiOperation({ summary: 'Add label to task' })
  async addLabelToTask(
    @Param('taskId') taskId: string,
    @Param('labelId') labelId: string,
  ) {
    await this.taskLabelsService.addLabelToTask(taskId, labelId);
    return { message: 'Label added to task' };
  }

  @Delete('tasks/:taskId/labels/:labelId')
  @ApiOperation({ summary: 'Remove label from task' })
  async removeLabelFromTask(
    @Param('taskId') taskId: string,
    @Param('labelId') labelId: string,
  ) {
    await this.taskLabelsService.removeLabelFromTask(taskId, labelId);
    return { message: 'Label removed from task' };
  }
}
