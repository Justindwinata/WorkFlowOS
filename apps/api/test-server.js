const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module');
const { ValidationPipe } = require('@nestjs/common');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { AuditLogInterceptor } = require('./dist/src/common/interceptors/audit-log.interceptor');
const { HttpExceptionFilter } = require('./dist/src/common/filters/http-exception.filter');
const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

async function bootstrap() {
  try {
    const app = await NestFactory.create(require('./dist/src/app.module').AppModule);
    console.log('AppModule created');
    
    app.use(cookieParser());
    app.useGlobalInterceptors(new (require('./dist/src/common/interceptors/audit-log.interceptor').AuditLogInterceptor)());
    app.useGlobalFilters(new (require('./dist/src/common/filters/http-exception.filter').HttpExceptionFilter)());
    app.useGlobalPipes(new (require('@nestjs/common').ValidationPipe)({ whitelist: true, transform: true }));
    
    const corsOrigin = process.env.WEB_URL || 'http://localhost:3000';
    app.enableCors({
      origin: corsOrigin.split(',').map(s => s.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
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
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
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

    const port = process.env.API_PORT || 3001;
    console.log('Starting server on port', port);
    
    const server = await app.listen(port);
    console.log('Server listening on port', port);
    console.log('Server address:', server.address());
  } catch (err) {
    console.error('Bootstrap error:', err);
    process.exit(1);
  }
}
bootstrap().catch(err => {
  console.error('Bootstrap error:', err);
  process.exit(1);
});