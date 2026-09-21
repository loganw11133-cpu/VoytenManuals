// Creates request_log, the site's own server-side traffic record.
//
//   node scripts/init-request-log.mjs          # DRY RUN
//   node scripts/init-request-log.mjs --apply
//
// This exists because on 2026-09-19 GA4 reported 446 users (410 of them
// "Direct") and we had no way to corroborate or refute it: download_events
// only fires on an actual PDF download, ip_hash is salted one-way, and
// rate_limit_entries keeps no history. The answer had to be guessed at from
// GA4's own word.
//
// It stores COUNTERS, not requests. There is no IP, no ip_hash, no user agent
// string and no full URL -- only a country code from the edge, a coarse UA
// class and a coarse path class, bucketed by UTC hour. Hourly granularity is
// deliberate: the shape of a day is what separates a human audience from a
// bot, and it is the one thing GA4's "Direct" bucket will not tell us.
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const APPLY = process.argv.includes('--apply');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const DDL = [
  `CREATE TABLE IF NOT EXISTS request_log (
     day        TEXT    NOT NULL,
     hour       INTEGER NOT NULL,
     country    TEXT    NOT NULL,
     ua_class   TEXT    NOT NULL,
     path_class TEXT    NOT NULL,
     hits       INTEGER NOT NULL DEFAULT 0,
     PRIMARY KEY (day, hour, country, ua_class, path_class)
   )`,
  `CREATE INDEX IF NOT EXISTS idx_request_log_day ON request_log(day)`,
  `CREATE INDEX IF NOT EXISTS idx_request_log_day_ua ON request_log(day, ua_class)`,
];

const exists = await db.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name='request_log'`);
console.log(exists.rows.length ? 'request_log already exists.' : 'request_log does NOT exist yet.');

if (!APPLY) {
  console.log('\nDRY RUN. Statements that would run:\n');
  for (const s of DDL) console.log(s.replace(/\n\s+/g, '\n  ') + ';\n');
  console.log('Re-run with --apply.');
} else {
  for (const s of DDL) await db.execute(s);
  const cols = await db.execute(`pragma table_info(request_log)`);
  console.log('\nCreated. Columns: ' + cols.rows.map(r => `${r.name} ${r.type}`).join(', '));
  const idx = await db.execute(`SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='request_log'`);
  console.log('Indexes: ' + idx.rows.map(r => r.name).filter(n => !n.startsWith('sqlite_')).join(', '));
}
