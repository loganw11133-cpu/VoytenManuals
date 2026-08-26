// One-off repair of the S&C Type SM-20 fuse record (id 5338), which carried
// both of the scrape-era defects at once:
//
//   1. "&amp;" flattened to the word "AMP"  -> "S AMP C", plus a stray "amp"
//      keyword. Also fossilised in the slug, which is deliberately NOT touched
//      so the live URL keeps resolving.
//   2. Decimal points dropped from voltages -> "138 KV" / "345 KV". Verified
//      against the source PDF (252-536, S&C Electric, 27 Sep 1982), whose cover
//      reads "Indoor Distribution (13.8 kv through 34.5 kv)" and whose body
//      lists "ratings of 13.8 kv, 25 kv, and 34.5 kv". 345 kV is transmission
//      class -- no indoor distribution fuse is rated near it.
//
// "KV" casing is left as-is; only the numbers are corrected here.
//
// Run: node scripts/fix-sc-sm20-title.mjs
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local' });

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const ID = 5338;

const NEW_TITLE = 'S&C Power Fuses Type SM-20 Indoor Distribution 13.8 KV Through 34.5 KV';

const before = (await db.execute({
  sql: 'SELECT id, slug, title, description, keywords FROM manuals WHERE id = ?', args: [ID],
})).rows[0];
if (!before) { console.error('id ' + ID + ' not found -- aborting'); process.exit(1); }

// description: "138kV rated." -> "13.8kV rated."
const newDescription = String(before.description).replace(/\b138kV rated\b/g, '13.8kV rated');

// keywords: drop the "amp" artifact, restore the decimals.
const newKeywords = String(before.keywords)
  .split(',')
  .map(k => k.trim())
  .filter(k => k.toLowerCase() !== 'amp')
  .map(k => {
    if (k === '138') return '13.8';
    if (k === '345') return '34.5';
    return k.replace(/\b138(\s*)kV\b/gi, '13.8$1kV').replace(/\b345(\s*)kV\b/gi, '34.5$1kV');
  })
  .join(', ');

console.log('--- BEFORE ---');
console.log('title       | ' + before.title);
console.log('description | ' + before.description);
console.log('keywords    | ' + before.keywords);

await db.execute({
  sql: "UPDATE manuals SET title = ?, description = ?, keywords = ?, updated_at = datetime('now') WHERE id = ?",
  args: [NEW_TITLE, newDescription, newKeywords, ID],
});

const after = (await db.execute({
  sql: 'SELECT slug, title, description, keywords, updated_at FROM manuals WHERE id = ?', args: [ID],
})).rows[0];

console.log('\n--- AFTER ---');
console.log('title       | ' + after.title);
console.log('description | ' + after.description);
console.log('keywords    | ' + after.keywords);
console.log('slug        | ' + after.slug + '  (unchanged -- URL still resolves)');
console.log('stamp       | ' + after.updated_at);
