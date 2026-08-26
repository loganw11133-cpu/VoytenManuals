// One-off: repair the mangled ampersand in the S&C Type SM-20 fuse title.
// The scrape wrote "S AMP C" (HTML-entity "&amp;" flattened to a word), which
// is also fossilised in the slug as "s-amp-c-...". Slug is left alone so the
// live URL keeps working; only the display title changes.
//
// Run: node scripts/fix-sc-sm20-title.mjs
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local' });

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const ID = 5338;
const NEW_TITLE = 'S&C Power Fuses Type SM-20 Indoor Distribution 138 KV Through 345 KV';

const before = (await db.execute({ sql: 'SELECT id, slug, title FROM manuals WHERE id = ?', args: [ID] })).rows[0];
if (!before) { console.error('id ' + ID + ' not found — aborting'); process.exit(1); }

console.log('before | ' + before.title);

await db.execute({
  sql: "UPDATE manuals SET title = ?, updated_at = datetime('now') WHERE id = ?",
  args: [NEW_TITLE, ID],
});

const after = (await db.execute({ sql: 'SELECT id, slug, title, updated_at FROM manuals WHERE id = ?', args: [ID] })).rows[0];
console.log('after  | ' + after.title);
console.log('slug   | ' + after.slug + '  (unchanged — URL still resolves)');
console.log('stamp  | ' + after.updated_at);
