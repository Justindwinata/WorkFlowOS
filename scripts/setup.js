#!/usr/bin/env node

const { execSync } = require('child_process');

function runAndExit(cmd, okMessage, errorPrefix) {
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log('  ' + okMessage);
  } catch (e) {
    console.error('❌ ' + errorPrefix);
    if (e.stdout) console.error(String(e.stdout));
    if (e.stderr) console.error(String(e.stderr));
    process.exit(1);
  }
}

function check(cmd, name, hint) {
  try {
    execSync(cmd, { stdio: 'ignore', timeout: 8000 });
    console.log('✅ ' + name);
    return true;
  } catch {
    console.error('❌ ' + name);
    console.error('   Action: ' + hint);
    return false;
  }
}

console.log('🚀 Setting up WorkFlowOS...\n');

// 1. Environment file bootstrap (with generated dev secrets)
runAndExit('node scripts/ensure-env.js', 'Environment file ready', 'Failed to prepare environment file');

// 2. Environment validation
if (!check('node scripts/validate-env.js --strict', 'Environment validation passed', 'Fix the reported .env issues, then re-run make setup')) process.exit(1);

// 3. Node version
const nodeMajor = parseInt(process.version.slice(1).split('.')[0], 10);
if (nodeMajor < 20) {
  console.error(`❌ Node.js 20+ is required (current: ${process.version})`);
  process.exit(1);
}
console.log('✅ Node.js version ' + process.version);

// 4. Prerequisites
if (!check('pg_isready -h localhost -p 5432', 'PostgreSQL ready on 5432', 'brew services start postgresql@15')) process.exit(1);
if (!check('redis-cli ping', 'Redis ready on 6379', 'brew services start redis')) {
  console.warn('⚠️  Redis not ready; attempting to start via Homebrew...');
  try {
    execSync('brew services start redis', { stdio: 'ignore' });
    console.log('✅ Redis service started');
  } catch {
    console.error('❌ Redis is not running. Install/start Redis or the app will run without cache.');
  }
}

// 5. Install dependencies
console.log('\n📦 Installing dependencies...');
runAndExit('npm ci', 'Dependencies installed', 'Failed to install dependencies');

// 6. Prisma generate + validation
console.log('\n🏗  Running Prisma generate...');
runAndExit('cd apps/api && npx prisma generate', 'Prisma client generated', 'Prisma generate failed');

console.log('🗄️ Running database migrations...');
runAndExit('cd apps/api && npx prisma migrate deploy', 'Database migrated', 'Database migration gagal (failed). Check DATABASE_URL and PostgreSQL connectivity.');

// 7. Verify migration status
console.log('📊 Checking migration status...');
runAndExit('cd apps/api && npx prisma migrate status', 'Migration status clean', 'Migration status check failed');

// 8. Seed (idempotent; existing data preserved)
console.log('\n🌱 Seeding database (idempotent)...');
runAndExit('cd apps/api && npm run seed', 'Database seeded', 'Database seeding gagal (failed)');

console.log('\n✨ WorkFlowOS setup complete!');
console.log('   API:   http://localhost:3001');
console.log('   Web:   http://localhost:3000');
console.log('   Admin: admin@workflowos.id / Admin123!');
console.log('   Run "make dev" to start development servers.\n');