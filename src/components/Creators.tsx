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

interface Creator {
  username: string;
  status: string;
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
    .filter((c) => !search || c.username.includes(search.toLowerCase()));

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
