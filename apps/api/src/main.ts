import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalInterceptors(new AuditLogInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  const corsOrigin = process.env.WEB_URL || 'http://localhost:3000';
  app.enableCors({
    origin: corsOrigin.split(',').map((s) => s.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Vary', 'Origin');
    next();
  });

  const helmetConfig = {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        connectSrc: ["'self'", 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' as const },
  };
  app.use(helmet(helmetConfig));

  const config = new DocumentBuilder()
    .setTitle('WorkFlowOS API')
    .setDescription('Enterprise Work Management API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.API_PORT || 3001);
  console.log(`🚀 Application is running on: http://localhost:${process.env.API_PORT || 3001}`);
}
bootstrap().catch(err => {
  console.error('Bootstrap error:', err);
  process.exit(1);
});
