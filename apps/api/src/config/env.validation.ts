export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const errors: string[] = [];

  const databaseUrl = config.DATABASE_URL;
  if (!databaseUrl || typeof databaseUrl !== 'string') {
    errors.push('DATABASE_URL is required');
  }

  const jwtAccess = config.JWT_ACCESS_SECRET;
  const jwtRefresh = config.JWT_REFRESH_SECRET;
  const nodeEnv = config.NODE_ENV || 'development';

  if (!jwtAccess || typeof jwtAccess !== 'string' || jwtAccess.length < 16) {
    errors.push('JWT_ACCESS_SECRET must be defined and at least 16 characters long');
  }

  if (!jwtRefresh || typeof jwtRefresh !== 'string' || jwtRefresh.length < 16) {
    errors.push('JWT_REFRESH_SECRET must be defined and at least 16 characters long');
  }

  if (nodeEnv === 'production') {
    if (jwtAccess === 'dev-access-secret-change-in-production' || (typeof jwtAccess === 'string' && jwtAccess.length < 32)) {
      errors.push('JWT_ACCESS_SECRET must be at least 32 characters and not use dev default in production');
    }
    if (jwtRefresh === 'dev-refresh-secret-change-in-production' || (typeof jwtRefresh === 'string' && jwtRefresh.length < 32)) {
      errors.push('JWT_REFRESH_SECRET must be at least 32 characters and not use dev default in production');
    }
  }

  if (errors.length > 0) {
    console.error('\n❌ NestJS Environment Validation Error:');
    errors.forEach((err) => console.error(`  - ${err}`));
    throw new Error(`Environment validation failed with ${errors.length} error(s).`);
  }

  return config;
}
