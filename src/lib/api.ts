/**
 * Client-side API helpers — all data goes through Supabase via API routes.
 * No localStorage anywhere. Ever.
 */

import type { DailySubmission, GoogleAdsDaily, MonthlySummary, MonthGoal, AuditPatient } from './types';
import { MONTHLY_GOALS_2026 } from './types';

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

// ---- Audit Patients ----

export async function fetchAuditPatients(status?: string): Promise<AuditPatient[]> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    const res = await fetch(`${BASE}/api/audit?${params}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function upsertAuditPatient(entry: Partial<AuditPatient> & { name: string }): Promise<AuditPatient[]> {
    const res = await fetch(`${BASE}/api/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function deleteAuditPatient(id: number): Promise<void> {
    const res = await fetch(`${BASE}/api/audit?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
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

// ---- Monthly Goals (Settings) ----

export async function fetchMonthlyGoals(): Promise<MonthGoal[]> {
    try {
        const res = await fetch(`${BASE}/api/settings?key=monthly_goals_2026`);
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
    const res = await fetch(`${BASE}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'monthly_goals_2026', value: JSON.stringify(goals) }),
    });
    if (!res.ok) throw new Error(await res.text());
}
