#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_PORT = process.env.API_PORT || 3001;
const WEB_PORT = process.env.WEB_PORT || 3000;

// Helper: wait for HTTP endpoint
function waitForHealth(url, name, timeout = 60000, interval = 1000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          if (Date.now() - start > timeout) {
            reject(new Error(`${name} health check failed with status ${res.statusCode}`));
          } else {
            setTimeout(check, interval);
          }
        }
      }).on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error(`${name} did not become ready in time`));
        } else {
          setTimeout(check, interval);
        }
      });
    };
    check();
  });
}

// Spawn a process with logging
function startProcess(name, command, args, options = {}) {
  const child = spawn(command, args, { stdio: 'inherit', ...options });
  child.on('exit', (code) => {
    if (code !== 0) {
      console.log(`\n❌ ${name} exited with code ${code}`);
    }
  });
  return child;
}

async function main() {
  console.log('🚀 Starting WorkFlowOS development servers...\n');

  // 1. Environment validation
  const requiredEnv = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  for (const env of requiredEnv) {
    if (!process.env[env]) {
      console.error(`❌ Missing required environment variable: ${env}`);
      process.exit(1);
    }
  }

  console.log('✅ Environment variables validated');

  // 2. Start API
  console.log('\n📡 Starting API server on port ' + API_PORT + '...');
  const apiProcess = startProcess('API', 'npm', ['run', 'start:dev'], { cwd: path.join(__dirname, '../apps/api') });

  // 3. Wait for API health
  console.log('⏳ Waiting for API health check...');
  try {
    await waitForHealth(`${API_URL}/health`, 'API');
    console.log('✅ API is ready at ' + API_URL);
  } catch (e) {
    console.error('❌ ' + e.message);
    apiProcess.kill();
    process.exit(1);
  }

  // 4. Start Web
  console.log('\n🌐 Starting Web server on port ' + WEB_PORT + '...');
  const webProcess = startProcess('Web', 'npm', ['run', 'dev'], { cwd: path.join(__dirname, '../apps/web') });

  // 5. Wait for Web
  console.log('⏳ Waiting for Web server...');
  try {
    await waitForHealth(`http://localhost:${WEB_PORT}`, 'Web', 60000, 1000);
    console.log('✅ Web is ready at http://localhost:' + WEB_PORT);
  } catch (e) {
    console.error('❌ ' + e.message);
    apiProcess.kill();
    webProcess.kill();
    process.exit(1);
  }

  console.log('\n✨ WorkFlowOS is running!');
  console.log('   API:  ' + API_URL);
  console.log('   Web:  http://localhost:' + WEB_PORT);
  console.log('   \nPress Ctrl+C to stop all servers.');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    apiProcess.kill('SIGINT');
    webProcess.kill('SIGINT');
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});