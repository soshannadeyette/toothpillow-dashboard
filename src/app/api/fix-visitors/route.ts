import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// One-time migration: restore correct daily visitor data from original HTML dashboard.
// Previous batch upserts overwrote visitor values. This restores from the source of truth.
// DELETE THIS FILE after running once.

const VISITOR_DATA: { date: string; visitors: number }[] = [
  // January 2026
  {date:'2026-01-02',visitors:500},{date:'2026-01-04',visitors:320},{date:'2026-01-05',visitors:680},
  {date:'2026-01-06',visitors:1450},{date:'2026-01-07',visitors:1320},{date:'2026-01-08',visitors:1680},
  {date:'2026-01-09',visitors:1290},{date:'2026-01-10',visitors:850},{date:'2026-01-11',visitors:920},
  {date:'2026-01-12',visitors:1150},{date:'2026-01-13',visitors:1680},{date:'2026-01-14',visitors:1340},
  {date:'2026-01-15',visitors:1520},{date:'2026-01-16',visitors:1210},{date:'2026-01-17',visitors:780},
  {date:'2026-01-18',visitors:900},{date:'2026-01-19',visitors:1560},{date:'2026-01-20',visitors:1430},
  {date:'2026-01-21',visitors:1120},{date:'2026-01-22',visitors:1340},{date:'2026-01-23',visitors:920},
  {date:'2026-01-24',visitors:560},{date:'2026-01-25',visitors:640},{date:'2026-01-26',visitors:1050},
  {date:'2026-01-27',visitors:1340},{date:'2026-01-28',visitors:1520},{date:'2026-01-29',visitors:1180},
  {date:'2026-01-30',visitors:780},{date:'2026-01-31',visitors:870},
  // February 2026
  {date:'2026-02-01',visitors:680},{date:'2026-02-02',visitors:820},{date:'2026-02-03',visitors:1240},
  {date:'2026-02-04',visitors:1560},{date:'2026-02-05',visitors:1120},{date:'2026-02-06',visitors:950},
  {date:'2026-02-07',visitors:720},{date:'2026-02-08',visitors:540},{date:'2026-02-09',visitors:1430},
  {date:'2026-02-10',visitors:890},{date:'2026-02-11',visitors:780},{date:'2026-02-12',visitors:1180},
  {date:'2026-02-13',visitors:1320},{date:'2026-02-14',visitors:600},{date:'2026-02-15',visitors:520},
  {date:'2026-02-16',visitors:1850},{date:'2026-02-17',visitors:1720},{date:'2026-02-18',visitors:1540},
  {date:'2026-02-19',visitors:1380},{date:'2026-02-20',visitors:1290},{date:'2026-02-21',visitors:720},
  {date:'2026-02-22',visitors:980},{date:'2026-02-23',visitors:2340},{date:'2026-02-24',visitors:1860},
  {date:'2026-02-25',visitors:1720},{date:'2026-02-26',visitors:1650},{date:'2026-02-27',visitors:1420},
  {date:'2026-02-28',visitors:1260},
  // March 2026
  {date:'2026-03-01',visitors:1115},{date:'2026-03-02',visitors:1348},{date:'2026-03-03',visitors:1443},
  {date:'2026-03-04',visitors:1385},{date:'2026-03-05',visitors:1085},{date:'2026-03-06',visitors:960},
  {date:'2026-03-07',visitors:726},{date:'2026-03-08',visitors:613},{date:'2026-03-09',visitors:1687},
  {date:'2026-03-10',visitors:1924},{date:'2026-03-11',visitors:1638},{date:'2026-03-12',visitors:1492},
  {date:'2026-03-13',visitors:1262},{date:'2026-03-14',visitors:972},{date:'2026-03-15',visitors:1016},
  {date:'2026-03-16',visitors:1790},{date:'2026-03-17',visitors:1316},{date:'2026-03-18',visitors:1927},
  {date:'2026-03-19',visitors:1546},{date:'2026-03-20',visitors:1078},{date:'2026-03-21',visitors:808},
  {date:'2026-03-22',visitors:763},{date:'2026-03-23',visitors:1245},{date:'2026-03-24',visitors:1238},
  {date:'2026-03-25',visitors:1793},{date:'2026-03-26',visitors:1855},{date:'2026-03-27',visitors:2135},
  {date:'2026-03-28',visitors:1534},{date:'2026-03-29',visitors:1393},{date:'2026-03-30',visitors:1831},
  {date:'2026-03-31',visitors:1171},
  // April 2026
  {date:'2026-04-01',visitors:1250},{date:'2026-04-02',visitors:940},{date:'2026-04-03',visitors:827},
  {date:'2026-04-04',visitors:574},{date:'2026-04-05',visitors:838},{date:'2026-04-06',visitors:1429},
  {date:'2026-04-07',visitors:1400},{date:'2026-04-08',visitors:1051},{date:'2026-04-09',visitors:1070},
  {date:'2026-04-10',visitors:762},{date:'2026-04-11',visitors:573},{date:'2026-04-12',visitors:784},
  {date:'2026-04-13',visitors:1164},{date:'2026-04-14',visitors:1139},{date:'2026-04-15',visitors:1254},
  {date:'2026-04-16',visitors:1110},{date:'2026-04-17',visitors:813},{date:'2026-04-18',visitors:643},
  {date:'2026-04-19',visitors:855},{date:'2026-04-20',visitors:1156},{date:'2026-04-21',visitors:1367},
  {date:'2026-04-22',visitors:1271},{date:'2026-04-23',visitors:1043},{date:'2026-04-24',visitors:795},
  {date:'2026-04-25',visitors:712},{date:'2026-04-26',visitors:744},{date:'2026-04-27',visitors:1191},
  {date:'2026-04-28',visitors:1101},{date:'2026-04-29',visitors:1325},{date:'2026-04-30',visitors:1130},
];

export async function GET() {
  const results: { date: string; status: string }[] = [];
  let fixed = 0;
  let errors = 0;

  for (const entry of VISITOR_DATA) {
    const { data: existing } = await supabase
      .from('daily_submissions')
      .select('*')
      .eq('date', entry.date)
      .maybeSingle();

    if (!existing) {
      results.push({ date: entry.date, status: 'no row found — skipped' });
      continue;
    }

    const { error } = await supabase
      .from('daily_submissions')
      .update({ visitors: entry.visitors })
      .eq('date', entry.date);

    if (error) {
      results.push({ date: entry.date, status: `error: ${error.message}` });
      errors++;
    } else {
      results.push({ date: entry.date, status: `updated ${existing.visitors} → ${entry.visitors}` });
      fixed++;
    }
  }

  return NextResponse.json({
    message: `Fixed ${fixed} rows, ${errors} errors, ${VISITOR_DATA.length} total`,
    results,
  });
}
