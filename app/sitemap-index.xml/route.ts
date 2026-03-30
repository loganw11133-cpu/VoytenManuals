import { NextResponse } from 'next/server';
import { searchManuals } from '@/lib/manuals-db';

const baseUrl = 'https://voytenmanuals.com';
const MANUALS_PER_SITEMAP = 1000;

export async function GET() {
  let sitemapCount = 1; // At minimum: sitemap 0 (static/filter pages)

  try {
    const result = await searchManuals({ limit: 1, page: 1 });
    const manualBatches = Math.max(1, Math.ceil(result.total / MANUALS_PER_SITEMAP));
    sitemapCount = 1 + manualBatches; // sitemap 0 + manual batches
  } catch {
    // DB unavailable — just reference sitemap 0
  }

  const now = new Date().toISOString();
  const sitemapEntries = Array.from({ length: sitemapCount }, (_, i) =>
    `  <sitemap>
    <loc>${baseUrl}/sitemap/${i}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
