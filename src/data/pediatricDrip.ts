// Pediatric Drip Campaign data — hybrid + screening families from dental offices.
// Enrollment data: SOSH | CHECKOUT Salesforce export (Nov 13, 2026).
// Booking data: GHL daily scrape (placeholder until first scrape runs).
// Drip campaign started Nov 2, 2026.

export const DRIP_START = '2026-11-02';
export const SF_EXPORT_DATE = '2026-11-13';
export const GHL_AS_OF: string | null = null; // set when first GHL scrape runs

// ════════════════════════════════════════════════════════════════════════
//  ENROLLMENT BY REFERRAL MONTH (from Salesforce CHECKOUT export)
//  These are families who CHECKED OUT, grouped by submission (referral) month.
//  "type" = Account Source in Salesforce (Hybrid or Screening).
// ════════════════════════════════════════════════════════════════════════

export type EnrollmentRow = {
  month: string;        // YYYY-MM
  type: 'hybrid' | 'screening';
  checkouts: number;    // families who checked out with this referral month
  amtPaid: number;
  totalAmtPaid: number;
  avgDaysToCheckout: number | null;  // avg days from submission to checkout
  medianDaysToCheckout: number | null;
};

export const enrollmentByMonth: EnrollmentRow[] = [
  // Hybrid
  { month: '2026-01', type: 'hybrid', checkouts: 15, amtPaid: 25237, totalAmtPaid: 30326, avgDaysToCheckout: 19.4, medianDaysToCheckout: 17 },
  { month: '2026-02', type: 'hybrid', checkouts: 21, amtPaid: 29133, totalAmtPaid: 35223, avgDaysToCheckout: 34.3, medianDaysToCheckout: 28 },
  { month: '2026-03', type: 'hybrid', checkouts: 37, amtPaid: 51229, totalAmtPaid: 63427, avgDaysToCheckout: 32.6, medianDaysToCheckout: 20 },
  { month: '2026-04', type: 'hybrid', checkouts: 33, amtPaid: 53129, totalAmtPaid: 64308, avgDaysToCheckout: 22.5, medianDaysToCheckout: 16 },
  { month: '2026-05', type: 'hybrid', checkouts: 17, amtPaid: 24581, totalAmtPaid: 29168, avgDaysToCheckout: 32.9, medianDaysToCheckout: 26 },
  { month: '2026-06', type: 'hybrid', checkouts: 32, amtPaid: 55717, totalAmtPaid: 67493, avgDaysToCheckout: 25.6, medianDaysToCheckout: 16 },
  { month: '2026-07', type: 'hybrid', checkouts: 32, amtPaid: 58923, totalAmtPaid: 70102, avgDaysToCheckout: 16.1, medianDaysToCheckout: 13 },
  { month: '2026-08', type: 'hybrid', checkouts: 20, amtPaid: 37815, totalAmtPaid: 53606, avgDaysToCheckout: 14.1, medianDaysToCheckout: 9 },
  { month: '2026-09', type: 'hybrid', checkouts: 15, amtPaid: 31233, totalAmtPaid: 42825, avgDaysToCheckout: 17.8, medianDaysToCheckout: 14 },
  { month: '2026-10', type: 'hybrid', checkouts: 3, amtPaid: 6188, totalAmtPaid: 6785, avgDaysToCheckout: 10.0, medianDaysToCheckout: 9 },
  // Screening
  { month: '2026-01', type: 'screening', checkouts: 21, amtPaid: 29927, totalAmtPaid: 39519, avgDaysToCheckout: 23.3, medianDaysToCheckout: 11 },
  { month: '2026-02', type: 'screening', checkouts: 8, amtPaid: 13366, totalAmtPaid: 17764, avgDaysToCheckout: 61.1, medianDaysToCheckout: 42 },
  { month: '2026-03', type: 'screening', checkouts: 13, amtPaid: 20278, totalAmtPaid: 25472, avgDaysToCheckout: 29.3, medianDaysToCheckout: 15 },
  { month: '2026-04', type: 'screening', checkouts: 13, amtPaid: 19698, totalAmtPaid: 25290, avgDaysToCheckout: 29.9, medianDaysToCheckout: 29 },
  { month: '2026-05', type: 'screening', checkouts: 6, amtPaid: 9325, totalAmtPaid: 11320, avgDaysToCheckout: 28.5, medianDaysToCheckout: 28 },
  { month: '2026-06', type: 'screening', checkouts: 11, amtPaid: 19652, totalAmtPaid: 24244, avgDaysToCheckout: 41.0, medianDaysToCheckout: 19 },
  { month: '2026-07', type: 'screening', checkouts: 19, amtPaid: 26193, totalAmtPaid: 33586, avgDaysToCheckout: 18.4, medianDaysToCheckout: 10 },
  { month: '2026-08', type: 'screening', checkouts: 23, amtPaid: 40811, totalAmtPaid: 49398, avgDaysToCheckout: 18.9, medianDaysToCheckout: 10 },
  { month: '2026-09', type: 'screening', checkouts: 3, amtPaid: 4380, totalAmtPaid: 5579, avgDaysToCheckout: 11.3, medianDaysToCheckout: 14 },
  { month: '2026-10', type: 'screening', checkouts: 5, amtPaid: 9632, totalAmtPaid: 10428, avgDaysToCheckout: 16.4, medianDaysToCheckout: 16 },
];

// ════════════════════════════════════════════════════════════════════════
//  GHL FAMILY POOL (total referred families by month, from daily scrape)
//  This is the DENOMINATOR for enrollment rates.
//  Placeholder — populated by GHL scrape scheduled task.
// ════════════════════════════════════════════════════════════════════════

