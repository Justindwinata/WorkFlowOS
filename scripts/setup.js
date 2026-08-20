#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up WorkFlowOS...\n');

// 1. Check Node version
const nodeVersion = process.version.slice(1).split('.')[0];
if (parseInt(nodeVersion) < 20) {
  console.error('❌ Node.js version 20+ is required (current: ' + process.version + ')');
  process.exit(1);
}
console.log('✅ Node.js version ' + process.version);

// 2. Setup environment files if missing
const apiEnv = path.join(__dirname, '../apps/api/.env');
const apiEnvExample = path.join(__dirname, '../apps/api/.env.example');
if (!fs.existsSync(apiEnv) && fs.existsSync(apiEnvExample)) {
  fs.copyFileSync(apiEnvExample, apiEnv);
  console.log('✅ Created apps/api/.env from example');
}

// 3. Install root dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm ci', { stdio: 'inherit' });
} catch (e) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// 4. Check PostgreSQL
console.log('🐘 Checking PostgreSQL...');
try {
  execSync('pg_isready -h localhost -p 5432', { stdio: 'ignore' });
  console.log('✅ PostgreSQL service responding on port 5432');
} catch {
  console.error('❌ PostgreSQL is not running locally on port 5432');
  console.error('   Action required: Start PostgreSQL via Homebrew: brew services start postgresql@15');
  process.exit(1);
}

// 5. Check Redis
console.log('⚡ Checking Redis...');
try {
  execSync('redis-cli ping', { stdio: 'ignore' });
  console.log('✅ Redis service responding on port 6379');
} catch {
  console.warn('⚠️  Redis is not running on port 6379. Attempting to start service...');
  try {
    execSync('brew services start redis', { stdio: 'ignore' });
    console.log('✅ Started Redis via Homebrew');
  } catch {
    console.warn('⚠️  Could not start Redis via Homebrew automatically. Ensure Redis is installed and running.');
  }
}

// 6. Database Migration & Seed
console.log('🗄️ Initializing database & running migrations...');
try {
  execSync('cd apps/api && npx prisma generate && npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Database migrated successfully');
} catch (e) {
  console.error('❌ Database migration failed');
  process.exit(1);
}

console.log('🌱 Seeding database...');
try {
  execSync('cd apps/api && npm run seed', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully');
} catch (e) {
  console.error('❌ Database seeding failed');
  process.exit(1);
}

console.log('\n✨ WorkFlowOS setup complete!');
console.log('   Run "npm run dev" or "make dev" to start development servers.\n');
