import { Controller, Sse, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Observable, interval, from, switchMap, map } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsSseController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Sse('stream')
  stream(@CurrentUser('id') userId: string): Observable<{ data: any }> {
    return interval(5000).pipe(
      switchMap(() => from(this.notificationsService.findUnread(userId))),
      map((unread) => ({
        data: {
          count: unread.length,
          unread,
        },
      })),
    );
  }
}
