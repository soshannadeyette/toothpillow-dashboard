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

// GET /api/google-ads — fetch daily Google Ads data, optionally filtered by year/month
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    let query = supabase
        .from('google_ads_daily')
        .select('*')
        .order('date', { ascending: true });

    if (year && month) {
        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const endDate = `${year}-${month.padStart(2, '0')}-31`;
        query = query.gte('date', startDate).lte('date', endDate);
    } else if (year) {
        query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
    }

    const { data, error } = await query;
    if (error) return noCacheJson({ error: error.message }, 500);
    return noCacheJson(data);
}

// POST /api/google-ads — upsert a daily Google Ads entry
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { date, spend, impressions, clicks, submit, started, finished, treatment } = body;

    if (!date) {
        return noCacheJson({ error: 'Date is required' }, 400);
    }

    const { data, error } = await supabase
        .from('google_ads_daily')
        .upsert(
            {
                date,
                spend: spend || 0,
                impressions: impressions || 0,
                clicks: clicks || 0,
                submit: submit || 0,
                started: started || 0,
                finished: finished || 0,
                treatment: treatment || 0,
            },
            { onConflict: 'date' }
        )
        .select();

    if (error) return noCacheJson({ error: error.message }, 500);
    return noCacheJson(data);
}
