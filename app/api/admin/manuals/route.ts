import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAccess } from '@/lib/admin-auth';
import { searchManuals, createManual, toSlug } from '@/lib/manuals-db';

// GET /api/admin/manuals — list manuals with search/filter (admin)
export async function GET(request: NextRequest) {
  const authError = validateAdminAccess(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || undefined;
  const category = searchParams.get('category') || undefined;
  const manufacturer = searchParams.get('manufacturer') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

  const results = await searchManuals({ query, category, manufacturer, page, limit });
  return NextResponse.json(results);
}

// POST /api/admin/manuals — create a new manual
export async function POST(request: NextRequest) {
  const authError = validateAdminAccess(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, manual_number, category, manufacturer, subcategory, description, pdf_url, page_count, file_size_bytes, keywords } = body;

    if (!title || !category || !manufacturer || !pdf_url) {
      return NextResponse.json({ error: 'title, category, manufacturer, and pdf_url are required' }, { status: 400 });
    }

    const slug = toSlug(title);
    const id = await createManual({
      slug,
      title,
      manual_number: manual_number || null,
      category,
      manufacturer,
      subcategory: subcategory || null,
      description: description || `${title} — ${manufacturer} ${category} documentation. Free PDF download from Voyten Manuals.`,
      pdf_url,
      page_count: page_count || null,
      file_size_bytes: file_size_bytes || null,
      keywords: keywords || [category, manufacturer, subcategory, title].filter(Boolean).join(', '),
    });

    return NextResponse.json({ id, slug }, { status: 201 });
  } catch (error) {
    console.error('Create manual error:', error);
    return NextResponse.json({ error: 'Failed to create manual' }, { status: 500 });
  }
}
