import { createClient, Client, type Row } from '@libsql/client';
import { cache as reactCache } from 'react';

let _db: Client | null = null;

function getDb(): Client {
  if (!_db) {
    _db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _db;
}

// ── Types ──

export interface Manual {
  id: number;
  slug: string;
  title: string;
  manual_number: string | null;
  category: string;
  manufacturer: string;
  subcategory: string | null;
  description: string | null;
  pdf_url: string;
  page_count: number | null;
  file_size_bytes: number | null;
  keywords: string | null;
  created_at: string;
  updated_at: string;
}

function rowToManual(row: Row): Manual {
  return {
    id: Number(row.id),
    slug: row.slug as string,
    title: row.title as string,
    manual_number: row.manual_number as string | null,
    category: row.category as string,
    manufacturer: row.manufacturer as string,
    subcategory: row.subcategory as string | null,
    description: row.description as string | null,
    pdf_url: row.pdf_url as string,
    page_count: row.page_count != null ? Number(row.page_count) : null,
    file_size_bytes: row.file_size_bytes != null ? Number(row.file_size_bytes) : null,
    keywords: row.keywords as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export interface Category {
  name: string;
  count: number;
  slug: string;
}

export interface Manufacturer {
  name: string;
  count: number;
  slug: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  manufacturer?: string;
  subcategory?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  manuals: Manual[];
  total: number;
  page: number;
  totalPages: number;
}

// ── Cache ──

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number): T {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
  return data;
}

const CACHE_5MIN = 5 * 60 * 1000;
const CACHE_1HR = 60 * 60 * 1000;

// ── Utility ──

export function toSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── FTS5 search helpers ──

/** Sanitize user input for FTS5 MATCH syntax.
 *  Removes special FTS5 operators, adds prefix matching with * suffix.
 */
function buildFtsQuery(raw: string): string {
  // Remove FTS5 special chars that could cause syntax errors
  const cleaned = raw.replace(/['"():^*{}[\]~@#$%&\\]/g, ' ').trim();
  const tokens = cleaned.split(/\s+/).filter(t => t.length >= 2);
  if (tokens.length === 0) return cleaned + '*';
  // Each token gets prefix matching; all tokens must match (implicit AND in FTS5)
  return tokens.map(t => `"${t}"*`).join(' ');
}

// ── Queries ──

export async function searchManuals(filters: SearchFilters): Promise<SearchResult> {
  const page = filters.page || 1;
  const limit = filters.limit || 24;
  const offset = (page - 1) * limit;

  const cacheKey = `search:${JSON.stringify(filters)}`;
  const cached = getCached<SearchResult>(cacheKey);
  if (cached) return cached;

  const hasTextQuery = filters.query && filters.query.trim().length >= 1;

  if (hasTextQuery) {
    // FTS5 path — fast full-text search via virtual table
    const ftsQuery = buildFtsQuery(filters.query!);
    let filterClause = '';
    const filterArgs: (string | number)[] = [];

    if (filters.category) {
      filterClause += ' AND m.category = ?';
      filterArgs.push(filters.category);
    }
    if (filters.manufacturer) {
      filterClause += ' AND m.manufacturer = ?';
      filterArgs.push(filters.manufacturer);
    }
    if (filters.subcategory) {
      filterClause += ' AND m.subcategory = ?';
      filterArgs.push(filters.subcategory);
    }

    const batchResults = await getDb().batch([
      {
        sql: `SELECT COUNT(*) as count FROM manuals_fts f JOIN manuals m ON m.id = f.rowid WHERE manuals_fts MATCH ?${filterClause}`,
        args: [ftsQuery, ...filterArgs],
      },
      {
        sql: `SELECT m.id, m.slug, m.title, m.manual_number, m.category, m.manufacturer, m.subcategory, m.pdf_url, m.file_size_bytes, m.page_count, m.search_priority
              FROM manuals_fts f JOIN manuals m ON m.id = f.rowid
              WHERE manuals_fts MATCH ?${filterClause}
              ORDER BY m.search_priority DESC, rank
              LIMIT ? OFFSET ?`,
        args: [ftsQuery, ...filterArgs, limit, offset],
      },
    ]);

    const total = Number(batchResults[0].rows[0].count);
    const result = {
      manuals: batchResults[1].rows.map(rowToManual),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
    return setCache(cacheKey, result, CACHE_5MIN);
  }

  // Filter-only path (no text query) — direct indexed queries on manuals table
  let whereClause = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters.category) {
    whereClause += ' AND category = ?';
    params.push(filters.category);
  }
  if (filters.manufacturer) {
    whereClause += ' AND manufacturer = ?';
    params.push(filters.manufacturer);
  }
  if (filters.subcategory) {
    whereClause += ' AND subcategory = ?';
    params.push(filters.subcategory);
  }

  const batchResults = await getDb().batch([
    { sql: `SELECT COUNT(*) as count FROM manuals ${whereClause}`, args: params },
    { sql: `SELECT id, slug, title, manual_number, category, manufacturer, subcategory, pdf_url, file_size_bytes, page_count, search_priority FROM manuals ${whereClause} ORDER BY search_priority DESC, title ASC LIMIT ? OFFSET ?`, args: [...params, limit, offset] },
  ]);
  const total = Number(batchResults[0].rows[0].count);

  const result = {
    manuals: batchResults[1].rows.map(rowToManual),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
  return setCache(cacheKey, result, CACHE_5MIN);
}

// React cache() deduplicates within a single server request —
// generateMetadata and page component share the same DB call.
// In-memory cache covers repeated requests within the 5-min TTL.
export const getManualBySlug = reactCache(async (slug: string): Promise<Manual | null> => {
  const cacheKey = `manual:${slug}`;
  const cached = getCached<Manual>(cacheKey);
  if (cached) return cached;

  const result = await getDb().execute({
    sql: 'SELECT * FROM manuals WHERE slug = ?',
    args: [slug],
  });
  if (result.rows.length === 0) return null;
  return setCache(cacheKey, rowToManual(result.rows[0]), CACHE_5MIN);
});

export async function getManualById(id: number): Promise<Manual | null> {
  const result = await getDb().execute({
    sql: 'SELECT * FROM manuals WHERE id = ?',
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToManual(result.rows[0]);
}

export async function getCategories(): Promise<Category[]> {
  const cached = getCached<Category[]>('categories');
  if (cached) return cached;

  const result = await getDb().execute(
    'SELECT category as name, COUNT(*) as count FROM manuals GROUP BY category ORDER BY count DESC'
  );
  const categories = result.rows.map(row => ({
    name: row.name as string,
    count: row.count as number,
    slug: toSlug(row.name as string),
  }));
  return setCache('categories', categories, CACHE_1HR);
}

export async function getManufacturers(category?: string): Promise<Manufacturer[]> {
  const cacheKey = `manufacturers:${category || 'all'}`;
  const cached = getCached<Manufacturer[]>(cacheKey);
  if (cached) return cached;

  let sql = 'SELECT manufacturer as name, COUNT(*) as count FROM manuals';
  const args: string[] = [];

  if (category) {
    sql += ' WHERE category = ?';
    args.push(category);
  }

  sql += ' GROUP BY manufacturer ORDER BY count DESC, name ASC';

  const result = await getDb().execute({ sql, args });
  const manufacturers = result.rows.map(row => ({
    name: row.name as string,
    count: row.count as number,
    slug: toSlug(row.name as string),
  }));
  return setCache(cacheKey, manufacturers, CACHE_1HR);
}

export async function getSubcategories(category?: string, manufacturer?: string): Promise<string[]> {
  const cacheKey = `subcategories:${category || ''}:${manufacturer || ''}`;
  const cached = getCached<string[]>(cacheKey);
  if (cached) return cached;

  let sql = 'SELECT DISTINCT subcategory FROM manuals WHERE subcategory IS NOT NULL';
  const args: string[] = [];

  if (category) {
    sql += ' AND category = ?';
    args.push(category);
  }
  if (manufacturer) {
    sql += ' AND manufacturer = ?';
    args.push(manufacturer);
  }

  sql += ' ORDER BY subcategory ASC';

  const result = await getDb().execute({ sql, args });
  const subcategories = result.rows.map(row => row.subcategory as string);
  return setCache(cacheKey, subcategories, CACHE_1HR);
}

export async function getManufacturerBySlug(slug: string): Promise<Manufacturer | null> {
  const manufacturers = await getManufacturers();
  return manufacturers.find(m => m.slug === slug) || null;
}

export interface ManufacturerCategoryBreakdown {
  category: string;
  count: number;
}

export async function getManufacturerCategories(manufacturer: string): Promise<ManufacturerCategoryBreakdown[]> {
  const cacheKey = `mfr-cats:${manufacturer}`;
  const cached = getCached<ManufacturerCategoryBreakdown[]>(cacheKey);
  if (cached) return cached;

  const result = await getDb().execute({
    sql: 'SELECT category, COUNT(*) as count FROM manuals WHERE manufacturer = ? GROUP BY category ORDER BY count DESC',
    args: [manufacturer],
  });
  const breakdown = result.rows.map(row => ({
    category: row.category as string,
    count: Number(row.count),
  }));
  return setCache(cacheKey, breakdown, CACHE_1HR);
}

export async function getManufacturerManuals(manufacturer: string, limit = 12): Promise<Manual[]> {
  const cacheKey = `mfr-manuals:${manufacturer}:${limit}`;
  const cached = getCached<Manual[]>(cacheKey);
  if (cached) return cached;

  const result = await getDb().execute({
    sql: `SELECT * FROM manuals WHERE manufacturer = ? AND pdf_url != '' AND pdf_url IS NOT NULL
          ORDER BY search_priority DESC, title ASC LIMIT ?`,
    args: [manufacturer, limit],
  });
  const manuals = result.rows.map(rowToManual);
  return setCache(cacheKey, manuals, CACHE_5MIN);
}

export async function getRelatedManuals(manual: Manual, limit = 4): Promise<Manual[]> {
  const cacheKey = `related:${manual.id}`;
  const cached = getCached<Manual[]>(cacheKey);
  if (cached) return cached;

  // Single query: same manufacturer (prefer same category) UNION same category different manufacturer
  const result = await getDb().execute({
    sql: `SELECT id, slug, title, manual_number, category, manufacturer, subcategory,
                 description, pdf_url, page_count, file_size_bytes, keywords, created_at, updated_at
          FROM (
            SELECT *, 0 as sort_group,
              CASE WHEN category = ? THEN 0 ELSE 1 END as sort_rank
            FROM manuals WHERE manufacturer = ? AND id != ?
            UNION ALL
            SELECT *, 1 as sort_group, 0 as sort_rank
            FROM manuals WHERE category = ? AND manufacturer != ? AND id != ?
          ) ORDER BY sort_group, sort_rank, title ASC LIMIT ?`,
    args: [manual.category, manual.manufacturer, manual.id,
           manual.category, manual.manufacturer, manual.id, limit],
  });

  return setCache(cacheKey, result.rows.map(rowToManual), CACHE_5MIN);
}

/**
 * Fetch a manual and its related manuals in a single SQL query (one network round-trip).
 * The related manuals are derived via a self-join on the slug-matched row's manufacturer/category.
 */
export const getManualWithRelated = reactCache(async (slug: string, relatedLimit = 4): Promise<{ manual: Manual; related: Manual[] } | null> => {
  // Check caches first
  const cachedManual = getCached<Manual>(`manual:${slug}`);
  if (cachedManual) {
    const cachedRelated = getCached<Manual[]>(`related:${cachedManual.id}`);
    if (cachedRelated) return { manual: cachedManual, related: cachedRelated };
    const related = await getRelatedManuals(cachedManual, relatedLimit);
    return { manual: cachedManual, related };
  }

  // Single batch — both queries in one HTTP round-trip to Turso.
  // Query 1: fetch the manual by slug.
  // Query 2: fetch related manuals using a subquery to resolve manufacturer/category from slug.
  const batchResults = await getDb().batch([
    {
      sql: 'SELECT * FROM manuals WHERE slug = ?',
      args: [slug],
    },
    {
      sql: `SELECT r.id, r.slug, r.title, r.manual_number, r.category, r.manufacturer,
                   r.subcategory, r.description, r.pdf_url, r.page_count, r.file_size_bytes,
                   r.keywords, r.created_at, r.updated_at
            FROM manuals r, manuals m
            WHERE m.slug = ?
              AND r.id != m.id
              AND (r.manufacturer = m.manufacturer OR r.category = m.category)
            ORDER BY
              CASE WHEN r.manufacturer = m.manufacturer AND r.category = m.category THEN 0
                   WHEN r.manufacturer = m.manufacturer THEN 1
                   ELSE 2 END,
              r.title ASC
            LIMIT ?`,
      args: [slug, relatedLimit],
    },
  ]);

  if (batchResults[0].rows.length === 0) return null;

  const manual = setCache(`manual:${slug}`, rowToManual(batchResults[0].rows[0]), CACHE_5MIN);
  const related = setCache(`related:${manual.id}`, batchResults[1].rows.map(rowToManual), CACHE_5MIN);
  return { manual, related };
});

export async function getTotalManualCount(): Promise<number> {
  const cached = getCached<number>('totalCount');
  if (cached !== null) return cached;

  const result = await getDb().execute("SELECT COUNT(*) as count FROM manuals WHERE pdf_url != '' AND pdf_url IS NOT NULL");
  const count = Number(result.rows[0].count);
  return setCache('totalCount', count, CACHE_1HR);
}

export async function getFeaturedManuals(limit = 8): Promise<Manual[]> {
  const cached = getCached<Manual[]>('featured');
  if (cached) return cached;

  // Curated featured slugs — top-sellers in stock at PA facility
  const featuredSlugs = [
    'top-seller-eaton-magnum-ds-mds6163wea-1600a',
    'sel-321-data-sheet-phase-and-ground-distance-relay-directional-overcurrent-relay-fault-locator',
    'kirk-key-interlock-system-application-information-and-schemes',
    'square-d-masterpact-nw16-1600a-air-circuit-breaker',
    'square-d-masterpact-nw20-2000a-air-circuit-breaker',
    'top-seller-westinghouse-ds-416-1600a-air-breaker',
    'top-seller-cutler-hammer-spb65-1600a-iccb',
    'top-seller-ge-akr-50-1600a-air-breaker',
  ];

  const placeholders = featuredSlugs.map(() => '?').join(', ');
  const result = await getDb().execute({
    sql: `SELECT * FROM manuals
          WHERE slug IN (${placeholders}) AND pdf_url != '' AND pdf_url IS NOT NULL
          ORDER BY CASE ${featuredSlugs.map((s, i) => `WHEN slug = ? THEN ${i}`).join(' ')} ELSE ${featuredSlugs.length} END
          LIMIT ?`,
    args: [...featuredSlugs, ...featuredSlugs, limit],
  });
  const manuals = result.rows.map(rowToManual);
  return setCache('featured', manuals, CACHE_1HR);
}

// ── Product Line Queries ──

export async function getManualsBySubcategory(manufacturer: string, subcategory: string, limit = 50): Promise<Manual[]> {
  const cacheKey = `subcat-manuals:${manufacturer}:${subcategory}:${limit}`;
  const cached = getCached<Manual[]>(cacheKey);
  if (cached) return cached;

  const result = await getDb().execute({
    sql: `SELECT * FROM manuals WHERE manufacturer = ? AND subcategory = ?
          ORDER BY search_priority DESC, title ASC LIMIT ?`,
    args: [manufacturer, subcategory, limit],
  });
  return setCache(cacheKey, result.rows.map(rowToManual), CACHE_5MIN);
}

export async function getRLProductLine(): Promise<{
  breakers: Manual[];
  accessories: Manual[];
  laBreakers: Manual[];
  laAccessories: Manual[];
}> {
  const cacheKey = 'rl-product-line';
  const cached = getCached<{ breakers: Manual[]; accessories: Manual[]; laBreakers: Manual[]; laAccessories: Manual[] }>(cacheKey);
  if (cached) return cached;

  const batchResults = await getDb().batch([
    {
      sql: `SELECT * FROM manuals WHERE manufacturer = 'Siemens'
            AND (
              (slug IN (
                'siemens-rl-renewal-parts-catalog',
                'siemens-rl-wiring-diagrams-control-power',
                'siemens-rl-static-trip-iii-unit-manual',
                'siemens-rl-switchgear-installation-manual',
                'instructionssgim-3068',
                'sgim-3068e'
              ))
              OR (title LIKE '%Static Trip III%' AND subcategory IN ('Trip Units', 'Trip Units & Accessories'))
              OR (title LIKE '%Static Trip II %' AND subcategory = 'Trip Units & Accessories')
            )
            GROUP BY COALESCE(pdf_url, slug)
            ORDER BY search_priority DESC, title ASC`,
      args: [],
    },
    {
      sql: `SELECT * FROM manuals WHERE manufacturer = 'Siemens' AND subcategory = 'RL Accessories'
            ORDER BY title ASC`,
      args: [],
    },
    {
      sql: `SELECT * FROM manuals WHERE manufacturer = 'Siemens' AND subcategory = 'Air Circuit Breakers'
            AND title LIKE '%Type LA%'
            ORDER BY search_priority DESC, title ASC`,
      args: [],
    },
    {
      sql: `SELECT * FROM manuals WHERE manufacturer = 'Siemens' AND subcategory = 'LA Accessories'
            ORDER BY title ASC`,
      args: [],
    },
  ]);

  const data = {
    breakers: batchResults[0].rows.map(rowToManual),
    accessories: batchResults[1].rows.map(rowToManual),
    laBreakers: batchResults[2].rows.map(rowToManual),
    laAccessories: batchResults[3].rows.map(rowToManual),
  };
  return setCache(cacheKey, data, CACHE_5MIN);
}

// ── Admin: Create/Update ──

export async function createManual(data: Omit<Manual, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const result = await getDb().execute({
    sql: `INSERT INTO manuals (slug, title, manual_number, category, manufacturer, subcategory, description, pdf_url, page_count, file_size_bytes, keywords)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.slug, data.title, data.manual_number, data.category,
      data.manufacturer, data.subcategory, data.description,
      data.pdf_url, data.page_count, data.file_size_bytes, data.keywords,
    ],
  });
  return Number(result.lastInsertRowid);
}

export async function updateManual(id: number, data: Partial<Manual>): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  const allowedFields = ['slug', 'title', 'manual_number', 'category', 'manufacturer', 'subcategory', 'description', 'pdf_url', 'page_count', 'file_size_bytes', 'keywords'];

  for (const field of allowedFields) {
    if (field in data) {
      fields.push(`${field} = ?`);
      values.push((data as Record<string, string | number | null>)[field]);
    }
  }

  if (fields.length === 0) return;

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  await getDb().execute({
    sql: `UPDATE manuals SET ${fields.join(', ')} WHERE id = ?`,
    args: values,
  });
}

export async function deleteManual(id: number): Promise<void> {
  await getDb().execute({
    sql: 'DELETE FROM manuals WHERE id = ?',
    args: [id],
  });
}
