'use client';

import { useState, useEffect, useCallback } from 'react';

/* ════════════════════════════════════════════════════════════════════════════
   TP Palette
   ════════════════════════════════════════════════════════════════════════ */
const TP = {
  navy: '#1B2A4A',
  teal: '#2A9D8F',
  gold: '#F4A261',
  coral: '#E76F51',
  text: '#333333',
};

const TOTAL_FOLLOWERS = 132492; // follower export 2026-08-13

/* ════════════════════════════════════════════════════════════════════════════
   Outreach Log — Tania's DM outreach to IG creators
   Add new entries as batches come in. Source of truth for outreach tracking.
   ════════════════════════════════════════════════════════════════════════ */
interface OutreachEntry {
  name: string;
  contactDate: string;
  replied: boolean | null; // null = pending
  interested: boolean | null; // null = pending/no reply
  notes?: string;
}

const OUTREACH_LOG: OutreachEntry[] = [
  // Batch 1 — 2026-09-21 (Tania)
  { name: 'Lauren Johnson', contactDate: '2026-09-21', replied: true, interested: true, notes: 'Smaller following Lauren Johnson, NOT NNM' },
  { name: 'Megan Dixon Smalley', contactDate: '2026-09-21', replied: true, interested: true },
  { name: 'Carly Russ Peterson', contactDate: '2026-09-21', replied: true, interested: true },
  { name: 'Daya Diaz', contactDate: '2026-09-21', replied: true, interested: true },
  { name: 'Christine Hassler', contactDate: '2026-09-21', replied: true, interested: true },
  { name: 'Jessica Duncan Propes', contactDate: '2026-09-21', replied: true, interested: false, notes: 'Found someone in person, already in expanders' },
  { name: 'Autumn Lohman', contactDate: '2026-09-21', replied: null, interested: null },
  { name: 'Ally Kendricks', contactDate: '2026-09-21', replied: null, interested: null },
  { name: 'Molly Vollmer', contactDate: '2026-09-21', replied: null, interested: null },
  { name: 'Chelsey Curtis', contactDate: '2026-09-21', replied: null, interested: null },
];

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

export default function Creators() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [minFollowers, setMinFollowers] = useState<number>(10000);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async (min: number) => {
    try {
      const res = await fetch(`/api/creators?min=${Math.min(min, 5000)}`);
      const json = await res.json();
      if (json.creators) {
        setCreators(json.creators);
        setSummary(json.summary);
        setLastRefresh(new Date());
      }
    } catch {
      /* transient network error — next poll retries */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(minFollowers);
    const t = setInterval(() => load(minFollowers), 60_000);
    return () => clearInterval(t);
  }, [load, minFollowers]);

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

  const card = (label: string, value: string, color: string, sub?: string) => (
    <div
      style={{
        background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12,
        padding: '16px 20px', minWidth: 170, flex: 1,
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
          Live from the follower crawler (newest followers analyzed first). Auto-refreshes every minute.
          {lastRefresh && ` Last refresh ${lastRefresh.toLocaleTimeString()}.`}
        </p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'flex', gap: 12, margin: '14px 0', flexWrap: 'wrap' }}>
        {card('30K+ creators found', summary ? String(summary.big30k) : '…', TP.coral)}
        {card('Followers analyzed', summary ? fmt(summary.totalChecked) : '…', TP.navy, `of ${fmt(TOTAL_FOLLOWERS)}`)}
        {card('Creator accounts resolved', summary ? fmt(summary.totalResolved) : '…', TP.teal, 'business/creator profiles')}
        {card('Crawl progress', `${pctCrawled.toFixed(1)}%`, TP.gold)}
      </div>

      {/* Progress bar */}
      <div style={{ background: '#eee', borderRadius: 6, height: 8, marginBottom: 18 }}>
        <div
          style={{
            width: `${pctCrawled}%`, background: TP.teal, height: 8,
            borderRadius: 6, transition: 'width 1s',
          }}
        />
      </div>

      {/* ── Outreach Tracking ── */}
      {(() => {
        const totalSent = OUTREACH_LOG.length;
        const replied = OUTREACH_LOG.filter(e => e.replied === true).length;
        const interested = OUTREACH_LOG.filter(e => e.interested === true).length;
        const notInterested = OUTREACH_LOG.filter(e => e.interested === false).length;
        const pending = OUTREACH_LOG.filter(e => e.replied === null).length;
        const replyRate = totalSent > 0 ? ((replied / totalSent) * 100).toFixed(0) : '0';
        const interestRate = replied > 0 ? ((interested / replied) * 100).toFixed(0) : '0';

        return (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, marginBottom: 10 }}>
              DM Outreach — Tania
            </h3>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              {card('Sent', String(totalSent), TP.navy)}
              {card('Replied', String(replied), TP.teal, `${replyRate}% reply rate`)}
              {card('Interested', String(interested), '#2d8a4e', `${interestRate}% of replies`)}
              {card('Pending', String(pending), TP.gold, 'no reply yet')}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: TP.navy, color: '#fff' }}>
                    <th style={{ padding: '9px 10px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '9px 10px', textAlign: 'left' }}>Contacted</th>
                    <th style={{ padding: '9px 10px', textAlign: 'center' }}>Replied</th>
                    <th style={{ padding: '9px 10px', textAlign: 'center' }}>Interested</th>
                    <th style={{ padding: '9px 10px', textAlign: 'left' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {OUTREACH_LOG.map((e, i) => (
                    <tr key={e.name + e.contactDate} style={{ borderBottom: '1px solid #eee', background: i % 2 ? '#fafafa' : '#fff' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: TP.text }}>{e.name}</td>
                      <td style={{ padding: '8px 10px', color: '#666' }}>{e.contactDate}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        {e.replied === true ? (
                          <span style={{ color: TP.teal, fontWeight: 700 }}>Yes</span>
                        ) : e.replied === false ? (
                          <span style={{ color: TP.coral }}>No</span>
                        ) : (
                          <span style={{ color: TP.gold, fontWeight: 600 }}>Pending</span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        {e.interested === true ? (
                          <span style={{ background: '#2d8a4e', color: '#fff', borderRadius: 10, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>Yes</span>
                        ) : e.interested === false ? (
                          <span style={{ background: '#ddd', color: '#666', borderRadius: 10, padding: '2px 10px', fontSize: 11 }}>No</span>
                        ) : (
                          <span style={{ color: '#bbb', fontSize: 11 }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#888', fontSize: 12, maxWidth: 300 }}>{e.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* ── Creator Crawler Results ── */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, marginBottom: 10 }}>
        Follower Crawler Results
      </h3>

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
                <th style={{ padding: '9px 10px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((c, i) => (
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
                  <td style={{ padding: '8px 10px' }}>
                    {c.is_ambassador ? (
                      <span style={{ background: TP.teal, color: '#fff', borderRadius: 10, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                        Ambassador
                      </span>
                    ) : (c.followers_count ?? 0) >= 30000 ? (
                      <span style={{ background: TP.coral, color: '#fff', borderRadius: 10, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                        Prospect
                      </span>
                    ) : (
                      <span style={{ color: '#bbb', fontSize: 11 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
