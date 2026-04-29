import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Build main server bundle
await esbuild.build({
  entryPoints: [path.join(projectRoot, 'server/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: path.join(projectRoot, 'dist/index.js'),
  external: [
    // Never bundle vite into production server
    'vite',
    '@vitejs/plugin-react',
    // Node built-ins
    'fs', 'path', 'url', 'crypto', 'stream', 'http', 'https', 'net', 'os',
    'child_process', 'events', 'util', 'buffer', 'querystring', 'zlib',
    // Heavy native deps — let node resolve at runtime
    'pg', 'pg-native',
    'openai',
    'node-cron',
    'compression',
    'express',
    'serve-static'
  ],
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`
  }
});

// Build SSR entry
await esbuild.build({
  entryPoints: [path.join(projectRoot, 'src/client/entry-server.tsx')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: path.join(projectRoot, 'dist/server/entry-server.js'),
  external: ['react', 'react-dom', 'react-router-dom'],
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`
  }
});

console.log('[build-server] Done');
