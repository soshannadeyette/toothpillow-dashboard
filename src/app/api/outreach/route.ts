import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}

/**
 * GET /api/outreach — list all outreach entries, newest first
 */
export async function GET() {
  const { data, error } = await supabase
    .from('ig_outreach')
    .select('*')
    .order('contact_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) return json({ error: error.message }, 500);
  return json({ rows: data || [] });
}

/**
 * POST /api/outreach — add one or more outreach entries
 * Body: { rows: [{ name, username?, contact_date, status?, notes? }] }
 *   OR  { name, username?, contact_date, status?, notes? }  (single)
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const rawRows = Array.isArray(body.rows)
    ? (body.rows as Record<string, unknown>[])
    : [body];

  const clean = rawRows
    .filter((r) => typeof r.name === 'string' && (r.name as string).length > 0)
    .map((r) => ({
      name: (r.name as string).trim(),
      username: typeof r.username === 'string' && r.username ? r.username.toLowerCase().replace('@', '') : null,
      contact_date: typeof r.contact_date === 'string' ? r.contact_date : new Date().toISOString().slice(0, 10),
      status: typeof r.status === 'string' ? r.status : 'initiated',
      notes: typeof r.notes === 'string' ? r.notes : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

  if (clean.length === 0) return json({ error: 'No valid rows' }, 400);

  const { data, error } = await supabase
    .from('ig_outreach')
    .insert(clean)
    .select();

  if (error) return json({ error: error.message }, 500);
  return json({ ok: true, inserted: data?.length || clean.length, rows: data });
}

/**
 * PATCH /api/outreach — update an outreach entry
 * Body: { id, status?, notes?, name?, contact_date? }
 */
export async function PATCH(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const id = body.id;
  if (typeof id !== 'number' && typeof id !== 'string') {
    return json({ error: 'id required' }, 400);
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if ('status' in body && typeof body.status === 'string') updates.status = body.status;
  if ('notes' in body) updates.notes = typeof body.notes === 'string' ? body.notes : null;
  if ('name' in body && typeof body.name === 'string') updates.name = body.name;
  if ('contact_date' in body && typeof body.contact_date === 'string') updates.contact_date = body.contact_date;
  if ('username' in body) updates.username = typeof body.username === 'string' ? body.username : null;

  const { error } = await supabase
    .from('ig_outreach')
    .update(updates)
    .eq('id', Number(id));

  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
}

/**
 * DELETE /api/outreach?id=123 — remove an outreach entry
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return json({ error: 'id required' }, 400);

  const { error } = await supabase
    .from('ig_outreach')
    .delete()
    .eq('id', Number(id));

  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
}
