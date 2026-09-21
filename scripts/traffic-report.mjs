// Reads request_log — the site's own server-side traffic record.
//
//   node scripts/traffic-report.mjs                 # last 14 days
//   node scripts/traffic-report.mjs --days=30
//   node scripts/traffic-report.mjs --day=2026-09-19    # drill into one day
//
// Written to answer the question the 2026-09-19 spike could not be answered
// with: GA4 said 446 users, 410 of them "Direct", and nothing on our side could
// confirm or deny it. The three views below are the ones that settle it —
// who by agent class, where from, and what SHAPE the day had. A human audience
// and a bot look nothing alike by hour.
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const arg = (n, d) => (process.argv.find(a => a.startsWith(`--${n}=`)) || '').split('=')[1] || d;
const DAYS = Number(arg('days', 14));
const DAY = arg('day', null);

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const total = await db.execute('select count(*) n, min(day) a, max(day) b from request_log');
if (!Number(total.rows[0].n)) {
  console.log('request_log is empty. It fills from edge middleware once deployed —');
  console.log('counters flush about once a minute per edge instance.');
  process.exit(0);
}
console.log(`request_log: ${total.rows[0].n} counter rows, ${total.rows[0].a} .. ${total.rows[0].b}\n`);

const bar = (n, max, w = 40) => '#'.repeat(Math.max(n > 0 ? 1 : 0, Math.round((n / Math.max(max, 1)) * w)));

if (!DAY) {
  console.log(`=== daily totals, human vs automated (last ${DAYS} days) ===`);
  const d = await db.execute({
    sql: `select day,
                 sum(case when ua_class in ('browser','none','other') then hits else 0 end) human,
                 sum(case when ua_class not in ('browser','none','other') then hits else 0 end) bot,
                 sum(hits) all_hits
          from request_log where day >= date('now', ?) group by day order by day`,
    args: [`-${DAYS} days`],
  });
  const max = Math.max(...d.rows.map(r => Number(r.all_hits)), 1);
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (const r of d.rows) {
    const wd = dow[new Date(r.day + 'T12:00:00Z').getUTCDay()];
    const pctBot = Number(r.all_hits) ? Math.round((Number(r.bot) / Number(r.all_hits)) * 100) : 0;
    console.log(`  ${r.day} ${wd}  total ${String(r.all_hits).padStart(6)}  browser ${String(r.human).padStart(6)}  automated ${String(r.bot).padStart(6)} (${String(pctBot).padStart(3)}%)  ${bar(Number(r.all_hits), max)}`);
  }

  console.log(`\n=== by agent class (last ${DAYS} days) ===`);
  const u = await db.execute({
    sql: `select ua_class, sum(hits) hits from request_log where day >= date('now', ?) group by ua_class order by hits desc`,
    args: [`-${DAYS} days`],
  });
  const umax = Math.max(...u.rows.map(r => Number(r.hits)), 1);
  for (const r of u.rows) console.log(`  ${String(r.ua_class).padEnd(18)} ${String(r.hits).padStart(7)}  ${bar(Number(r.hits), umax, 34)}`);

  console.log(`\n=== top countries (last ${DAYS} days) ===`);
  const c = await db.execute({
    sql: `select country, sum(hits) hits from request_log where day >= date('now', ?) group by country order by hits desc limit 12`,
    args: [`-${DAYS} days`],
  });
  const cmax = Math.max(...c.rows.map(r => Number(r.hits)), 1);
  for (const r of c.rows) console.log(`  ${r.country}  ${String(r.hits).padStart(7)}  ${bar(Number(r.hits), cmax, 34)}`);

  console.log(`\n=== by section (last ${DAYS} days) ===`);
  const p = await db.execute({
    sql: `select path_class, sum(hits) hits from request_log where day >= date('now', ?) group by path_class order by hits desc`,
    args: [`-${DAYS} days`],
  });
  for (const r of p.rows) console.log(`  ${String(r.path_class).padEnd(15)} ${String(r.hits).padStart(7)}`);
  console.log('\nDrill into a day:  node scripts/traffic-report.mjs --day=YYYY-MM-DD');
} else {
  console.log(`=== ${DAY}: hour by hour ===`);
  console.log('A real audience has a working-day curve. A bot run is flat or a single spike.\n');
  const h = await db.execute({
    sql: `select hour,
                 sum(case when ua_class in ('browser','none','other') then hits else 0 end) human,
                 sum(case when ua_class not in ('browser','none','other') then hits else 0 end) bot
          from request_log where day = ? group by hour order by hour`,
    args: [DAY],
  });
  const hmax = Math.max(...h.rows.map(r => Number(r.human) + Number(r.bot)), 1);
  for (const r of h.rows) {
    console.log(`  ${String(r.hour).padStart(2, '0')}:00 UTC  browser ${String(r.human).padStart(5)}  automated ${String(r.bot).padStart(5)}  ${bar(Number(r.human) + Number(r.bot), hmax)}`);
  }

  for (const [label, col] of [['agent class', 'ua_class'], ['country', 'country'], ['section', 'path_class']]) {
    console.log(`\n=== ${DAY}: by ${label} ===`);
    const r = await db.execute({
      sql: `select ${col} k, sum(hits) hits from request_log where day = ? group by ${col} order by hits desc limit 15`,
      args: [DAY],
    });
    const m = Math.max(...r.rows.map(x => Number(x.hits)), 1);
    for (const x of r.rows) console.log(`  ${String(x.k).padEnd(18)} ${String(x.hits).padStart(7)}  ${bar(Number(x.hits), m, 30)}`);
  }
}
