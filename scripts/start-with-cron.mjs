import cron from 'node-cron';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve as resolvePath } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolvePath(__dirname, '..');

// ─── Startup seed: run bulk-seed if DB has fewer than 10 published articles ──
async function runStartupSeed() {
  if (!process.env.DATABASE_URL) {
    console.log('[startup-seed] No DATABASE_URL — skipping seed');
    return;
  }
  if (!process.env.OPENAI_API_KEY) {
    console.log('[startup-seed] No OPENAI_API_KEY — skipping seed');
    return;
  }
  try {
    const { query, initDb, close } = await import('../src/lib/db.mjs');
    await initDb();
    const result = await query(`SELECT COUNT(*) as cnt FROM articles WHERE status = 'published'`, []);
    const count = parseInt(result.rows[0].cnt, 10);
    await close();
    if (count >= 10) {
      console.log(`[startup-seed] ${count} published articles found — skipping seed`);
      return;
    }
    console.log(`[startup-seed] Only ${count} published articles — running bulk-seed...`);
    await new Promise((res) => {
      const seed = spawn('node', [resolvePath(projectRoot, 'scripts/bulk-seed.mjs')], {
        cwd: projectRoot,
        stdio: 'inherit',
        env: { ...process.env }
      });
      seed.on('exit', (code) => {
        if (code === 0) console.log('[startup-seed] Bulk seed complete');
        else console.error(`[startup-seed] Bulk seed exited with code ${code}`);
        res();
      });
      seed.on('error', (err) => {
        console.error('[startup-seed] Seed error:', err);
        res();
      });
    });
  } catch (err) {
    console.error('[startup-seed] Error:', err.message);
  }
}

// Run seed in background — don't block server start
runStartupSeed().catch(console.error);

// ─── Start web server as child process ───────────────────────────────────────
const server = spawn('node', ['dist/index.js'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('exit', (code) => {
  console.error(`[cron-runner] Server exited with code ${code}. Restarting in 5s...`);
  setTimeout(() => process.exit(1), 5000);
});

// ─── Guard: only run crons if AUTO_GEN_ENABLED=true ──────────────────────────
const AUTO_GEN = process.env.AUTO_GEN_ENABLED === 'true';

if (!AUTO_GEN) {
  console.log('[cron-runner] AUTO_GEN_ENABLED is not true — crons disabled');
} else {
  console.log('[cron-runner] Crons enabled — phase-based publishing active');

  /**
   * Cron #1 — Phase-based Article Publisher
   *
   * Phase 1 (published < 60):  5x/day, every day
   *   07:00, 10:00, 13:00, 16:00, 19:00 UTC
   *
   * Phase 2 (published >= 60): 1x/weekday
   *   08:00 UTC, Monday-Friday
   *
   * Each run checks the queue first. If queue has articles, publishes oldest.
   * If queue is empty, generates a fresh article and publishes it.
   */
  async function runArticlePublisher() {
    console.log('[cron] #1 article-publisher starting');
    try {
      const { query } = await import('../src/lib/db.mjs');
      const countRes = await query(
        `SELECT COUNT(*) as cnt FROM articles WHERE status = 'published'`,
        []
      );
      const publishedCount = parseInt(countRes.rows[0].cnt, 10);
      const phase = publishedCount < 60 ? 1 : 2;
      console.log(`[cron] #1 Phase ${phase} (${publishedCount} published)`);

      const { publishNextArticle } = await import('../src/cron/generate-article.mjs');
      await publishNextArticle();
    } catch (err) {
      console.error('[cron] #1 article-publisher error:', err);
    }
  }

  // Phase 1 times: 07:00, 10:00, 13:00, 16:00, 19:00 UTC — every day
  // Phase 2 times: 08:00 UTC — Mon-Fri only
  // We schedule all Phase 1 slots every day, but inside each handler we check
  // the phase and skip if we're in Phase 2 and it's not the 08:00 slot.

  cron.schedule('0 7 * * *', async () => {
    const { query } = await import('../src/lib/db.mjs');
    const r = await query(`SELECT COUNT(*) as cnt FROM articles WHERE status = 'published'`, []);
    if (parseInt(r.rows[0].cnt, 10) < 60) await runArticlePublisher();
    else console.log('[cron] #1 Phase 2 active — skipping 07:00 slot');
  });

  cron.schedule('0 8 * * 1-5', async () => {
    // This runs Mon-Fri — valid for both Phase 1 and Phase 2
    await runArticlePublisher();
  });

  cron.schedule('0 10 * * *', async () => {
    const { query } = await import('../src/lib/db.mjs');
    const r = await query(`SELECT COUNT(*) as cnt FROM articles WHERE status = 'published'`, []);
    if (parseInt(r.rows[0].cnt, 10) < 60) await runArticlePublisher();
    else console.log('[cron] #1 Phase 2 active — skipping 10:00 slot');
  });

  cron.schedule('0 13 * * *', async () => {
    const { query } = await import('../src/lib/db.mjs');
    const r = await query(`SELECT COUNT(*) as cnt FROM articles WHERE status = 'published'`, []);
    if (parseInt(r.rows[0].cnt, 10) < 60) await runArticlePublisher();
    else console.log('[cron] #1 Phase 2 active — skipping 13:00 slot');
  });

  cron.schedule('0 16 * * *', async () => {
    const { query } = await import('../src/lib/db.mjs');
    const r = await query(`SELECT COUNT(*) as cnt FROM articles WHERE status = 'published'`, []);
    if (parseInt(r.rows[0].cnt, 10) < 60) await runArticlePublisher();
    else console.log('[cron] #1 Phase 2 active — skipping 16:00 slot');
  });

  cron.schedule('0 19 * * *', async () => {
    const { query } = await import('../src/lib/db.mjs');
    const r = await query(`SELECT COUNT(*) as cnt FROM articles WHERE status = 'published'`, []);
    if (parseInt(r.rows[0].cnt, 10) < 60) await runArticlePublisher();
    else console.log('[cron] #1 Phase 2 active — skipping 19:00 slot');
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

  console.log('[cron-runner] All crons scheduled (phase-based publishing active)');
}
