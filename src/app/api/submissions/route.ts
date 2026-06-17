import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Hardcoded seed — Salesforce export data (source of truth for completed days).
// Auto-upserted into Supabase on GET for past dates only. Today is excluded
// so manual form entries work normally.
// Source: Salesforce exports, June 17, 2026
const SUBMISSIONS_SEED = [
  {date:'2026-06-01',online:77,hybrid:13,prime:0,visitors:0,income:385},
  {date:'2026-06-02',online:61,hybrid:12,prime:0,visitors:0,income:305},
  {date:'2026-06-03',online:46,hybrid:18,prime:0,visitors:0,income:230},
  {date:'2026-06-04',online:52,hybrid:8,prime:0,visitors:0,income:260},
  {date:'2026-06-05',online:46,hybrid:3,prime:1,visitors:0,income:230},
  {date:'2026-06-06',online:45,hybrid:1,prime:0,visitors:0,income:225},
  {date:'2026-06-07',online:24,hybrid:0,prime:0,visitors:0,income:120},
  {date:'2026-06-08',online:61,hybrid:3,prime:0,visitors:0,income:305},
  {date:'2026-06-09',online:64,hybrid:9,prime:0,visitors:0,income:320},
  {date:'2026-06-10',online:66,hybrid:12,prime:1,visitors:0,income:330},
  {date:'2026-06-11',online:63,hybrid:12,prime:1,visitors:0,income:315},
  {date:'2026-06-12',online:46,hybrid:8,prime:0,visitors:0,income:230},
  {date:'2026-06-13',online:29,hybrid:0,prime:0,visitors:0,income:145},
  {date:'2026-06-14',online:27,hybrid:0,prime:0,visitors:0,income:135},
  {date:'2026-06-15',online:38,hybrid:12,prime:0,visitors:0,income:190},
  {date:'2026-06-16',online:34,hybrid:10,prime:1,visitors:0,income:170},
];

function centralToday(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '01';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

async function seedPastDates() {
  const today = centralToday();
  const pastSeed = SUBMISSIONS_SEED.filter(s => s.date < today);
  if (pastSeed.length === 0) return;

  // Fetch existing rows so we preserve prime/visitors
  const dates = pastSeed.map(s => s.date);
  const { data: existing } = await supabase
    .from('daily_submissions')
    .select('*')
    .in('date', dates);

  const existingByDate = new Map((existing || []).map(r => [r.date, r]));

  // Merge: seed provides online/hybrid/income, existing keeps prime/visitors
  const merged = pastSeed.map(s => {
    const ex = existingByDate.get(s.date);
    return {
      date: s.date,
      online: s.online,
      hybrid: s.hybrid,
      prime: ex?.prime ?? s.prime,
      visitors: ex?.visitors ?? s.visitors,
      income: s.income,
    };
  });

  await supabase
    .from('daily_submissions')
    .upsert(merged, { onConflict: 'date' });
}

// GET /api/submissions — fetch daily submissions, optionally filtered by year/month
export async function GET(request: NextRequest) {
    // Seed past dates from Salesforce exports into Supabase (idempotent)
    await seedPastDates();

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    let query = supabase
        .from('daily_submissions')
        .select('*')
        .order('date', { ascending: true });

    if (year && month) {
        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const lastDay = new Date(Number(year), Number(month), 0).getDate();
                const endDate = `${year}-${month.padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        query = query.gte('date', startDate).lte('date', endDate);
    } else if (year) {
        query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// POST /api/submissions — upsert a daily submission entry
// Only updates fields that are explicitly provided; leaves others untouched.
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { date } = body;

    if (!date) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Fetch existing row so we can merge rather than overwrite
    const { data: existing } = await supabase
        .from('daily_submissions')
        .select('*')
        .eq('date', date)
        .maybeSingle();

    const onlineCount = body.online ?? existing?.online ?? 0;

    const merged = {
        date,
        online:   onlineCount,
        hybrid:   body.hybrid   ?? existing?.hybrid   ?? 0,
        prime:    body.prime    ?? existing?.prime    ?? 0,
        visitors: body.visitors ?? existing?.visitors ?? 0,
        income:   onlineCount * 5,  // $5 per online submission — always auto-calculated
    };

    const { data, error } = await supabase
        .from('daily_submissions')
        .upsert(merged, { onConflict: 'date' })
        .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// DELETE /api/submissions?id=123 — delete a submission by ID
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
        .from('daily_submissions')
        .delete()
        .eq('id', Number(id));

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deletedId: Number(id) });
}
