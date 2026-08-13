-- IG Creators table — populated by the local follower crawler via /api/creators
-- Run this in the Supabase SQL Editor (one time)

CREATE TABLE ig_creators (
    username TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'ok',          -- ok | not_found | error
    followers_count INTEGER,
    media_count INTEGER,
    ig_id TEXT,
    followed_date DATE,                          -- when they followed toothpillow_official
    checked_at TIMESTAMPTZ,                      -- when the crawler analyzed them
    is_ambassador BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ig_creators_followers ON ig_creators (followers_count DESC NULLS LAST);
CREATE INDEX idx_ig_creators_status ON ig_creators (status);

-- Same access model as the other dashboard tables (anon key read/write)
ALTER TABLE ig_creators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON ig_creators FOR ALL USING (true) WITH CHECK (true);
