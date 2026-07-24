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

// Google Ads daily seed — spend/clicks/impressions from Google Ads Report Editor.
// Upserted into Supabase on GET (idempotent, merges with existing rows to preserve
// submit/started/finished/treatment fields from manual entry).
// July 6-24 refreshed from Google Ads Report Editor, July 24, 2026.
const GOOGLE_ADS_SEED: {date:string;spend:number;clicks:number;impressions:number}[] = [
  { date: '2026-07-20', spend: 653.31, clicks: 172, impressions: 2558 },
  { date: '2026-07-21', spend: 656.91, clicks: 162, impressions: 2514 },
  { date: '2026-07-22', spend: 643.76, clicks: 161, impressions: 2536 },
  { date: '2026-07-23', spend: 605.30, clicks: 144, impressions: 2383 },
  { date: '2026-07-24', spend: 340.22, clicks: 86, impressions: 1327 },
];

async function seedGoogleAdsData() {
  if (GOOGLE_ADS_SEED.length === 0) return;
  const dates = GOOGLE_ADS_SEED.map(s => s.date);
  const { data: existing } = await supabase
    .from('google_ads_daily')
    .select('*')
    .in('date', dates);
  const existingByDate = new Map((existing || []).map((r: Record<string, unknown>) => [r.date as string, r]));
  const merged = GOOGLE_ADS_SEED.map(s => {
    const ex = existingByDate.get(s.date) as Record<string, unknown> | undefined;
    return {
      date: s.date,
      spend: s.spend,
      clicks: s.clicks,
      impressions: s.impressions,
      submit: (ex?.submit as number) ?? 0,
      started: (ex?.started as number) ?? 0,
      finished: (ex?.finished as number) ?? 0,
      treatment: (ex?.treatment as number) ?? 0,
    };
  });
  await supabase.from('google_ads_daily').upsert(merged, { onConflict: 'date' });
}

// GET /api/google-ads — fetch daily Google Ads data, optionally filtered by year/month
export async function GET(request: NextRequest) {
    // Seed new days into Supabase (idempotent)
    await seedGoogleAdsData();

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
