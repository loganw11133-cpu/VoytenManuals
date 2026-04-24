import { NextRequest, NextResponse } from 'next/server';
import { searchManuals, getCategories, getManufacturers, getSubcategories } from '@/lib/manuals-db';

// In-memory rate limit for search — avoids DB round-trip on every query
const searchHits = new Map<string, { count: number; reset: number }>();
function checkSearchRate(ip: string): boolean {
  const now = Date.now();
  const entry = searchHits.get(ip);
  if (!entry || now > entry.reset) {
    searchHits.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 60; // 60 req/min — generous for real users
}

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (checkSearchRate(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const manufacturer = searchParams.get('manufacturer') || undefined;
    const subcategory = searchParams.get('subcategory') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '24'), 100);

    // If requesting filter options
    if (searchParams.get('filters') === 'true') {
      const [categories, manufacturers, subcategories] = await Promise.all([
        getCategories(),
        getManufacturers(category),
        getSubcategories(category, manufacturer),
      ]);
      const filterResponse = NextResponse.json({ categories, manufacturers, subcategories });
      filterResponse.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return filterResponse;
    }

    const results = await searchManuals({ query, category, manufacturer, subcategory, page, limit });
    const response = NextResponse.json(results);
    // Static catalog — cache aggressively at CDN edge
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    console.error('Manuals API error:', error);
    return NextResponse.json({ error: 'Failed to fetch manuals' }, { status: 500 });
  }
}
