import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsSseController } from './notifications.sse.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController, NotificationsSseController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
