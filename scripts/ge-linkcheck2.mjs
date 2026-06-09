/** Throttled GE manual link-health check — paces requests to avoid 429, retries 429. */
const sleep = ms => new Promise(r => setTimeout(r, ms));

let all = [], page = 1, total = Infinity;
while (all.length < total) {
  const j = await (await fetch('https://www.voytenmanuals.com/api/manuals?manufacturer=General%20Electric&limit=100&page=' + page)).json();
  total = j.total; all = all.concat(j.manuals || []); if (!j.manuals || !j.manuals.length) break; page++;
}
console.log('throttled-checking', all.length, 'GE pages...');

async function status(slug) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch('https://www.voytenmanuals.com/manual/' + slug, { redirect: 'manual' });
      if (r.status === 429) { await sleep(3000); continue; }
      return r.status;
    } catch { return -1; }
  }
  return 429;
}

const bad = [];
let i = 0;
for (const m of all) {
  i++;
  const code = await status(m.slug);
  if (code !== 200) bad.push({ slug: m.slug, code, title: m.title });
  if (i % 100 === 0) console.log(`  ${i}/${all.length} (non-200 so far: ${bad.length})`);
  await sleep(450);
}
console.log('\n=== GENUINE non-200 GE pages:', bad.length, '===');
for (const b of bad) console.log(`  [${b.code}] ${b.slug}  (${b.title})`);
