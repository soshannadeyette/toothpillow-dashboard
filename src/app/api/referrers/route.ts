import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// POST /api/referrers — upsert a referrer entry
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { year_month, referrer_type, count } = body;

    if (!year_month || !referrer_type) {
        return NextResponse.json({ error: 'year_month and referrer_type are required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('monthly_referrers')
        .upsert(
            { year_month, referrer_type, count: count || 0 },
            { onConflict: 'year_month,referrer_type' }
        )
        .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
