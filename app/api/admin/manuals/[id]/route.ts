import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAccess } from '@/lib/admin-auth';
import { getManualById, updateManual, deleteManual } from '@/lib/manuals-db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/manuals/[id] — get single manual
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authError = validateAdminAccess(request);
  if (authError) return authError;

  const { id } = await params;
  const manual = await getManualById(parseInt(id));
  if (!manual) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(manual);
}

// PUT /api/admin/manuals/[id] — update manual
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authError = validateAdminAccess(request);
  if (authError) return authError;

  const { id } = await params;
  const manual = await getManualById(parseInt(id));
  if (!manual) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  await updateManual(parseInt(id), body);

  return NextResponse.json({ success: true });
}

// DELETE /api/admin/manuals/[id] — delete manual
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authError = validateAdminAccess(request);
  if (authError) return authError;

  const { id } = await params;
  const manual = await getManualById(parseInt(id));
  if (!manual) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await deleteManual(parseInt(id));
  return NextResponse.json({ success: true });
}
