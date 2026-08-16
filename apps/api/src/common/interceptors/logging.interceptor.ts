import { Injectable, Logger, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const start = Date.now();
    const requestId = headers['x-request-id'] || this.randomId();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          this.metricsService.incrementCounter('http_requests_total');
          this.metricsService.incrementLabeled('http_requests_by_method', method);
          this.metricsService.recordLatency('http', duration);
          this.logger.log(
            `[${requestId}] ${method} ${url} ${duration}ms - ${ip} - ${userAgent}`,
          );
        },
        error: (err) => {
          const duration = Date.now() - start;
          this.metricsService.incrementCounter('http_errors_total');
          this.metricsService.incrementLabeled('http_errors_by_method', method);
          this.logger.error(
            `[${requestId}] ${method} ${url} ${duration}ms - ${ip} - ${err.message}`,
            err.stack,
          );
        },
      }),
    );
  }

  private randomId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}