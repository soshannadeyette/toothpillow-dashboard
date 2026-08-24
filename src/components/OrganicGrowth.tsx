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
   Data pulled fresh from Google Search Console on August 18, 2026
   Property: https://www.toothpillow.com/ (URL prefix)
   Baseline period: Feb 8 2025 through May 18 2026 (all pre-SEO data)
   SEO program reset date: May 19, 2026
   May 2026: full month (31 days). June 2026: full month (30 days). July 2026: full month (31 days).
   August 2026: partial (16 days through Aug 16). Blog launched Aug 6, 2026.
   ════════════════════════════════════════════ */

const SEO_START_DATE = '2026-05-19';
const WEBSITE_LAUNCH_DATE = '2025-12-22';
const BLOG_LAUNCH_DATE = '2026-08-06';

// Total submissions (online + hybrid + prime) aligned to GSC_MONTHLY months
// 2025: hardcoded historical. 2026: pulled from daily tracker at runtime.
const SUBMISSIONS_2025: Record<string, number> = {
  '2025-02': 1561, '2025-03': 1512, '2025-04': 1665, '2025-05': 1359,
  '2025-06': 1098, '2025-07': 2689, '2025-08': 2542, '2025-09': 1600,
  '2025-10': 1508, '2025-11': 1608, '2025-12': 1253,
};

const GSC_MONTHLY: Array<{ month: string; clicks: number; impressions: number; ctr: number; position: number; partial?: boolean; daysReported?: number }> = [
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
  { month: '2026-06', clicks: 11550, impressions: 54729, ctr: 21.1, position: 10.1 },
  { month: '2026-07', clicks: 11163, impressions: 52738, ctr: 21.2, position: 9.3 },
  { month: '2026-08', clicks: 4903, impressions: 29439, ctr: 16.7, position: 10.4, partial: true, daysReported: 16 },
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
  { week: '2026-06-15', clicks: 2182, impressions: 12279, ctr: 17.8, position: 13.4 },
  { week: '2026-06-22', clicks: 2396, impressions: 12319, ctr: 19.4, position: 9.6 },
  { week: '2026-06-29', clicks: 1831, impressions: 9952, ctr: 18.4, position: 8.8 },
  { week: '2026-07-06', clicks: 2132, impressions: 11471, ctr: 18.6, position: 9.8 },
  { week: '2026-07-13', clicks: 2767, impressions: 12827, ctr: 21.6, position: 10.1 },
  { week: '2026-07-20', clicks: 2949, impressions: 12640, ctr: 23.3, position: 9.1 },
  { week: '2026-07-27', clicks: 2714, impressions: 12617, ctr: 21.5, position: 10.0 },
  { week: '2026-08-03', clicks: 2136, impressions: 11890, ctr: 18.0, position: 10.1 },
  { week: '2026-08-10', clicks: 2241, impressions: 14355, ctr: 15.6, position: 9.7 },
  { week: '2026-08-17', clicks: 2128, impressions: 11772, ctr: 18.1, position: 10.7 },
];

// Full-year daily GSC data — Jan 1 to Aug 16, 2026
// Source: Google Search Console DAYS view, updated August 18, 2026
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
    [25,440,1945],[26,290,1676],[27,246,1450],[28,247,1330],[29,309,1627],[30,341,1973],
  ],
  Jul: [
    [1,353,1618],[2,288,1627],[3,176,956],[4,148,965],[5,216,1186],[6,385,1840],[7,336,2000],
    [8,381,1816],[9,342,1640],[10,261,1431],[11,212,1351],[12,215,1393],[13,463,2101],
    [14,511,2209],[15,464,1929],[16,466,1944],[17,352,1697],[18,250,1408],[19,261,1539],
    [20,429,1866],[21,528,2355],[22,501,2035],[23,467,1900],[24,428,1631],[25,303,1328],
    [26,293,1525],[27,395,1957],[28,412,1722],[29,391,1790],[30,384,1714],[31,552,2265],
  ],
  Aug: [
    [1,311,1559],[2,269,1610],[3,343,1836],[4,387,1667],[5,338,1692],[6,341,1629],[7,264,1678],[8,194,1778],[9,190,1733],[10,300,2137],
    [11,371,2180],[12,361,2336],[13,337,2421],[14,361,2013],[15,286,1408],[16,250,1762],
  ],
};

// Derive May-only record for backward compat
const GSC_DAILY_MAY_2026: Record<number, { clicks: number; impressions: number }> = {};
for (const [d, c, i] of GSC_DAILY_2026.May) { GSC_DAILY_MAY_2026[d] = { clicks: c, impressions: i }; }

/* ════════════════════════════════════════════
   KEYWORD MOVERS — Non-branded keywords showing movement
   GSC comparison: Jul 12–Aug 8, 2026 (28d)
   Only keywords verified as appearing in recent GSC data are included.
   Excludes all branded variations (toothpillow, tooth pillow, mouth pillow, etc.)
   Updated August 10, 2026
   ════════════════════════════════════════════ */

// Position climbers with monthly position history from GSC
// posHistory: monthly average position (from GSC DAYS breakdown, verified Jul 6 2026)
// startedClimbing: first month position improved meaningfully and sustained
const KEYWORD_CLIMBERS = [
  { query: 'mouth breather face', posNow: 8.7, posPrev: 40.0, change: -31.3, imprNow: 271,
    startedClimbing: 'Aug 2026', posHistory: null },
  { query: 'mouth breathing treatment kids', posNow: 4.0, posPrev: 7.8, change: -3.8, imprNow: 74,
    startedClimbing: 'May 2026', posHistory: null },
  { query: 'child mouth breathing treatment', posNow: 5.0, posPrev: 7.5, change: -2.5, imprNow: 61,
    startedClimbing: 'Jun 2026', posHistory: null },
  { query: 'airway doctor', posNow: 9.5, posPrev: 30.0, change: -20.5, imprNow: 110,
    startedClimbing: 'Apr 2026', posHistory: null },
  { query: 'pillow for mouth breathers', posNow: 7.6, posPrev: 11.8, change: -4.2, imprNow: 89,
    startedClimbing: 'May 2026', posHistory: null },
  { query: 'best kids pillow for mouth breathing', posNow: 3.7, posPrev: 5.5, change: -1.8, imprNow: 80,
    startedClimbing: 'Jun 2026', posHistory: null },
  { query: 'kids posture pillow for mouth breathing', posNow: 2.1, posPrev: 3.5, change: -1.4, imprNow: 120,
    startedClimbing: 'May 2026', posHistory: null },
  { query: 'how to avoid braces', posNow: 5.1, posPrev: 5.5, change: -0.4, imprNow: 32,
    startedClimbing: 'May 2026', posHistory: null },
];
// posHistory is 17 values: Feb'25..Jun'26 monthly avg position, null = no data that month

