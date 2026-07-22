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
    if (error) return noCacheJson({ error: error.message }, 500);
    return noCacheJson(data);
}

// POST /api/audit — create or update an audit patient
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!fields.name) {
        return noCacheJson({ error: 'Name is required' }, 400);
    }

    if (id) {
        // Update existing
        const { data, error } = await supabase
            .from('audit_patients')
            .update(fields)
            .eq('id', id)
            .select();
        if (error) return noCacheJson({ error: error.message }, 500);
        return noCacheJson(data);
    } else {
        // Insert new
        const { data, error } = await supabase
            .from('audit_patients')
            .insert(fields)
            .select();
        if (error) return noCacheJson({ error: error.message }, 500);
        return noCacheJson(data);
    }
}

// DELETE /api/audit?id=123 — delete an audit patient
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return noCacheJson({ error: 'ID is required' }, 400);
    }

    const { error } = await supabase
        .from('audit_patients')
        .delete()
        .eq('id', Number(id));

    if (error) return noCacheJson({ error: error.message }, 500);
    return noCacheJson({ success: true });
}
