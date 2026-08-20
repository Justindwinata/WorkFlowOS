#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const checks = [
  { name: 'API Health', url: 'http://localhost:3001/health', expectStatus: 200 },
  { name: 'API Readiness', url: 'http://localhost:3001/readiness', expectStatus: 200 },
  { name: 'API Startup', url: 'http://localhost:3001/startup', expectStatus: 200 },
  { name: 'Web Root', url: 'http://localhost:3000', expectStatus: 200 },
];

function checkEndpoint(url, expectStatus) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 5000 }, (res) => {
      resolve({ ok: res.statusCode === expectStatus, status: res.statusCode });
    });
    req.on('error', () => resolve({ ok: false, error: true }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, timeout: true });
    });
  });
}

async function main() {
  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    const result = await checkEndpoint(check.url, check.expectStatus);
    if (result.ok) {
      console.log(`✅ ${check.name}`);
      passed++;
    } else {
      console.log(`❌ ${check.name}`);
      failed++;
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

main();