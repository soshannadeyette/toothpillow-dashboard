/**
 * Client-side API helpers — all data goes through Supabase via API routes.
 * No localStorage anywhere. Ever.
 */

import type { DailySubmission, GoogleAdsDaily, MonthlySummary, MonthGoal, AuditPatient } from './types';
import { MONTHLY_GOALS_2026 } from './types';

const BASE = '';

/** Wrapper around fetch that forces no-cache on all requests */
async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
    // Add cache-busting param + no-store to defeat browser/CDN caching
    const separator = url.includes('?') ? '&' : '?';
    const bustUrl = `${url}${separator}_t=${Date.now()}`;
    return fetch(bustUrl, { ...init, cache: 'no-store' as RequestCache });
}

// ---- Daily Submissions ----

export async function fetchSubmissions(year?: number, month?: number): Promise<DailySubmission[]> {
    const params = new URLSearchParams();
    if (year) params.set('year', String(year));
    if (month) params.set('month', String(month));
    const res = await apiFetch(`${BASE}/api/submissions?${params}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function upsertSubmission(entry: Partial<DailySubmission>): Promise<DailySubmission[]> {
    const res = await apiFetch(`${BASE}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ---- Google Ads Daily ----

export async function fetchGoogleAds(year?: number, month?: number): Promise<GoogleAdsDaily[]> {
    const params = new URLSearchParams();
    if (year) params.set('year', String(year));
    if (month) params.set('month', String(month));
    const res = await apiFetch(`${BASE}/api/google-ads?${params}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function upsertGoogleAds(entry: Partial<GoogleAdsDaily>): Promise<GoogleAdsDaily[]> {
    const res = await apiFetch(`${BASE}/api/google-ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ---- Monthly Summaries ----

export async function fetchAnnualSummaries(year?: number): Promise<MonthlySummary[]> {
    const params = new URLSearchParams();
    if (year) params.set('year', String(year));
    const res = await apiFetch(`${BASE}/api/annual?${params}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function upsertMonthlySummary(entry: Partial<MonthlySummary>): Promise<MonthlySummary[]> {
    const res = await apiFetch(`${BASE}/api/annual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ---- Audit Patients ----

export async function fetchAuditPatients(status?: string): Promise<AuditPatient[]> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    const res = await apiFetch(`${BASE}/api/audit?${params}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function upsertAuditPatient(entry: Partial<AuditPatient> & { name: string }): Promise<AuditPatient[]> {
    const res = await apiFetch(`${BASE}/api/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function deleteAuditPatient(id: number): Promise<void> {
    const res = await apiFetch(`${BASE}/api/audit?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
}

// ---- Utility (all dates in Central Time) ----

/** Returns a Date object representing "now" in US Central time */
function centralNow(): Date {
    // Intl gives us the Central-time components regardless of server TZ
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
    }).formatToParts(new Date());
    const get = (t: string) => parts.find(p => p.type === t)?.value ?? '0';
    return new Date(+get('year'), +get('month') - 1, +get('day'),
                    +get('hour'), +get('minute'), +get('second'));
}

export function todayStr(): string {
    const d = centralNow();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function currentMonth(): number {
    return centralNow().getMonth() + 1;
}

export function currentYear(): number {
    return centralNow().getFullYear();
}

// ---- Monthly Goals (Settings) ----

export async function fetchMonthlyGoals(): Promise<MonthGoal[]> {
    try {
        const res = await apiFetch(`${BASE}/api/settings?key=monthly_goals_2026`);
        if (!res.ok) return MONTHLY_GOALS_2026;
        const data = await res.json();
        if (data && data.length > 0 && data[0].value) {
            return JSON.parse(data[0].value) as MonthGoal[];
        }
        return MONTHLY_GOALS_2026;
    } catch {
        return MONTHLY_GOALS_2026;
    }
}

export async function saveMonthlyGoals(goals: MonthGoal[]): Promise<void> {
    const res = await apiFetch(`${BASE}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'monthly_goals_2026', value: JSON.stringify(goals) }),
    });
    if (!res.ok) throw new Error(await res.text());
}
