'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bar, Line } from 'react-chartjs-2';
import { fetchSubmissions } from '@/lib/api';
import type { DailySubmission } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, annotationPlugin);

const TP = {
  blue: '#3A6EA4', skyBlue: '#B6CAE3', lightBlue: '#D6E5F7',
  cream: '#FEF8EE', green: '#8CD1C8', yellow: '#FDBE67',
  peach: '#FBCCC5', red: '#DD5759', darkPurple: '#B26CA6',
  lightPurple: '#DDBBD9', bubblegum: '#F6AACB', amber: '#EF9F27',
  text: '#333333', navy: '#1B2A4A',
};

/* ════════════════════════════════════════════
   HARDCODED GSC DATA — Source of truth
   Data pulled fresh from Google Search Console on June 26, 2026
   Property: https://www.toothpillow.com/ (URL prefix)
   Baseline period: Feb 8 2025 through May 18 2026 (all pre-SEO data)
   SEO program reset date: May 19, 2026
   May 2026: full month (31 days). June 2026: through Jun 24 (Jun 25-26 not yet available)
   ════════════════════════════════════════════ */

const SEO_START_DATE = '2026-05-19';
const WEBSITE_LAUNCH_DATE = '2025-12-22';

// Total submissions (online + hybrid + prime) aligned to GSC_MONTHLY months
// 2025: hardcoded historical. 2026: pulled from daily tracker at runtime.
const SUBMISSIONS_2025: Record<string, number> = {
  '2025-02': 1561, '2025-03': 1512, '2025-04': 1665, '2025-05': 1359,
  '2025-06': 1098, '2025-07': 2689, '2025-08': 2542, '2025-09': 1600,
  '2025-10': 1508, '2025-11': 1608, '2025-12': 1253,
};

const GSC_MONTHLY = [
  { month: '2025-02', clicks: 18183, impressions: 541298, ctr: 3.4, position: 72.5 },
  { month: '2025-03', clicks: 19017, impressions: 867156, ctr: 2.2, position: 72.5 },
  { month: '2025-04', clicks: 13318, impressions: 652511, ctr: 2.0, position: 72.0 },
  { month: '2025-05', clicks: 13745, impressions: 371309, ctr: 3.7, position: 67.9 },
  { month: '2025-06', clicks: 14288, impressions: 231187, ctr: 6.2, position: 63.4 },
  { month: '2025-07', clicks: 23188, impressions: 492401, ctr: 4.7, position: 69.5 },
  { month: '2025-08', clicks: 18593, impressions: 716570, ctr: 2.6, position: 69.6 },
  { month: '2025-09', clicks: 14121, impressions: 173269, ctr: 8.1, position: 50.9 },
  { month: '2025-10', clicks: 13571, impressions: 144474, ctr: 9.4, position: 36.6 },
  { month: '2025-11', clicks: 14362, impressions: 174206, ctr: 8.2, position: 40.0 },
  { month: '2025-12', clicks: 11248, impressions: 188408, ctr: 6.0, position: 48.0 },
  { month: '2026-01', clicks: 11810, impressions: 213760, ctr: 5.5, position: 50.7 },
  { month: '2026-02', clicks: 10579, impressions: 66544, ctr: 15.9, position: 23.1 },
  { month: '2026-03', clicks: 12601, impressions: 74269, ctr: 17.0, position: 26.9 },
  { month: '2026-04', clicks: 11180, impressions: 105758, ctr: 10.6, position: 37.4 },
  { month: '2026-05', clicks: 10509, impressions: 53592, ctr: 19.6, position: 17.8 },
  { month: '2026-06', clicks: 9680, impressions: 44700, ctr: 21.6, position: 10.5 },
];

