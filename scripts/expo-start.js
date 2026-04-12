// Metro: use 8082 if 8081 is taken (avoids interactive Expo prompt).
const net = require('net');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');

function portIsFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '0.0.0.0');
  });
}

async function pickPort() {
  const fromEnv = process.env.EXPO_METRO_PORT || process.env.RCT_METRO_PORT;
  if (fromEnv) {
    const n = Number(fromEnv, 10);
    if (Number.isInteger(n) && n > 0) return n;
  }
  if (await portIsFree(8081)) return 8081;
  console.log('Port 8081 is in use; starting Metro on 8082.');
  if (await portIsFree(8082)) return 8082;
  console.error('Ports 8081 and 8082 are in use. Stop the other Metro/Expo process or set EXPO_METRO_PORT.');
  process.exit(1);
}

(async () => {
  const port = await pickPort();
  const child = spawn('npx', ['expo', 'start', '--port', String(port)], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  });
  child.on('exit', (code) => process.exit(code == null ? 0 : code));
})();