// Non-branded keywords already driving clicks (sorted by clicks, last 28 days)
// Source: GSC 28-day data (Jul 12–Aug 8, 2026), pulled August 10, 2026
const CLICK_DRIVING_KEYWORDS = [
  { query: 'kids pillow for mouth breathing', posNow: 1.8, clicksNow: 30, imprNow: 171, status: 'Page 1' },
  { query: 'mouth pillow kids', posNow: 1.0, clicksNow: 28, imprNow: 98, status: 'Page 1' },
  { query: 'kids posture pillow for mouth breathing', posNow: 2.1, clicksNow: 19, imprNow: 120, status: 'Page 1' },
  { query: 'tongue pillow', posNow: 13.8, clicksNow: 13, imprNow: 86, status: 'Page 2' },
  { query: 'best kids pillow for mouth breathing', posNow: 3.7, clicksNow: 11, imprNow: 80, status: 'Page 1' },
  { query: 'kids mouth breathing pillow', posNow: 1.4, clicksNow: 10, imprNow: 32, status: 'Page 1' },
  { query: 'pillow for mouth breathing child', posNow: 1.3, clicksNow: 10, imprNow: 28, status: 'Page 1' },
  { query: 'pillow for kids mouth breathing', posNow: 1.4, clicksNow: 9, imprNow: 75, status: 'Page 1' },
  { query: 'mouth breathing pillow kids', posNow: 1.6, clicksNow: 9, imprNow: 42, status: 'Page 1' },
  { query: 'mouth pillow for adults', posNow: 8.6, clicksNow: 8, imprNow: 91, status: 'Near page 1' },
  { query: 'pillow for mouth breathers kids', posNow: 1.6, clicksNow: 8, imprNow: 58, status: 'Page 1' },
  { query: 'mouth breathing pillow', posNow: 1.7, clicksNow: 8, imprNow: 56, status: 'Page 1' },
  { query: 'pillow for mouth breathers', posNow: 7.6, clicksNow: 6, imprNow: 89, status: 'Near page 1' },
];
// Source: GSC 16-month aggregate (Mar 20 2025 – Jul 22 2026), pulled July 24, 2026
// "mouth pillow", "mouth pillow kids", "teeth pillow" = quasi-branded (people searching
// for Toothpillow by name variant, not discovering via symptom/treatment keywords)
const TOP_QUERIES = [
  { query: 'tooth pillow', clicks: 75386, impressions: 121893, ctr: 61.8, position: 1.1, branded: true },
  { query: 'toothpillow', clicks: 49708, impressions: 75780, ctr: 65.6, position: 1.7, branded: true },
  { query: 'tooth pillow for kids', clicks: 10402, impressions: 16904, ctr: 61.5, position: 1.0, branded: true },
  { query: 'toothpillow for kids', clicks: 4151, impressions: 6044, ctr: 68.7, position: 1.0, branded: true },
  { query: 'tooth pillow device', clicks: 3657, impressions: 7241, ctr: 50.5, position: 3.3, branded: true },
  { query: 'tooth pillow for adults', clicks: 3133, impressions: 7770, ctr: 40.3, position: 5.4, branded: true },
  { query: 'mouth pillow', clicks: 2256, impressions: 8569, ctr: 26.3, position: 1.4, branded: true },
  { query: 'the tooth pillow', clicks: 1618, impressions: 2201, ctr: 73.5, position: 1.1, branded: true },
  { query: 'my tooth pillow', clicks: 1479, impressions: 1934, ctr: 76.5, position: 1.3, branded: true },
  { query: 'toothpillow for adults', clicks: 1471, impressions: 4335, ctr: 33.9, position: 7.3, branded: true },
  { query: 'tooth pillow appliance', clicks: 1080, impressions: 3257, ctr: 33.2, position: 8.9, branded: true },
  { query: 'tooth pillow canada', clicks: 916, impressions: 1558, ctr: 58.8, position: 1.0, branded: true },
  { query: 'teeth pillow', clicks: 883, impressions: 2236, ctr: 39.5, position: 1.2, branded: true },
  { query: 'what is a tooth pillow', clicks: 769, impressions: 2746, ctr: 28.0, position: 1.3, branded: true },
  { query: 'toothpillow reviews', clicks: 762, impressions: 7124, ctr: 10.7, position: 2.6, branded: true },
  { query: 'mouth pillow kids', clicks: 677, impressions: 1216, ctr: 55.7, position: 1.0, branded: true },
  { query: 'toothpillow cost', clicks: 640, impressions: 2347, ctr: 27.3, position: 1.9, branded: true },
  { query: 'tongue pillow', clicks: 585, impressions: 1536, ctr: 38.1, position: 2.0, branded: false },
  { query: 'mouth breathing device for kids', clicks: 31, impressions: 402, ctr: 7.7, position: 3.9, branded: false },
  { query: 'virtual airway dentist', clicks: 32, impressions: 184, ctr: 17.4, position: 1.2, branded: false },
];

/* ════════════════════════════════════════════
   YEAR-OVER-YEAR NON-BRANDED COMPARISON
   Total clicks from GSC_MONTHLY. Non-branded breakdown from JS extraction
   of GSC query tables (top 1000 queries). Non-branded counts are accurate
   because they appear fully within the 1000-query cap; truncated long-tail
   queries are almost exclusively branded variations.
   "mouth pillow" reclassified as quasi-branded per Sosh (people searching by name variant).
   Product NB = pillow-related searches (tongue pillow, mouth breathing pillow, etc.)
   Discovery NB = problem/treatment searches (airway dentist, mouth breathing treatment, etc.)
   Updated August 10, 2026
   ════════════════════════════════════════════ */
const YOY_JUNE = {
  jun25: { total: 14288, nonBranded: 313, productNB: 281, discoveryNB: 32, days: 30 },
  jun26: { total: 11550, nonBranded: 335, productNB: 278, discoveryNB: 57, days: 30 },
};

const YOY_JULY = {
  jul25: { total: 23188, nonBranded: 420, productNB: 355, discoveryNB: 65, days: 31 },
  jul26: { total: 11163, nonBranded: 648, productNB: 510, discoveryNB: 138, days: 31 },
};

// Aug 1-8 comparison (partial month, same 8-day window)
const YOY_AUGUST = {
  aug25: { total: 6125, nonBranded: 180, productNB: 140, discoveryNB: 40, days: 8 },
  aug26: { total: 2447, nonBranded: 293, productNB: 210, discoveryNB: 83, days: 8 },
};

/* ════════════════════════════════════════════
   TOP PAGES — Which pages get organic clicks
   Source: GSC 3-month aggregate (May 9 – Aug 8, 2026), pulled August 10, 2026
   Note: page URLs changed since last pull (/program → /toothpillow-program, /assessment → /is-my-child-a-candidate)
   ════════════════════════════════════════════ */
const TOP_PAGES = [
  { page: '/', label: 'Homepage', clicks: 25663, impressions: 109874 },
  { page: '/teens-adult', label: 'Teens & Adults', clicks: 2399, impressions: 33241 },
  { page: '/toothpillow-program', label: 'Program', clicks: 1386, impressions: 43067 },
  { page: '/pricing', label: 'Pricing', clicks: 1228, impressions: 54374 },
  { page: '/is-my-child-a-candidate', label: 'Assessment', clicks: 1077, impressions: 57170 },
  { page: '/our-doctors', label: 'Our Doctors', clicks: 872, impressions: 57817 },
  { page: '/faqs', label: 'FAQs', clicks: 705, impressions: 53663 },
  { page: '/premium', label: 'Premium', clicks: 225, impressions: 10355 },
  { page: '/symptoms', label: 'Symptoms', clicks: 159, impressions: 24091 },
];

/* ════════════════════════════════════════════
   BLOG / ARTICLE PAGES — New content indexed since blog launch Aug 6
   Source: GSC 3-month aggregate (May 9 – Aug 8, 2026), pulled August 10, 2026
   33 article pages indexed, 126 total clicks, 13,806 total impressions
   ════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   BLOG ARTICLE TRACKER — Time-series data per article
   Each snapshot = one GSC pull. Add a new snapshot row each time data is refreshed.
   snapshots[]: { date, clicks, impressions, position, ctr } — cumulative from GSC window
   When updating: add new snapshot to each article, keep all previous snapshots.
   ════════════════════════════════════════════ */