const GSC_WEEKLY = [
  { week: '2025-02-03', clicks: 1637, impressions: 44797, ctr: 3.7, position: 72.0 },
  { week: '2025-02-10', clicks: 5956, impressions: 176125, ctr: 3.4, position: 72.2 },
  { week: '2025-02-17', clicks: 6154, impressions: 191592, ctr: 3.2, position: 73.1 },
  { week: '2025-02-24', clicks: 5461, impressions: 187546, ctr: 2.9, position: 72.7 },
  { week: '2025-03-03', clicks: 5028, impressions: 188818, ctr: 2.7, position: 72.1 },
  { week: '2025-03-10', clicks: 4782, impressions: 213712, ctr: 2.2, position: 72.5 },
  { week: '2025-03-17', clicks: 3704, impressions: 206114, ctr: 1.8, position: 72.5 },
  { week: '2025-03-24', clicks: 3868, impressions: 180794, ctr: 2.1, position: 72.2 },
  { week: '2025-03-31', clicks: 3855, impressions: 218626, ctr: 1.8, position: 73.1 },
  { week: '2025-04-07', clicks: 3170, impressions: 178541, ctr: 1.8, position: 65.1 },
  { week: '2025-04-14', clicks: 2861, impressions: 51100, ctr: 5.6, position: 30.3 },
  { week: '2025-04-21', clicks: 2901, impressions: 142691, ctr: 2.0, position: 60.3 },
  { week: '2025-04-28', clicks: 2689, impressions: 180654, ctr: 1.5, position: 71.9 },
  { week: '2025-05-05', clicks: 2344, impressions: 64556, ctr: 3.6, position: 40.1 },
  { week: '2025-05-12', clicks: 3703, impressions: 50779, ctr: 7.3, position: 35.2 },
  { week: '2025-05-19', clicks: 3324, impressions: 101685, ctr: 3.3, position: 61.8 },
  { week: '2025-05-26', clicks: 3144, impressions: 55571, ctr: 5.7, position: 44.6 },
  { week: '2025-06-02', clicks: 3856, impressions: 131190, ctr: 2.9, position: 61.7 },
  { week: '2025-06-09', clicks: 2168, impressions: 32324, ctr: 6.7, position: 28.5 },
  { week: '2025-06-16', clicks: 2015, impressions: 9845, ctr: 20.5, position: 14.0 },
  { week: '2025-06-23', clicks: 5117, impressions: 52749, ctr: 9.7, position: 31.7 },
  { week: '2025-06-30', clicks: 4679, impressions: 119564, ctr: 3.9, position: 66.3 },
  { week: '2025-07-07', clicks: 3284, impressions: 37330, ctr: 8.8, position: 32.7 },
  { week: '2025-07-14', clicks: 2975, impressions: 90646, ctr: 3.3, position: 54.2 },
  { week: '2025-07-21', clicks: 7894, impressions: 151188, ctr: 5.2, position: 69.3 },
  { week: '2025-07-28', clicks: 6863, impressions: 151499, ctr: 4.5, position: 69.7 },
  { week: '2025-08-04', clicks: 5431, impressions: 206323, ctr: 2.6, position: 68.2 },
  { week: '2025-08-11', clicks: 4509, impressions: 217233, ctr: 2.1, position: 68.9 },
  { week: '2025-08-18', clicks: 3543, impressions: 107479, ctr: 3.3, position: 61.2 },
  { week: '2025-08-25', clicks: 3417, impressions: 131361, ctr: 2.6, position: 70.1 },
  { week: '2025-09-01', clicks: 2933, impressions: 43730, ctr: 6.7, position: 37.5 },
  { week: '2025-09-08', clicks: 4671, impressions: 64021, ctr: 7.3, position: 37.6 },
  { week: '2025-09-15', clicks: 2587, impressions: 19747, ctr: 13.1, position: 25.9 },
  { week: '2025-09-22', clicks: 3024, impressions: 38136, ctr: 7.9, position: 39.8 },
  { week: '2025-09-29', clicks: 2827, impressions: 34721, ctr: 8.1, position: 33.0 },
  { week: '2025-10-06', clicks: 2403, impressions: 44166, ctr: 5.4, position: 34.2 },
  { week: '2025-10-13', clicks: 2974, impressions: 17984, ctr: 16.5, position: 14.9 },
  { week: '2025-10-20', clicks: 3864, impressions: 22858, ctr: 16.9, position: 15.3 },
  { week: '2025-10-27', clicks: 3087, impressions: 36143, ctr: 8.5, position: 31.7 },
  { week: '2025-11-03', clicks: 4172, impressions: 48054, ctr: 8.7, position: 32.0 },
  { week: '2025-11-10', clicks: 3364, impressions: 36247, ctr: 9.3, position: 26.8 },
  { week: '2025-11-17', clicks: 3484, impressions: 74179, ctr: 4.7, position: 48.0 },
  { week: '2025-11-24', clicks: 2664, impressions: 11963, ctr: 22.3, position: 8.6 },
  { week: '2025-12-01', clicks: 3055, impressions: 30783, ctr: 9.9, position: 23.3 },
  { week: '2025-12-08', clicks: 2653, impressions: 78257, ctr: 3.4, position: 47.7 },
  { week: '2025-12-15', clicks: 2791, impressions: 28415, ctr: 9.8, position: 24.5 },
  { week: '2025-12-22', clicks: 1685, impressions: 45826, ctr: 3.7, position: 40.2 },
  { week: '2025-12-29', clicks: 2097, impressions: 11897, ctr: 17.6, position: 17.7 },
  { week: '2026-01-05', clicks: 2631, impressions: 48663, ctr: 5.4, position: 39.6 },
  { week: '2026-01-12', clicks: 2865, impressions: 68544, ctr: 4.2, position: 50.3 },
  { week: '2026-01-19', clicks: 2584, impressions: 50283, ctr: 5.1, position: 39.8 },
  { week: '2026-01-26', clicks: 2945, impressions: 40899, ctr: 7.2, position: 32.2 },
  { week: '2026-02-02', clicks: 2615, impressions: 30948, ctr: 8.4, position: 28.9 },
  { week: '2026-02-09', clicks: 2129, impressions: 10691, ctr: 19.9, position: 6.9 },
  { week: '2026-02-16', clicks: 2661, impressions: 12146, ctr: 21.9, position: 6.0 },
  { week: '2026-02-23', clicks: 3148, impressions: 12305, ctr: 25.6, position: 5.4 },
  { week: '2026-03-02', clicks: 2487, impressions: 10128, ctr: 24.6, position: 6.1 },
  { week: '2026-03-09', clicks: 3063, impressions: 10171, ctr: 30.1, position: 5.3 },
  { week: '2026-03-16', clicks: 2701, impressions: 22119, ctr: 12.2, position: 31.4 },
  { week: '2026-03-23', clicks: 3102, impressions: 23036, ctr: 13.5, position: 28.1 },
  { week: '2026-03-30', clicks: 2431, impressions: 24948, ctr: 9.7, position: 38.6 },
  { week: '2026-04-06', clicks: 3007, impressions: 25909, ctr: 11.6, position: 32.7 },
  { week: '2026-04-13', clicks: 2537, impressions: 21018, ctr: 12.1, position: 25.7 },
  { week: '2026-04-20', clicks: 2142, impressions: 20811, ctr: 10.3, position: 30.8 },
  { week: '2026-04-27', clicks: 2848, impressions: 24374, ctr: 11.7, position: 25.3 },
  { week: '2026-05-04', clicks: 1951, impressions: 16762, ctr: 11.6, position: 23.0 },
  { week: '2026-05-11', clicks: 2082, impressions: 10234, ctr: 20.3, position: 11.3 },
  { week: '2026-05-18', clicks: 2564, impressions: 10691, ctr: 24.0, position: 10.4 },
  { week: '2026-05-25', clicks: 3153, impressions: 12473, ctr: 25.3, position: 14.2 },
  { week: '2026-06-01', clicks: 3533, impressions: 13754, ctr: 25.7, position: 9.5 },
  { week: '2026-06-08', clicks: 2789, impressions: 12777, ctr: 21.8, position: 9.3 },
  { week: '2026-06-15', clicks: 2182, impressions: 12279, ctr: 17.8, position: 13.0 },
  { week: '2026-06-22', clicks: 1173, impressions: 5918, ctr: 19.8, position: 10.8 },
];

// Full-year daily GSC data — Jan 1 to Jun 24, 2026
// Source: Google Search Console DAYS view, updated June 26, 2026
// Format: [day, clicks, impressions]
const GSC_DAILY_2026: Record<string, [number, number, number][]> = {
  Jan: [
    [1,254,1532],[2,276,2115],[3,245,1477],[4,258,1646],[5,382,2299],[6,472,2277],[7,459,2482],
    [8,439,8333],[9,391,13023],[10,242,11158],[11,246,9091],[12,400,10680],[13,451,12374],[14,466,2493],
    [15,624,9788],[16,389,12479],[17,249,10079],[18,286,10651],[19,391,11432],[20,532,12448],[21,550,13664],
    [22,361,7174],[23,302,2087],[24,213,1718],[25,235,1760],[26,328,3489],[27,394,10677],[28,788,13860],
    [29,513,8228],[30,406,1936],[31,268,1310],
  ],
  Feb: [
    [1,248,1399],[2,400,1633],[3,387,5794],[4,414,9045],[5,543,8944],[6,393,3057],[7,269,1252],
    [8,209,1223],[9,375,1811],[10,381,1679],[11,357,1478],[12,347,1632],[13,264,1692],[14,218,1248],
    [15,187,1151],[16,403,1711],[17,524,1906],[18,499,2113],[19,422,1907],[20,351,1938],[21,234,1190],
    [22,228,1381],[23,551,2136],[24,571,2030],[25,555,2089],[26,547,2050],[27,404,1881],[28,298,1174],
  ],
  Mar: [
    [1,222,945],[2,412,1665],[3,488,1829],[4,451,1668],[5,364,1371],[6,349,1483],[7,238,998],
    [8,185,1114],[9,528,1704],[10,579,1827],[11,460,1439],[12,467,1486],[13,431,1571],[14,285,1009],
    [15,313,1135],[16,508,1481],[17,491,1702],[18,479,3412],[19,405,5134],[20,366,4292],[21,244,2395],
    [22,208,3703],[23,383,1335],[24,403,1396],[25,494,3372],[26,505,5154],[27,676,4298],[28,340,3524],
    [29,301,3957],[30,545,3506],[31,481,4364],
  ],
  Apr: [
    [1,453,5600],[2,346,3610],[3,252,3468],[4,180,2681],[5,174,1719],[6,304,4381],[7,360,1388],
    [8,376,3655],[9,427,2065],[10,305,3816],[11,828,5014],[12,407,5590],[13,294,2728],[14,383,1415],
    [15,377,1416],[16,342,1265],[17,545,5042],[18,300,4172],[19,296,4980],[20,427,5550],[21,382,2953],
    [22,341,1284],[23,332,1129],[24,311,3957],[25,158,2174],[26,191,3764],[27,340,3772],[28,721,6704],
    [29,619,7218],[30,409,3248],
  ],
  May: [
    [1,339,1522],[2,218,1003],[3,202,907],[4,299,2293],[5,317,3915],[6,343,5614],[7,322,1831],
    [8,305,1259],[9,186,877],[10,179,973],[11,337,1412],[12,389,1397],[13,342,1367],[14,373,3003],
    [15,262,1250],[16,176,900],[17,203,905],[18,311,1339],[19,337,1358],[20,330,1551],[21,387,1881],
    [22,487,1600],[23,464,1559],[24,248,1403],[25,230,1124],[26,338,1553],[27,339,1581],
    [28,466,1967],[29,845,2473],[30,508,1859],[31,427,1916],
  ],
  Jun: [
    [1,697,2554],[2,571,1925],[3,517,1967],[4,514,2582],[5,440,1551],[6,402,1636],[7,392,1539],
    [8,449,1957],[9,497,2477],[10,547,2391],[11,482,1849],[12,343,1431],[13,231,1239],
    [14,240,1433],[15,366,1988],[16,380,1846],[17,391,2264],[18,337,1670],
    [19,309,1471],[20,202,1391],[21,197,1649],[22,319,1765],[23,384,1737],[24,470,2416],
  ],
};

