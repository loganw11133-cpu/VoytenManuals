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

// ── Queries ──

export async function searchManuals(filters: SearchFilters): Promise<SearchResult> {
  const page = filters.page || 1;
  const limit = filters.limit || 24;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters.query) {
    whereClause += ' AND (title LIKE ? OR manual_number LIKE ? OR keywords LIKE ? OR description LIKE ?)';
    const q = `%${filters.query}%`;
    params.push(q, q, q, q);
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
    sql: `SELECT * FROM manuals ${whereClause} ORDER BY title ASC LIMIT ? OFFSET ?`,
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
  const result = await getDb().execute('SELECT COUNT(*) as count FROM manuals');
  return (result.rows[0] as unknown as { count: number }).count;
}

export async function getRecentManuals(limit = 8): Promise<Manual[]> {
  const result = await getDb().execute({
    sql: 'SELECT * FROM manuals ORDER BY created_at DESC LIMIT ?',
    args: [limit],
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
