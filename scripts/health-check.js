#!/usr/bin/env node

const http = require('http');
const url = require('url');

const port = parseInt(process.env.API_PORT) || 3001;
const host = process.env.API_HOST || 'localhost';
const healthPath = process.env.HEALTH_PATH || '/health';

const options = {
  hostname: host,
  port: port,
  path: healthPath,
  method: 'GET',
  timeout: 5000,
};

const checkHealth = () => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: 'healthy',
            statusCode: res.statusCode,
            data: parsed,
          });
        } catch {
          resolve({
            status: 'degraded',
            statusCode: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        status: 'unhealthy',
        error: error.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        status: 'unhealthy',
        error: 'Request timeout',
      });
    });

    req.end();
  });
};

const main = async () => {
  console.log(`Health check: ${host}:${port}${healthPath}`);
  
  try {
    const result = await checkHealth();
    
    if (result.status === 'healthy' || result.status === 'degraded') {
      console.log(`Health check passed: ${result.statusCode}`);
      console.log(`Response: ${JSON.stringify(result.data, null, 2)}`);
      process.exit(0);
    } else {
      console.error(`Health check failed: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Health check error: ${error.message || error}`);
    process.exit(1);
  }
};

main();