// Derive May-only record for backward compat
const GSC_DAILY_MAY_2026: Record<number, { clicks: number; impressions: number }> = {};
for (const [d, c, i] of GSC_DAILY_2026.May) { GSC_DAILY_MAY_2026[d] = { clicks: c, impressions: i }; }

/* ════════════════════════════════════════════
   KEYWORD MOVERS — Non-branded keywords showing movement
   GSC comparison: May 12–Jun 11, 2026 vs Mar 12–May 11, 2026
   Monthly position history verified per-keyword from GSC DAYS breakdown.
   Excludes all branded variations (toothpillow, tooth pillow, etc.)
   Updated June 15, 2026
   ════════════════════════════════════════════ */

// Position climbers with monthly position history from GSC
// posHistory: monthly average position (from GSC DAYS breakdown, verified Jun 15 2026)
// startedClimbing: first month position improved meaningfully and sustained
const KEYWORD_CLIMBERS = [
  { query: 'mouth breathing', posNow: 40.0, posPrev: 61.0, change: -21.0, imprNow: 18,
    startedClimbing: 'Dec 2025', posHistory: [89,92,82,82,92,93,89,89,84,86,74,79,57,75,61,40,38] },
  { query: 'tongue tie near me', posNow: 38.0, posPrev: 56.0, change: -18.0, imprNow: 25,
    startedClimbing: 'May 2026', posHistory: [null,null,null,68,null,90,null,null,80,78,84,null,null,null,50,41,36] },
  { query: 'tongue tie removal near me', posNow: 36.0, posPrev: 49.0, change: -13.0, imprNow: 90,
    startedClimbing: 'Jan 2026', posHistory: [93,null,null,null,null,null,null,null,68,82,83,63,61,52,47,42,35] },
  { query: 'myofunctional therapist near me', posNow: 38.0, posPrev: 55.0, change: -17.0, imprNow: 12,
    startedClimbing: 'Feb 2026', posHistory: [70,70,67,91,98,82,76,70,60,72,95,76,46,63,39,43,37] },
  { query: 'airway dentists', posNow: 18.0, posPrev: 52.0, change: -34.0, imprNow: 8,
    startedClimbing: 'Oct 2025', posHistory: [82,62,57,56,54,57,63,null,38,37,56,68,null,73,52,16,15] },
  { query: 'orthodontic evaluation near me', posNow: 42.0, posPrev: 57.0, change: -15.0, imprNow: 98,
    startedClimbing: 'Mar 2026', posHistory: [44,48,52,82,84,73,71,88,84,90,87,85,69,62,55,44,40] },
  { query: 'child sleep apnea solution near me', posNow: 20.0, posPrev: 55.0, change: -35.0, imprNow: 11,
    startedClimbing: 'May 2026', posHistory: null },
  { query: 'orthodontist for children', posNow: 40.0, posPrev: 52.0, change: -12.0, imprNow: 38,
    startedClimbing: 'May 2026', posHistory: null },
  { query: "children's orthodontic braces", posNow: 52.0, posPrev: 72.0, change: -20.0, imprNow: 28,
    startedClimbing: 'May 2026', posHistory: null },
  { query: 'sleep dentistry near me', posNow: 48.0, posPrev: 64.0, change: -16.0, imprNow: 40,
    startedClimbing: 'May 2026', posHistory: null },
  { query: "kid's dentist near me", posNow: 52.0, posPrev: 68.0, change: -16.0, imprNow: 120,
    startedClimbing: 'May 2026', posHistory: null },
  { query: 'kids dental', posNow: 50.0, posPrev: 64.0, change: -14.0, imprNow: 102,
    startedClimbing: 'May 2026', posHistory: null },
  { query: 'oral appliance therapy', posNow: 60.0, posPrev: 72.0, change: -12.0, imprNow: 130,
    startedClimbing: 'May 2026', posHistory: null },
  { query: 'lip tie dentist near me', posNow: 48.0, posPrev: 60.0, change: -12.0, imprNow: 26,
    startedClimbing: 'May 2026', posHistory: null },
];
// posHistory is 17 values: Feb'25..Jun'26 monthly avg position, null = no data that month

