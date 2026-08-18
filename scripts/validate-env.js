#!/usr/bin/env node

const requiredEnvVars = {
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
};

const warnings = {
  NODE_ENV: process.env.NODE_ENV === 'production' ? null : 'NODE_ENV is not set to production',
  WEB_URL: !process.env.WEB_URL ? 'WEB_URL is not configured' : null,
  THROTTLE_TTL: !process.env.THROTTLE_TTL ? 'THROTTLE_TTL not configured' : null,
  THROTTLE_LIMIT: !process.env.THROTTLE_LIMIT ? 'THROTTLE_LIMIT not configured' : null,
};

const criticalErrors = [];

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    criticalErrors.push(`Missing required environment variable: ${key}`);
  }
  
  if (value && value.length < 16) {
    criticalErrors.push(`Environment variable ${key} is too short (min 16 chars)`);
  }
  
  if (value && (value.includes('password') || value === 'default-secret' || value === 'default-refresh-secret')) {
    criticalErrors.push(`Environment variable ${key} appears to use default/weak value`);
  }
}

if (criticalErrors.length > 0) {
  console.error('\n❌ Environment validation FAILED:');
  criticalErrors.forEach((err) => console.error(`  - ${err}`));
  process.exit(1);
}

console.log('\n✅ Environment validation PASSED');
console.log('  - JWT secrets are configured and sufficiently long');

const activeWarnings = Object.entries(warnings).filter(([_, v]) => v !== null);
if (activeWarnings.length > 0) {
  console.warn('\n⚠️  Configuration warnings:');
  activeWarnings.forEach(([key, warning]) => console.warn(`  - ${warning}`));
}

process.exit(0);
