-- Toothpillow Submission Dashboard — Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables

-- Daily submission tracker (the core table — replaces localStorage submissionData)
CREATE TABLE daily_submissions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    online INTEGER NOT NULL DEFAULT 0,
    hybrid INTEGER NOT NULL DEFAULT 0,
    prime INTEGER NOT NULL DEFAULT 0,
    total INTEGER GENERATED ALWAYS AS (online + hybrid + prime) STORED,
    visitors INTEGER NOT NULL DEFAULT 0,
    income NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Google Ads daily tracking (replaces localStorage googleAdsDaily)
CREATE TABLE google_ads_daily (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    spend NUMERIC(10,2) NOT NULL DEFAULT 0,
    impressions INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    submit INTEGER NOT NULL DEFAULT 0,
    started INTEGER NOT NULL DEFAULT 0,
    finished INTEGER NOT NULL DEFAULT 0,
    treatment INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly summary (replaces annualSeedData — one row per completed month)
CREATE TABLE monthly_summary (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    month_name TEXT NOT NULL,
    goal INTEGER NOT NULL DEFAULT 0,
    total_submissions INTEGER NOT NULL DEFAULT 0,
    online_submissions INTEGER NOT NULL DEFAULT 0,
    hybrid_submissions INTEGER NOT NULL DEFAULT 0,
    prime_submissions INTEGER NOT NULL DEFAULT 0,
    total_income NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_visitors INTEGER NOT NULL DEFAULT 0,
    usa_visitors INTEGER NOT NULL DEFAULT 0,
    conversion_rate NUMERIC(5,2) DEFAULT 0,
    usa_conversion_rate NUMERIC(5,2) DEFAULT 0,
    days_tracked INTEGER NOT NULL DEFAULT 0,
    daily_avg NUMERIC(6,1) DEFAULT 0,
    UNIQUE(year, month)
);

-- Referrer data by month (replaces referrerData object)
CREATE TABLE monthly_referrers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    year_month TEXT NOT NULL, -- '2026-01' format
    referrer_type TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    UNIQUE(year_month, referrer_type)
);

-- Ambassador commissions (replaces ambCommissions object)
CREATE TABLE ambassador_commissions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    month_name TEXT NOT NULL UNIQUE,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Meta Ads monthly spend (replaces metaMonthly array)
CREATE TABLE meta_ads_monthly (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    month_label TEXT NOT NULL UNIQUE, -- 'Mar 2025' format
    spend NUMERIC(10,2) NOT NULL DEFAULT 0,
    leads INTEGER NOT NULL DEFAULT 0
);

-- Ad funnel snapshots (replaces metaFunnel/googleFunnel objects)
CREATE TABLE ad_funnels (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    platform TEXT NOT NULL, -- 'meta' or 'google'
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    entered INTEGER DEFAULT 0,
    waiting_info INTEGER DEFAULT 0,
    sent_to_txp INTEGER DEFAULT 0,
    txp_approved INTEGER DEFAULT 0,
    sent_checkout INTEGER DEFAULT 0,
    checked_out INTEGER DEFAULT 0,
    amount_received NUMERIC(10,2) DEFAULT 0,
    denied INTEGER DEFAULT 0,
    closed_lost INTEGER DEFAULT 0,
    referred_out INTEGER DEFAULT 0,
    UNIQUE(platform, snapshot_date)
);

-- Settings / config (monthly goals, etc.)
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historical daily totals for 2025 (read-only reference data)
CREATE TABLE historical_daily (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total INTEGER NOT NULL DEFAULT 0
);

-- Indexes for common queries
CREATE INDEX idx_daily_submissions_date ON daily_submissions(date);
CREATE INDEX idx_google_ads_daily_date ON google_ads_daily(date);
CREATE INDEX idx_monthly_summary_year_month ON monthly_summary(year, month);
CREATE INDEX idx_monthly_referrers_year_month ON monthly_referrers(year_month);
CREATE INDEX idx_historical_daily_date ON historical_daily(date);

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER daily_submissions_updated_at
    BEFORE UPDATE ON daily_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER google_ads_daily_updated_at
    BEFORE UPDATE ON google_ads_daily
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