// Non-branded keywords already driving clicks (sorted by best position)
// Source: GSC 16-month aggregate, pulled June 12, 2026
const CLICK_DRIVING_KEYWORDS = [
  { query: 'pediatric airway dentist near me', posNow: 0.5, clicksNow: 9, imprNow: 1580, status: 'Near page 1' },
  { query: 'airway dentist near me', posNow: 0.7, clicksNow: 18, imprNow: 2420, status: 'Near page 1' },
  { query: 'sleep apnea pillow for child', posNow: 1.0, clicksNow: 7, imprNow: 600, status: 'Page 1' },
  { query: 'airway dentistry kids', posNow: 1.1, clicksNow: 10, imprNow: 850, status: 'Page 1' },
  { query: 'dental pillow', posNow: 1.6, clicksNow: 20, imprNow: 1220, status: 'Page 1' },
  { query: 'tooth cushion', posNow: 1.8, clicksNow: 11, imprNow: 570, status: 'Page 1' },
  { query: 'airway dentist for kids', posNow: 2.0, clicksNow: 7, imprNow: 320, status: 'Page 1' },
  { query: 'orthodontic pillow', posNow: 2.1, clicksNow: 14, imprNow: 640, status: 'Page 1' },
  { query: 'pillow for mouth breathers', posNow: 8.4, clicksNow: 362, imprNow: 5280, status: 'Page 1 since Feb 2025' },
];
// Source: GSC 16-month aggregate, pulled June 12, 2026
const TOP_QUERIES = [
  { query: 'tooth pillow', clicks: 80046, impressions: 127909, ctr: 62.6, position: 1.1, branded: true },
  { query: 'toothpillow', clicks: 54558, impressions: 82453, ctr: 66.2, position: 1.6, branded: true },
  { query: 'tooth pillow for kids', clicks: 9521, impressions: 15464, ctr: 61.6, position: 1.0, branded: true },
  { query: 'toothpillow for kids', clicks: 5367, impressions: 7492, ctr: 71.6, position: 1.0, branded: true },
  { query: 'tooth pillow device', clicks: 4568, impressions: 8456, ctr: 54.0, position: 2.7, branded: true },
  { query: 'tooth pillow for adults', clicks: 3525, impressions: 8336, ctr: 42.3, position: 5.0, branded: true },
  { query: 'mouth pillow', clicks: 2447, impressions: 8466, ctr: 28.9, position: 1.2, branded: false },
  { query: 'toothpillow for adults', clicks: 1884, impressions: 5005, ctr: 37.6, position: 3.8, branded: true },
  { query: 'the tooth pillow', clicks: 1710, impressions: 2277, ctr: 75.1, position: 1.0, branded: true },
  { query: 'my tooth pillow', clicks: 1553, impressions: 2008, ctr: 77.3, position: 1.0, branded: true },
  { query: 'tooth pillow appliance', clicks: 1165, impressions: 3287, ctr: 35.4, position: 10.5, branded: true },
  { query: 'teeth pillow', clicks: 974, impressions: 2364, ctr: 41.2, position: 2.1, branded: false },
  { query: 'tooth pillow canada', clicks: 964, impressions: 1644, ctr: 58.6, position: 1.0, branded: true },
  { query: 'what is a tooth pillow', clicks: 831, impressions: 2787, ctr: 29.8, position: 1.5, branded: true },
  { query: 'toothpillow reviews', clicks: 798, impressions: 7277, ctr: 11.0, position: 3.8, branded: true },
  { query: 'toothpillow cost', clicks: 723, impressions: 2481, ctr: 29.1, position: 3.1, branded: true },
  { query: 'tongue pillow', clicks: 697, impressions: 1682, ctr: 41.4, position: 2.3, branded: false },
  { query: 'mouth pillow kids', clicks: 622, impressions: 1087, ctr: 57.2, position: 1.0, branded: false },
  { query: 'pillow for mouth breathers', clicks: 362, impressions: 5280, ctr: 6.9, position: 8.4, branded: false },
  { query: 'airway dentist near me', clicks: 18, impressions: 2420, ctr: 0.7, position: 0.7, branded: false },
];


/* ════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════ */

// GSC_DAILY_MAY_2026 kept for backward compat but not rendered
void GSC_DAILY_MAY_2026;

function weekLabel(w: string): string {
  const d = new Date(w + 'T12:00:00');
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${names[d.getMonth()]} ${d.getDate()}`;
}

function weekToIndex(_weekStr: string, target: string): number {
  return GSC_WEEKLY.findIndex(w => w.week >= target);
}

function fmtK(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function monthLabel(m: string): string {
  const [y, mo] = m.split('-');
  const names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[parseInt(mo)]} '${y.slice(2)}`;
}

