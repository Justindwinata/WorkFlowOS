import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppLogger extends Logger {
  constructor(private config: ConfigService) {
    super();
  }

  log(message: string, context?: string) {
    super.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
  }

  debug(message: string, context?: string) {
    if (this.config.get('NODE_ENV') !== 'production') {
      super.debug(message, context);
    }
  }

  logHttp(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: string,
  ) {
    const level = this.isErrorStatus(statusCode) ? 'error' : 'log';
    const message = `${method} ${url} ${duration}ms`;
    if (level === 'error') {
      this.error(message);
    } else {
      this.log(message);
    }
  }

  private isErrorStatus(status: number): boolean {
    return status >= 400;
  }

  logSecurity(event: string, userId: string, details: Record<string, unknown>) {
    this.warn(`SECURITY: ${event} - userId=${userId} details=${JSON.stringify(details)}`);
  }

  logAudit(action: string, entity: string, entityId: string, userId: string, details?: Record<string, unknown>) {
    this.log(`AUDIT: ${action} ${entity}:${entityId} by user:${userId} ${details ? JSON.stringify(details) : ''}`);
  }
}