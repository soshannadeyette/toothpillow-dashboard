import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic — prevents Vercel/Next.js from caching this route
export const dynamic = 'force-dynamic';

function noCacheJson(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

/** GET /api/creators?min=10000 — resolved creators above a follower floor, plus crawl summary */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const min = parseInt(searchParams.get('min') || '10000', 10);

  const { data, error } = await supabase
    .from('ig_creators')
    .select('*')
    .eq('status', 'ok')
    .gte('followers_count', min)
    .order('followers_count', { ascending: false })
    .limit(2000);

  if (error) return noCacheJson({ error: error.message }, 500);

  const { count: totalChecked } = await supabase
    .from('ig_creators')
    .select('*', { count: 'exact', head: true });
  const { count: totalResolved } = await supabase
    .from('ig_creators')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ok');
  const { count: big30k } = await supabase
    .from('ig_creators')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ok')
    .gte('followers_count', 30000);

  return noCacheJson({
    creators: data || [],
    summary: {
      totalChecked: totalChecked || 0,
      totalResolved: totalResolved || 0,
      big30k: big30k || 0,
    },
  });
}

/** POST /api/creators — upsert a batch of crawler results: { rows: [{username, status, ...}] } */
export async function POST(request: NextRequest) {
  let body: { rows?: Record<string, unknown>[] };
  try {
    body = await request.json();
  } catch {
    return noCacheJson({ error: 'Invalid JSON' }, 400);
  }
  const rows = Array.isArray(body.rows) ? body.rows : [];
  if (rows.length === 0) return noCacheJson({ error: 'No rows' }, 400);
  if (rows.length > 500) return noCacheJson({ error: 'Max 500 rows per batch' }, 400);

  const clean = rows
    .filter((r) => typeof r.username === 'string' && (r.username as string).length > 0)
    .map((r) => ({
      username: (r.username as string).toLowerCase(),
      status: typeof r.status === 'string' ? r.status : 'ok',
      followers_count: Number.isFinite(Number(r.followers_count)) && r.followers_count !== '' ? Number(r.followers_count) : null,
      media_count: Number.isFinite(Number(r.media_count)) && r.media_count !== '' ? Number(r.media_count) : null,
      ig_id: typeof r.ig_id === 'string' && r.ig_id ? r.ig_id : null,
      followed_date: typeof r.followed_date === 'string' && r.followed_date ? r.followed_date : null,
      checked_at: typeof r.checked_at === 'string' && r.checked_at ? r.checked_at : null,
      updated_at: new Date().toISOString(),
    }));

  const { error } = await supabase
    .from('ig_creators')
    .upsert(clean, { onConflict: 'username' });

  if (error) return noCacheJson({ error: error.message }, 500);
  return noCacheJson({ ok: true, upserted: clean.length });
}
