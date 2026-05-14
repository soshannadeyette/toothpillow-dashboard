import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/submissions — fetch daily submissions, optionally filtered by year/month
export async function GET(request: NextRequest) {
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
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { date, online, hybrid, prime, visitors, income } = body;

    if (!date) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('daily_submissions')
        .upsert(
            {
                date,
                online: online || 0,
                hybrid: hybrid || 0,
                prime: prime || 0,
                visitors: visitors || 0,
                income: income || (online || 0) * 5,
            },
            { onConflict: 'date' }
        )
        .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
