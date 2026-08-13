import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TaskCommentsService } from './task-comments.service';
import { CreateTaskCommentDto } from './dto/task-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('task-comments')
@Controller('tasks/:taskId/comments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TaskCommentsController {
  constructor(private readonly taskCommentsService: TaskCommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Add comment to task' })
  async create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateTaskCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.taskCommentsService.create(taskId, dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all comments for a task' })
  async findAll(@Param('taskId') taskId: string) {
    return this.taskCommentsService.findAll(taskId);
  }
}
