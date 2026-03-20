import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAccess } from '@/lib/admin-auth';
import { createClient } from '@libsql/client';

function getDb() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

// GET /api/admin/stats — dashboard overview stats
export async function GET(request: NextRequest) {
  const authError = validateAdminAccess(request);
  if (authError) return authError;

  try {
    const db = getDb();

    const [
      totalManuals,
      totalDownloads,
      totalLeads,
      categoryBreakdown,
      recentLeads,
      topDownloads,
      downloadsToday,
      leadsThisWeek,
    ] = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM manuals'),
      db.execute('SELECT COUNT(*) as count FROM download_events'),
      db.execute('SELECT COUNT(*) as count FROM lead_submissions'),
      db.execute('SELECT category, COUNT(*) as count FROM manuals GROUP BY category ORDER BY count DESC'),
      db.execute(`SELECT * FROM lead_submissions ORDER BY created_at DESC LIMIT 10`),
      db.execute(`
        SELECT m.title, m.slug, m.manufacturer, COUNT(d.id) as downloads
        FROM download_events d JOIN manuals m ON m.id = d.manual_id
        GROUP BY d.manual_id ORDER BY downloads DESC LIMIT 10
      `),
      db.execute(`SELECT COUNT(*) as count FROM download_events WHERE created_at >= date('now')`),
      db.execute(`SELECT COUNT(*) as count FROM lead_submissions WHERE created_at >= date('now', '-7 days')`),
    ]);

    return NextResponse.json({
      overview: {
        total_manuals: (totalManuals.rows[0] as unknown as { count: number }).count,
        total_downloads: (totalDownloads.rows[0] as unknown as { count: number }).count,
        total_leads: (totalLeads.rows[0] as unknown as { count: number }).count,
        downloads_today: (downloadsToday.rows[0] as unknown as { count: number }).count,
        leads_this_week: (leadsThisWeek.rows[0] as unknown as { count: number }).count,
      },
      categories: categoryBreakdown.rows,
      recent_leads: recentLeads.rows,
      top_downloads: topDownloads.rows,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
