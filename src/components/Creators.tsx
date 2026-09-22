'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/* ════════════════════════════════════════════════════════════════════════════
   TP Palette
   ════════════════════════════════════════════════════════════════════════ */
const TP = {
  navy: '#1B2A4A',
  teal: '#2A9D8F',
  gold: '#F4A261',
  coral: '#E76F51',
  green: '#2d8a4e',
  text: '#333333',
};

const TOTAL_FOLLOWERS = 132492; // follower export 2026-08-13

/* ════════════════════════════════════════════════════════════════════════════
   Outreach statuses — the pipeline Tania tracks
   ════════════════════════════════════════════════════════════════════════ */
const STATUSES = [
  { value: 'initiated', label: 'Initiated Contact', color: TP.navy, bg: '#e8edf4' },
  { value: 'sent_link', label: 'Sent Meeting Link', color: TP.teal, bg: '#e0f5f1' },
  { value: 'not_interested', label: 'Not Interested', color: '#888', bg: '#eee' },
  { value: 'submitted', label: 'Submitted', color: '#7c3aed', bg: '#ede9fe' },
  { value: 'onboarded', label: 'Onboarded', color: TP.coral, bg: '#fde8e3' },
] as const;

type StatusValue = typeof STATUSES[number]['value'];

function statusMeta(s: string) {
  return STATUSES.find(st => st.value === s) || STATUSES[0];
}

