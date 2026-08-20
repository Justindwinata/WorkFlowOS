#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const url = require('url');

const ENV_PATH = process.env.ENV_FILE || path.join(__dirname, '../apps/api/.env');
const STRICT = process.argv.includes('--strict');

let envVars = {};
if (fs.existsSync(ENV_PATH)) {
  const content = fs.readFileSync(ENV_PATH, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
} else {
  console.error(`❌ Environment file not found: ${ENV_PATH}`);
  console.error('   Action: run "make env" or "make setup" to create it from .env.example');
  process.exit(1);
}

const errors = [];
const warnings = [];

const get = (k) => envVars[k] ?? process.env[k];
const nodeEnv = get('NODE_ENV') || 'development';

if (!['development', 'test', 'production'].includes(nodeEnv)) {
  errors.push(`NODE_ENV "${nodeEnv}" is invalid (expected development | test | production)`);
}

const dbUrl = get('DATABASE_URL');
if (dbUrl) {
  let parsed;
  try {
    parsed = new URL(dbUrl);
  } catch {
    errors.push('DATABASE_URL is not a valid URL');
  }
  if (parsed) {
    if (parsed.protocol !== 'postgresql:' && parsed.protocol !== 'postgres:') {
      errors.push(`DATABASE_URL must use postgresql:// scheme (got ${parsed.protocol}//)`);
    }
    const port = parsed.port ? Number(parsed.port) : 5432;
    if (Number.isNaN(port) || port < 1 || port > 65535) {
      errors.push('DATABASE_URL has an invalid port');
    }
    if (!parsed.pathname || parsed.pathname === '/') {
      errors.push('DATABASE_URL is missing a database name');
    }
  }
} else {
  errors.push('DATABASE_URL is required');
}

const redisUrl = get('REDIS_URL');
if (redisUrl) {
  let parsed;
  try {
    parsed = new URL(redisUrl);
  } catch {
    errors.push('REDIS_URL is not a valid URL');
  }
  if (parsed && parsed.protocol !== 'redis:' && parsed.protocol !== 'rediss:') {
    errors.push(`REDIS_URL must use redis:// scheme (got ${parsed.protocol}//)`);
  }
} else if (nodeEnv === 'production') {
  errors.push('REDIS_URL is required in production');
}

const port = get('PORT') || get('API_PORT');
if (port !== undefined && port !== '') {
  const n = Number(port);
  if (Number.isNaN(n) || n < 1 || n > 65535) {
    errors.push(`PORT "${port}" is invalid (expected 1-65535)`);
  }
}

const webUrl = get('WEB_URL');
if (webUrl && !/^https?:\/\/.+/.test(webUrl)) {
  errors.push('WEB_URL must be a valid http(s) URL');
}

const jwtAccess = get('JWT_ACCESS_SECRET');
const jwtRefresh = get('JWT_REFRESH_SECRET');
const DEFAULT_SECRETS = ['dev-access-secret-change-in-production', 'dev-refresh-secret-change-in-production', 'default-secret', 'default-refresh-secret'];

if (nodeEnv === 'production') {
  if (!jwtAccess || jwtAccess.length < 32) {
    errors.push('JWT_ACCESS_SECRET must be at least 32 characters in production');
  }
  if (!jwtRefresh || jwtRefresh.length < 32) {
    errors.push('JWT_REFRESH_SECRET must be at least 32 characters in production');
  }
  if (jwtAccess && (DEFAULT_SECRETS.includes(jwtAccess) || jwtAccess.includes('password') || jwtAccess.includes('secret'))) {
    errors.push('JWT_ACCESS_SECRET appears to use a default/weak value (revoke and rotate before production)');
  }
  if (jwtRefresh && (DEFAULT_SECRETS.includes(jwtRefresh) || jwtRefresh.includes('password') || jwtRefresh.includes('secret'))) {
    errors.push('JWT_REFRESH_SECRET appears to use a default/weak value (revoke and rotate before production)');
  }
  if (!webUrl) {
    errors.push('WEB_URL is required in production (CORS origin)');
  }
} else {
  if (jwtAccess && jwtAccess.length < 16) {
    warnings.push('JWT_ACCESS_SECRET is short (min 16 chars; regenerate via "make env" for real deployments)');
  }
  if (!jwtAccess || DEFAULT_SECRETS.includes(jwtAccess)) {
    warnings.push('JWT_ACCESS_SECRET is missing or uses the default dev value');
  }
  if (jwtRefresh && jwtRefresh.length < 16) {
    warnings.push('JWT_REFRESH_SECRET is short (min 16 chars)');
  }
}

const throttleTtl = get('THROTTLE_TTL');
if (throttleTtl && (Number.isNaN(Number(throttleTtl)) || Number(throttleTtl) <= 0)) {
  errors.push(`THROTTLE_TTL "${throttleTtl}" is invalid (positive integer ms)`);
}
const throttleLimit = get('THROTTLE_LIMIT');
if (throttleLimit && (Number.isNaN(Number(throttleLimit)) || Number(throttleLimit) <= 0)) {
  errors.push(`THROTTLE_LIMIT "${throttleLimit}" is invalid (positive integer)`);
}

if (errors.length > 0) {
  console.error('\n❌ Environment validation FAILED:');
  errors.forEach((e) => console.error(`  - ${e}`));
  if (STRICT) {
    console.error('\n   Action: fix the issues above in ' + ENV_PATH);
    process.exit(1);
  }
}

if (STRICT && errors.length > 0) process.exit(1);
if (warnings.length > 0 && errors.length === 0) {
  console.warn('\n⚠️  Configuration warnings:');
  warnings.forEach((w) => console.warn(`  - ${w}`));
}

const status = errors.length > 0 && !STRICT ? 'DEGRADED' : 'PASSED';
console.log(`\n✅ Environment validation ${status} (${ENV_PATH})`);
console.log(`  - Node environment: ${nodeEnv}`);
process.exit(errors.length > 0 && (STRICT || nodeEnv === 'production') ? 1 : 0);