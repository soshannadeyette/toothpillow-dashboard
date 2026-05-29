import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// One-time seed: May 2026 daily submissions from 5/29 Salesforce export
// DELETE THIS FILE after confirming data is seeded
const MAY_2026 = [
  {day:1,o:31,h:3,p:3},{day:2,o:17,h:0,p:0},{day:3,o:21,h:0,p:0},
  {day:4,o:36,h:13,p:1},{day:5,o:26,h:11,p:0},{day:6,o:34,h:10,p:1},
  {day:7,o:27,h:8,p:2},{day:8,o:23,h:2,p:3},{day:9,o:16,h:0,p:0},
  {day:10,o:15,h:0,p:0},{day:11,o:37,h:3,p:0},{day:12,o:28,h:11,p:0},
  {day:13,o:33,h:13,p:0},{day:14,o:28,h:18,p:0},{day:15,o:22,h:3,p:0},
  {day:16,o:18,h:0,p:0},{day:17,o:15,h:0,p:0},{day:18,o:41,h:9,p:0},
  {day:19,o:34,h:6,p:0},{day:20,o:29,h:14,p:0},{day:21,o:20,h:8,p:0},
  {day:22,o:32,h:5,p:0},{day:23,o:29,h:0,p:0},{day:24,o:17,h:0,p:0},
  {day:25,o:23,h:1,p:0},{day:26,o:40,h:22,p:0},{day:27,o:40,h:15,p:1},
  {day:28,o:70,h:11,p:1},{day:29,o:33,h:3,p:1},
];

export async function GET() {
  const results: string[] = [];
  for (const d of MAY_2026) {
    const date = `2026-05-${String(d.day).padStart(2, '0')}`;
    const { error } = await supabase
      .from('daily_submissions')
      .upsert({
        date,
        online: d.o,
        hybrid: d.h,
        prime: d.p,
        income: d.o * 5,
      }, { onConflict: 'date' });
    results.push(`${date}: ${error ? 'FAIL ' + error.message : 'OK'}`);
  }
  const ok = results.filter(r => r.includes('OK')).length;
  return NextResponse.json({ ok, failed: results.length - ok, details: results });
}
