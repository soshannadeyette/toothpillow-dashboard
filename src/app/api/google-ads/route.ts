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
// Only updates fields that are explicitly provided; leaves others untouched.
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { date } = body;

    if (!date) {
        return noCacheJson({ error: 'Date is required' }, 400);
    }

    // Fetch existing row so we can merge rather than overwrite
    const { data: existing } = await supabase
        .from('google_ads_daily')
        .select('*')
        .eq('date', date)
        .maybeSingle();

    // Safe number helper: treats NaN/Infinity as "not provided"
    const safeNum = (v: unknown): number | undefined => {
        if (v === null || v === undefined) return undefined;
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    };

    const merged = {
        date,
        spend:       safeNum(body.spend)       ?? existing?.spend       ?? 0,
        impressions: safeNum(body.impressions) ?? existing?.impressions ?? 0,
        clicks:      safeNum(body.clicks)      ?? existing?.clicks      ?? 0,
        submit:      safeNum(body.submit)      ?? existing?.submit      ?? 0,
        started:     safeNum(body.started)     ?? existing?.started     ?? 0,
        finished:    safeNum(body.finished)    ?? existing?.finished    ?? 0,
        treatment:   safeNum(body.treatment)   ?? existing?.treatment   ?? 0,
    };

    const { data, error } = await supabase
        .from('google_ads_daily')
        .upsert(merged, { onConflict: 'date' })
        .select();

    if (error) return noCacheJson({ error: error.message }, 500);
    return noCacheJson(data);
}
