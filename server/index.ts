import express from 'express';
import compression from 'compression';
import serveStatic from 'serve-static';
import path from 'path';
import { fileURLToPath } from 'url';
import { healthRouter } from './routes/health.js';
import { articlesRouter } from './routes/articles.js';
import { sitemapRouter } from './routes/sitemap.js';
import { renderPage } from './ssr.js';
import { newsletterRouter } from './routes/newsletter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV !== 'production';
const PORT = parseInt(process.env.PORT ?? '3000', 10);

async function createServer() {
  const app = express();
  app.use(compression());
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json());

  // Health check FIRST — must work even if other routes fail
  app.use('/health', healthRouter);

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // API routes
  app.use('/api/articles', articlesRouter);
  app.use('/api/newsletter', newsletterRouter);
  app.use('/sitemap.xml', sitemapRouter);

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      try {
        const html = await renderPage(req.originalUrl, { vite });
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) { next(e); }
    });
  } else {
    const clientDir = path.resolve(__dirname, '../dist/client');
    app.use(serveStatic(clientDir, {
      index: false,
      maxAge: '1y',
      setHeaders(res, filepath) {
        if (/\.(html)$/.test(filepath)) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    }));
    app.use('*', async (req, res, next) => {
      try {
        const html = await renderPage(req.originalUrl);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) { next(e); }
    });
  }

  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[server error]', err);
    res.status(500).send('Internal Server Error');
  });

  return app;
}

const app = await createServer();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] Listening on 0.0.0.0:${PORT} (NODE_ENV=${process.env.NODE_ENV})`);
});

export default app;
