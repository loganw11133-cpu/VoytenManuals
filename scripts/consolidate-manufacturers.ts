/**
 * Consolidate the manufacturer taxonomy — applied to production 2026-05-22.
 *
 * Drives the /manufacturers browse page and the search manufacturer filter.
 * Before: 89 distinct manufacturers (long tail of tiny brands cluttered the list).
 *
 * Actions:
 *   1) Merge Cutler-Hammer (242) -> Eaton  (Cutler-Hammer is Eaton's legacy brand; Eaton -> 600)
 *   2) Fold every manufacturer with < 22 manuals, plus 'Unknown', into 'Other Manufacturers'
 *      (70 values, 326 manuals)
 * Result: 19 manufacturer tiles. Reversible from scripts/backups/mfr-backup-*.json.
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });
const BUCKET = 'Other Manufacturers';
const THRESHOLD = 22;

async function main() {
  // 1) Merge Cutler-Hammer -> Eaton
  const m = await db.execute("UPDATE manuals SET manufacturer='Eaton' WHERE manufacturer='Cutler-Hammer'");
  console.log(`Cutler-Hammer -> Eaton: ${m.rowsAffected}`);

  // 2) Fold small manufacturers (< THRESHOLD) + 'Unknown' into the bucket.
  //    NB: compute the name list in app code (a HAVING subquery inside UPDATE proved unreliable here).
  const dist = await db.execute('SELECT manufacturer, COUNT(*) c FROM manuals GROUP BY manufacturer');
  const small = dist.rows
    .filter(r => Number(r.c) < THRESHOLD && r.manufacturer !== BUCKET)
    .map(r => String(r.manufacturer));
  const names = Array.from(new Set([...small, 'Unknown']));
  const inList = names.map(n => `'${n.replace(/'/g, "''")}'`).join(',');
  const f = await db.execute(`UPDATE manuals SET manufacturer='${BUCKET}' WHERE manufacturer IN (${inList})`);
  console.log(`Folded ${names.length} manufacturers into '${BUCKET}': ${f.rowsAffected} rows`);

  const after = await db.execute('SELECT COUNT(DISTINCT manufacturer) c FROM manuals');
  console.log(`Distinct manufacturers now: ${after.rows[0].c}`);
}
main().catch(console.error);
