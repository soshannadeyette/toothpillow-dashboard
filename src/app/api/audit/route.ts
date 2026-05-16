import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/audit — fetch audit patients, optionally filtered by status
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
        .from('audit_patients')
        .select('*')
        .order('created_at', { ascending: false });

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// POST /api/audit — create or update an audit patient
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!fields.name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (id) {
        // Update existing
        const { data, error } = await supabase
            .from('audit_patients')
            .update(fields)
            .eq('id', id)
            .select();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } else {
        // Insert new
        const { data, error } = await supabase
            .from('audit_patients')
            .insert(fields)
            .select();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    }
}

// DELETE /api/audit?id=123 — delete an audit patient
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
        .from('audit_patients')
        .delete()
        .eq('id', Number(id));

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
