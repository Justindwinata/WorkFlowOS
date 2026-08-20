#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../apps/api/.env') });

const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_PORT = parseInt(process.env.API_PORT || process.env.PORT || '3001', 10);
const WEB_PORT = parseInt(process.env.WEB_PORT || '3000', 10);
const LOCK_FILE = path.join(__dirname, '.dev.lock');

// Helper: check if port is available
function checkPortInUse(port) {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    server.once('error', (err) => {
      resolve(err.code === 'EADDRINUSE');
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port, '127.0.0.1');
  });
}

// Helper: wait for HTTP endpoint (200 = healthy, 503 = still starting)
function waitForEndpoint(url, name, timeout = 90000, interval = 1000, requiredStatus = 200) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode === requiredStatus) {
          resolve();
        } else {
          if (Date.now() - start > timeout) {
            reject(new Error(`${name} did not become ready (last status ${res.statusCode})`));
          } else {
            setTimeout(check, interval);
          }
        }
      });
      req.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error(`${name} did not become ready in time`));
        } else {
          setTimeout(check, interval);
        }
      });
      req.setTimeout(3000, () => req.destroy());
    };
    check();
  });
}

// Spawn a process with logging
function startProcess(name, command, args, options = {}) {
  const child = spawn(command, args, { stdio: 'inherit', detached: false, ...options });
  child.on('exit', (code) => {
    if (code !== 0) {
      console.log(`\n❌ ${name} exited with code ${code}`);
    }
  });
  return child;
}

function checkPrereq(command, name, hint) {
  try {
    execSync(command, { stdio: 'ignore', timeout: 5000 });
    return true;
  } catch {
    console.error(`❌ ${name}`);
    console.error(`   Action: ${hint}`);
    return false;
  }
}

async function main() {
  const lockExists = fs.existsSync(LOCK_FILE);
  if (lockExists) {
    let pid = null;
    try {
      pid = parseInt(fs.readFileSync(LOCK_FILE, 'utf8').trim(), 10);
    } catch { /* ignore */ }
    if (pid && process.kill(pid, 0)) {
      console.error('❌ Another dev process is already running (pid ' + pid + ').');
      console.error('   Action: run "make stop" or kill pid ' + pid + ' before starting again.');
      process.exit(1);
    }
    fs.unlinkSync(LOCK_FILE);
  }
  fs.writeFileSync(LOCK_FILE, String(process.pid), 'utf8');

  console.log('🚀 Starting WorkFlowOS development servers...\n');

  // 1. Infrastructure prerequisites
  const apiEnvReady = fs.existsSync(path.join(__dirname, '../apps/api/.env'));
  if (!apiEnvReady) {
    console.error('❌ apps/api/.env missing.');
    console.error('   Action: run "make setup" (or "make env") first to initialize the environment.');
    process.exit(1);
  }

  const requiredEnv = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  for (const env of requiredEnv) {
    if (!process.env[env]) {
      console.error(`❌ Missing required environment variable: ${env}`);
      console.error('   Action: verify apps/api/.env contains the value.');
      process.exit(1);
    }
  }

  const pgReady = checkPrereq('pg_isready -h localhost -p 5432', 'PostgreSQL is not running.', 'brew services start postgresql@15');
  if (!pgReady) process.exit(1);
  const redisReady = checkPrereq('redis-cli ping', 'Redis is not available.', 'brew services start redis');
  if (!redisReady) process.exit(1);

  // 2. Port availability
  if (await checkPortInUse(API_PORT)) {
    console.error(`❌ Port ${API_PORT} is already in use.`);
    console.error('   Action: stop the process using port ' + API_PORT + ' (run: lsof -ti:' + API_PORT + ' | xargs kill) or set API_PORT in apps/api/.env');
    fs.unlinkSync(LOCK_FILE);
    process.exit(1);
  }
  if (await checkPortInUse(WEB_PORT)) {
    console.error(`❌ Port ${WEB_PORT} is already in use.`);
    console.error('   Action: stop the process using port ' + WEB_PORT + ' (run: lsof -ti:' + WEB_PORT + ' | xargs kill) or set WEB_PORT in apps/api/.env');
    fs.unlinkSync(LOCK_FILE);
    process.exit(1);
  }

  console.log('✅ Environment, databases, and ports validated');

  // 3. Start API
  console.log('\n📡 Starting API server on port ' + API_PORT + '...');
  const apiProcess = startProcess('API', 'npm', ['run', 'start:dev'], { cwd: path.join(__dirname, '../apps/api') });

  // 4. Wait for API readiness (database + redis must be up)
  console.log('⏳ Waiting for API readiness...');
  try {
    await waitForEndpoint(`${API_URL}/readiness`, 'API', 120000, 1500, 200);
    console.log('✅ API is ready: ' + API_URL);
  } catch (e) {
    console.error('❌ API did not become ready in time.');
    console.error('   Detail: ' + e.message);
    console.error('   Action: check logs above, or run "make doctor" to verify prerequisites.');
    apiProcess.kill('SIGTERM');
    fs.unlinkSync(LOCK_FILE);
    process.exit(1);
  }

  // 5. Start Web
  console.log('\n🌐 Starting Web server on port ' + WEB_PORT + '...');
  const webProcess = startProcess('Web', 'npm', ['run', 'dev'], { cwd: path.join(__dirname, '../apps/web') });

  // 6. Wait for Web
  console.log('⏳ Waiting for Web server...');
  try {
    await waitForEndpoint(`http://localhost:${WEB_PORT}`, 'Web', 120000, 1500);
    console.log('✅ Web is ready: http://localhost:' + WEB_PORT);
  } catch (e) {
    console.error('❌ Web did not become ready in time.');
    console.error('   Detail: ' + e.message);
    apiProcess.kill('SIGTERM');
    webProcess.kill('SIGTERM');
    fs.unlinkSync(LOCK_FILE);
    process.exit(1);
  }

  console.log('\n✨ WorkFlowOS is running!');
  console.log('   API:   ' + API_URL);
  console.log('   Web:   http://localhost:' + WEB_PORT);
  console.log('   Docs:  ' + API_URL + '/api');
  console.log('\n   Press Ctrl+C to stop all servers.');

  let shuttingDown = false;
  // Handle graceful shutdown and signal forwarding
  const cleanup = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log('\n🛑 Shutting down (signal: ' + signal + ')...');
    if (apiProcess && !apiProcess.killed) apiProcess.kill('SIGTERM');
    if (webProcess && !webProcess.killed) webProcess.kill('SIGTERM');
    setTimeout(() => {
      if (apiProcess && !apiProcess.killed) apiProcess.kill('SIGKILL');
      if (webProcess && !webProcess.killed) webProcess.kill('SIGKILL');
      if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE);
      process.exit(0);
    }, 2500);
  };

  process.on('SIGINT', () => cleanup('SIGINT'));
  process.on('SIGTERM', () => cleanup('SIGTERM'));
  process.on('SIGHUP', () => cleanup('SIGHUP'));
}

main().catch((err) => {
  console.error('❌ Fatal error: ' + (err.message || err));
  if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE);
  process.exit(1);
});