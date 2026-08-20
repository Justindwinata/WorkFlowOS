#!/usr/bin/env node

const http = require('http');

const TESTS = [
  { url: 'http://localhost:3001/health', name: 'API Health', expectStatus: 200 },
  { url: 'http://localhost:3001/readiness', name: 'API Readiness', expectStatus: 200 },
  { url: 'http://localhost:3000', name: 'Web Root', expectStatus: 200 },
];

function checkEndpoint(url, expectStatus) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: 5000 }, (res) => {
      resolve({ status: res.statusCode, ok: res.statusCode === expectStatus });
    });
    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function main() {
  console.log('🔍 Verifying WorkFlowOS startup...\n');
  
  let passed = 0;
  let failed = 0;

  for (const test of TESTS) {
    try {
      const result = await checkEndpoint(test.url, test.expectStatus);
      if (result.ok) {
        console.log(`✅ ${test.name}: ${result.status}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: expected ${test.expectStatus}, got ${result.status}`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ ${test.name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    console.error('❌ Startup verification failed');
    console.error('   Action: Ensure "make dev" is running and services are ready');
    process.exit(1);
  }

  console.log('✅ WorkFlowOS startup verified successfully');
  process.exit(0);
}

main();