function delta(current: number, previous: number): string {
  const pct = ((current - previous) / previous * 100);
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(0)}%`;
}

/* ════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════ */

type ViewMode = 'monthly' | 'weekly' | 'daily';

export default function OrganicGrowth() {
  const [subs2026, setSubs2026] = useState<Record<string, number>>({});
  const [clicksView, setClicksView] = useState<ViewMode>('weekly');

  useEffect(() => {
    fetchSubmissions(2026).then((entries: DailySubmission[]) => {
      const byMonth: Record<string, number> = {};
      for (const e of entries) {
        const m = new Date(e.date + 'T12:00:00').getMonth() + 1;
        const key = `2026-${String(m).padStart(2, '0')}`;
        byMonth[key] = (byMonth[key] || 0) + (e.online || 0) + (e.hybrid || 0) + (e.prime || 0);
      }
      setSubs2026(byMonth);
    }).catch(() => {});
  }, []);

  // Merge 2025 hardcoded + 2026 from daily tracker
  const SUBMISSIONS_BY_MONTH: Record<string, number> = { ...SUBMISSIONS_2025, ...subs2026 };

  const mayData = GSC_MONTHLY[GSC_MONTHLY.length - 1];
  const latestDaysReported = 24; // June 1-24
  const mayClickPace = Math.round(mayData.clicks / latestDaysReported * 30);
  const mayImprPace = Math.round(mayData.impressions / latestDaysReported * 30);

  const may2025 = GSC_MONTHLY.find(m => m.month === '2025-05')!;


  // Annotation indices for chart markers
  const seoMonthIndex = GSC_MONTHLY.findIndex(m => m.month >= SEO_START_DATE.substring(0, 7));
  const websiteMonthIndex = GSC_MONTHLY.findIndex(m => m.month >= WEBSITE_LAUNCH_DATE.substring(0, 7));
  const coreUpdateIndex = GSC_MONTHLY.findIndex(m => m.month === '2025-09');

  // Branded vs non-branded totals
  const brandedClicks = TOP_QUERIES.filter(q => q.branded).reduce((s, q) => s + q.clicks, 0);
  const nonBrandedClicks = TOP_QUERIES.filter(q => !q.branded).reduce((s, q) => s + q.clicks, 0);
  const totalTopClicks = brandedClicks + nonBrandedClicks;

  // Annotation configs reused across all charts
  // Position lines proportionally within the month (Dec 22 = 71% through, May 19 = 61% through)
  const websiteAnnotation = websiteMonthIndex >= 0 ? {
    websiteLine: {
      type: 'line' as const,
      xMin: websiteMonthIndex + 0.21,
      xMax: websiteMonthIndex + 0.21,
      borderColor: `${TP.blue}B0`,
      borderWidth: 2.5,
      borderDash: [6, 3],
      label: {
        display: true,
        content: 'New Site',
        position: 'end' as const,
        backgroundColor: TP.blue,
        color: '#fff',
        font: { size: 9, weight: 'bold' as const },
        padding: { top: 2, bottom: 2, left: 5, right: 5 },
        borderRadius: 3,
      },
    },
  } : {};

  const seoAnnotation = seoMonthIndex >= 0 ? {
    seoLine: {
      type: 'line' as const,
      xMin: seoMonthIndex + 0.11,
      xMax: seoMonthIndex + 0.11,
      borderColor: `${TP.green}B0`,
      borderWidth: 2.5,
      borderDash: [6, 3],
      label: {
        display: true,
        content: 'SEO',
        position: 'end' as const,
        backgroundColor: TP.green,
        color: '#fff',
        font: { size: 9, weight: 'bold' as const },
        padding: { top: 2, bottom: 2, left: 5, right: 5 },
        borderRadius: 3,
      },
    },
  } : {};

  const coreUpdateAnnotation = coreUpdateIndex >= 0 ? {
    coreUpdateLine: {
      type: 'line' as const,
      xMin: coreUpdateIndex - 0.5,
      xMax: coreUpdateIndex - 0.5,
      borderColor: `${TP.amber}B0`,
      borderWidth: 2.5,
      borderDash: [6, 3],
      label: {
        display: true,
        content: 'Core Update',
        position: 'end' as const,
        backgroundColor: TP.amber,
        color: '#fff',
        font: { size: 9, weight: 'bold' as const },
        padding: { top: 2, bottom: 2, left: 5, right: 5 },
        borderRadius: 3,
      },
    },
  } : {};

  // ── Chart: Monthly Organic Clicks with 3-month MA ──
  const monthlyClicksData = useMemo(() => {
    const clickValues = GSC_MONTHLY.map(m => m.clicks);
    const ma3: (number | null)[] = clickValues.map((_, i) => {
      if (i < 2) return null;
      return Math.round((clickValues[i] + clickValues[i - 1] + clickValues[i - 2]) / 3);
    });
    return {
      labels: GSC_MONTHLY.map(m => monthLabel(m.month)),
      datasets: [
        { label: 'Organic Clicks', data: clickValues, backgroundColor: TP.blue, borderRadius: 4, borderSkipped: false as const, order: 2 },
        { label: '3-Month Moving Avg', data: ma3, type: 'line' as const, borderColor: TP.red, backgroundColor: 'transparent', pointRadius: 0, borderWidth: 2.5, tension: 0.35, spanGaps: true, order: 1 },
      ],
    };
  }, []);

  const clicksChartOpts = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8, padding: 16, font: { size: 11 } } },
      tooltip: { callbacks: { label: (ctx: { datasetIndex: number; parsed: { y: number } }) => ctx.datasetIndex === 0 ? `${ctx.parsed.y.toLocaleString()} clicks` : `${ctx.parsed.y.toLocaleString()} avg` } },
      annotation: { annotations: { ...websiteAnnotation, ...seoAnnotation, ...coreUpdateAnnotation } },
    },
    scales: { y: { beginAtZero: true, ticks: { callback: (v: number | string) => fmtK(Number(v)) }, grid: { color: '#f0f0f0' } }, x: { grid: { display: false } } },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [seoMonthIndex]);

  // ── Chart: Weekly Organic Clicks with 4-week MA ──
  const weeklyClicksData = useMemo(() => {
    const clickValues = GSC_WEEKLY.map(w => w.clicks);
    const ma4: (number | null)[] = clickValues.map((_, i) => {
      if (i < 3) return null;
      return Math.round((clickValues[i] + clickValues[i - 1] + clickValues[i - 2] + clickValues[i - 3]) / 4);
    });
    return {
      labels: GSC_WEEKLY.map(w => weekLabel(w.week)),
      datasets: [
        { label: 'Weekly Clicks', data: clickValues, borderColor: TP.blue, backgroundColor: `${TP.blue}18`, pointRadius: 2.5, pointBackgroundColor: TP.blue, borderWidth: 2, tension: 0.3, fill: true, order: 2 },
        { label: '4-Week Moving Avg', data: ma4, borderColor: TP.red, backgroundColor: 'transparent', pointRadius: 0, borderWidth: 2.5, tension: 0.35, spanGaps: true, order: 1 },
      ],
    };
  }, []);

  const seoWeekIndex = weekToIndex(GSC_WEEKLY[0]?.week || '', SEO_START_DATE);
  const websiteWeekIndex = weekToIndex(GSC_WEEKLY[0]?.week || '', WEBSITE_LAUNCH_DATE);
  const coreUpdateWeekIndex = GSC_WEEKLY.findIndex(w => w.week >= '2025-09-01');

  const weeklyClicksOpts = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8, padding: 16, font: { size: 11 } } },
      tooltip: { callbacks: { label: (ctx: { datasetIndex: number; parsed: { y: number } }) => ctx.datasetIndex === 0 ? `${ctx.parsed.y.toLocaleString()} clicks` : `${ctx.parsed.y.toLocaleString()} avg` } },
      annotation: {
        annotations: {
          ...(websiteWeekIndex >= 0 ? { websiteLine: { type: 'line' as const, xMin: websiteWeekIndex, xMax: websiteWeekIndex, borderColor: `${TP.blue}B0`, borderWidth: 2, borderDash: [6, 3], label: { display: true, content: 'New Site (Dec 22)', position: 'end' as const, backgroundColor: TP.blue, color: '#fff', font: { size: 9, weight: 'bold' as const }, padding: { top: 2, bottom: 2, left: 5, right: 5 }, borderRadius: 3 } } } : {}),
          ...(coreUpdateWeekIndex >= 0 ? { coreUpdateLine: { type: 'line' as const, xMin: coreUpdateWeekIndex, xMax: coreUpdateWeekIndex, borderColor: `${TP.amber}B0`, borderWidth: 2, borderDash: [6, 3], label: { display: true, content: 'Core Update (Sep)', position: 'end' as const, backgroundColor: TP.amber, color: '#fff', font: { size: 9, weight: 'bold' as const }, padding: { top: 2, bottom: 2, left: 5, right: 5 }, borderRadius: 3 } } } : {}),
          ...(seoWeekIndex >= 0 ? { seoLine: { type: 'line' as const, xMin: seoWeekIndex, xMax: seoWeekIndex, borderColor: `${TP.green}B0`, borderWidth: 2, borderDash: [6, 3], label: { display: true, content: 'SEO Live (May 19)', position: 'end' as const, backgroundColor: TP.green, color: '#fff', font: { size: 9, weight: 'bold' as const }, padding: { top: 2, bottom: 2, left: 5, right: 5 }, borderRadius: 3 } } } : {}),
        },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v: number | string) => fmtK(Number(v)) }, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false }, ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 18, font: { size: 10 } } },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [seoWeekIndex]);

  // ── Chart: Daily 2026 Clicks with 7-day MA ──
  const dailyClicksData = useMemo(() => {
    const allDays: { label: string; clicks: number }[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] as const;
    const monthNums = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06' };
    for (const mo of months) {
      const days = GSC_DAILY_2026[mo];
      if (!days) continue;
      for (const [d, clicks] of days) {
        allDays.push({ label: `${mo} ${d}`, clicks });
      }
    }
    const clickValues = allDays.map(d => d.clicks);
    const ma7: (number | null)[] = clickValues.map((_, i) => {
      if (i < 6) return null;
      let sum = 0;
      for (let j = 0; j < 7; j++) sum += clickValues[i - j];
      return Math.round(sum / 7);
    });

    // Find SEO start index (May 19)
    const seoIdx = allDays.findIndex(d => d.label === 'May 19');

    return {
      labels: allDays.map(d => d.label),
      datasets: [
        { label: 'Daily Clicks', data: clickValues, borderColor: `${TP.blue}60`, backgroundColor: `${TP.blue}10`, pointRadius: 1, borderWidth: 1.2, tension: 0.2, fill: true, order: 2 },
        { label: '7-Day Moving Avg', data: ma7, borderColor: TP.red, backgroundColor: 'transparent', pointRadius: 0, borderWidth: 2.5, tension: 0.35, spanGaps: true, order: 1 },
      ],
      seoIdx,
    };
  }, []);

  const dailyClicksOpts = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8, padding: 16, font: { size: 11 } } },
      tooltip: { callbacks: { label: (ctx: { datasetIndex: number; parsed: { y: number } }) => ctx.datasetIndex === 0 ? `${ctx.parsed.y.toLocaleString()} clicks` : `${ctx.parsed.y.toLocaleString()} avg` } },
      annotation: {
        annotations: {
          ...(dailyClicksData.seoIdx >= 0 ? { seoLine: { type: 'line' as const, xMin: dailyClicksData.seoIdx, xMax: dailyClicksData.seoIdx, borderColor: `${TP.green}B0`, borderWidth: 2, borderDash: [6, 3], label: { display: true, content: 'SEO Live (May 19)', position: 'end' as const, backgroundColor: TP.green, color: '#fff', font: { size: 9, weight: 'bold' as const }, padding: { top: 2, bottom: 2, left: 5, right: 5 }, borderRadius: 3 } } } : {}),
        },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v: number | string) => fmtK(Number(v)) }, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false }, ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 20, font: { size: 10 } } },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [dailyClicksData.seoIdx]);

  // ── Chart: Monthly Impressions + Submissions overlay ──
  const impressionsData = useMemo(() => ({
    labels: GSC_MONTHLY.map(m => monthLabel(m.month)),
    datasets: [
      { label: 'Impressions', data: GSC_MONTHLY.map(m => m.impressions), backgroundColor: `${TP.darkPurple}70`, borderRadius: 4, borderSkipped: false as const, order: 2, yAxisID: 'y' },
      { label: 'Submissions', data: GSC_MONTHLY.map(m => SUBMISSIONS_BY_MONTH[m.month] || null), type: 'line' as const,
        borderColor: TP.green, backgroundColor: TP.green, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: TP.green, tension: 0.3, order: 1, yAxisID: 'y1' },
      { label: 'Clicks', data: GSC_MONTHLY.map(m => m.clicks), type: 'line' as const,
        borderColor: TP.blue, backgroundColor: TP.blue, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: TP.blue,
        tension: 0.3, order: 1, yAxisID: 'y1' },
    ],
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [subs2026]);

  const impressionsOpts = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8, padding: 16, font: { size: 11 } } },
      tooltip: { callbacks: { label: (ctx: { datasetIndex: number; parsed: { y: number } }) => ctx.datasetIndex === 0 ? `${ctx.parsed.y.toLocaleString()} impressions` : ctx.datasetIndex === 1 ? `${ctx.parsed.y.toLocaleString()} submissions` : `${ctx.parsed.y.toLocaleString()} clicks` } },
      annotation: { annotations: { ...websiteAnnotation, ...seoAnnotation, ...coreUpdateAnnotation } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v: number | string) => fmtK(Number(v)) }, grid: { color: '#f0f0f0' }, title: { display: true, text: 'Impressions', font: { size: 11 }, color: TP.darkPurple } },
      y1: { position: 'right' as const, beginAtZero: true, grid: { display: false }, ticks: { callback: (v: number | string) => fmtK(Number(v)) }, title: { display: true, text: 'Submissions / Clicks', font: { size: 11 }, color: TP.green } },
      x: { grid: { display: false } },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [seoMonthIndex]);

  // ── Chart: Search Position Trend (reversed Y) ──
  const positionData = useMemo(() => ({
    labels: GSC_MONTHLY.map(m => monthLabel(m.month)),
    datasets: [{
      label: 'Avg Position', data: GSC_MONTHLY.map(m => m.position),
      borderColor: TP.darkPurple, backgroundColor: `${TP.darkPurple}18`,
      pointRadius: 4, pointBackgroundColor: TP.darkPurple, borderWidth: 2.5, tension: 0.3, fill: true,
    }],
  }), []);

  const positionOpts = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: { parsed: { y: number } }) => `Position: ${ctx.parsed.y.toFixed(1)}` } },
      annotation: {
        annotations: {
          page1: { type: 'line' as const, yMin: 10, yMax: 10, borderColor: `${TP.green}80`, borderWidth: 1.5, borderDash: [6, 4],
            label: { display: true, content: 'Page 1', position: 'start' as const, backgroundColor: 'transparent', color: TP.green, font: { size: 10, weight: 'bold' as const }, padding: 2 } },
          page2: { type: 'line' as const, yMin: 20, yMax: 20, borderColor: `${TP.yellow}80`, borderWidth: 1.5, borderDash: [6, 4],
            label: { display: true, content: 'Page 2', position: 'start' as const, backgroundColor: 'transparent', color: TP.yellow, font: { size: 10, weight: 'bold' as const }, padding: 2 } },
          ...websiteAnnotation,
          ...seoAnnotation,
          ...coreUpdateAnnotation,
        },
      },
    },
    scales: {
      y: { reverse: true, min: 0, max: 80, grid: { color: '#f0f0f0' },
        ticks: { callback: (v: number | string) => { const n = Number(v); return n === 10 ? 'Pg 1' : n === 20 ? 'Pg 2' : n === 30 ? 'Pg 3' : n === 50 ? 'Pg 5' : n === 70 ? 'Pg 7' : ''; } } },
      x: { grid: { display: false } },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [seoMonthIndex]);

  const cardStyle = { background: '#fff', borderRadius: 10, padding: '16px 20px', border: '1px solid #e5e7eb', flex: '1 1 0', minWidth: 150 } as const;
  const labelStyle = { fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 6 } as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: TP.navy, marginBottom: 4 }}>Organic Search Growth</h2>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Google Search Console, Feb 2025 to present</p>
      </div>

      {/* ═══════ SECTION 1: HEADLINE STAT CARDS ═══════ */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={cardStyle}>
          <div style={labelStyle}>Organic Clicks</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: TP.navy }}>{fmtK(mayClickPace)}</div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>Jun pace ({latestDaysReported} days)</div>
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, color: mayClickPace < may2025.clicks ? TP.red : TP.green }}>
            {mayClickPace >= may2025.clicks ? '▲' : '▼'} {delta(mayClickPace, may2025.clicks)} vs May &apos;25
          </div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Impressions</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: TP.navy }}>{fmtK(mayImprPace)}</div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>Jun pace ({latestDaysReported} days)</div>
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, color: mayImprPace < may2025.impressions ? TP.red : TP.green }}>
            {mayImprPace >= may2025.impressions ? '▲' : '▼'} {delta(mayImprPace, may2025.impressions)} vs May &apos;25
          </div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Avg Position</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: TP.navy }}>{mayData.position}</div>
          <div style={{ fontSize: 11, color: TP.green, fontWeight: 600, marginTop: 2 }}>
            {mayData.position <= 10 ? 'Page 1' : mayData.position <= 20 ? 'Page 2' : `Page ${Math.ceil(mayData.position / 10)}`}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, color: mayData.position < may2025.position ? TP.green : TP.red }}>
            {mayData.position < may2025.position ? '▲' : '▼'} from {may2025.position} (Pg {Math.ceil(may2025.position / 10)}) in May &apos;25
          </div>
        </div>


      </div>

      {/* ═══════ SECTION 2: ORGANIC CLICKS (Monthly / Weekly / Daily toggle) ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, margin: 0 }}>
            Organic Clicks {clicksView === 'monthly' ? '(Monthly)' : clicksView === 'weekly' ? '(Weekly)' : '(Daily 2026)'}
          </h3>
          <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 6, padding: 3 }}>
            {(['monthly', 'weekly', 'daily'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setClicksView(v)} style={{
                padding: '4px 12px', fontSize: 11, fontWeight: 600, borderRadius: 4, border: 'none', cursor: 'pointer',
                background: clicksView === v ? TP.navy : 'transparent', color: clicksView === v ? '#fff' : '#666',
                transition: 'all 0.15s',
              }}>
                {v === 'monthly' ? 'Monthly' : v === 'weekly' ? 'Weekly' : 'Daily 2026'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
          {clicksView === 'monthly' && 'Feb 2025 to present. Bars = total clicks per month, red line = 3-month moving average.'}
          {clicksView === 'weekly' && `${GSC_WEEKLY.length} weeks from Feb 2025. Blue area = weekly clicks, red line = 4-week moving average.`}
          {clicksView === 'daily' && 'Jan 1 – Jun 24, 2026 (175 days). Gray area = daily clicks, red line = 7-day moving average.'}
        </div>
        <div style={{ height: 320 }}>
          {clicksView === 'monthly' && (
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            <Bar data={monthlyClicksData as any} options={clicksChartOpts as object} />
          )}
          {clicksView === 'weekly' && (
            <Line data={weeklyClicksData} options={weeklyClicksOpts as object} />
          )}
          {clicksView === 'daily' && (
            <Line data={dailyClicksData} options={dailyClicksOpts as object} />
          )}
        </div>
      </div>

      {/* ═══════ MONTH-OVER-MONTH SUMMARY TABLE ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 4, marginTop: 0 }}>Month-over-Month Trend</h3>
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 12px 0' }}>Each row shows the change from the previous month. Green = improvement, red = decline.</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${TP.navy}` }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: TP.navy }}>Month</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Clicks</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>MoM</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Impressions</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>MoM</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>CTR</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Position</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>MoM</th>
              </tr>
            </thead>
            <tbody>
              {GSC_MONTHLY.map((m, i) => {
                const prev = i > 0 ? GSC_MONTHLY[i - 1] : null;
                const clickChg = prev ? ((m.clicks - prev.clicks) / prev.clicks * 100) : null;
                const imprChg = prev ? ((m.impressions - prev.impressions) / prev.impressions * 100) : null;
                const posChg = prev ? (prev.position - m.position) : null; // positive = improved (lower position)
                const isJune = m.month === '2026-06';
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '7px 10px', fontWeight: 600 }}>
                      {monthLabel(m.month)}
                      {isJune && <span style={{ fontSize: 10, color: '#999', marginLeft: 4 }}>(24 days)</span>}
                    </td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600 }}>{m.clicks.toLocaleString()}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600, color: clickChg !== null ? (clickChg >= 0 ? TP.green : TP.red) : '#ccc', fontSize: 11 }}>
                      {clickChg !== null ? `${clickChg >= 0 ? '+' : ''}${clickChg.toFixed(0)}%` : '--'}
                    </td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmtK(m.impressions)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600, color: imprChg !== null ? (imprChg >= 0 ? TP.green : TP.red) : '#ccc', fontSize: 11 }}>
                      {imprChg !== null ? `${imprChg >= 0 ? '+' : ''}${imprChg.toFixed(0)}%` : '--'}
                    </td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{m.ctr}%</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600, color: m.position <= 10 ? TP.green : m.position <= 20 ? TP.yellow : TP.text }}>{m.position.toFixed(1)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600, color: posChg !== null ? (posChg >= 0 ? TP.green : TP.red) : '#ccc', fontSize: 11 }}>
                      {posChg !== null ? `${posChg >= 0 ? '▲' : '▼'} ${Math.abs(posChg).toFixed(1)}` : '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════ SECTION 3: MONTHLY IMPRESSIONS + SUBMISSIONS ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 12, marginTop: 0 }}>Monthly Impressions vs Submissions</h3>
        <div style={{ height: 320 }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Bar data={impressionsData as any} options={impressionsOpts as object} />
        </div>
      </div>

      {/* ═══════ SEPTEMBER DROP CALLOUT ═══════ */}
      <div style={{ background: `${TP.amber}0C`, borderRadius: 10, padding: '16px 20px', border: `1.5px solid ${TP.amber}40` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ background: TP.amber, color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>CORE UPDATE</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: TP.navy }}>September 2025 traffic drop</span>
        </div>
        <div style={{ fontSize: 12, color: '#555', lineHeight: 1.7 }}>
          <p style={{ margin: '0 0 8px' }}>
            Impressions fell from 717K (Aug) to 173K (Sep) and clicks dropped from 18.6K to 14.1K. The most likely cause is
            Google&apos;s <strong>August 2025 Core Update</strong>, which finished rolling out in early September 2025.
          </p>
          <p style={{ margin: '0 0 8px' }}>
            This update specifically targeted YMYL (&quot;Your Money or Your Life&quot;) sites, which includes health and medical content.
            Sites without strong E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness) and pages that looked
            thin relative to competitors were demoted. Toothpillow had no JSON-LD structured data on the home page at the time, no
            canonical URLs, and limited schema markup, all of which weakened the site&apos;s authority signals to Google.
          </p>
          <p style={{ margin: 0 }}>
            Impressions never recovered to pre-update levels. The December new-site migration then compounded the problem by stripping
            the remaining metadata, which drove impressions down further to 66K by February 2026.
          </p>
        </div>
      </div>

      {/* ═══════ SECTION 4: SEARCH POSITION TREND ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 12, marginTop: 0 }}>Average Search Position</h3>
        <div style={{ height: 300 }}>
          <Line data={positionData} options={positionOpts as object} />
        </div>
      </div>

      {/* ═══════ SECTION 5: TOP QUERIES ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 4, marginTop: 0 }}>Top Search Queries (16-Month Aggregate)</h3>
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 12px 0' }}>
          {Math.round(brandedClicks / totalTopClicks * 100)}% of top-query clicks are branded. Non-branded discovery is where SEO gains compound.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${TP.navy}` }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: TP.navy }}>Query</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: TP.navy }}>Type</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Clicks</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Impressions</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>CTR</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Position</th>
              </tr>
            </thead>
            <tbody>
              {TOP_QUERIES.map((q, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                  <td style={{ padding: '7px 10px', fontWeight: 500 }}>{q.query}</td>
                  <td style={{ padding: '7px 10px' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 3,
                      background: q.branded ? `${TP.blue}15` : `${TP.green}15`,
                      color: q.branded ? TP.blue : TP.green }}>
                      {q.branded ? 'Branded' : 'Non-branded'}
                    </span>
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600 }}>{q.clicks.toLocaleString()}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right' }}>{q.impressions.toLocaleString()}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right' }}>{q.ctr}%</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600, color: q.position <= 10 ? TP.green : q.position <= 30 ? TP.yellow : TP.text }}>{q.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════ SECTION 6: KEYWORD MOVEMENT ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 12, marginTop: 0 }}>Non-Branded Keywords Moving Toward Page 1</h3>
        <div style={{ overflowX: 'auto', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${TP.green}` }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: TP.navy }}>Keyword</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Position</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Moved</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', color: TP.navy, minWidth: 130 }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {KEYWORD_CLIMBERS.map((k, i) => {
                const spots = Math.abs(k.change);
                const ph = k.posHistory;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '7px 10px', fontWeight: 500 }}>{k.query}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600, color: k.posNow <= 20 ? TP.green : k.posNow <= 40 ? TP.yellow : TP.text }}>{k.posNow.toFixed(1)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: TP.green }}>▲ {spots.toFixed(0)}</td>
                    <td style={{ padding: '4px 10px', textAlign: 'center' }}>
                      {ph ? (
                        <svg width={130} height={28} viewBox="0 0 130 28">
                          {(() => {
                            const vals = ph.filter((v): v is number => v !== null);
                            const maxP = Math.max(...vals); const minP = Math.min(...vals); const range = maxP - minP || 1;
                            const points: string[] = [];
                            const xScale = ph.length > 1 ? ph.length - 1 : 1;
                            ph.forEach((v, mi) => { if (v !== null) { points.push(`${(mi / xScale) * 126 + 2},${((v - minP) / range) * 20 + 2}`); } });
                            return (<>
                              <polyline points={points.join(' ')} fill="none" stroke={TP.green} strokeWidth={1.5} />
                              {points.map((p, pi) => { const [cx, cy] = p.split(',').map(Number); return <circle key={pi} cx={cx} cy={cy} r={pi === points.length - 1 ? 3 : 1.5} fill={pi === points.length - 1 ? TP.green : `${TP.green}80`} />; })}
                            </>);
                          })()}
                        </svg>
                      ) : <span style={{ fontSize: 10, color: '#ccc' }}>--</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: TP.navy, marginBottom: 8 }}>Already Driving Clicks</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${TP.blue}` }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: TP.navy }}>Keyword</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Position</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: TP.navy }}>Clicks</th>
              </tr>
            </thead>
            <tbody>
              {CLICK_DRIVING_KEYWORDS.map((k, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                  <td style={{ padding: '7px 10px', fontWeight: 500 }}>{k.query}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600, color: k.posNow <= 10 ? TP.green : k.posNow <= 30 ? TP.yellow : TP.text }}>{k.posNow.toFixed(1)}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: TP.blue }}>{k.clicksNow}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(() => {
        const items = [
          { name: 'Title tags',           old: true,  mid: true,  now: true },
          { name: 'Meta descriptions',    old: true,  mid: false, now: true },
          { name: 'OG tags',              old: true,  mid: false, now: true },
          { name: 'Twitter tags',         old: true,  mid: false, now: true },
          { name: 'Canonical URL',        old: false, mid: false, now: true },
          { name: 'H1 heading structure', old: true,  mid: true,  now: true },
          { name: 'JSON-LD schema',       old: false, mid: false, now: true },
        ];
        const oldCount = items.filter(i => i.old).length;
        const midCount = items.filter(i => i.mid).length;
        const nowCount = items.filter(i => i.now).length;
        const rowStyle = { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', fontSize: 12 };
        return (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {/* CARD 1: Old Site */}
            <div style={{ flex: 0.8, minWidth: 200, background: '#fff', borderRadius: 10, padding: '16px 18px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TP.navy }}>Old Site</div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>Pre-Dec 2025</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: TP.navy, marginBottom: 10 }}>{oldCount}/{items.length} <span style={{ fontSize: 12, fontWeight: 500, color: '#888' }}>elements</span></div>
              {items.map((el, i) => (
                <div key={i} style={rowStyle}>
                  <span style={{ fontSize: 13 }}>{el.old ? '✅' : '❌'}</span>
                  <span style={{ color: el.old ? TP.navy : '#bbb' }}>{el.name}</span>
                </div>
              ))}
            </div>

            {/* CARD 2: New Site (the crash) */}
            <div style={{ flex: 1.4, minWidth: 280, background: `linear-gradient(135deg, ${TP.red}08, ${TP.red}04)`, borderRadius: 10, padding: '16px 18px', border: `2px solid ${TP.red}40` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: TP.blue, color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>NEW SITE</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: TP.navy }}>New Site</span>
              </div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>Dec 22, 2025 – May 18, 2026</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: TP.red, marginBottom: 4 }}>{midCount}/{items.length} <span style={{ fontSize: 12, fontWeight: 500 }}>elements</span></div>
              <div style={{ fontSize: 11, color: TP.red, fontWeight: 600, marginBottom: 10 }}>5 elements lost in migration</div>
              {items.map((el, i) => (
                <div key={i} style={rowStyle}>
                  <span style={{ fontSize: 13 }}>{el.mid ? '✅' : '❌'}</span>
                  <span style={{ color: el.mid ? TP.navy : TP.red, fontWeight: el.mid ? 400 : 600 }}>{el.name}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, padding: '8px 10px', background: `${TP.red}10`, borderRadius: 6, fontSize: 11, color: '#555', fontWeight: 400, lineHeight: 1.6 }}>
                <span style={{ fontWeight: 600, color: TP.red }}>Impressions fell from 213K to 66K</span> once Google finished re-indexing the new pages without metadata.
                The drop lagged the launch by ~2 months because Google re-crawls pages on a cycle, not instantly. Dec and Jan still looked normal because
                Google was serving old cached index entries. By Feb, enough pages had been re-crawled that the missing metadata showed in the data.
              </div>
            </div>

            {/* CARD 3: Post-SEO */}
            <div style={{ flex: 0.8, minWidth: 200, background: `linear-gradient(135deg, ${TP.green}08, ${TP.green}04)`, borderRadius: 10, padding: '16px 18px', border: `2px solid ${TP.green}40` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: TP.green, color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>SEO</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: TP.navy }}>Post-SEO</span>
              </div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>May 19, 2026+</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: TP.green, marginBottom: 4 }}>{nowCount}/{items.length} <span style={{ fontSize: 12, fontWeight: 500 }}>elements</span></div>
              <div style={{ fontSize: 11, color: TP.green, fontWeight: 600, marginBottom: 10 }}>All elements restored + 2 new</div>
              {items.map((el, i) => (
                <div key={i} style={rowStyle}>
                  <span style={{ fontSize: 13 }}>{el.now ? '✅' : '❌'}</span>
                  <span style={{ color: el.now ? TP.navy : '#bbb' }}>{el.name}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, padding: '8px 10px', background: `${TP.green}10`, borderRadius: 6, fontSize: 11, color: '#555', lineHeight: 1.5 }}>
                Restored everything lost + added canonical URLs, Twitter card, and JSON-LD schema across 6 pages.
              </div>
            </div>
          </div>
        );
      })()}

      {/* Data source */}
      <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center', padding: '8px 0' }}>
        Google Search Console (16 months). Data pulled June 4, 2026. SEO implemented May 19, 2026.
      </div>
    </div>
  );
}