const BLOG_ARTICLES: Array<{
  path: string;
  label: string;
  targetKeyword: string;
  monthlyVol: number;
  kd: number;
  publishDate: string;
  snapshots: Array<{ date: string; clicks: number; impressions: number; position: number; ctr: number }>;
}> = [
  {
    path: '/articles/mouth-breathing-face',
    label: 'Mouth Breathing Face',
    targetKeyword: 'mouth breathing face',
    monthlyVol: 22200, kd: 1,
    publishDate: '2026-08-06',
    snapshots: [
      { date: '2026-08-10', clicks: 1, impressions: 736, position: 8.0, ctr: 0.1 },
    ],
  },
  {
    path: '/articles/is-your-child-a-mouth-breather',
    label: 'Is Your Child a Mouth Breather',
    targetKeyword: 'is my child a mouth breather',
    monthlyVol: 720, kd: 0,
    publishDate: '2026-08-06',
    snapshots: [
      { date: '2026-08-10', clicks: 18, impressions: 4468, position: 7.1, ctr: 0.4 },
    ],
  },
  {
    path: '/articles/rapid-palatal-expansion',
    label: 'Rapid Palatal Expansion',
    targetKeyword: 'rapid palatal expansion',
    monthlyVol: 5400, kd: 3,
    publishDate: '2026-08-06',
    snapshots: [
      { date: '2026-08-10', clicks: 34, impressions: 907, position: 9.3, ctr: 3.7 },
    ],
  },
  {
    path: '/articles/the-human-airway',
    label: 'The Human Airway',
    targetKeyword: 'pediatric airway anatomy',
    monthlyVol: 260, kd: 0,
    publishDate: '2026-08-06',
    snapshots: [
      { date: '2026-08-10', clicks: 26, impressions: 2443, position: 12.0, ctr: 1.1 },
    ],
  },
  {
    path: '/articles/snoring-can-be-a-danger-sign',
    label: 'Snoring Can Be a Danger Sign',
    targetKeyword: 'child snoring',
    monthlyVol: 1400, kd: 3,
    publishDate: '2026-08-06',
    snapshots: [
      { date: '2026-08-10', clicks: 4, impressions: 93, position: 8.8, ctr: 4.3 },
    ],
  },
  {
    path: '/articles/craniofacial-changes',
    label: 'Craniofacial Changes & SDB',
    targetKeyword: 'craniofacial development children',
    monthlyVol: 170, kd: 0,
    publishDate: '2026-08-06',
    snapshots: [
      { date: '2026-08-10', clicks: 2, impressions: 579, position: 9.3, ctr: 0.3 },
    ],
  },
  {
    path: '/articles/association-oral-habits',
    label: 'Oral Habits & Mouth Breathing',
    targetKeyword: 'oral habits mouth breathing',
    monthlyVol: 110, kd: 0,
    publishDate: '2026-08-06',
    snapshots: [
      { date: '2026-08-10', clicks: 0, impressions: 277, position: 11.3, ctr: 0.0 },
    ],
  },
  {
    path: '/articles/pediatric-orthodontic-expansion',
    label: 'Pediatric Expansion for SDB',
    targetKeyword: 'palate expander kids',
    monthlyVol: 2200, kd: 0,
    publishDate: '2026-08-06',
    snapshots: [
      { date: '2026-08-10', clicks: 0, impressions: 256, position: 27.0, ctr: 0.0 },
    ],
  },
  {
    path: '/articles',
    label: 'Articles Index',
    targetKeyword: '(index page)',
    monthlyVol: 0, kd: 0,
    publishDate: '2026-08-06',
    snapshots: [
      { date: '2026-08-10', clicks: 35, impressions: 3496, position: 9.9, ctr: 1.0 },
    ],
  },
];

