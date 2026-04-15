import { NextRequest, NextResponse } from 'next/server';
import { searchManuals, getCategories, getManufacturers, getSubcategories } from '@/lib/manuals-db';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const rateLimited = await checkRateLimit(request, RATE_LIMITS.searchApi);
    if (rateLimited) return rateLimited;
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
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    console.error('Manuals API error:', error);
    return NextResponse.json({ error: 'Failed to fetch manuals' }, { status: 500 });
  }
}
