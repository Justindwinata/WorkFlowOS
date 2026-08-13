import { Injectable, NestInterceptor, CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const user = request.user;

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`${method} ${url} by user: ${user?.email || 'anonymous'}`);
      }),
    );
  }
}
