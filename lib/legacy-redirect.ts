import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

function getDb() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

/**
 * In-memory lookup maps for legacy URL redirects.
 * Loaded once from DB, then all redirects are zero-cost.
 *
 * Maps built:
 *   pdfPathToSlug  — full PDF path (after /pdf/ or /part_manuals/pdf/) → slug
 *   filenameToSlug — just the PDF filename (no extension) → slug
 *   normalizedToSlug — filename with dots/dashes/spaces stripped → slug
 */
let pdfPathToSlug: Map<string, string> | null = null;
let filenameToSlug: Map<string, string> | null = null;
let normalizedToSlug: Map<string, string> | null = null;
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function ensureCache(): Promise<void> {
  if (pdfPathToSlug && Date.now() - cacheLoadedAt < CACHE_TTL_MS) return;

  const db = getDb();
  const result = await db.execute(
    'SELECT slug, manual_number, pdf_url FROM manuals WHERE pdf_url IS NOT NULL'
  );

  const pathMap = new Map<string, string>();
  const fnMap = new Map<string, string>();
  const normMap = new Map<string, string>();

  for (const row of result.rows) {
    const { slug, manual_number, pdf_url } = row as unknown as {
      slug: string;
      manual_number: string | null;
      pdf_url: string;
    };

    // Extract the path after the domain for full-path matching
    // e.g., "http://www.electricalpartmanuals.com/part_manuals/pdf/transformer/Westinghouse/Bushings/TD33-360.pdf"
    //   → "transformer/Westinghouse/Bushings/TD33-360.pdf"
    const pdfMatch = pdf_url.match(/\.com\/(?:part_manuals\/)?pdf\/(.+)$/);
    if (pdfMatch) {
      // Store with spaces (decoded) and with underscores for flexible matching
      const fullPath = decodeURIComponent(pdfMatch[1]).toLowerCase();
      pathMap.set(fullPath, slug);
      // Also store with underscores replaced by spaces and vice versa
      pathMap.set(fullPath.replace(/_/g, ' '), slug);
      pathMap.set(fullPath.replace(/ /g, '_'), slug);
    }

    // Extract just the filename
    const fnMatch = pdf_url.match(/\/([^/]+)\.pdf$/i);
    if (fnMatch) {
      const fn = decodeURIComponent(fnMatch[1]).toLowerCase();
      fnMap.set(fn, slug);
    }

    // Map manual_number (exact and normalized)
    if (manual_number) {
      fnMap.set(manual_number.toLowerCase(), slug);
      const norm = manual_number.replace(/[.\-\s]/g, '').toLowerCase();
      normMap.set(norm, slug);
    }
  }

  pdfPathToSlug = pathMap;
  filenameToSlug = fnMap;
  normalizedToSlug = normMap;
  cacheLoadedAt = Date.now();
}

/**
 * Handles legacy electricalpartmanuals.com PDF URL redirects.
 * Uses in-memory lookup maps — zero DB queries after initial cache load.
 */
export async function handleLegacyPdfRedirect(
  request: NextRequest,
  path: string[]
): Promise<NextResponse> {
  const rawFilename = path[path.length - 1] || '';
  const filename = decodeURIComponent(rawFilename).replace(/\.pdf$/i, '');

  if (!filename) {
    return NextResponse.redirect(new URL('/search', request.url), 301);
  }

  try {
    await ensureCache();

    const joinedPath = path.map(p => decodeURIComponent(p)).join('/').toLowerCase();
    const filenameLower = filename.toLowerCase();
    const normalized = filename.replace(/[.\-\s]/g, '').toLowerCase();

    // 1. Full path match
    let slug = pdfPathToSlug!.get(joinedPath);

    // 2. Filename match (includes manual_number exact matches)
    if (!slug) slug = filenameToSlug!.get(filenameLower);

    // 3. Normalized match (strips dots, dashes, spaces)
    if (!slug) slug = normalizedToSlug!.get(normalized);

    if (slug) {
      return NextResponse.redirect(new URL(`/manual/${slug}`, request.url), 301);
    }

    // No match — redirect to search
    return NextResponse.redirect(
      new URL(`/search?q=${encodeURIComponent(filename)}`, request.url),
      302
    );
  } catch (error) {
    console.error('Legacy PDF redirect error:', error);
    return NextResponse.redirect(
      new URL(`/search?q=${encodeURIComponent(filename)}`, request.url),
      302
    );
  }
}