export type FamilyPoolRow = {
  month: string;        // YYYY-MM
  type: 'hybrid' | 'screening';
  referred: number;     // total families referred this month
  bookedCall: number;   // families who booked a patient educator call
  bookedWithin3d: number;
  bookedWithin7d: number;
};

// From the other thread's artifact (peds-drip-dashboard-task-rules.md notes):
// Old flow (Jan 5 – Nov 1): hybrid 858 families, screening 1,340 families.
// New drip (Nov 2+): 58 hybrid, 30 screening.
// Enrolled within 30d: hybrid 10% (85/858), screening 7% (95/1340).
export const familyPool: FamilyPoolRow[] = [
  // Populated from the other thread's dataset. GHL scrape will refresh these.
  // Hybrid — monthly breakdown from GHL contact counts
  { month: '2026-01', type: 'hybrid', referred: 204, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-02', type: 'hybrid', referred: 75, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-03', type: 'hybrid', referred: 95, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-04', type: 'hybrid', referred: 83, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-05', type: 'hybrid', referred: 57, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-06', type: 'hybrid', referred: 79, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-07', type: 'hybrid', referred: 84, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-08', type: 'hybrid', referred: 83, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-09', type: 'hybrid', referred: 50, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-10', type: 'hybrid', referred: 48, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-11', type: 'hybrid', referred: 58, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  // Screening
  { month: '2026-01', type: 'screening', referred: 150, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-02', type: 'screening', referred: 107, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-03', type: 'screening', referred: 139, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-04', type: 'screening', referred: 123, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-05', type: 'screening', referred: 127, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-06', type: 'screening', referred: 104, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-07', type: 'screening', referred: 149, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-08', type: 'screening', referred: 183, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-09', type: 'screening', referred: 128, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-10', type: 'screening', referred: 130, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
  { month: '2026-11', type: 'screening', referred: 30, bookedCall: 0, bookedWithin3d: 0, bookedWithin7d: 0 },
];

// ════════════════════════════════════════════════════════════════════════
//  TC PERFORMANCE (patient educators handling hybrid/screening)
// ════════════════════════════════════════════════════════════════════════

export type TCRow = {
  tc: string;
  hybridCheckouts: number;
  screeningCheckouts: number;
  hybridRevenue: number;
  screeningRevenue: number;
};

export const tcPerformance: TCRow[] = [
  { tc: 'Ashley Acuna', hybridCheckouts: 91, screeningCheckouts: 34, hybridRevenue: 140536, screeningRevenue: 55518 },
  { tc: 'Desirea Peraza', hybridCheckouts: 81, screeningCheckouts: 48, hybridRevenue: 136928, screeningRevenue: 69012 },
  { tc: 'Jolee Thailing', hybridCheckouts: 37, screeningCheckouts: 28, hybridRevenue: 61993, screeningRevenue: 47339 },
  { tc: 'Sam Rice', hybridCheckouts: 11, screeningCheckouts: 9, hybridRevenue: 23551, screeningRevenue: 15607 },
  { tc: 'Irina Osuji', hybridCheckouts: 4, screeningCheckouts: 3, hybridRevenue: 8182, screeningRevenue: 5786 },
  { tc: 'Ashley Holland', hybridCheckouts: 1, screeningCheckouts: 0, hybridRevenue: 1995, screeningRevenue: 0 },
];

// ════════════════════════════════════════════════════════════════════════
//  SPEED STATS (days between stages, from Salesforce)
// ════════════════════════════════════════════════════════════════════════

export type SpeedStats = {
  type: 'hybrid' | 'screening';
  subToCheckout: { median: number; avg: number; p25: number; p75: number; n: number };
  subToPef: { median: number; avg: number; p25: number; p75: number; n: number };
};

export const speedStats: SpeedStats[] = [
  {
    type: 'hybrid',
    subToCheckout: { median: 16, avg: 24.1, p25: 8, p75: 31, n: 225 },
    subToPef: { median: 29, avg: 37.5, p25: 19, p75: 49, n: 216 },
  },
  {
    type: 'screening',
    subToCheckout: { median: 18, avg: 26.8, p25: 8, p75: 34, n: 122 },
    subToPef: { median: 35, avg: 42.0, p25: 22, p75: 51, n: 115 },
  },
];

// ════════════════════════════════════════════════════════════════════════
//  DRIP CAMPAIGN TIMELINE
// ════════════════════════════════════════════════════════════════════════

export const dripTimeline = [
  { date: '2026-11-02', event: 'New pediatric drip campaign launched' },
  { date: '2026-11-13', event: 'First Salesforce export with post-drip data (0 new-drip checkouts yet — oldest family 11 days old)' },
];

// Key findings from the other thread's analysis:
// - Sep + Oct pediatric checkouts dropped before the drip change
//   (Screening Sep+Oct: 2% within 14d vs 5% Jan-Aug; Hybrid Oct: 1% vs Aug 11%)
// - Old-flow 30d enrollment: hybrid 10% (85/858), screening 7% (95/1340)
// - First new-drip families reach 30 days on Dec 2
// - ~77% Salesforce-to-GHL email match rate for pediatric checkouts
export const keyFindings = {
  oldFlowHybrid30d: 10.0,       // % enrolled within 30 days
  oldFlowScreening30d: 7.0,
  oldFlowHybridFamilies: 858,
  oldFlowScreeningFamilies: 1340,
  newDripHybridFamilies: 58,
  newDripScreeningFamilies: 30,
  newDripFirstCheckout: null as string | null,
  emailMatchRate: 77,           // % of pediatric checkout emails matched to GHL
  sepOctDropFlag: true,         // enrollment dropped before the drip change
};
