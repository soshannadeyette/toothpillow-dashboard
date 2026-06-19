import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// June 1-16 seed data already in Supabase — cleared to stop overwriting manual entries.
// If a future batch needs seeding, add rows here temporarily, then clear after confirmed in Supabase.
const SUBMISSIONS_SEED: {date:string;online:number;hybrid:number;prime:number;visitors:number;income:number}[] = [];

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
