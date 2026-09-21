/**
 * Server-side traffic record, written from the edge.
 *
 * The site had no way to corroborate its analytics. download_events only fires
 * on an actual PDF download, ip_hash is salted one-way, and rate_limit_entries
 * keeps no history — so when GA4 reported a 446-user day, nothing on our side
 * could confirm or refute it. This closes that gap, and it sees the traffic GA4
 * structurally cannot: crawlers and scrapers that never execute JavaScript.
 *
 * What it stores: counters keyed by (UTC day, UTC hour, country, UA class, path
 * class). No IP, no hashed IP, no user-agent string, no full URL, no identifier
 * of any kind that could single out a visitor. Country comes from the edge
 * header Vercel already computes.
 *
 * How it stays cheap: hits accumulate in memory and flush as one batched upsert
 * per interval, not one write per request. The flush is handed to waitUntil, so
 * it resolves after the response has already gone out and never adds latency.
 * The interval is short and the first request on a fresh instance flushes at
 * once, because edge instances are recycled constantly and anything still in
 * memory when one dies is simply lost. Under load that costs nothing — requests
 * arrive faster than the interval, so the buffer coalesces and one batch covers
 * many hits. It is quiet traffic that needs the eager flush.
 *
 * Because of that recycling, a partial final bucket can still be lost. This
 * measures the SHAPE of traffic and should not be quoted as an exact count.
 *
 * Nothing here may ever break a page. Every entry point swallows its own
 * errors; a logging failure must cost a data point, never a response.
 */
import { createClient } from '@libsql/client/web';

const FLUSH_MS = 5_000;    // at most one flush per 5s per edge instance
const FLUSH_KEYS = 100;    // ...or sooner if the buffer gets wide
const MAX_KEYS = 2_000;    // hard ceiling; stop accumulating rather than grow forever

/** key = day|hour|country|ua_class|path_class */
const buffer = new Map<string, number>();
/**
 * Deliberately 0, not Date.now(). Edge instances are created and recycled
 * constantly, and on a quiet site one may serve only a handful of requests
 * before it goes away. Starting the clock at "now" would give every new
 * instance a grace period it usually does not outlive, and its counts would
 * die with it — the log would read empty while traffic was arriving. Starting
 * at 0 makes the first request on a fresh instance flush immediately, which
 * bounds the loss to at most one interval of a LIVE instance.
 */
let lastFlush = 0;
let flushing = false;

let client: ReturnType<typeof createClient> | null = null;
function db() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url || !authToken) return null;
    client = createClient({ url, authToken });
  }
  return client;
}

/**
 * Named buckets, so a spike can be attributed to a specific agent rather than
 * just "bot". Order matters: the AI crawlers are checked before the generic
 * browser test because several of them carry a full browser UA as a prefix.
 */
const UA_PATTERNS: [RegExp, string][] = [
  [/googlebot|google-inspectiontool|storebot-google|googleother/i, 'search:google'],
  [/bingbot|bingpreview|msnbot/i, 'search:bing'],
  [/duckduckbot|slurp|baiduspider|yandex/i, 'search:other'],
  [/applebot/i, 'search:apple'],
  [/gptbot|chatgpt-user|oai-searchbot/i, 'ai:openai'],
  [/claudebot|anthropic-ai|claude-web/i, 'ai:anthropic'],
  [/perplexitybot|perplexity-user/i, 'ai:perplexity'],
  [/google-extended|xai-grok|cohere-ai|meta-externalagent|amazonbot|bytespider/i, 'ai:other'],
  [/ahrefsbot|semrushbot|mj12bot|dotbot|petalbot|dataforseo|screaming frog/i, 'seo-tool'],
  [/facebookbot|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot/i, 'preview'],
  // Generic automation that does not pretend to be a browser.
  [/\b(curl|wget|python-requests|httpx|aiohttp|go-http-client|java|okhttp|axios|node-fetch|scrapy|libwww|postman)\b/i, 'script'],
  // Headless signatures worth separating from real browsers — this is the
  // class a JS-executing scraper farm would land in.
  [/headlesschrome|phantomjs|puppeteer|playwright|selenium|webdriver/i, 'headless'],
  [/bot|crawler|spider|crawling/i, 'bot:other'],
];

export function classifyUa(ua: string | null): string {
  if (!ua) return 'none';
  for (const [re, name] of UA_PATTERNS) if (re.test(ua)) return name;
  if (/mozilla\/|applewebkit|gecko|safari|chrome|firefox|edg\//i.test(ua)) return 'browser';
  return 'other';
}

export function classifyPath(pathname: string): string {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/manual/')) return 'manual';
  if (pathname === '/search') return 'search';
  if (pathname.startsWith('/tools')) return 'tools';
  if (pathname.startsWith('/manufacturers')) return 'manufacturers';
  if (pathname.startsWith('/categories')) return 'categories';
  if (pathname.startsWith('/products')) return 'products';
  if (pathname.startsWith('/resources')) return 'resources';
  if (pathname.startsWith('/pdf/') || pathname.startsWith('/part_manuals/')) return 'pdf';
  if (pathname === '/robots.txt' || pathname.startsWith('/sitemap') || pathname === '/llms.txt') return 'agent-file';
  return 'other';
}

/** Buffer one request. Never throws. */
export function record(pathname: string, ua: string | null, country: string | null): void {
  try {
    if (buffer.size >= MAX_KEYS) return;
    const now = new Date();
    const key = [
      now.toISOString().slice(0, 10),
      now.getUTCHours(),
      (country || 'ZZ').toUpperCase().slice(0, 2),
      classifyUa(ua),
      classifyPath(pathname),
    ].join('|');
    buffer.set(key, (buffer.get(key) ?? 0) + 1);
  } catch {
    /* a logging failure must never cost a response */
  }
}

export function dueForFlush(): boolean {
  return buffer.size > 0 && (buffer.size >= FLUSH_KEYS || Date.now() - lastFlush >= FLUSH_MS);
}

/**
 * Drain the buffer into one batch. Handed to waitUntil, so it runs after the
 * response is already on its way. The buffer is cleared BEFORE the await so a
 * slow write cannot double-count concurrent requests; a failed batch drops that
 * interval's counts rather than retrying, which is the right trade for
 * telemetry that must never become a source of latency or errors.
 */
export async function flush(): Promise<void> {
  if (flushing || buffer.size === 0) return;
  const conn = db();
  if (!conn) return;

  flushing = true;
  const drained = [...buffer.entries()];
  buffer.clear();
  lastFlush = Date.now();

  try {
    await conn.batch(
      drained.map(([key, hits]) => {
        const [day, hour, country, ua, path] = key.split('|');
        return {
          sql: `INSERT INTO request_log (day, hour, country, ua_class, path_class, hits)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(day, hour, country, ua_class, path_class)
                DO UPDATE SET hits = hits + excluded.hits`,
          args: [day, Number(hour), country, ua, path, hits],
        };
      }),
      'write',
    );
  } catch {
    /* drop the interval rather than retry */
  } finally {
    flushing = false;
  }
}
