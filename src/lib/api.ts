/**
 * Client-side API helpers — all data goes through Supabase via API routes.
 * No localStorage anywhere. Ever.
 */

import type { DailySubmission, GoogleAdsDaily, MonthlySummary } from './types';

const BASE = '';

// ---- Daily Submissions ----

export async function fetchSubmissions(year?: number, month?: number): Promise<DailySubmission[]> {
    const params = new URLSearchParams();
    if (year) params.set('year', String(year));
    if (month) params.set('month', String(month));
    const res = await fetch(`${BASE}/api/submissions?${params}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function upsertSubmission(entry: Partial<DailySubmission>): Promise<DailySubmission[]> {
    const res = await fetch(`${BASE}/api/submissions`, {
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
    const res = await fetch(`${BASE}/api/google-ads?${params}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function upsertGoogleAds(entry: Partial<GoogleAdsDaily>): Promise<GoogleAdsDaily[]> {
    const res = await fetch(`${BASE}/api/google-ads`, {
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
    const res = await fetch(`${BASE}/api/annual?${params}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function upsertMonthlySummary(entry: Partial<MonthlySummary>): Promise<MonthlySummary[]> {
    const res = await fetch(`${BASE}/api/annual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ---- Utility ----

export function todayStr(): string {
    return new Date().toISOString().slice(0, 10);
}

export function currentMonth(): number {
    return new Date().getMonth() + 1;
}

export function currentYear(): number {
    return new Date().getFullYear();
}
