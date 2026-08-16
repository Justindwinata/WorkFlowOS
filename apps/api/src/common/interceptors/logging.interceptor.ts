import { Injectable, Logger, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const start = Date.now();
    const requestId = headers['x-request-id'] || this.randomId();
    const reqUser = request.user as any;
    const userId = reqUser?.id ?? '-';
    const workspaceId = reqUser?.workspaceId ?? '-';

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          const status = response.statusCode;
          this.metricsService.incrementCounter('http_requests_total');
          this.metricsService.incrementLabeled('http_requests_by_method', method);
          this.metricsService.incrementLabeled('http_requests_by_status', String(status));
          this.metricsService.recordLatency('http', duration);
          this.logger.log(
            JSON.stringify({
              requestId,
              method,
              url,
              status,
              durationMs: duration,
              ip,
              userAgent,
              userId,
              workspaceId,
            }),
          );
        },
        error: (err) => {
          const duration = Date.now() - start;
          const status = err?.status || 500;
          const category = this.getErrorCategory(err);
          this.metricsService.incrementCounter('http_errors_total');
          this.metricsService.incrementLabeled('http_errors_by_method', method);
          this.logger.error(
            JSON.stringify({
              requestId,
              method,
              url,
              status,
              durationMs: duration,
              ip,
              userAgent,
              userId,
              workspaceId,
              errorCategory: category,
              message: this.sanitizeError(err.message),
            }),
            err.stack,
          );
        },
      }),
    );
  }

  private getErrorCategory(err: any): string {
    if (err?.status === 401) return 'auth';
    if (err?.status === 403) return 'authorization';
    if (err?.status === 404) return 'not_found';
    if (err?.status === 429) return 'rate_limit';
    if (err?.status && err?.status >= 500) return 'server_error';
    if (err?.status && err?.status >= 400) return 'client_error';
    return 'unknown';
  }

  private sanitizeError(message: string): string {
    if (!message) return '';
    // Mask passwords, tokens, and authorization headers in error messages
    return message
      .replace(/(password[=: ]+)[^\s,;"]+/gi, '$1[REDACTED]')
      .replace(/(refresh[_-]?token[=: ]+)[^\s,;"]+/gi, '$1[REDACTED]')
      .replace(/(access[_-]?token[=: ]+)[^\s,;"]+/gi, '$1[REDACTED]')
      .replace(/(authorization[=: ]+)[^\s,;"]+/gi, '$1[REDACTED]');
  }

  private randomId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}