import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

function getDb() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

/**
 * Handles legacy electricalpartmanuals.com PDF URL redirects.
 *
 * The old domain 301-redirects all traffic to voytenmanuals.com preserving
 * the path. Two known URL patterns exist in the wild:
 *   /part_manuals/pdf/{category}/{manufacturer}/{sub}/{filename}.pdf
 *   /pdf/{category}/{manufacturer}/{sub}/{filename}.pdf
 *
 * This function looks up the manual by pdf_url or manual_number and
 * returns a 301 redirect to the listing page. Falls back to /search
 * with the filename as query if no DB match is found.
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
    const db = getDb();

    // Build the path suffix for LIKE matching (handles URL-encoded spaces, etc.)
    const joinedPath = path.map(p => decodeURIComponent(p)).join('/');

    // Try matching the full path against pdf_url (both /pdf/ and /part_manuals/pdf/ variants)
    const result = await db.execute({
      sql: 'SELECT slug FROM manuals WHERE pdf_url LIKE ? OR pdf_url LIKE ? LIMIT 1',
      args: [`%/pdf/${joinedPath}`, `%/part_manuals/pdf/${joinedPath}`],
    });

    if (result.rows.length > 0) {
      const slug = (result.rows[0] as unknown as { slug: string }).slug;
      return NextResponse.redirect(new URL(`/manual/${slug}`, request.url), 301);
    }

    // Fallback: match filename against manual_number
    const result2 = await db.execute({
      sql: 'SELECT slug FROM manuals WHERE manual_number = ? LIMIT 1',
      args: [filename],
    });

    if (result2.rows.length > 0) {
      const slug = (result2.rows[0] as unknown as { slug: string }).slug;
      return NextResponse.redirect(new URL(`/manual/${slug}`, request.url), 301);
    }

    // No match — redirect to search with the filename as query
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
