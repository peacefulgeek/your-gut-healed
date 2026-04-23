// Dev server — runs Express with Vite middleware
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

const proc = spawn('node', ['--loader', 'ts-node/esm', 'server/index.ts'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

proc.on('exit', (code) => {
  process.exit(code ?? 0);
});
