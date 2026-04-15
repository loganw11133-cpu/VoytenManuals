import { NextRequest } from 'next/server';
import { handleLegacyPdfRedirect } from '@/lib/legacy-redirect';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleLegacyPdfRedirect(request, path);
}
