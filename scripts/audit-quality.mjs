import { runQualityGate } from '../src/lib/article-quality-gate.mjs';

async function loadArticles() {
  const { query, close } = await import('../src/lib/db.mjs');
  const { rows } = await query('SELECT id, slug, body FROM articles WHERE published = true');
  await close();
  return rows;
}

const articles = await loadArticles();
const report = { total: articles.length, passed: 0, failed: [] };

for (const a of articles) {
  const g = runQualityGate(a.body);
  if (g.passed) {
    report.passed++;
  } else {
    report.failed.push({
      slug: a.slug,
      failures: g.failures,
      wordCount: g.wordCount,
      amazonLinks: g.amazonLinks,
      voice: g.voice
    });
  }
}

console.log(`Quality audit: ${report.passed}/${report.total} passed`);
if (report.failed.length > 0) {
  console.log('\nFAILED articles:');
  console.log(JSON.stringify(report.failed, null, 2));
  process.exit(1);
}
process.exit(0);
