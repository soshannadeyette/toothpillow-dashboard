import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';

// Server-only: this module is imported exclusively by API routes (src/app/api/*), never by
// client components, so the service-role key is never bundled to the browser. Service role
// bypasses Row-Level Security, so once RLS is enabled on the tables the dashboard keeps working
// while the public anon path is closed. Falls back to the anon key when SUPABASE_SERVICE_ROLE_KEY
// is unset, so this can deploy before the Vercel env var is added without breaking anything.
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
