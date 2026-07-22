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

// GET /api/annual — fetch monthly summaries, optionally filtered by year
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');

    let query = supabase
        .from('monthly_summary')
        .select('*')
        .order('year', { ascending: true })
        .order('month', { ascending: true });

    if (year) {
        query = query.eq('year', parseInt(year));
    }

    const { data, error } = await query;
    if (error) return noCacheJson({ error: error.message }, 500);
    return noCacheJson(data);
}

// POST /api/annual — upsert a monthly summary row
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { year, month, month_name, ...rest } = body;

    if (!year || !month) {
        return noCacheJson({ error: 'Year and month are required' }, 400);
    }

    const { data, error } = await supabase
        .from('monthly_summary')
        .upsert(
            { year, month, month_name: month_name || '', ...rest },
            { onConflict: 'year,month' }
        )
        .select();

    if (error) return noCacheJson({ error: error.message }, 500);
    return noCacheJson(data);
}
