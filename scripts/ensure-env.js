#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const apiEnvPath = path.join(__dirname, '../apps/api/.env');
const apiExamplePath = path.join(__dirname, '../apps/api/.env.example');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function ensureEnv() {
  if (fs.existsSync(apiEnvPath)) {
    console.log('✅ apps/api/.env already exists');
    return;
  }

  if (!fs.existsSync(apiExamplePath)) {
    console.error('❌ apps/api/.env.example missing, cannot initialize environment');
    process.exit(1);
  }

  let content = fs.readFileSync(apiExamplePath, 'utf8');

  const accessSecret = generateSecret();
  const refreshSecret = generateSecret();

  content = content.replace(/JWT_ACCESS_SECRET=".*?"/, `JWT_ACCESS_SECRET="${accessSecret}"`);
  content = content.replace(/JWT_REFRESH_SECRET=".*?"/, `JWT_REFRESH_SECRET="${refreshSecret}"`);

  fs.writeFileSync(apiEnvPath, content, 'utf8');
  console.log('✅ Created apps/api/.env with generated dev JWT secrets');
}

ensureEnv();
