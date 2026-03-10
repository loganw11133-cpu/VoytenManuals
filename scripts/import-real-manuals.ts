import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

// Category mapping from URL path segments to display names
const CATEGORY_MAP: Record<string, string> = {
  'bus': 'Bus Products',
  'breaker': 'Circuit Breakers',
  'circuitBreaker': 'Circuit Breakers',
  'fuse': 'Fuses',
  'miscellaneous': 'Miscellaneous',
  'motorControl': 'Motor Controls',
  'relaysAndMeters': 'Relays and Meters',
  'switch': 'Switches',
  'transformer': 'Transformers',
};

// Clean up manufacturer names from URL-encoded format
function cleanManufacturer(raw: string): string {
  return raw
    .replace(/_/g, ' ')
    .replace(/Allis-Chamber\b/, 'Allis-Chalmers')
    .replace(/^Westinghouse\d.*$/, 'Westinghouse')
    .replace(/^unknown$/, 'Unknown');
}

// Clean up subcategory names
function cleanSubcategory(raw: string): string {
  return raw
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2'); // camelCase → words
}

// Generate a readable title from a slug
function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => {
      // Don't capitalize certain words unless first
      const lower = ['a', 'an', 'the', 'and', 'or', 'for', 'in', 'on', 'at', 'to', 'of', 'with'];
      if (lower.includes(word)) return word;
      // Keep acronyms/numbers as-is
      if (/^[A-Z0-9]+$/i.test(word) && word.length <= 4) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    // Capitalize first word always
    .replace(/^(\w)/, (m) => m.toUpperCase());
}

interface ManualEntry {
  slug: string;
  title: string;
  manual_number: string | null;
  category: string;
  manufacturer: string;
  subcategory: string | null;
  pdf_url: string;
  keywords: string;
}

async function main() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  // Read CSV
  const csvPath = path.resolve(__dirname, '../../urls_www_electricalpartmanuals_com_simplescraper.csv');
  const lines = fs.readFileSync(csvPath, 'utf-8').split('\n').filter(l => l.trim());

  console.log(`Read ${lines.length} URLs from CSV`);

  // Parse manual/PDF pairs
  // Pattern: manual URL followed by one or more PDF URLs
  const manuals: ManualEntry[] = [];
  let currentSlug: string | null = null;

  for (const line of lines) {
    const url = line.trim();

    // Manual page URL
    const manualMatch = url.match(/\/manual\/([a-z0-9][a-z0-9-]+)$/);
    if (manualMatch) {
      currentSlug = manualMatch[1];
      continue;
    }

    // PDF URL - extract metadata from path
    const pdfMatch = url.match(/\/part_manuals\/pdf\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+\.pdf)$/i);
    if (pdfMatch && currentSlug) {
      const [, rawCategory, rawManufacturer, rawSubcategory, filename] = pdfMatch;

      const category = CATEGORY_MAP[rawCategory] || rawCategory;
      const manufacturer = cleanManufacturer(rawManufacturer);
      const subcategory = cleanSubcategory(rawSubcategory);
      const title = slugToTitle(currentSlug);

      // Extract manual number from PDF filename (strip extension)
      const manualNumber = filename.replace(/\.pdf$/i, '');

      manuals.push({
        slug: currentSlug,
        title,
        manual_number: manualNumber,
        category,
        manufacturer,
        subcategory,
        pdf_url: url,
        keywords: [category, manufacturer, subcategory, manualNumber, title].filter(Boolean).join(', '),
      });

      // Don't reset currentSlug - some manuals have multiple PDFs
      // But only take the first PDF for the primary record
      currentSlug = null;
    }
  }

  console.log(`Parsed ${manuals.length} manual entries`);

  // Ensure tables exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS manuals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      manual_number TEXT,
      category TEXT NOT NULL,
      manufacturer TEXT NOT NULL,
      subcategory TEXT,
      description TEXT,
      pdf_url TEXT NOT NULL,
      page_count INTEGER,
      file_size_bytes INTEGER,
      keywords TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Clear existing sample data
  await db.execute('DELETE FROM manuals');
  console.log('Cleared existing sample data');

  // Deduplicate by slug
  const seenSlugs = new Set<string>();
  const uniqueManuals = manuals.filter(m => {
    if (seenSlugs.has(m.slug)) return false;
    seenSlugs.add(m.slug);
    return true;
  });
  const skipped = manuals.length - uniqueManuals.length;

  console.log(`${uniqueManuals.length} unique manuals (${skipped} duplicates removed)`);

  // Batch insert using Turso batch() — sends all statements in one network call
  const BATCH_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < uniqueManuals.length; i += BATCH_SIZE) {
    const batch = uniqueManuals.slice(i, i + BATCH_SIZE);
    const statements = batch.map(manual => ({
      sql: `INSERT OR IGNORE INTO manuals (slug, title, manual_number, category, manufacturer, subcategory, description, pdf_url, keywords)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        manual.slug,
        manual.title,
        manual.manual_number,
        manual.category,
        manual.manufacturer,
        manual.subcategory,
        `${manual.title} — ${manual.manufacturer} ${manual.category} documentation. Free PDF download from Voyten Manuals.`,
        manual.pdf_url,
        manual.keywords,
      ],
    }));

    await db.batch(statements, 'write');
    inserted += batch.length;
    console.log(`  Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(uniqueManuals.length / BATCH_SIZE)} (${inserted}/${uniqueManuals.length})`);
  }

  // Print category breakdown
  const categoryResult = await db.execute('SELECT category, COUNT(*) as count FROM manuals GROUP BY category ORDER BY count DESC');
  console.log('\nCategory breakdown:');
  for (const row of categoryResult.rows) {
    console.log(`  ${row.category}: ${row.count}`);
  }

  // Print manufacturer breakdown
  const mfrResult = await db.execute('SELECT manufacturer, COUNT(*) as count FROM manuals GROUP BY manufacturer ORDER BY count DESC LIMIT 20');
  console.log('\nTop 20 manufacturers:');
  for (const row of mfrResult.rows) {
    console.log(`  ${row.manufacturer}: ${row.count}`);
  }

  console.log(`\nDone! Inserted ${inserted}, skipped ${skipped} duplicates.`);
  const totalResult = await db.execute('SELECT COUNT(*) as count FROM manuals');
  console.log(`Total manuals in database: ${(totalResult.rows[0] as unknown as { count: number }).count}`);
}

main().catch(console.error);
