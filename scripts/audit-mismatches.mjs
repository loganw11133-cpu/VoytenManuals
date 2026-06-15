// Cross-catalog PDF-mismatch auditor (read-only, no DB creds needed).
// Pulls every manual for a manufacturer from the public API, groups by pdf_url,
// and surfaces clusters where ONE pdf serves MANY differently-named products —
// the signal for a generic-OEM-PDF-substituted-across-wrong-family mismatch.
//
// Usage:  node scripts/audit-mismatches.mjs "ITE"
//         node scripts/audit-mismatches.mjs "ABB" --min 2
//
// Output: cluster report to stdout + full JSON dump to %TEMP%\<mfr>-mismatch-audit.json
// Note: the public /api/manuals listing returns pdf_url + subcategory but NOT
// description/keywords — enough to cluster; verify suspects against the live page.

import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = 'https://www.voytenmanuals.com';
const mfr = process.argv[2];
const minCluster = process.argv.includes('--min')
  ? Number(process.argv[process.argv.indexOf('--min') + 1])
  : 3;
if (!mfr) {
  console.error('Usage: node scripts/audit-mismatches.mjs "<Manufacturer>" [--min N]');
  process.exit(1);
}

async function fetchAll(manufacturer) {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const url = `${BASE}/api/manuals?manufacturer=${encodeURIComponent(manufacturer)}&limit=100&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API ${res.status} on page ${page}`);
    const json = await res.json();
    all.push(...json.manuals);
    totalPages = json.totalPages;
    process.stderr.write(`\r  fetched page ${page}/${totalPages} (${all.length} rows)`);
    page++;
  } while (page <= totalPages);
  process.stderr.write('\n');
  return all;
}

function norm(u) {
  if (u == null) return '__NULL__';
  const s = String(u).trim();
  if (s === '') return '__EMPTY__';
  if (s.toUpperCase() === 'NONE') return '__NONE__';
  return s;
}

const rows = await fetchAll(mfr);
console.log(`\n=== ${mfr}: ${rows.length} manuals ===\n`);

// Integrity flags
const badUrls = rows.filter(r => r.pdf_url && r.pdf_url.includes(' '));        // real URLs never contain spaces
const empty = rows.filter(r => norm(r.pdf_url) === '__EMPTY__' || norm(r.pdf_url) === '__NULL__');
const noneVal = rows.filter(r => norm(r.pdf_url) === '__NONE__');
const rawTitles = rows.filter(r => r.manual_number && r.title === r.manual_number);

// Cluster by pdf_url
const byUrl = new Map();
for (const r of rows) {
  const k = norm(r.pdf_url);
  if (!byUrl.has(k)) byUrl.set(k, []);
  byUrl.get(k).push(r);
}

const clusters = [...byUrl.entries()]
  .filter(([k, v]) => v.length >= minCluster && !k.startsWith('__'))
  .sort((a, b) => b[1].length - a[1].length);

console.log(`Integrity: ${badUrls.length} space-corrupted pdf_url | ${empty.length} empty/null | ${noneVal.length} NONE | ${rawTitles.length} raw machine-titles (title===manual_number)`);
console.log(`Shared-PDF clusters (>=${minCluster} rows): ${clusters.length}\n`);

if (badUrls.length) {
  console.log('!! SPACE-CORRUPTED pdf_url (broken Download buttons):');
  for (const r of badUrls) console.log(`   id=${r.id} ${r.slug} -> "${r.pdf_url}"`);
  console.log('');
}

for (const [url, items] of clusters) {
  const fname = url.split('/').pop();
  const subcats = [...new Set(items.map(i => i.subcategory || '—'))];
  console.log(`── ${items.length}×  ${fname}`);
  console.log(`   url: ${url}`);
  console.log(`   subcats: ${subcats.join(' | ')}`);
  for (const i of items.slice(0, 40)) {
    console.log(`     [${i.id}] ${i.title}  (${i.subcategory || '—'})`);
  }
  if (items.length > 40) console.log(`     …(+${items.length - 40} more)`);
  console.log('');
}

const out = join(tmpdir(), `${mfr.toLowerCase().replace(/\W+/g, '-')}-mismatch-audit.json`);
writeFileSync(out, JSON.stringify({
  manufacturer: mfr, total: rows.length,
  badUrls, empty, noneVal, rawTitles,
  clusters: clusters.map(([url, items]) => ({ url, count: items.length, items })),
  rows,
}, null, 2));
console.log(`Full dump: ${out}`);
