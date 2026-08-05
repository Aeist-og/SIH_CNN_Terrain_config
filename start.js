/**
 * Single Unified Launcher for TerrainVision AI
 * Starts both Python Flask Backend and React Vite Frontend concurrently.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '=====================================================');
console.log('\x1b[32m%s\x1b[0m', '  🚀 Launching TerrainVision AI Unified Service');
console.log('\x1b[36m%s\x1b[0m', '=====================================================');

// 1. Launch Flask Backend API Server
console.log('\x1b[33m%s\x1b[0m', '[1/2] Starting Flask Backend Server (python api_server.py)...');
const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
const backend = spawn(pythonCmd, ['api_server.py'], {
  cwd: __dirname,
  stdio: 'pipe',
  shell: true
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[34m[Backend]\x1b[0m ${data.toString()}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[Backend Error]\x1b[0m ${data.toString()}`);
});

// 2. Launch React Vite Frontend Dev Server
console.log('\x1b[33m%s\x1b[0m', '[2/2] Starting React Vite Frontend Server (mobile_app)...');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'mobile_app'),
  stdio: 'pipe',
  shell: true
});

frontend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[Frontend]\x1b[0m ${data.toString()}`);
});

frontend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[Frontend Error]\x1b[0m ${data.toString()}`);
});

// Clean shutdown handler
const shutdown = () => {
  console.log('\n\x1b[31m%s\x1b[0m', 'Shutting down TerrainVision services...');
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
