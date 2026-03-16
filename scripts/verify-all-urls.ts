import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import https from 'https';
import http from 'http';
dotenv.config({ path: '.env.local' });

const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

interface UrlResult {
  pdf_url: string;
  status: number | string;
  count: number;
}

function checkUrl(url: string): Promise<number | string> {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.request(url, { method: 'HEAD', timeout: 20000 }, (res) => {
      // Follow redirects
      if (res.statusCode && [301, 302, 307, 308].includes(res.statusCode)) {
        const loc = res.headers.location;
        resolve(`${res.statusCode}->${loc?.substring(0, 80) || '?'}`);
      } else {
        resolve(res.statusCode || 0);
      }
      res.resume();
    });
    req.on('error', (e) => resolve(`ERR:${e.message.substring(0, 50)}`));
    req.on('timeout', () => { req.destroy(); resolve('TIMEOUT'); });
    req.end();
  });
}

async function main() {
  // Get all distinct URLs with counts
  const result = await db.execute(
    'SELECT pdf_url, COUNT(*) as cnt FROM manuals GROUP BY pdf_url ORDER BY cnt DESC'
  );

  const urls = result.rows.map(r => ({
    url: r.pdf_url as string,
    count: Number(r.cnt),
  }));

  console.log(`Scanning ${urls.length} distinct URLs...`);

  const broken: UrlResult[] = [];
  const ok: number[] = [];
  const CONCURRENCY = 25;

  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async ({ url, count }) => {
        const status = await checkUrl(url);
        return { pdf_url: url, status, count };
      })
    );

    for (const r of results) {
      if (r.status === 200 || r.status === 206) {
        ok.push(r.count);
      } else {
        broken.push(r);
      }
    }

    // Progress
    const done = Math.min(i + CONCURRENCY, urls.length);
    if (done % 250 === 0 || done === urls.length) {
      console.log(`  ${done}/${urls.length} checked, ${broken.length} broken so far`);
    }
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`OK (200): ${ok.length} URLs covering ${ok.reduce((a, b) => a + b, 0)} entries`);
  console.log(`BROKEN: ${broken.length} URLs\n`);

  if (broken.length > 0) {
    // Group by domain
    const byDomain: Record<string, UrlResult[]> = {};
    for (const b of broken) {
      const domain = new URL(b.pdf_url).hostname;
      if (!byDomain[domain]) byDomain[domain] = [];
      byDomain[domain].push(b);
    }

    for (const [domain, items] of Object.entries(byDomain).sort((a, b) =>
      b[1].reduce((s, i) => s + i.count, 0) - a[1].reduce((s, i) => s + i.count, 0)
    )) {
      const totalEntries = items.reduce((s, i) => s + i.count, 0);
      console.log(`\n--- ${domain} (${items.length} URLs, ${totalEntries} entries) ---`);
      for (const item of items.sort((a, b) => b.count - a.count)) {
        console.log(`  ${String(item.status).padEnd(8)} ${item.count}x ${item.pdf_url.substring(0, 120)}`);
      }
    }
  }
}

main().catch(console.error);
