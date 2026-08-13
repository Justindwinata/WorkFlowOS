import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskCommentsController } from './task-comments.controller';
import { TaskCommentsService } from './task-comments.service';
import { TaskLabelsController } from './task-labels.controller';
import { TaskLabelsService } from './task-labels.service';

@Module({
  controllers: [TasksController, TaskCommentsController, TaskLabelsController],
  providers: [TasksService, TaskCommentsService, TaskLabelsService],
  exports: [TasksService, TaskCommentsService, TaskLabelsService],
})
export class TasksModule {}
