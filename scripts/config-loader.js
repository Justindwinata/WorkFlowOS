#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const config = {
  version: '0.1.0',
  environment: process.env.NODE_ENV || 'development',
  api: {
    port: parseInt(process.env.API_PORT) || 3001,
    host: process.env.API_HOST || 'localhost',
  },
  web: {
    port: parseInt(process.env.WEB_PORT) || 3000,
    host: process.env.WEB_HOST || 'localhost',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  jwt: {
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL) || 60000,
    limit: parseInt(process.env.THROTTLE_LIMIT) || 60,
  },
  cors: {
    origin: (process.env.WEB_URL || 'http://localhost:3000').split(','),
  },
};

function validate() {
  const errors = [];

  if (!config.database.url) {
    errors.push('DATABASE_URL is required');
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET.length < 32) {
      errors.push('JWT_ACCESS_SECRET must be >= 32 chars in production');
    }
    if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
      errors.push('JWT_REFRESH_SECRET must be >= 32 chars in production');
    }
  }

  return errors;
}

function loadConfig() {
  const errors = validate();
  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }
  return config;
}

module.exports = { loadConfig, config };
