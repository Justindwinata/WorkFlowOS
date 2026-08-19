#!/usr/bin/env node
const http = require('http');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const checks = [
  { path: '/health', description: 'API health endpoint' },
  { path: '/readiness', description: 'API readiness endpoint' },
  { path: '/startup', description: 'API startup endpoint' },
  { path: '/api', description: 'Swagger API documentation' },
];

async function check(url, description) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      // Readiness/Startup probes return 200 or 503, both are "running" if body matches
      resolve({ url, description, status: res.statusCode, ok: res.statusCode === 200 });
    }).on('error', (e) => {
      resolve({ url, description, error: e.message, ok: false });
    });
  });
}

async function main() {
  console.log('Running deployment smoke tests...\n');

  const results = await Promise.all(
    checks.map((c) => check(`${API_URL}${c.path}`, c.description)),
  );

  let passed = 0;
  let failed = 0;

  results.forEach((result) => {
    if (!result) return;
    if (result.ok) {
      passed++;
      console.log(`✅ ${result.description}: ${result.status || 'OK'}`);
    } else {
      failed++;
      console.log(`❌ ${result.description}: ${result.error || result.status}`);
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main();
