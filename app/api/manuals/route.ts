import { NextRequest, NextResponse } from 'next/server';
import { searchManuals, getCategories, getManufacturers, getSubcategories } from '@/lib/manuals-db';

export async function GET(request: NextRequest) {
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
    return NextResponse.json({ categories, manufacturers, subcategories });
  }

  const results = await searchManuals({ query, category, manufacturer, subcategory, page, limit });
  return NextResponse.json(results);
}
