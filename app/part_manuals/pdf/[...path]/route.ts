import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

function getDb() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

/**
 * Catch-all handler for legacy electricalpartmanuals.com PDF URLs.
 *
 * The old domain (electricalpartmanuals.com) 301-redirects all traffic
 * to voytenmanuals.com preserving the path, e.g.:
 *   /part_manuals/pdf/transformer/Westinghouse/Bushings/TD33-360.pdf
 *
 * This route reconstructs the original URL, looks up the manual in the
 * database by pdf_url, and 301-redirects to the manual's listing page.
 * Falls back to /search if no match is found.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const filename = path[path.length - 1]?.replace(/\.pdf$/i, '') || '';

  if (!filename) {
    return NextResponse.redirect(new URL('/search', request.url), 301);
  }

  try {
    const db = getDb();

    // Match against the stored legacy pdf_url (covers http and https variants)
    const legacyUrl = `%/part_manuals/pdf/${path.join('/')}`;
    const result = await db.execute({
      sql: 'SELECT slug FROM manuals WHERE pdf_url LIKE ? LIMIT 1',
      args: [legacyUrl],
    });

    if (result.rows.length > 0) {
      const slug = (result.rows[0] as unknown as { slug: string }).slug;
      return NextResponse.redirect(new URL(`/manual/${slug}`, request.url), 301);
    }

    // Fallback: try matching just the filename against manual_number
    const result2 = await db.execute({
      sql: 'SELECT slug FROM manuals WHERE manual_number = ? LIMIT 1',
      args: [filename],
    });

    if (result2.rows.length > 0) {
      const slug = (result2.rows[0] as unknown as { slug: string }).slug;
      return NextResponse.redirect(new URL(`/manual/${slug}`, request.url), 301);
    }

    // No match — redirect to search with the filename as query
    return NextResponse.redirect(new URL(`/search?q=${encodeURIComponent(filename)}`, request.url), 302);
  } catch (error) {
    console.error('Legacy PDF redirect error:', error);
    return NextResponse.redirect(new URL(`/search?q=${encodeURIComponent(filename)}`, request.url), 302);
  }
}
