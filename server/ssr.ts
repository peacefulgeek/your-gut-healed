import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV !== 'production';

export async function renderPage(url: string, options?: { vite?: any }): Promise<string> {
  let template: string;
  let render: (url: string) => Promise<{ html: string; head: string }>;

  if (isDev && options?.vite) {
    const vite = options.vite;
    template = await fs.readFile(path.resolve('index.html'), 'utf-8');
    template = await vite.transformIndexHtml(url, template);
    const mod = await vite.ssrLoadModule('/src/client/entry-server.tsx');
    render = mod.render;
  } else {
    const clientDir = path.resolve(__dirname, '../dist/client');
    template = await fs.readFile(path.join(clientDir, 'index.html'), 'utf-8');
    const serverEntry = path.resolve(__dirname, '../dist/server/entry-server.js');
    const mod = await import(serverEntry);
    render = mod.render;
  }

  const { html: appHtml, head } = await render(url);

  const finalHtml = template
    .replace('<!--app-head-->', head ?? '')
    .replace('<!--app-html-->', appHtml);

  return finalHtml;
}