interface OutreachRow {
  id: number;
  name: string;
  username: string | null;
  contact_date: string;
  status: StatusValue;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Creator {
  username: string;
  status: string;
  full_name: string | null;
  followers_count: number | null;
  media_count: number | null;
  followed_date: string | null;
  checked_at: string | null;
  is_ambassador: boolean;
}

interface Summary {
  totalChecked: number;
  totalResolved: number;
  big30k: number;
}

const TIERS = [
  { min: 30000, label: '30K+' },
  { min: 10000, label: '10K+' },
  { min: 5000, label: '5K+' },
] as const;

function fmt(n: number | null): string {
  return n == null ? '—' : n.toLocaleString();
}

/* ════════════════════════════════════════════════════════════════════════════
   Inline editable notes field
   ════════════════════════════════════════════════════════════════════════ */
function EditableNotes({ value, onSave }: { value: string | null; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  if (!editing) {
    return (
      <span
        onClick={() => { setDraft(value || ''); setEditing(true); }}
        style={{ cursor: 'pointer', color: value ? '#666' : '#bbb', fontSize: 12 }}
        title="Click to edit"
      >
        {value || 'add note...'}
      </span>
    );
  }

  return (
    <input
      ref={ref}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { onSave(draft); setEditing(false); }}
      onKeyDown={(e) => { if (e.key === 'Enter') { onSave(draft); setEditing(false); } if (e.key === 'Escape') setEditing(false); }}
      style={{ fontSize: 12, padding: '3px 6px', border: '1px solid #ccc', borderRadius: 4, width: '100%', maxWidth: 260 }}
    />
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Add-manually form (for creators not in crawler)
   ════════════════════════════════════════════════════════════════════════ */
function AddManualForm({ onAdd }: { onAdd: (name: string, username: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer', color: TP.text }}
      >
        + Add manually
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        style={{ fontSize: 12, padding: '5px 8px', border: '1px solid #ccc', borderRadius: 4, width: 160 }}
      />
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="@handle (optional)"
        style={{ fontSize: 12, padding: '5px 8px', border: '1px solid #ccc', borderRadius: 4, width: 160 }}
      />
      <button
        onClick={() => { if (name.trim()) { onAdd(name.trim(), username.trim()); setName(''); setUsername(''); setOpen(false); } }}
        style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: 'none', background: TP.teal, color: '#fff', cursor: 'pointer', fontWeight: 600 }}
      >
        Add
      </button>
      <button
        onClick={() => setOpen(false)}
        style={{ fontSize: 12, padding: '5px 8px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer', color: '#888' }}
      >
        Cancel
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════════════════════════════ */
export default function Creators() {
  // Crawler state
  const [creators, setCreators] = useState<Creator[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [minFollowers, setMinFollowers] = useState<number>(10000);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Outreach state
  const [outreach, setOutreach] = useState<OutreachRow[]>([]);
  const [outreachLoading, setOutreachLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null); // id currently saving
  const [hideNotInterested, setHideNotInterested] = useState(false);

  /* ── Load crawler data ── */
  const loadCreators = useCallback(async (min: number) => {
    try {
      const res = await fetch(`/api/creators?min=${Math.min(min, 5000)}`);
      const json = await res.json();
      if (json.creators) {
        setCreators(json.creators);
        setSummary(json.summary);
        setLastRefresh(new Date());
      }
    } catch { /* retry on next poll */ }
    finally { setLoading(false); }
  }, []);

  /* ── localStorage helpers for outreach (primary store until Supabase table exists) ── */
  const LS_KEY = 'ig_outreach_data';
  const readLS = (): OutreachRow[] => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
  };
  const writeLS = (rows: OutreachRow[]) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(rows)); } catch { /* full */ }
  };

  /* ── Load outreach data: API is source of truth, localStorage is offline cache ── */
  const loadOutreach = useCallback(async () => {
    try {
      const res = await fetch('/api/outreach');
      const json = await res.json();
      if (json.rows) {
        setOutreach(json.rows);
        writeLS(json.rows); // cache locally
        setOutreachLoading(false);
        return;
      }
    } catch { /* API unavailable */ }
    // Fall back to localStorage only if API fails
    const local = readLS();
    setOutreach(local);
    setOutreachLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadCreators(minFollowers);
    loadOutreach();
    const t = setInterval(() => loadCreators(minFollowers), 60_000);
    const t2 = setInterval(loadOutreach, 30_000); // refresh outreach every 30s to sync across users
    return () => { clearInterval(t); clearInterval(t2); };
  }, [loadCreators, loadOutreach, minFollowers]);

  /* ── Outreach helpers: update localStorage immediately, try API in background ── */
  const updateOutreach = async (id: number, updates: Partial<OutreachRow>) => {
    setSaving(id);
    const updated = outreach.map(r => r.id === id ? { ...r, ...updates, updated_at: new Date().toISOString() } as OutreachRow : r);
    setOutreach(updated);
    writeLS(updated);
    try {
      await fetch('/api/outreach', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
    } catch { /* API unavailable — localStorage has the data */ }
    finally { setSaving(null); }
  };

  const addToOutreach = async (name: string, username?: string) => {
    const newRow: OutreachRow = {
      id: Date.now(), // local ID
      name,
      username: username ? username.toLowerCase().replace('@', '') : null,
      contact_date: new Date().toISOString().slice(0, 10),
      status: 'initiated',
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newRow, ...outreach];
    setOutreach(updated);
    writeLS(updated);
    // Try API in background
    try {
      const res = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRow.name,
          username: newRow.username,
          contact_date: newRow.contact_date,
          status: newRow.status,
        }),
      });
      const json = await res.json();
      if (json.ok && json.rows?.[0]) {
        // Replace local ID with server ID
        const serverRow = json.rows[0];
        const synced = updated.map(r => r.id === newRow.id ? { ...r, id: serverRow.id } : r);
        setOutreach(synced);
        writeLS(synced);
      }
    } catch { /* API unavailable — localStorage has the data */ }
  };

  const trackCreator = async (c: Creator) => {
    await addToOutreach(c.full_name || c.username, c.username);
  };

  const removeOutreach = async (id: number) => {
    const updated = outreach.filter(r => r.id !== id);
    setOutreach(updated);
    writeLS(updated);
    try {
      await fetch(`/api/outreach?id=${id}`, { method: 'DELETE' });
    } catch { /* API unavailable */ }
  };

  /* ── Derived data ── */
  const outreachUsernames = new Set(outreach.map(r => r.username).filter(Boolean));

  const shown = creators
    .filter((c) => (c.followers_count ?? 0) >= minFollowers)
    .filter(
      (c) =>
        !search ||
        c.username.includes(search.toLowerCase()) ||
        (c.full_name || '').toLowerCase().includes(search.toLowerCase())
    );

  const pctCrawled = summary
    ? Math.min(100, (summary.totalChecked / TOTAL_FOLLOWERS) * 100)
    : 0;

  /* ── Outreach KPIs ── */
  const totalSent = outreach.length;
  const initiated = outreach.filter(r => r.status === 'initiated').length;
  const sentLink = outreach.filter(r => r.status === 'sent_link').length;
  const notInterested = outreach.filter(r => r.status === 'not_interested').length;
  const submitted = outreach.filter(r => r.status === 'submitted').length;
  const onboarded = outreach.filter(r => r.status === 'onboarded').length;
  const activeCount = sentLink + submitted + onboarded;

  const card = (label: string, value: string, color: string, sub?: string) => (
    <div
      style={{
        background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12,
        padding: '16px 20px', minWidth: 140, flex: 1,
      }}
    >
      <div style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 6 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: TP.navy }}>
          IG Creators — followers of @toothpillow_official
        </h2>
        <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
          Live from the follower crawler + outreach tracker. Auto-refreshes every minute.
          {lastRefresh && ` Last refresh ${lastRefresh.toLocaleTimeString()}.`}
        </p>
      </div>

      {/* ═══════ OUTREACH PIPELINE ═══════ */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, marginBottom: 10, marginTop: 20 }}>
        DM Outreach Pipeline
      </h3>

      {/* KPI cards */}
      <div style={{ display: 'flex', gap: 10, margin: '0 0 14px', flexWrap: 'wrap' }}>
        {card('Total', String(totalSent), TP.navy)}
        {card('Initiated', String(initiated), TP.navy, 'contacted')}
        {card('Sent Link', String(sentLink), TP.teal)}
        {card('Submitted', String(submitted), '#7c3aed')}
        {card('Onboarded', String(onboarded), TP.coral)}
        {card('Not Interested', String(notInterested), '#888')}
      </div>

      {/* Track button on each creator row is the primary add method */}

      {/* Filter toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <button
          onClick={() => setHideNotInterested(h => !h)}
          style={{
            fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 8,
            border: '1px solid #ddd', cursor: 'pointer',
            background: hideNotInterested ? '#f3f4f6' : '#fff',
            color: hideNotInterested ? TP.navy : '#666',
          }}
        >
          {hideNotInterested ? 'Show All' : 'Hide Not Interested'}
        </button>
        {hideNotInterested && notInterested > 0 && (
          <span style={{ fontSize: 12, color: '#888' }}>({notInterested} hidden)</span>
        )}
      </div>

      {/* Outreach table */}
      {outreachLoading ? (
        <p style={{ color: '#888', fontSize: 14 }}>Loading outreach data…</p>
      ) : outreach.length === 0 ? (
        <p style={{ color: '#888', fontSize: 14 }}>
          No outreach yet. Use the &quot;Track&quot; button on a creator below, or add manually above.
        </p>
      ) : (
        <div style={{ overflowX: 'auto', marginBottom: 28 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: TP.navy, color: '#fff' }}>
                <th style={{ padding: '9px 10px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '9px 10px', textAlign: 'left' }}>Handle</th>
                <th style={{ padding: '9px 10px', textAlign: 'left' }}>Contacted</th>
                <th style={{ padding: '9px 10px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '9px 10px', textAlign: 'left' }}>Notes</th>
                <th style={{ padding: '9px 10px', textAlign: 'center', width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {outreach
                .filter(r => !(hideNotInterested && r.status === 'not_interested'))
                .sort((a, b) => {
                  const aNI = a.status === 'not_interested' ? 1 : 0;
                  const bNI = b.status === 'not_interested' ? 1 : 0;
                  return aNI - bNI;
                })
                .map((r, i) => {
                const meta = statusMeta(r.status);
                const isNI = r.status === 'not_interested';
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid #eee', background: isNI ? '#f7f7f7' : i % 2 ? '#fafafa' : '#fff', opacity: saving === r.id ? 0.5 : isNI ? 0.45 : 1 }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: isNI ? '#aaa' : TP.text, textDecoration: isNI ? 'line-through' : 'none' }}>{r.name}</td>
                    <td style={{ padding: '8px 10px' }}>
                      {r.username ? (
                        <a
                          href={`https://www.instagram.com/${r.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: TP.teal, textDecoration: 'none', fontSize: 12 }}
                        >
                          @{r.username}
                        </a>
                      ) : (
                        <span style={{ color: '#bbb', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '8px 10px', color: '#666', fontSize: 12 }}>{r.contact_date}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <select
                        value={r.status}
                        onChange={(e) => updateOutreach(r.id, { status: e.target.value as StatusValue })}
                        style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 10,
                          border: 'none', cursor: 'pointer',
                          background: meta.bg, color: meta.color,
                          appearance: 'auto',
                        }}
                      >
                        {STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '8px 10px', maxWidth: 260 }}>
                      <EditableNotes
                        value={r.notes}
                        onSave={(v) => updateOutreach(r.id, { notes: v })}
                      />
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <button
                        onClick={() => { if (confirm(`Remove ${r.name} from outreach?`)) removeOutreach(r.id); }}
                        style={{ fontSize: 12, color: '#e53e3e', background: '#fef2f2', border: '1px solid #fecaca', cursor: 'pointer', padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}
                        title="Remove from outreach"
                        onMouseEnter={e => { e.currentTarget.style.background = '#e53e3e'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#e53e3e'; }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══════ CRAWLER RESULTS ═══════ */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, marginBottom: 10 }}>
        Follower Crawler Results
      </h3>

      {/* Crawler KPI cards */}
      <div style={{ display: 'flex', gap: 12, margin: '0 0 14px', flexWrap: 'wrap' }}>
        {card('30K+ creators', summary ? String(summary.big30k) : '…', TP.coral)}
        {card('Analyzed', summary ? fmt(summary.totalChecked) : '…', TP.navy, `of ${fmt(TOTAL_FOLLOWERS)}`)}
        {card('Resolved', summary ? fmt(summary.totalResolved) : '…', TP.teal, 'creator profiles')}
        {card('Crawl', `${pctCrawled.toFixed(1)}%`, TP.gold)}
      </div>

      {/* Progress bar */}
      <div style={{ background: '#eee', borderRadius: 6, height: 8, marginBottom: 14 }}>
        <div
          style={{
            width: `${pctCrawled}%`, background: TP.teal, height: 8,
            borderRadius: 6, transition: 'width 1s',
          }}
        />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        {TIERS.map((t) => (
          <button
            key={t.min}
            onClick={() => setMinFollowers(t.min)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
              border: `1.5px solid ${minFollowers === t.min ? TP.navy : '#ccc'}`,
              background: minFollowers === t.min ? TP.navy : '#fff',
              color: minFollowers === t.min ? '#fff' : TP.text,
              fontWeight: minFollowers === t.min ? 700 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search handle…"
          style={{
            marginLeft: 'auto', padding: '7px 12px', border: '1px solid #ccc',
            borderRadius: 8, fontSize: 13, width: 200,
          }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: '#888', fontSize: 14 }}>Loading…</p>
      ) : shown.length === 0 ? (
        <p style={{ color: '#888', fontSize: 14 }}>
          No creators at {fmt(minFollowers)}+ followers yet — the crawler is working newest-first, check back soon.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: TP.navy, color: '#fff' }}>
                <th style={{ padding: '9px 10px', textAlign: 'left' }}>#</th>
                <th style={{ padding: '9px 10px', textAlign: 'left' }}>Handle</th>
                <th style={{ padding: '9px 10px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '9px 10px', textAlign: 'right' }}>Followers</th>
                <th style={{ padding: '9px 10px', textAlign: 'right' }}>Posts</th>
                <th style={{ padding: '9px 10px', textAlign: 'left' }}>Followed TP</th>
                <th style={{ padding: '9px 10px', textAlign: 'left' }}>Analyzed</th>
                <th style={{ padding: '9px 10px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((c, i) => {
                const tracked = outreachUsernames.has(c.username);
                return (
                  <tr key={c.username} style={{ borderBottom: '1px solid #eee', background: i % 2 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '8px 10px', color: '#999' }}>{i + 1}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <a
                        href={`https://www.instagram.com/${c.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: TP.teal, fontWeight: 600, textDecoration: 'none' }}
                      >
                        @{c.username}
                      </a>
                    </td>
                    <td style={{ padding: '8px 10px', color: TP.text }}>{c.full_name || '—'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: (c.followers_count ?? 0) >= 30000 ? TP.coral : TP.text }}>
                      {fmt(c.followers_count)}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#666' }}>{fmt(c.media_count)}</td>
                    <td style={{ padding: '8px 10px', color: '#666' }}>{c.followed_date || '—'}</td>
                    <td style={{ padding: '8px 10px', color: '#666' }}>
                      {c.checked_at ? new Date(c.checked_at).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      {c.is_ambassador ? (
                        <span style={{ background: TP.teal, color: '#fff', borderRadius: 10, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                          Ambassador
                        </span>
                      ) : tracked ? (
                        <span style={{ background: '#e0f0e6', color: TP.green, borderRadius: 10, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                          Tracking
                        </span>
                      ) : (
                        <button
                          onClick={() => trackCreator(c)}
                          style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 10,
                            border: `1.5px solid ${TP.coral}`, background: '#fff', color: TP.coral,
                            cursor: 'pointer',
                          }}
                        >
                          Track
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
