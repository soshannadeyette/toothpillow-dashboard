import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// POST /api/annual — upsert a monthly summary row
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { year, month, month_name, ...rest } = body;

    if (!year || !month) {
        return NextResponse.json({ error: 'Year and month are required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('monthly_summary')
        .upsert(
            { year, month, month_name: month_name || '', ...rest },
            { onConflict: 'year,month' }
        )
        .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
