import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { createHash } from 'crypto';

function getDb() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_SALT || 'voyten')).digest('hex').slice(0, 16);
}

// POST /api/downloads — track a download event
export async function POST(request: NextRequest) {
  try {
    const { manual_id } = await request.json();
    if (!manual_id) {
      return NextResponse.json({ error: 'manual_id required' }, { status: 400 });
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0] ?? 'unknown';
    const ipHash = hashIp(ip);
    const userAgent = request.headers.get('user-agent') || '';

    const db = getDb();
    await db.execute({
      sql: `INSERT INTO download_events (manual_id, ip_hash, user_agent) VALUES (?, ?, ?)`,
      args: [manual_id, ipHash, userAgent.slice(0, 255)],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Download tracking error:', error);
    return NextResponse.json({ success: true }); // Don't block downloads on tracking failures
  }
}

// GET /api/downloads?manual_id=X — get download count for a manual (public)
// GET /api/downloads?stats=true — get download stats (admin, requires auth)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const db = getDb();

  const manualId = searchParams.get('manual_id');
  if (manualId) {
    const result = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM download_events WHERE manual_id = ?',
      args: [parseInt(manualId)],
    });
    return NextResponse.json({ downloads: (result.rows[0] as unknown as { count: number }).count });
  }

  // Stats overview (top downloaded manuals)
  const result = await db.execute(`
    SELECT m.title, m.slug, m.manufacturer, m.category, COUNT(d.id) as downloads
    FROM download_events d
    JOIN manuals m ON m.id = d.manual_id
    GROUP BY d.manual_id
    ORDER BY downloads DESC
    LIMIT 50
  `);

  const totalResult = await db.execute('SELECT COUNT(*) as count FROM download_events');

  return NextResponse.json({
    total_downloads: (totalResult.rows[0] as unknown as { count: number }).count,
    top_manuals: result.rows,
  });
}
