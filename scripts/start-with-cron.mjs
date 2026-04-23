import cron from 'node-cron';
import { spawn, execFile } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve as resolvePath } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolvePath(__dirname, '..');

// ─── Startup seed: run seed-articles if DB is empty ──────────
async function runStartupSeed() {
  if (!process.env.DATABASE_URL) {
    console.log('[startup-seed] No DATABASE_URL — skipping seed');
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('[startup-seed] No ANTHROPIC_API_KEY — skipping seed');
    return;
  }
  try {
    const { query, initDb, close } = await import('../src/lib/db.mjs');
    await initDb();
    const result = await query('SELECT COUNT(*) as cnt FROM articles WHERE published = true');
    const count = parseInt(result.rows[0].cnt, 10);
    await close();
    if (count >= 10) {
      console.log(`[startup-seed] ${count} articles already seeded — skipping`);
      return;
    }
    console.log(`[startup-seed] Only ${count} articles found — running seed...`);
    await new Promise((resolve, reject) => {
      const seed = spawn('node', [resolvePath(projectRoot, 'scripts/seed-articles.mjs')], {
        cwd: projectRoot,
        stdio: 'inherit',
        env: { ...process.env }
      });
      seed.on('exit', (code) => {
        if (code === 0) {
          console.log('[startup-seed] Seed complete');
          resolve();
        } else {
          console.error(`[startup-seed] Seed exited with code ${code}`);
          resolve(); // Don't block server start on seed failure
        }
      });
      seed.on('error', (err) => {
        console.error('[startup-seed] Seed error:', err);
        resolve();
      });
    });
  } catch (err) {
    console.error('[startup-seed] Error checking article count:', err.message);
  }
}

// Run seed in background (don't await — let server start immediately)
runStartupSeed().catch(console.error);

// ─── Start web server as child process ────────────────────────
const server = spawn('node', ['dist/index.js'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('exit', (code) => {
  console.error(`[cron-runner] Server exited with code ${code}. Restarting in 5s...`);
  setTimeout(() => {
    process.exit(1); // Let DigitalOcean restart the whole process
  }, 5000);
});

// ─── Guard: only run crons if AUTO_GEN_ENABLED=true ───────────
const AUTO_GEN = process.env.AUTO_GEN_ENABLED === 'true';

if (!AUTO_GEN) {
  console.log('[cron-runner] AUTO_GEN_ENABLED is not true — crons disabled');
} else {
  console.log('[cron-runner] Crons enabled');

  // Cron #1 — Article generation Mon-Fri 06:00 UTC
  cron.schedule('0 6 * * 1-5', async () => {
    console.log('[cron] #1 generate-article starting');
    try {
      const { generateDailyArticle } = await import('../src/cron/generate-article.mjs');
      await generateDailyArticle();
    } catch (err) {
      console.error('[cron] #1 generate-article error:', err);
    }
  });

  // Cron #2 — Product spotlight Saturdays 08:00 UTC
  cron.schedule('0 8 * * 6', async () => {
    console.log('[cron] #2 product-spotlight starting');
    try {
      const { generateProductSpotlight } = await import('../src/cron/product-spotlight.mjs');
      await generateProductSpotlight();
    } catch (err) {
      console.error('[cron] #2 product-spotlight error:', err);
    }
  });

  // Cron #3 — Monthly refresh 1st of month 03:00 UTC
  cron.schedule('0 3 1 * *', async () => {
    console.log('[cron] #3 refresh-monthly starting');
    try {
      const { refreshMonthly } = await import('../src/cron/refresh-monthly.mjs');
      await refreshMonthly();
    } catch (err) {
      console.error('[cron] #3 refresh-monthly error:', err);
    }
  });

  // Cron #4 — Quarterly refresh Jan/Apr/Jul/Oct 1st 04:00 UTC
  cron.schedule('0 4 1 1,4,7,10 *', async () => {
    console.log('[cron] #4 refresh-quarterly starting');
    try {
      const { refreshQuarterly } = await import('../src/cron/refresh-quarterly.mjs');
      await refreshQuarterly();
    } catch (err) {
      console.error('[cron] #4 refresh-quarterly error:', err);
    }
  });

  // Cron #5 — ASIN health check Sundays 05:00 UTC
  cron.schedule('0 5 * * 0', async () => {
    console.log('[cron] #5 asin-health-check starting');
    try {
      const { runAsinHealthCheck } = await import('../src/cron/asin-health-check.mjs');
      await runAsinHealthCheck();
    } catch (err) {
      console.error('[cron] #5 asin-health-check error:', err);
    }
  });

  console.log('[cron-runner] All 5 crons scheduled');
}
