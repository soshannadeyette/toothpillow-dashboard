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

// GET /api/settings — fetch all settings or a specific key
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    let query = supabase.from('settings').select('*');
    if (key) {
        query = query.eq('key', key);
    }

    const { data, error } = await query;
    if (error) return noCacheJson({ error: error.message }, 500);
    return noCacheJson(data);
}

// POST /api/settings — upsert a setting
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
        return noCacheJson({ error: 'key and value are required' }, 400);
    }

    const { data, error } = await supabase
        .from('settings')
        .upsert(
            { key, value: String(value), updated_at: new Date().toISOString() },
            { onConflict: 'key' }
        )
        .select();

    if (error) return noCacheJson({ error: error.message }, 500);
    return noCacheJson(data);
}
