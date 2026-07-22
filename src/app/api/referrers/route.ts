import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

// GET /api/referrers — fetch referrer data, optionally by year_month
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const yearMonth = searchParams.get('year_month'); // '2026-01'

    let query = supabase
        .from('monthly_referrers')
        .select('*')
        .order('year_month', { ascending: true });

    if (yearMonth) {
        query = query.eq('year_month', yearMonth);
    }

    const { data, error } = await query;
    if (error) return noCacheJson({ error: error.message }, 500);
    return noCacheJson(data);
}

// POST /api/referrers — upsert a referrer entry
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { year_month, referrer_type, count } = body;

    if (!year_month || !referrer_type) {
        return noCacheJson({ error: 'year_month and referrer_type are required' }, 400);
    }

    const { data, error } = await supabase
        .from('monthly_referrers')
        .upsert(
            { year_month, referrer_type, count: count || 0 },
            { onConflict: 'year_month,referrer_type' }
        )
        .select();

    if (error) return noCacheJson({ error: error.message }, 500);
    return noCacheJson(data);
}
