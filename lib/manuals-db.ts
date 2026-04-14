import { createClient, Client } from '@libsql/client';

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

// ── Fuzzy search helpers ──

const SEARCH_COLS = ['title', 'manual_number', 'keywords', 'description', 'manufacturer'] as const;

/** Generate near-miss variants of a token for fuzzy matching.
 *  - Tokens ≥ 4 chars: also try with trailing char removed (catches plurals, extra chars)
 *  - Tokens 4-5 chars: also try removing each char (catches model-number typos like MDSC→MDS)
 */
function generateSearchVariants(token: string): string[] {
  const variants = new Set([token]);

  if (token.length >= 4) {
    variants.add(token.slice(0, -1));
  }

  if (token.length >= 4 && token.length <= 5) {
    for (let i = 0; i < token.length; i++) {
      const v = token.slice(0, i) + token.slice(i + 1);
      if (v.length >= 3) variants.add(v);
    }
  }

  return Array.from(variants);
}

// ── Queries ──

export async function searchManuals(filters: SearchFilters): Promise<SearchResult> {
  const page = filters.page || 1;
  const limit = filters.limit || 24;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters.query) {
    const raw = filters.query.trim();
    const tokens = raw.split(/\s+/).filter(t => t.length >= 2);

    if (tokens.length === 0) {
      // Very short query (single char) — broad match across all columns
      whereClause += ` AND (${SEARCH_COLS.map(c => `${c} LIKE ?`).join(' OR ')})`;
      const q = `%${raw}%`;
      for (let i = 0; i < SEARCH_COLS.length; i++) params.push(q);
    } else {
      // Token-based search: each token must match somewhere (AND between tokens)
      // with fuzzy variants (OR between variants × columns)
      const tokenClauses: string[] = [];

      for (const token of tokens) {
        const variants = generateSearchVariants(token);
        const conds: string[] = [];

        for (const v of variants) {
          const like = `%${v}%`;
          for (const col of SEARCH_COLS) {
            conds.push(`${col} LIKE ?`);
            params.push(like);
          }
        }

        tokenClauses.push(`(${conds.join(' OR ')})`);
      }

      whereClause += ` AND (${tokenClauses.join(' AND ')})`;
    }
  }

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

  // Get total count
  const countResult = await getDb().execute({
    sql: `SELECT COUNT(*) as count FROM manuals ${whereClause}`,
    args: params,
  });
  const total = (countResult.rows[0] as unknown as { count: number }).count;

  // Get page of results
  const dataResult = await getDb().execute({
    sql: `SELECT * FROM manuals ${whereClause} ORDER BY search_priority DESC, title ASC LIMIT ? OFFSET ?`,
    args: [...params, limit, offset],
  });

  return {
    manuals: dataResult.rows as unknown as Manual[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getManualBySlug(slug: string): Promise<Manual | null> {
  const result = await getDb().execute({
    sql: 'SELECT * FROM manuals WHERE slug = ?',
    args: [slug],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as Manual;
}

export async function getManualById(id: number): Promise<Manual | null> {
  const result = await getDb().execute({
    sql: 'SELECT * FROM manuals WHERE id = ?',
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as Manual;
}

export async function getCategories(): Promise<Category[]> {
  const result = await getDb().execute(
    'SELECT category as name, COUNT(*) as count FROM manuals GROUP BY category ORDER BY count DESC'
  );
  return result.rows.map(row => ({
    name: row.name as string,
    count: row.count as number,
    slug: toSlug(row.name as string),
  }));
}

export async function getManufacturers(category?: string): Promise<Manufacturer[]> {
  let sql = 'SELECT manufacturer as name, COUNT(*) as count FROM manuals';
  const args: string[] = [];

  if (category) {
    sql += ' WHERE category = ?';
    args.push(category);
  }

  sql += ' GROUP BY manufacturer ORDER BY count DESC, name ASC';

  const result = await getDb().execute({ sql, args });
  return result.rows.map(row => ({
    name: row.name as string,
    count: row.count as number,
    slug: toSlug(row.name as string),
  }));
}

export async function getSubcategories(category?: string, manufacturer?: string): Promise<string[]> {
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
  return result.rows.map(row => row.subcategory as string);
}

export async function getRelatedManuals(manual: Manual, limit = 4): Promise<Manual[]> {
  const result = await getDb().execute({
    sql: `SELECT * FROM manuals
          WHERE id != ? AND (manufacturer = ? OR category = ?)
          ORDER BY
            CASE WHEN manufacturer = ? AND category = ? THEN 0
                 WHEN manufacturer = ? THEN 1
                 ELSE 2 END,
            title ASC
          LIMIT ?`,
    args: [manual.id, manual.manufacturer, manual.category, manual.manufacturer, manual.category, manual.manufacturer, limit],
  });
  return result.rows as unknown as Manual[];
}

export async function getTotalManualCount(): Promise<number> {
  const result = await getDb().execute("SELECT COUNT(*) as count FROM manuals WHERE pdf_url != 'NONE'");
  return (result.rows[0] as unknown as { count: number }).count;
}

export async function getFeaturedManuals(limit = 8): Promise<Manual[]> {
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
          WHERE slug IN (${placeholders}) AND pdf_url != 'NONE'
          ORDER BY CASE ${featuredSlugs.map((s, i) => `WHEN slug = ? THEN ${i}`).join(' ')} ELSE ${featuredSlugs.length} END
          LIMIT ?`,
    args: [...featuredSlugs, ...featuredSlugs, limit],
  });
  return result.rows as unknown as Manual[];
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
