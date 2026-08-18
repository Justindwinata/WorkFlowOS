#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const checks = [
  {
    name: 'Node version >= 20',
    run: () => {
      const version = process.version.slice(1).split('.')[0];
      return parseInt(version) >= 20;
    },
  },
  {
    name: 'npm available',
    run: () => {
      try {
        execSync('npm --version', { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    },
  },
  {
    name: 'package.json exists',
    run: () => fs.existsSync('package.json'),
  },
  {
    name: 'apps/api/package.json exists',
    run: () => fs.existsSync('apps/api/package.json'),
  },
  {
    name: 'apps/web/package.json exists',
    run: () => fs.existsSync('apps/web/package.json'),
  },
  {
    name: 'prisma schema exists',
    run: () => fs.existsSync('apps/api/prisma/schema.prisma'),
  },
  {
    name: 'docker-compose.prod.yml exists',
    run: () => fs.existsSync('docker-compose.prod.yml'),
  },
  {
    name: 'docker/api.Dockerfile exists',
    run: () => fs.existsSync('docker/api.Dockerfile'),
  },
  {
    name: 'docker/web.Dockerfile exists',
    run: () => fs.existsSync('docker/web.Dockerfile'),
  },
  {
    name: '.dockerignore exists',
    run: () => fs.existsSync('.dockerignore'),
  },
  {
    name: 'Backend builds successfully',
    run: () => {
      try {
        execSync('cd apps/api && npm run build', { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    },
  },
  {
    name: 'Frontend builds successfully',
    run: () => {
      try {
        execSync('cd apps/web && npm run build', { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    },
  },
  {
    name: 'Tests pass',
    run: () => {
      try {
        execSync('cd apps/api && npm test', { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    },
  },
  {
    name: 'Lint passes',
    run: () => {
      try {
        execSync('cd apps/api && npm run lint', { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    },
  },
];

function main() {
  console.log('=== WorkFlowOS Deployment Readiness Check ===\n');

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    try {
      const result = check.run();
      if (result) {
        console.log(`✅ ${check.name}`);
        passed++;
      } else {
        console.log(`❌ ${check.name}`);
        failed++;
      }
    } catch (e) {
      console.log(`❌ ${check.name} (error: ${e.message})`);
      failed++;
    }
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

  if (failed > 0) {
    console.log('\n⚠️  Some checks failed. Please fix before deployment.');
    process.exit(1);
  }

  console.log('\n✅ All deployment readiness checks passed!');
  process.exit(0);
}

main();