// Total indexed articles (includes pages not in the tracked list above)
const BLOG_TOTAL_INDEXED = 33;


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

  const latestFullMonth = GSC_MONTHLY.find(m => m.month === '2026-07')!;
  void latestFullMonth;
  const latestMonth = GSC_MONTHLY[GSC_MONTHLY.length - 1];
  const augPartial = GSC_MONTHLY.find(m => m.month === '2026-08');
  const augDays = augPartial?.daysReported || 8;
  // Hero card values: show August partial with pace annotation
  const heroClicks = augPartial?.clicks || latestMonth.clicks;
  const heroImpr = augPartial?.impressions || latestMonth.impressions;
  const heroCtr = augPartial?.ctr || latestMonth.ctr;
  const heroPos = augPartial?.position || latestMonth.position;
  const heroLabel = augPartial ? 'Aug' : 'Jul';
  const heroSubLabel = augPartial ? `${augDays} days (partial)` : 'Full month';
  // Paced projections for August
  const augPacedClicks = augPartial ? Math.round(augPartial.clicks / augDays * 31) : 0;
  const augPacedImpr = augPartial ? Math.round(augPartial.impressions / augDays * 31) : 0;

  const aug2025 = GSC_MONTHLY.find(m => m.month === '2025-08')!;
  const jul2025 = GSC_MONTHLY.find(m => m.month === '2025-07')!;
  // YoY comparison month for hero cards
  const heroYoyMonth = augPartial ? aug2025 : jul2025;
  const heroYoyLabel = augPartial ? "Aug '25" : "Jul '25";


  // Annotation indices for chart markers
  const seoMonthIndex = GSC_MONTHLY.findIndex(m => m.month >= SEO_START_DATE.substring(0, 7));
  const websiteMonthIndex = GSC_MONTHLY.findIndex(m => m.month >= WEBSITE_LAUNCH_DATE.substring(0, 7));
  const coreUpdateIndex = GSC_MONTHLY.findIndex(m => m.month === '2025-09');
  const blogMonthIndex = GSC_MONTHLY.findIndex(m => m.month >= BLOG_LAUNCH_DATE.substring(0, 7));
  // If Aug 2026 not in GSC_MONTHLY yet, place at end of chart (just past last month)
  const blogMonthPos = blogMonthIndex >= 0 ? blogMonthIndex + 6 / 31 : GSC_MONTHLY.length - 1 + 0.9;

  // Branded vs non-branded totals
  const brandedClicks = TOP_QUERIES.filter(q => q.branded).reduce((s, q) => s + q.clicks, 0);
  const nonBrandedClicks = TOP_QUERIES.filter(q => !q.branded).reduce((s, q) => s + q.clicks, 0);
  const totalTopClicks = brandedClicks + nonBrandedClicks;

  // YoY non-branded metrics
  const yoyNbPctChg = ((YOY_JUNE.jun26.nonBranded - YOY_JUNE.jun25.nonBranded) / YOY_JUNE.jun25.nonBranded * 100);
  const yoyDiscChg = ((YOY_JUNE.jun26.discoveryNB - YOY_JUNE.jun25.discoveryNB) / YOY_JUNE.jun25.discoveryNB * 100);
  const yoyNbShare25 = (YOY_JUNE.jun25.nonBranded / YOY_JUNE.jun25.total * 100);
  const yoyNbShare26 = (YOY_JUNE.jun26.nonBranded / YOY_JUNE.jun26.total * 100);
  const yoyShareChg = ((yoyNbShare26 - yoyNbShare25) / yoyNbShare25 * 100);

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

  const blogAnnotation = {
    blogLine: {
      type: 'line' as const,
      xMin: blogMonthPos,
      xMax: blogMonthPos,
      borderColor: '#9C27B0B0',
      borderWidth: 2.5,
      borderDash: [6, 3],
      label: {
        display: true,
        content: 'Blog Launch',
        position: 'end' as const,
        backgroundColor: '#9C27B0',
        color: '#fff',
        font: { size: 9, weight: 'bold' as const },
        padding: { top: 2, bottom: 2, left: 5, right: 5 },
        borderRadius: 3,
      },
    },
  };

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
      annotation: { annotations: { ...websiteAnnotation, ...seoAnnotation, ...coreUpdateAnnotation, ...blogAnnotation } },
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
  const blogWeekIndex = weekToIndex(GSC_WEEKLY[0]?.week || '', BLOG_LAUNCH_DATE);

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
          ...(blogWeekIndex >= 0 ? { blogLine: { type: 'line' as const, xMin: blogWeekIndex, xMax: blogWeekIndex, borderColor: '#9C27B0B0', borderWidth: 2, borderDash: [6, 3], label: { display: true, content: 'Blog Launch (Aug 6)', position: 'end' as const, backgroundColor: '#9C27B0', color: '#fff', font: { size: 9, weight: 'bold' as const }, padding: { top: 2, bottom: 2, left: 5, right: 5 }, borderRadius: 3 } } } : {}),
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
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'] as const;
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

    // Find SEO start index (May 19) and blog launch index (Aug 6)
    const seoIdx = allDays.findIndex(d => d.label === 'May 19');
    const blogIdx = allDays.findIndex(d => d.label === 'Aug 6');

    return {
      labels: allDays.map(d => d.label),
      datasets: [
        { label: 'Daily Clicks', data: clickValues, borderColor: `${TP.blue}60`, backgroundColor: `${TP.blue}10`, pointRadius: 1, borderWidth: 1.2, tension: 0.2, fill: true, order: 2 },
        { label: '7-Day Moving Avg', data: ma7, borderColor: TP.red, backgroundColor: 'transparent', pointRadius: 0, borderWidth: 2.5, tension: 0.35, spanGaps: true, order: 1 },
      ],
      seoIdx,
      blogIdx,
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
          ...(dailyClicksData.blogIdx >= 0 ? { blogLine: { type: 'line' as const, xMin: dailyClicksData.blogIdx, xMax: dailyClicksData.blogIdx, borderColor: `${TP.darkPurple}B0`, borderWidth: 2, borderDash: [6, 3], label: { display: true, content: 'Blog Launch (Aug 6)', position: 'start' as const, backgroundColor: TP.darkPurple, color: '#fff', font: { size: 9, weight: 'bold' as const }, padding: { top: 2, bottom: 2, left: 5, right: 5 }, borderRadius: 3 } } } : {}),
        },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v: number | string) => fmtK(Number(v)) }, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false }, ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 20, font: { size: 10 } } },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [dailyClicksData.seoIdx, dailyClicksData.blogIdx]);

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
      annotation: { annotations: { ...websiteAnnotation, ...seoAnnotation, ...coreUpdateAnnotation, ...blogAnnotation } },
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

  // ── Chart: YoY Non-Branded Breakdown ──
  const yoyChartData = useMemo(() => ({
    labels: ['Product keywords', 'Discovery keywords'],
    datasets: [
      {
        label: "Jun '25",
        data: [YOY_JUNE.jun25.productNB, YOY_JUNE.jun25.discoveryNB],
        backgroundColor: '#D1D5DB',
        borderRadius: 3,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      },
      {
        label: "Jun '26",
        data: [YOY_JUNE.jun26.productNB, YOY_JUNE.jun26.discoveryNB],
        backgroundColor: TP.green,
        borderRadius: 3,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      },
    ],
  }), []);

  const yoyChartOpts = useMemo(() => ({
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { beginAtZero: true, title: { display: true, text: 'Clicks (June)', font: { size: 11 } }, grid: { color: '#f0f0f0' } },
      y: { ticks: { font: { size: 11 }, color: TP.navy }, grid: { display: false } },
    },
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: 11 }, usePointStyle: true, pointStyle: 'rectRounded' } },
      tooltip: { callbacks: { label: (ctx: { dataset: { label?: string }; raw: unknown }) => `${ctx.dataset.label}: ${ctx.raw} clicks` } },
    },
  }), []);

  // ── Normalized clicks/day by month ──
  const normalizedMonthly = useMemo(() => {
    return GSC_MONTHLY.map(m => {
      const [y, mo] = m.month.split('-').map(Number);
      // Use actual reported days for partial months, full month days otherwise
      const days = m.daysReported || new Date(y, mo, 0).getDate();
      return {
        month: m.month,
        label: monthLabel(m.month) + (m.partial ? '*' : ''),
        clicksPerDay: Math.round(m.clicks / days * 10) / 10,
        impressionsPerDay: Math.round(m.impressions / days),
        ctr: m.ctr,
        days,
        partial: m.partial || false,
      };
    });
  }, []);

  // ── CTR trend chart ──
  const ctrChartData = useMemo(() => ({
    labels: GSC_MONTHLY.map(m => monthLabel(m.month)),
    datasets: [{
      label: 'CTR %',
      data: GSC_MONTHLY.map(m => m.ctr),
      borderColor: TP.green,
      backgroundColor: `${TP.green}18`,
      pointRadius: 4,
      pointBackgroundColor: GSC_MONTHLY.map(m => m.ctr >= 15 ? TP.green : m.ctr >= 8 ? TP.yellow : TP.red),
      borderWidth: 2.5,
      tension: 0.3,
      fill: true,
    }],
  }), []);

  const ctrChartOpts = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: { parsed: { y: number } }) => `CTR: ${ctx.parsed.y.toFixed(1)}%` } },
      annotation: { annotations: { ...websiteAnnotation, ...seoAnnotation, ...coreUpdateAnnotation, ...blogAnnotation } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v: number | string) => `${v}%` }, grid: { color: '#f0f0f0' }, title: { display: true, text: 'Click-through Rate', font: { size: 11 } } },
      x: { grid: { display: false } },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [seoMonthIndex]);

  // ── Top pages chart ──
  const topPagesData = useMemo(() => ({
    labels: TOP_PAGES.map(p => p.label),
    datasets: [
      {
        label: 'Clicks',
        data: TOP_PAGES.map(p => p.clicks),
        backgroundColor: TP.blue,
        borderRadius: 3,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  }), []);

  const topPagesOpts = useMemo(() => ({
    indexAxis: 'y' as const,
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { beginAtZero: true, ticks: { callback: (v: number | string) => fmtK(Number(v)) }, grid: { color: '#f0f0f0' } },
      y: { ticks: { font: { size: 12 }, color: TP.navy }, grid: { display: false } },
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: { raw: unknown }) => `${Number(ctx.raw).toLocaleString()} clicks` } },
    },
  }), []);

  // ── YoY July comparison ──
  const yoyJulNbPctChg = ((YOY_JULY.jul26.nonBranded - YOY_JULY.jul25.nonBranded) / YOY_JULY.jul25.nonBranded * 100);
  const yoyJulDiscChg = ((YOY_JULY.jul26.discoveryNB - YOY_JULY.jul25.discoveryNB) / YOY_JULY.jul25.discoveryNB * 100);
  const yoyAugNbPctChg = ((YOY_AUGUST.aug26.nonBranded - YOY_AUGUST.aug25.nonBranded) / YOY_AUGUST.aug25.nonBranded * 100);
  const yoyAugDiscChg = ((YOY_AUGUST.aug26.discoveryNB - YOY_AUGUST.aug25.discoveryNB) / YOY_AUGUST.aug25.discoveryNB * 100);

  // ── Normalized clicks/day chart data ──
  const normalizedChartData = useMemo(() => {
    // Only show 2026 months for the normalized view (clean comparison)
    const months2026 = normalizedMonthly.filter(m => m.month >= '2026-01');
    return {
      labels: months2026.map(m => m.label),
      datasets: [
        {
          label: 'Clicks/Day',
          data: months2026.map(m => m.clicksPerDay),
          backgroundColor: months2026.map(m => m.month >= '2026-05' ? TP.green : TP.blue),
          borderRadius: 4,
          borderSkipped: false as const,
        },
      ],
    };
  }, [normalizedMonthly]);

  const normalizedChartOpts = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: { parsed: { y: number } }) => `${ctx.parsed.y.toFixed(1)} clicks/day` } },
      annotation: {
        annotations: {
          ...((() => {
            const months2026 = normalizedMonthly.filter(m => m.month >= '2026-01');
            const seoIdx = months2026.findIndex(m => m.month === '2026-05');
            return seoIdx >= 0 ? {
              seoLine: {
                type: 'line' as const,
                xMin: seoIdx - 0.5,
                xMax: seoIdx - 0.5,
                borderColor: `${TP.green}B0`,
                borderWidth: 2,
                borderDash: [6, 3],
                label: {
                  display: true,
                  content: 'SEO Live',
                  position: 'end' as const,
                  backgroundColor: TP.green,
                  color: '#fff',
                  font: { size: 9, weight: 'bold' as const },
                  padding: { top: 2, bottom: 2, left: 5, right: 5 },
                  borderRadius: 3,
                },
              },
            } : {};
          })()),
        },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f0f0f0' }, title: { display: true, text: 'Clicks per day', font: { size: 11 } } },
      x: { grid: { display: false } },
    },
  }), [normalizedMonthly]);

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
          <div style={labelStyle}>{heroLabel} Organic Clicks</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: TP.navy }}>{fmtK(heroClicks)}</div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{heroSubLabel}</div>
          {augPacedClicks > 0 && (
            <div style={{ fontSize: 11, color: TP.blue, marginTop: 2 }}>Pacing ~{fmtK(augPacedClicks)} full month</div>
          )}
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, color: heroClicks < heroYoyMonth.clicks ? TP.red : TP.green }}>
            {heroClicks >= heroYoyMonth.clicks ? '▲' : '▼'} {delta(heroClicks, heroYoyMonth.clicks)} vs {heroYoyLabel}
          </div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>{heroLabel} Impressions</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: TP.navy }}>{fmtK(heroImpr)}</div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{heroSubLabel}</div>
          {augPacedImpr > 0 && (
            <div style={{ fontSize: 11, color: TP.blue, marginTop: 2 }}>Pacing ~{fmtK(augPacedImpr)} full month</div>
          )}
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, color: heroImpr < heroYoyMonth.impressions ? TP.red : TP.green }}>
            {heroImpr >= heroYoyMonth.impressions ? '▲' : '▼'} {delta(heroImpr, heroYoyMonth.impressions)} vs {heroYoyLabel}
          </div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>{heroLabel} CTR</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: TP.navy }}>{heroCtr}%</div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>Click-through rate</div>
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, color: TP.green }}>
            ▲ from {heroYoyMonth.ctr}% in {heroYoyLabel}
          </div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Avg Position</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: TP.navy }}>{heroPos}</div>
          <div style={{ fontSize: 11, color: TP.green, fontWeight: 600, marginTop: 2 }}>
            {heroPos <= 10 ? 'Page 1' : heroPos <= 20 ? 'Page 2' : `Page ${Math.ceil(heroPos / 10)}`}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, color: heroPos < heroYoyMonth.position ? TP.green : TP.red }}>
            {heroPos < heroYoyMonth.position ? '▲' : '▼'} from {heroYoyMonth.position} (Pg {Math.ceil(heroYoyMonth.position / 10)}) in {heroYoyLabel}
          </div>
        </div>


      </div>

      {/* ═══════ SECTION 1B: NORMALIZED CLICKS/DAY — 2026 ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 4, marginTop: 0 }}>Organic Growth Rate: Clicks per Day</h3>
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 12px 0' }}>
          Normalizes for month length so partial and short months compare fairly. Green bars = post-SEO months.
        </p>
        <div style={{ height: 240 }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Bar data={normalizedChartData as any} options={normalizedChartOpts as object} />
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
          {(() => {
            const months2026 = normalizedMonthly.filter(m => m.month >= '2026-01');
            const mayRate = months2026.find(m => m.month === '2026-05')?.clicksPerDay || 0;
            const junRate = months2026.find(m => m.month === '2026-06')?.clicksPerDay || 0;
            const julRate = months2026.find(m => m.month === '2026-07')?.clicksPerDay || 0;
            const augEntry = months2026.find(m => m.month === '2026-08');
            const augRate = augEntry?.clicksPerDay || 0;
            const latestRate = augRate || julRate;
            const postSeoGrowth = mayRate > 0 ? ((latestRate - mayRate) / mayRate * 100) : 0;
            return (
              <>
                <div style={{ flex: 1, minWidth: 120, padding: '10px 14px', background: `${TP.green}08`, borderRadius: 8, border: `1px solid ${TP.green}20` }}>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>May (SEO start)</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: TP.navy }}>{mayRate.toFixed(0)}/day</div>
                </div>
                <div style={{ flex: 1, minWidth: 120, padding: '10px 14px', background: `${TP.green}08`, borderRadius: 8, border: `1px solid ${TP.green}20` }}>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>June</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: TP.navy }}>{junRate.toFixed(0)}/day</div>
                </div>
                <div style={{ flex: 1, minWidth: 120, padding: '10px 14px', background: `${TP.green}08`, borderRadius: 8, border: `1px solid ${TP.green}20` }}>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>July</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: TP.navy }}>{julRate.toFixed(0)}/day</div>
                </div>
                {augEntry && (
                  <div style={{ flex: 1, minWidth: 120, padding: '10px 14px', background: `${TP.darkPurple}10`, borderRadius: 8, border: `1px solid ${TP.darkPurple}30` }}>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Aug ({augEntry.days}d partial)</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: TP.darkPurple }}>{augRate.toFixed(0)}/day</div>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 120, padding: '10px 14px', background: `${TP.green}12`, borderRadius: 8, border: `1px solid ${TP.green}40` }}>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Post-SEO trend</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: postSeoGrowth >= 0 ? TP.green : TP.red }}>
                    {postSeoGrowth >= 0 ? '+' : ''}{postSeoGrowth.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: 10, color: '#999' }}>May → {augEntry ? 'Aug' : 'Jul'}</div>
                </div>
              </>
            );
          })()}
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
          {clicksView === 'daily' && 'Jan 1 – Aug 8, 2026 (220 days). Gray area = daily clicks, red line = 7-day moving average.'}
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
                      {isJune && <span style={{ fontSize: 10, color: '#999', marginLeft: 4 }}>(29 days)</span>}
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

      {/* ═══════ SECTION 4A: CTR TREND ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 4, marginTop: 0 }}>Click-Through Rate Trend</h3>
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 12px 0' }}>
          CTR measures what percentage of people who see Toothpillow in search results actually click.
          Higher CTR = Google is showing the site to more relevant searchers and the listing is compelling.
        </p>
        <div style={{ height: 280 }}>
          <Line data={ctrChartData} options={ctrChartOpts as object} />
        </div>
        <div style={{ marginTop: 12, padding: '10px 14px', background: `${TP.green}08`, borderRadius: 8, border: `1px solid ${TP.green}20`, fontSize: 12, color: '#555', lineHeight: 1.6 }}>
          CTR improved from {GSC_MONTHLY[0].ctr}% (Feb &apos;25) to {latestMonth.ctr}% (Jul &apos;26).
          The jump in Feb 2026 reflects the SEO metadata cleanup: when Google re-indexed the restored title tags and meta descriptions,
          it started showing Toothpillow for fewer but more relevant queries, so a higher share of impressions converted to clicks.
        </div>
      </div>

      {/* ═══════ SECTION 4B: YoY NON-BRANDED TRACTION ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 4, marginTop: 0 }}>
          Year-over-Year: Non-Branded Search Traction
        </h3>
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 16px 0' }}>
          Non-branded = searches by people who didn&apos;t know Toothpillow by name. &quot;Mouth pillow&quot; variants classified as quasi-branded.
        </p>

        {/* June YoY */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TP.navy, marginBottom: 8 }}>June 2025 vs June 2026</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={cardStyle}>
              <div style={labelStyle}>Non-Branded Clicks</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: TP.green }}>{YOY_JUNE.jun26.nonBranded}</div>
              <div style={{ fontSize: 12, color: '#888' }}>vs {YOY_JUNE.jun25.nonBranded} last year</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, color: TP.green }}>
                ▲ +{yoyNbPctChg.toFixed(0)}%
              </div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Discovery Keywords</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: TP.green }}>{YOY_JUNE.jun26.discoveryNB}</div>
              <div style={{ fontSize: 12, color: '#888' }}>vs {YOY_JUNE.jun25.discoveryNB} last year</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, color: TP.green }}>
                ▲ +{yoyDiscChg.toFixed(0)}%
              </div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Non-Branded Share</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: TP.green }}>{yoyNbShare26.toFixed(1)}%</div>
              <div style={{ fontSize: 12, color: '#888' }}>vs {yoyNbShare25.toFixed(1)}% last year</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, color: TP.green }}>
                ▲ +{yoyShareChg.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* July YoY */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TP.navy, marginBottom: 8 }}>July 2025 vs July 2026</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={cardStyle}>
              <div style={labelStyle}>Non-Branded Clicks</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: TP.green }}>{YOY_JULY.jul26.nonBranded}</div>
              <div style={{ fontSize: 12, color: '#888' }}>vs {YOY_JULY.jul25.nonBranded} last year</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, color: TP.green }}>
                ▲ +{yoyJulNbPctChg.toFixed(0)}%
              </div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Discovery Keywords</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: TP.green }}>{YOY_JULY.jul26.discoveryNB}</div>
              <div style={{ fontSize: 12, color: '#888' }}>vs {YOY_JULY.jul25.discoveryNB} last year</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, color: TP.green }}>
                ▲ +{yoyJulDiscChg.toFixed(0)}%
              </div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Total Clicks (All)</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: TP.navy }}>{fmtK(YOY_JULY.jul26.total)}</div>
              <div style={{ fontSize: 12, color: '#888' }}>vs {fmtK(YOY_JULY.jul25.total)} last year</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, color: TP.red }}>
                ▼ {delta(YOY_JULY.jul26.total, YOY_JULY.jul25.total)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
          Product = pillow/device searches (tongue pillow, mouth breathing pillow). Discovery = treatment, airway, and condition searches.
        </div>
        <div style={{ height: 160 }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Bar data={yoyChartData as any} options={yoyChartOpts as object} />
        </div>

        {/* August YoY (partial — first 8 days) */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TP.navy, marginBottom: 8 }}>August 1–8, 2025 vs August 1–8, 2026</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={cardStyle}>
              <div style={labelStyle}>Non-Branded Clicks</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: TP.green }}>{YOY_AUGUST.aug26.nonBranded}</div>
              <div style={{ fontSize: 12, color: '#888' }}>vs {YOY_AUGUST.aug25.nonBranded} last year</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, color: TP.green }}>
                ▲ +{yoyAugNbPctChg.toFixed(0)}%
              </div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Discovery Keywords</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: TP.green }}>{YOY_AUGUST.aug26.discoveryNB}</div>
              <div style={{ fontSize: 12, color: '#888' }}>vs {YOY_AUGUST.aug25.discoveryNB} last year</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, color: TP.green }}>
                ▲ +{yoyAugDiscChg.toFixed(0)}%
              </div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Total Clicks (All)</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: TP.navy }}>{fmtK(YOY_AUGUST.aug26.total)}</div>
              <div style={{ fontSize: 12, color: '#888' }}>vs {fmtK(YOY_AUGUST.aug25.total)} last year</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, color: TP.red }}>
                ▼ {delta(YOY_AUGUST.aug26.total, YOY_AUGUST.aug25.total)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, padding: '12px 16px', background: `${TP.green}08`, borderRadius: 8, border: `1px solid ${TP.green}20`, fontSize: 12, color: '#555', lineHeight: 1.7 }}>
          Non-branded discovery clicks grew +{yoyAugNbPctChg.toFixed(0)}% YoY in Aug 1–8, with discovery keywords
          up +{yoyAugDiscChg.toFixed(0)}%. The blog launched Aug 6 — &quot;mouth breather face&quot; (22K monthly search volume)
          already has 271 impressions at position 8.7. Total clicks are down YoY because Aug 2025 had inflated
          impression counts (188K vs 13K) from irrelevant queries at position 68+ (3.3% CTR vs 18.2% CTR in 2026).
        </div>
      </div>

      {/* ═══════ SECTION 5: BRANDED vs NON-BRANDED ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 12, marginTop: 0 }}>Where Search Clicks Come From</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 200, background: `${TP.blue}08`, borderRadius: 8, padding: 16, border: `1px solid ${TP.blue}20` }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Branded (people who know you)</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: TP.blue }}>{Math.round(brandedClicks / totalTopClicks * 100)}%</div>
            <div style={{ fontSize: 12, color: TP.text }}>{fmtK(brandedClicks)} clicks</div>
          </div>
          <div style={{ flex: 1, minWidth: 200, background: `${TP.green}08`, borderRadius: 8, padding: 16, border: `1px solid ${TP.green}20` }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Non-branded (new discovery)</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: TP.green }}>{Math.round(nonBrandedClicks / totalTopClicks * 100)}%</div>
            <div style={{ fontSize: 12, color: TP.text }}>{fmtK(nonBrandedClicks)} clicks</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>Top non-branded queries people use to find Toothpillow (16-month total)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {TOP_QUERIES.filter(q => !q.branded).map((q, i) => {
            const maxNB = Math.max(...TOP_QUERIES.filter(x => !x.branded).map(x => x.clicks));
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 200, fontSize: 12, fontWeight: 500, flexShrink: 0 }}>{q.query}</div>
                <div style={{ flex: 1, height: 20, background: '#f5f5f5', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(q.clicks / maxNB) * 100}%`, background: TP.green, borderRadius: 4, transition: 'width 0.3s' }} />
                </div>
                <div style={{ width: 55, fontSize: 11, fontWeight: 600, textAlign: 'right', flexShrink: 0 }}>{q.clicks.toLocaleString()}</div>
                <div style={{ width: 40, fontSize: 10, color: q.position <= 10 ? TP.green : TP.yellow, fontWeight: 600, textAlign: 'right', flexShrink: 0 }}>#{q.position.toFixed(0)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════ SECTION 5C: TOP PAGES ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 4, marginTop: 0 }}>Where Organic Traffic Lands</h3>
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 16px 0' }}>
          Clicks by page, 3-month aggregate (May 9 – Aug 8, 2026). Shows which pages Google sends people to.
        </p>
        <div style={{ height: Math.max(280, TOP_PAGES.length * 40 + 40) }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Bar data={topPagesData as any} options={topPagesOpts as object} />
        </div>
        <div style={{ overflowX: 'auto', marginTop: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${TP.navy}` }}>
                <th style={{ padding: '6px 10px', textAlign: 'left', color: TP.navy }}>Page</th>
                <th style={{ padding: '6px 10px', textAlign: 'right', color: TP.navy }}>Clicks</th>
                <th style={{ padding: '6px 10px', textAlign: 'right', color: TP.navy }}>Impressions</th>
                <th style={{ padding: '6px 10px', textAlign: 'right', color: TP.navy }}>CTR</th>
                <th style={{ padding: '6px 10px', textAlign: 'right', color: TP.navy }}>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {TOP_PAGES.map((p, i) => {
                const totalClicks = TOP_PAGES.reduce((s, x) => s + x.clicks, 0);
                const ctrVal = p.impressions > 0 ? (p.clicks / p.impressions * 100) : 0;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 500 }}>{p.label} <span style={{ color: '#bbb', fontSize: 10 }}>{p.page}</span></td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>{p.clicks.toLocaleString()}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right' }}>{p.impressions.toLocaleString()}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', color: ctrVal >= 5 ? TP.green : TP.yellow }}>{ctrVal.toFixed(1)}%</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>{(p.clicks / totalClicks * 100).toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, padding: '10px 14px', background: `${TP.blue}08`, borderRadius: 8, border: `1px solid ${TP.blue}20`, fontSize: 12, color: '#555', lineHeight: 1.6 }}>
          The homepage captures {(TOP_PAGES[0].clicks / TOP_PAGES.reduce((s, x) => s + x.clicks, 0) * 100).toFixed(0)}% of all organic clicks.
          Assessment and Symptoms pages have high impressions but low CTR, meaning Google shows them but the listing isn&apos;t compelling enough to click.
          These are the highest-leverage pages for title tag and meta description optimization.
        </div>
      </div>

      {/* ═══════ SECTION 6: KEYWORD POSITION TRACKER ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 4, marginTop: 0 }}>Non-Branded Keyword Positions: Then vs Now</h3>
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 16px 0' }}>
          Gray = previous position (pre-SEO baseline). Green = current position (Jul 12–Aug 8). Shorter bar = better ranking. Red line = Page 1 cutoff.
        </p>
        <div style={{ height: Math.max(250, KEYWORD_CLIMBERS.length * 50 + 60) }}>
          <Bar
            data={{
              labels: KEYWORD_CLIMBERS.map(k => k.query),
              datasets: [
                {
                  label: 'Previous (baseline)',
                  data: KEYWORD_CLIMBERS.map(k => k.posPrev),
                  backgroundColor: '#D1D5DB',
                  borderRadius: 3,
                  barPercentage: 0.7,
                  categoryPercentage: 0.8,
                },
                {
                  label: 'Current (Jul–Aug)',
                  data: KEYWORD_CLIMBERS.map(k => k.posNow),
                  backgroundColor: TP.green,
                  borderRadius: 3,
                  barPercentage: 0.7,
                  categoryPercentage: 0.8,
                },
              ],
            }}
            options={{
              indexAxis: 'y' as const,
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  min: 0,
                  max: Math.max(70, ...KEYWORD_CLIMBERS.map(k => Math.max(k.posNow, k.posPrev))) + 5,
                  title: { display: true, text: 'Google Position (lower = better)', font: { size: 11 } },
                  grid: { color: '#f0f0f0' },
                },
                y: {
                  ticks: { font: { size: 11 }, color: TP.navy },
                  grid: { display: false },
                },
              },
              plugins: {
                legend: { position: 'top' as const, labels: { font: { size: 11 }, usePointStyle: true, pointStyle: 'rectRounded' } },
                tooltip: {
                  callbacks: {
                    label: (ctx: { dataset: { label?: string }; raw: unknown }) => `${ctx.dataset.label}: position ${ctx.raw}`,
                  },
                },
                annotation: {
                  annotations: {
                    page1Line: {
                      type: 'line' as const,
                      xMin: 10,
                      xMax: 10,
                      borderColor: TP.red,
                      borderWidth: 2,
                      borderDash: [5, 3],
                      label: {
                        display: true,
                        content: 'Page 1',
                        position: 'start' as const,
                        font: { size: 10, weight: 'bold' as const },
                        backgroundColor: TP.red,
                        color: '#fff',
                        padding: 3,
                      },
                    },
                  },
                },
              },
            } as object}
          />
        </div>
      </div>

      {/* ═══════ SECTION 6B: CLICKS FROM NON-BRANDED KEYWORDS ═══════ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, marginBottom: 4, marginTop: 0 }}>Non-Branded Clicks This Month</h3>
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 12px 0' }}>
          Keywords where people found Toothpillow without searching for it by name (Jul 12–Aug 8, 2026)
        </p>
        {CLICK_DRIVING_KEYWORDS.filter(k => k.clicksNow > 0).map((k, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: k.posNow <= 10 ? TP.green : k.posNow <= 30 ? TP.yellow : '#ccc' }} />
            <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{k.query}</div>
            <div style={{ fontSize: 11, color: '#888', flexShrink: 0 }}>pos {k.posNow.toFixed(0)}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: TP.blue, width: 50, textAlign: 'right', flexShrink: 0 }}>
              {k.clicksNow} {k.clicksNow === 1 ? 'click' : 'clicks'}
            </div>
          </div>
        ))}
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 10 }}>
          Green dot = page 1 (position 1–10). Yellow dot = page 2–3.
        </div>
      </div>

      {/* ═══════ SECTION 7: BLOG ARTICLE TRACKER ═══════ */}
      {(() => {
        const PP = '#9C27B0'; // purple accent
        const articles = BLOG_ARTICLES.filter(a => a.path !== '/articles'); // exclude index
        const indexPage = BLOG_ARTICLES.find(a => a.path === '/articles');
        const allLatest = BLOG_ARTICLES.map(a => a.snapshots[a.snapshots.length - 1]);
        const totalClicks = allLatest.reduce((s, snap) => s + snap.clicks, 0);
        const totalImpr = allLatest.reduce((s, snap) => s + snap.impressions, 0);
        const onPage1 = articles.filter(a => a.snapshots[a.snapshots.length - 1].position <= 10).length;
        const latestDate = allLatest[0]?.date || '';

        // Sort articles by impressions (highest opportunity first)
        const sorted = [...articles].sort((a, b) => {
          const aSnap = a.snapshots[a.snapshots.length - 1];
          const bSnap = b.snapshots[b.snapshots.length - 1];
          return bSnap.impressions - aSnap.impressions;
        });

        return (
          <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: `2px solid ${PP}20` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: PP, color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>BLOG</span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: TP.navy, margin: 0 }}>Article Performance Tracker</h3>
              </div>
              <div style={{ fontSize: 11, color: '#999' }}>Last pull: {latestDate}</div>
            </div>
            <p style={{ fontSize: 12, color: '#888', margin: '4px 0 16px 0' }}>
              Blog launched Aug 6, 2026. Tracking {articles.length} articles + index page. {BLOG_TOTAL_INDEXED} total pages indexed.
            </p>

            {/* Summary cards */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
              <div style={{ flex: 1, minWidth: 120, background: `${PP}08`, borderRadius: 8, padding: 12, border: `1px solid ${PP}20`, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#888' }}>Indexed</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: PP }}>{BLOG_TOTAL_INDEXED}</div>
              </div>
              <div style={{ flex: 1, minWidth: 120, background: `${PP}08`, borderRadius: 8, padding: 12, border: `1px solid ${PP}20`, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#888' }}>On Page 1</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: TP.green }}>{onPage1}<span style={{ fontSize: 13, color: '#999' }}>/{articles.length}</span></div>
              </div>
              <div style={{ flex: 1, minWidth: 120, background: `${PP}08`, borderRadius: 8, padding: 12, border: `1px solid ${PP}20`, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#888' }}>Total Clicks</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: PP }}>{totalClicks}</div>
              </div>
              <div style={{ flex: 1, minWidth: 120, background: `${PP}08`, borderRadius: 8, padding: 12, border: `1px solid ${PP}20`, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#888' }}>Total Impressions</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: PP }}>{fmtK(totalImpr)}</div>
              </div>
            </div>

            {/* Position tracking chart */}
            {(() => {
              // Collect all unique snapshot dates across all articles
              const allDates = [...new Set(articles.flatMap(a => a.snapshots.map(s => s.date)))].sort();
              // Color palette for article lines
              const lineColors = [TP.red, TP.blue, TP.green, TP.darkPurple, TP.yellow, TP.bubblegum, '#FF6B35', '#004E89'];
              const chartDatasets = sorted.map((art, idx) => {
                const color = lineColors[idx % lineColors.length];
                // Map data to each date (null if no snapshot for that date)
                const data = allDates.map(d => {
                  const snap = art.snapshots.find(s => s.date === d);
                  return snap ? snap.position : null;
                });
                return {
                  label: art.label.length > 25 ? art.label.substring(0, 22) + '...' : art.label,
                  data,
                  borderColor: color,
                  backgroundColor: color,
                  pointRadius: 5,
                  pointHoverRadius: 7,
                  borderWidth: 2.5,
                  tension: 0.3,
                  spanGaps: true,
                };
              });

              return (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TP.navy, marginBottom: 4 }}>Article Position Tracking</div>
                  <p style={{ fontSize: 11, color: '#888', margin: '0 0 8px 0' }}>
                    Lower position = higher on Google. Dashed line = Page 1 cutoff (position 10). Each GSC pull adds a data point.
                  </p>
                  <div style={{ height: 300 }}>
                    <Line
                      data={{
                        labels: allDates.map(d => { const [,m,day] = d.split('-'); const mo = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m)]; return `${mo} ${Number(day)}`; }),
                        datasets: chartDatasets,
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            reverse: true,
                            min: 1,
                            max: Math.max(30, ...articles.flatMap(a => a.snapshots.map(s => s.position))) + 2,
                            title: { display: true, text: 'Google Position (lower = better)', font: { size: 11 } },
                            grid: { color: '#f0f0f0' },
                            ticks: { stepSize: 5 },
                          },
                          x: {
                            grid: { display: false },
                            ticks: { font: { size: 11 } },
                          },
                        },
                        plugins: {
                          legend: {
                            position: 'bottom' as const,
                            labels: { usePointStyle: true, boxWidth: 8, padding: 12, font: { size: 10 } },
                          },
                          tooltip: {
                            callbacks: {
                              label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) =>
                                ctx.parsed.y != null ? `${ctx.dataset.label}: pos ${ctx.parsed.y.toFixed(1)}` : '',
                            },
                          },
                          annotation: {
                            annotations: {
                              page1Line: {
                                type: 'line' as const,
                                yMin: 10,
                                yMax: 10,
                                borderColor: `${TP.green}80`,
                                borderWidth: 2,
                                borderDash: [8, 4],
                                label: {
                                  display: true,
                                  content: 'Page 1 cutoff',
                                  position: 'end' as const,
                                  backgroundColor: `${TP.green}B0`,
                                  color: '#fff',
                                  font: { size: 9, weight: 'bold' as const },
                                  padding: { top: 2, bottom: 2, left: 5, right: 5 },
                                  borderRadius: 3,
                                },
                              },
                              page2Line: {
                                type: 'line' as const,
                                yMin: 20,
                                yMax: 20,
                                borderColor: `${TP.yellow}60`,
                                borderWidth: 1,
                                borderDash: [4, 4],
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Per-article cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sorted.map((art, i) => {
                const snap = art.snapshots[art.snapshots.length - 1];
                const prevSnap = art.snapshots.length > 1 ? art.snapshots[art.snapshots.length - 2] : null;
                const posDelta = prevSnap ? prevSnap.position - snap.position : null; // positive = improved
                const clickDelta = prevSnap ? snap.clicks - prevSnap.clicks : null;
                const imprDelta = prevSnap ? snap.impressions - prevSnap.impressions : null;
                const daysLive = Math.floor((new Date(snap.date).getTime() - new Date(art.publishDate).getTime()) / 86400000);
                const posColor = snap.position <= 10 ? TP.green : snap.position <= 20 ? TP.yellow : TP.red;
                const posBg = snap.position <= 10 ? `${TP.green}12` : snap.position <= 20 ? `${TP.yellow}15` : `${TP.red}10`;
                const pageNum = Math.ceil(snap.position / 10);

                return (
                  <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 14, background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                    {/* Article header row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: TP.navy }}>{art.label}</span>
                          {snap.position <= 10 && (
                            <span style={{ fontSize: 9, background: TP.green, color: '#fff', borderRadius: 3, padding: '2px 6px', fontWeight: 700 }}>Page 1</span>
                          )}
                          {art.snapshots.length === 1 && (
                            <span style={{ fontSize: 9, background: TP.blue, color: '#fff', borderRadius: 3, padding: '2px 6px', fontWeight: 700 }}>First Reading</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>
                          <span style={{ color: TP.blue, fontWeight: 500 }}>{art.targetKeyword}</span>
                          {art.monthlyVol > 0 && <span> · {art.monthlyVol.toLocaleString()}/mo</span>}
                          {art.kd > 0 && <span> · KD {art.kd}</span>}
                          <span> · {daysLive} days live</span>
                        </div>
                      </div>
                      {/* Position badge */}
                      <div style={{ textAlign: 'center', minWidth: 70, padding: '6px 10px', borderRadius: 8, background: posBg, border: `1px solid ${posColor}30` }}>
                        <div style={{ fontSize: 9, color: '#888', marginBottom: 2 }}>Position</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: posColor }}>{snap.position.toFixed(1)}</div>
                        {posDelta !== null ? (
                          <div style={{ fontSize: 10, fontWeight: 600, color: posDelta > 0 ? TP.green : posDelta < 0 ? TP.red : '#888' }}>
                            {posDelta > 0 ? `▲ +${posDelta.toFixed(1)}` : posDelta < 0 ? `▼ ${posDelta.toFixed(1)}` : '—'}
                          </div>
                        ) : (
                          <div style={{ fontSize: 9, color: '#aaa' }}>Pg {pageNum}</div>
                        )}
                      </div>
                    </div>

                    {/* Metrics row */}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ minWidth: 80 }}>
                        <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>Clicks</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: TP.navy }}>
                          {snap.clicks}
                          {clickDelta !== null && (
                            <span style={{ fontSize: 11, marginLeft: 4, color: clickDelta >= 0 ? TP.green : TP.red }}>
                              {clickDelta >= 0 ? '+' : ''}{clickDelta}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ minWidth: 100 }}>
                        <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>Impressions</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: TP.navy }}>
                          {snap.impressions.toLocaleString()}
                          {imprDelta !== null && (
                            <span style={{ fontSize: 11, marginLeft: 4, color: imprDelta >= 0 ? TP.green : TP.red }}>
                              {imprDelta >= 0 ? '+' : ''}{imprDelta.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ minWidth: 60 }}>
                        <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>CTR</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: TP.navy }}>{snap.ctr.toFixed(1)}%</div>
                      </div>
                      {/* Position history sparkline (when we have 2+ snapshots) */}
                      {art.snapshots.length >= 2 && (
                        <div style={{ flex: 1, minWidth: 120 }}>
                          <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Position History</div>
                          <div style={{ display: 'flex', alignItems: 'end', gap: 2, height: 30 }}>
                            {art.snapshots.map((s, si) => {
                              // Invert so lower position = taller bar (better rank)
                              const maxPos = Math.max(...art.snapshots.map(x => x.position), 30);
                              const barH = Math.max(4, Math.round((1 - s.position / maxPos) * 28));
                              const barColor = s.position <= 10 ? TP.green : s.position <= 20 ? TP.yellow : TP.red;
                              return (
                                <div key={si} title={`${s.date}: pos ${s.position.toFixed(1)}`}
                                  style={{ width: 8, height: barH, borderRadius: 2, background: barColor, opacity: si === art.snapshots.length - 1 ? 1 : 0.5 }} />
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Index page (collapsed) */}
              {indexPage && (() => {
                const snap = indexPage.snapshots[indexPage.snapshots.length - 1];
                return (
                  <div style={{ border: '1px dashed #d0d0d0', borderRadius: 8, padding: '10px 14px', background: '#fafafa' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#888' }}>Articles Index (/articles)</span>
                        <span style={{ fontSize: 11, color: '#aaa', marginLeft: 8 }}>Pos {snap.position.toFixed(1)} · {snap.clicks} clicks · {snap.impressions.toLocaleString()} impr</span>
                      </div>
                      {snap.position <= 10 && <span style={{ fontSize: 9, background: TP.green, color: '#fff', borderRadius: 3, padding: '2px 6px', fontWeight: 700 }}>Page 1</span>}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Data note */}
            <div style={{ marginTop: 14, fontSize: 11, color: '#aaa', textAlign: 'center' }}>
              Snapshots taken each GSC pull. Deltas appear after 2+ readings. Position history bars appear after 2+ snapshots.
            </div>
          </div>
        );
      })()}

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
        Google Search Console (18 months). Data pulled August 10, 2026. SEO implemented May 19, 2026. Blog launched August 6, 2026.
      </div>
    </div>
  );
}
