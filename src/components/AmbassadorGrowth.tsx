'use client';

import { useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
  type Plugin,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

/* ════════════════════════════════════════════════════════════════════════════
   TP Kids Color Palette
   ════════════════════════════════════════════════════════════════════════ */
const TP = {
  navy: '#1B2A4A',
  blue: '#3A6EA4',
  lightBlue: '#B6CAE3',
  teal: '#8CD1C8',
  gold: '#FDBE67',
  purple: '#B26CA6',
  red: '#DD5759',
};

/* ════════════════════════════════════════════════════════════════════════════
   DATA — all from the HTML source of truth
   ════════════════════════════════════════════════════════════════════════ */

const ambSubs: Record<string, number> = {
  '2023-01':9,'2023-02':20,'2023-03':10,'2023-04':16,'2023-05':14,'2023-06':218,'2023-07':81,'2023-08':15,'2023-09':22,'2023-10':16,'2023-11':23,'2023-12':21,
  '2024-01':14,'2024-02':16,'2024-03':29,'2024-04':33,'2024-05':32,'2024-06':24,'2024-07':36,'2024-08':48,'2024-09':72,'2024-10':32,'2024-11':40,'2024-12':67,
  '2025-01':60,'2025-02':69,'2025-03':67,'2025-04':59,'2025-05':48,'2025-06':46,'2025-07':29,'2025-08':48,'2025-09':39,'2025-10':41,'2025-11':39,'2025-12':29,
  // 2026 corrected for retroactive reclassification: pre-onboard ambassador submissions attributed back to Parent
  '2026-01':37,'2026-02':43,'2026-03':43,'2026-04':44,'2026-05':41,'2026-06':38,'2026-07':68,'2026-08':31,
};
const infSubs: Record<string, number> = {
  '2023-05':2,'2023-09':1,'2023-10':6,'2023-11':293,'2023-12':1035,
  '2024-01':431,'2024-02':313,'2024-03':1590,'2024-04':565,'2024-05':642,'2024-06':1231,'2024-07':480,'2024-08':553,'2024-09':1114,'2024-10':490,'2024-11':357,'2024-12':513,
  '2025-01':514,'2025-02':601,'2025-03':515,'2025-04':504,'2025-05':428,'2025-06':328,'2025-07':897,'2025-08':434,'2025-09':285,'2025-10':267,'2025-11':486,'2025-12':272,
  // 2026 corrected for retroactive reclassification: pre-onboard influencer submissions attributed back to Parent
  '2026-01':307,'2026-02':504,'2026-03':441,'2026-04':228,'2026-05':268,'2026-06':303,'2026-07':597,'2026-08':161,
};

const newAddsAmb: Record<string, number> = {
  '2024-01':4,'2024-02':7,'2024-03':7,'2024-04':6,'2024-05':3,'2024-06':7,'2024-07':10,'2024-08':2,'2024-09':6,'2024-10':7,'2024-11':7,'2024-12':7,
  '2025-01':7,'2025-02':84,'2025-03':7,'2025-04':6,'2025-05':5,'2025-06':6,'2025-07':1,'2025-08':15,'2025-09':2,'2025-10':1,'2025-11':6,'2025-12':1,
  '2026-01':5,'2026-02':12,'2026-03':10,'2026-04':28,'2026-05':20,'2026-06':28,'2026-07':29,'2026-08':24,
};
const newAddsInf: Record<string, number> = {
  '2024-01':1,'2024-02':8,'2024-03':3,'2024-04':4,'2024-05':9,'2024-06':2,'2024-07':7,'2024-08':2,'2024-09':4,'2024-10':6,'2024-11':6,'2024-12':9,
  '2025-01':11,'2025-02':3,'2025-03':7,'2025-04':2,'2025-05':0,'2025-06':3,'2025-07':0,'2025-08':1,'2025-09':0,'2025-10':0,'2025-11':1,'2025-12':1,
  '2026-01':3,'2026-02':2,'2026-03':2,'2026-04':5,'2026-05':6,'2026-06':4,'2026-07':2,'2026-08':1,
};

const ambSubsYear: Record<number, number> = {2023:465, 2024:443, 2025:574, 2026:345};
const infSubsYear: Record<number, number> = {2023:1337, 2024:8279, 2025:5531, 2026:2809};
const combSubsYear: Record<number, number> = {2023:1802, 2024:8722, 2025:6105, 2026:3154};
const addsAmbYear: Record<number, number> = {2023:4, 2024:72, 2025:141, 2026:156};
const addsInfYear: Record<number, number> = {2023:2, 2024:61, 2025:29, 2026:25};
const addsTotalYear: Record<number, number> = {2023:6, 2024:133, 2025:171, 2026:189};
// Note: adds counts are from ambassador program tracking, not Salesforce referral exports

// Active ambassadors with ≥1 submission per year (from Salesforce)
const activeInfByYear: Record<number, number> = {2023:6, 2024:60, 2025:82, 2026:80};
const activeAmbByYear: Record<number, number> = {2023:24, 2024:85, 2025:127, 2026:143};
const activeTotalByYear: Record<number, number> = {2023:30, 2024:145, 2025:209, 2026:223};

const halfCarriedBy: Record<number, number> = {2023:1, 2024:2, 2025:5, 2026:7};
const tenPlusByYear: Record<number, number> = {2023:8, 2024:40, 2025:55, 2026:43};
// Mega-3 = Lauren Johnson + Kendra Needham + Ginny Yurich (top recruited-ambassador producers)
const mega3ByYear: Record<number, number> = {2023:1290, 2024:5935, 2025:1508, 2026:809};
const baseByYear: Record<number, number> = {2023:517, 2024:2898, 2025:4642, 2026:2512};

// Dynamic annualization: complete months + fractional current month
const _now = new Date();
const _isIn2026 = _now.getFullYear() === 2026;
const _completeMonths = _isIn2026 ? _now.getMonth() : 12; // getMonth() 0-based: June=5 → 5 complete months
const _daysInMonth = _isIn2026 ? new Date(2026, _now.getMonth() + 1, 0).getDate() : 1;
const _partialMonth = _isIn2026 ? _now.getDate() / _daysInMonth : 0;
const _monthsElapsed = Math.max(_completeMonths + _partialMonth, 1);
const ANN = 12 / _monthsElapsed;

const recruit26: {label:string; amb:number; inf:number; accent:string; tag?:string}[] = [
  {label:'Jan', amb:5, inf:3, accent:'#B6CAE3'},
  {label:'Feb', amb:12, inf:2, accent:'#8CD1C8'},
  {label:'Mar', amb:10, inf:2, accent:'#3A6EA4'},
  {label:'Apr', amb:28, inf:5, accent:'#FDBE67'},
  {label:'May', amb:20, inf:6, accent:'#B26CA6'},
  {label:'Jun', amb:28, inf:4, accent:'#DD5759'},
  {label:'Jul', amb:29, inf:2, accent:'#F6AACB'},
  {label:'Aug', amb:24, inf:1, accent:'#D6E5F7'},
];

const concRows = [
  {y:'2023', n:1, color:'#FDBE67', names:'Kendra'},
  {y:'2024', n:2, color:'#FDBE67', names:'Lauren, Kendra'},
  {y:'2025', n:5, color:'#8CD1C8', names:'Sosh, Shannon, Lauren, Kendra, Ginny'},
  {y:'2026', n:10, color:'#8CD1C8', names:'Lauren, Shannon, Sosh, Kendra, Jeff, Amy B., Melody, Ginny, Eden, Jasyra'},
];

// Top 3 producers by month — from LBT H1+H2 exports for each year
// Source: LBT 2024 H1+H2, 2025 H1+H2, 2026 H1+H2, all exported 2026-08-20
type Top3Entry = {
  month: string; label: string; total: number;
  p1: {name: string; count: number};
  p2: {name: string; count: number};
  p3: {name: string; count: number};
  rest: number;
};
const TOP3_MONTHLY: Top3Entry[] = [
  // 2024
  {month:'2024-01',label:'Jan 24',total:445,p1:{name:'Kendra Needham',count:395},p2:{name:'Amy Erickson',count:26},p3:{name:'Lauren Johnson',count:5},rest:19},
  {month:'2024-02',label:'Feb',total:328,p1:{name:'Kendra Needham',count:271},p2:{name:'Amy Erickson',count:13},p3:{name:'Taylor Kulik',count:13},rest:31},
  {month:'2024-03',label:'Mar',total:1617,p1:{name:'Lauren Johnson',count:1185},p2:{name:'Kendra Needham',count:373},p3:{name:'Amy Erickson',count:14},rest:45},
  {month:'2024-04',label:'Apr',total:596,p1:{name:'Lauren Johnson',count:262},p2:{name:'Kendra Needham',count:157},p3:{name:'Melody Brandon',count:44},rest:133},
  {month:'2024-05',label:'May',total:672,p1:{name:'Lauren Johnson',count:268},p2:{name:'Kendra Needham',count:164},p3:{name:'Erin Wilkins',count:129},rest:111},
  {month:'2024-06',label:'Jun',total:1255,p1:{name:'Ginny Yurich',count:457},p2:{name:'Lauren Johnson',count:449},p3:{name:'Kendra Needham',count:138},rest:211},
  {month:'2024-07',label:'Jul',total:516,p1:{name:'Lauren Johnson',count:199},p2:{name:'Ginny Yurich',count:97},p3:{name:'Kendra Needham',count:80},rest:140},
  {month:'2024-08',label:'Aug',total:598,p1:{name:'Lauren Johnson',count:147},p2:{name:'Jeff Cruz',count:122},p3:{name:'Soshanna Salsman',count:98},rest:231},
  {month:'2024-09',label:'Sep',total:1184,p1:{name:'Ginny Yurich',count:321},p2:{name:'Lauren Johnson',count:166},p3:{name:'Kendra Needham',count:92},rest:605},
  {month:'2024-10',label:'Oct',total:519,p1:{name:'Ginny Yurich',count:118},p2:{name:'Lauren Johnson',count:88},p3:{name:'Jeff Cruz',count:59},rest:254},
  {month:'2024-11',label:'Nov',total:397,p1:{name:'Lauren Johnson',count:99},p2:{name:'Ginny Yurich',count:43},p3:{name:'Kendra Needham',count:36},rest:219},
  {month:'2024-12',label:'Dec',total:574,p1:{name:'Thuy Improta',count:124},p2:{name:'Soshanna Salsman',count:89},p3:{name:'Lauren Johnson',count:85},rest:276},
  // 2025
  {month:'2025-01',label:'Jan 25',total:570,p1:{name:'Lauren Johnson',count:119},p2:{name:'Soshanna Salsman',count:78},p3:{name:'Thuy Improta',count:55},rest:318},
  {month:'2025-02',label:'Feb',total:667,p1:{name:'Soshanna Salsman',count:182},p2:{name:'Lauren Johnson',count:95},p3:{name:'Thuy Improta',count:46},rest:344},
  {month:'2025-03',label:'Mar',total:578,p1:{name:'Soshanna Salsman',count:128},p2:{name:'Lauren Johnson',count:86},p3:{name:'Thuy Improta',count:52},rest:312},
  {month:'2025-04',label:'Apr',total:563,p1:{name:'Lauren Johnson',count:129},p2:{name:'Soshanna Salsman',count:72},p3:{name:'Kendra Needham',count:59},rest:303},
  {month:'2025-05',label:'May',total:476,p1:{name:'Soshanna Salsman',count:103},p2:{name:'Lauren Johnson',count:66},p3:{name:'Devon Kuntzman',count:55},rest:252},
  {month:'2025-06',label:'Jun',total:373,p1:{name:'Soshanna Salsman',count:65},p2:{name:'Dr. Ameet Trivedi',count:41},p3:{name:'Kendra Needham',count:39},rest:228},
  {month:'2025-07',label:'Jul',total:925,p1:{name:'Shannon Tripp',count:467},p2:{name:'Lauren Johnson',count:88},p3:{name:'Soshanna Salsman',count:84},rest:286},
  {month:'2025-08',label:'Aug',total:479,p1:{name:'Shannon Tripp',count:71},p2:{name:'Lauren Johnson',count:67},p3:{name:'Soshanna Salsman',count:60},rest:281},
  {month:'2025-09',label:'Sep',total:323,p1:{name:'Lauren Johnson',count:48},p2:{name:'Shannon Tripp',count:28},p3:{name:'Amy Bernhard',count:27},rest:220},
  {month:'2025-10',label:'Oct',total:306,p1:{name:'Lauren Johnson',count:39},p2:{name:'Kendra Needham',count:33},p3:{name:'Shannon Tripp',count:31},rest:203},
  {month:'2025-11',label:'Nov',total:523,p1:{name:'Shannon Tripp',count:197},p2:{name:'Soshanna Salsman',count:50},p3:{name:'Ginny Yurich',count:46},rest:230},
  {month:'2025-12',label:'Dec',total:295,p1:{name:'Shannon Tripp',count:54},p2:{name:'Soshanna Salsman',count:42},p3:{name:'Lauren Johnson',count:31},rest:168},
  // 2026
  {month:'2026-01',label:'Jan 26',total:362,p1:{name:'Lauren Johnson',count:46},p2:{name:'Shannon Tripp',count:39},p3:{name:'Ginny Yurich',count:31},rest:246},
  {month:'2026-02',label:'Feb',total:570,p1:{name:'Shannon Tripp',count:112},p2:{name:'Kendra Needham',count:45},p3:{name:'Soshanna Salsman',count:43},rest:370},
  {month:'2026-03',label:'Mar',total:531,p1:{name:'Shannon Tripp',count:56},p2:{name:'Soshanna Salsman',count:52},p3:{name:'Jeff Cruz',count:41},rest:382},
  {month:'2026-04',label:'Apr',total:300,p1:{name:'Shannon Tripp',count:35},p2:{name:'Soshanna Salsman',count:28},p3:{name:'Lauren Johnson',count:25},rest:212},
  {month:'2026-05',label:'May',total:322,p1:{name:'Soshanna Salsman',count:31},p2:{name:'Emily Boazman',count:28},p3:{name:'Shannon Tripp',count:21},rest:242},
  {month:'2026-06',label:'Jun',total:352,p1:{name:'Amy Bernhard',count:30},p2:{name:'Shannon Tripp',count:30},p3:{name:'Soshanna Salsman',count:28},rest:264},
  {month:'2026-07',label:'Jul',total:683,p1:{name:'Lauren Johnson',count:314},p2:{name:'Eden Lee',count:49},p3:{name:'Soshanna Salsman',count:26},rest:294},
  {month:'2026-08',label:'Aug*',total:201,p1:{name:'Lauren Johnson',count:36},p2:{name:'Soshanna Salsman',count:15},p3:{name:'Shannon Tripp',count:15},rest:135},
];

// Top producers — 3-year history (2024 from H1+H2 LBT exports, 2025+2026 from moversData)
// Source: 2024 H1 LBT (Jan 1-Jul 18) + H2 LBT (Jul 18-Dec 31), overlap deduped on 7/18
const PRODUCER_HISTORY: {name:string; y24:number; y25:number; y26:number; type:string}[] = [
  {name:'Lauren Johnson NNM',    y24:2956, y25:831,  y26:525,  type:'Inf'},
  {name:'Kendra Needham',        y24:1851, y25:386,  y26:179,  type:'Inf'},
  {name:'Ginny Yurich',          y24:1110, y25:291,  y26:105,  type:'Inf'},
  {name:'Soshanna Salsman',      y24:299,  y25:914,  y26:249,  type:'Inf'},
  {name:'Shannon Tripp',         y24:0,    y25:866,  y26:327,  type:'Inf'},
  {name:'Thuy Improta',          y24:204,  y25:245,  y26:35,   type:'Inf'},
  {name:'Jeff Cruz',             y24:259,  y25:84,   y26:139,  type:'Inf'},
  {name:'Erin Wilkins',          y24:285,  y25:111,  y26:21,   type:'Inf'},
  {name:'Melody Brandon',        y24:137,  y25:123,  y26:121,  type:'Inf'},
  {name:'Taylor Kulik',          y24:156,  y25:103,  y26:66,   type:'Inf'},
  {name:'Eden Lee',              y24:25,   y25:185,  y26:102,  type:'Inf'},
  {name:'Eryn Carroll NMM',      y24:144,  y25:104,  y26:30,   type:'Inf'},
  {name:'Jasyra Santiago-Hines', y24:100,  y25:57,   y26:101,  type:'Inf'},
  {name:'Amy Bernhard',          y24:0,    y25:112,  y26:135,  type:'Inf'},
  {name:'Amy Erickson',          y24:141,  y25:51,   y26:45,   type:'Inf'},
  {name:'Devon Kuntzman',        y24:133,  y25:90,   y26:19,   type:'Inf'},
  {name:'Lauren Stadler',        y24:46,   y25:93,   y26:45,   type:'Inf'},
  {name:'Ellen Fisher',          y24:40,   y25:53,   y26:73,   type:'Inf'},
  {name:'Wendy Ostapuk',         y24:85,   y25:104,  y26:19,   type:'Inf'},
  {name:'Emily Boazman',         y24:0,    y25:0,    y26:78,   type:'Inf'},
];

// Top-5 concentration by year (% of total amb+inf submissions from top 5 producers)
// 2024: 8,722 total → top 5 = 74.7%  2025: 6,105 total → top 5 = 64.9%  2026: 3,321 YTD → top 5 = 42.7%
const TOP5_CONCENTRATION: {year:number; top5Pct:number; restPct:number; top5:number; rest:number; total:number; names:string}[] = [
  {year:2024, top5Pct:74.7, restPct:25.3, top5:6513, rest:2209, total:8722, names:'Lauren, Kendra, Ginny, Sosh, Erin W.'},
  {year:2025, top5Pct:64.9, restPct:35.1, top5:3962, rest:2143, total:6105, names:'Sosh, Shannon, Lauren, Kendra, Ginny'},
  {year:2026, top5Pct:42.7, restPct:57.3, top5:1419, rest:1902, total:3321, names:'Lauren, Shannon, Sosh, Kendra, Jeff'},
];

// Updated from Salesforce Launch Bonus Tracker export 2026-08-20
// Source: LB Tracker combined H1 (Jan-Jun30) + H2 (Jul1-Aug20), exported 2026-08-20
const moversData: Record<string, {y25:number; y26:number; type:string}> = {
  'Lauren Johnson NNM':   {y25:831,  y26:525, type:'Inf'},
  'Shannon Tripp':        {y25:866,  y26:327, type:'Inf'},
  'Soshanna Salsman':     {y25:914,  y26:249, type:'Inf'},
  'Kendra Needham':       {y25:386,  y26:179, type:'Inf'},
  'Jeff Cruz':            {y25:84,   y26:139, type:'Inf'},
  'Amy Bernhard':         {y25:112,  y26:135, type:'Inf'},
  'Melody Brandon':       {y25:123,  y26:121, type:'Inf'},
  'Ginny Yurich':         {y25:291,  y26:105, type:'Inf'},
  'Eden Lee':             {y25:185,  y26:102, type:'Inf'},
  'Jasyra Santiago-Hines':{y25:57,   y26:101, type:'Inf'},
  'Emily Boazman':        {y25:0,    y26:78,  type:'Inf'},
  'Ellen Fisher':         {y25:53,   y26:73,  type:'Inf'},
  'Taylor Kulik':         {y25:103,  y26:66,  type:'Inf'},
  'Amy Erickson':         {y25:51,   y26:45,  type:'Inf'},
  'Lauren Stadler':       {y25:93,   y26:45,  type:'Inf'},
  'Carly Brown':          {y25:0,    y26:44,  type:'Inf'},
  'Katelyn Alsop':        {y25:0,    y26:42,  type:'Inf'},
  'Thuy Improta':         {y25:245,  y26:35,  type:'Inf'},
  'Eryn Carroll NMM':     {y25:104,  y26:30,  type:'Inf'},
  'Hilary Fritsch':       {y25:0,    y26:29,  type:'Inf'},
  'Melina Moses':         {y25:28,   y26:28,  type:'Amb'},
  'Ashley Turner':        {y25:39,   y26:26,  type:'Inf'},
  'Hayley Lombard':       {y25:0,    y26:28,  type:'Inf'},
  'Jennie Hoglund':       {y25:29,   y26:25,  type:'Inf'},
  'Erin Wilkins':         {y25:111,  y26:21,  type:'Inf'},
  'Mary Catherine Oechslin':{y25:0,  y26:21,  type:'Inf'},
  'Taylor Moran':         {y25:62,   y26:20,  type:'Inf'},
  'Alicia Nussbaum':      {y25:0,    y26:19,  type:'Amb'},
  'Devon Kuntzman':       {y25:90,   y26:19,  type:'Inf'},
  'Wendy Ostapuk':        {y25:104,  y26:19,  type:'Inf'},
  'Taylor Weimar':        {y25:0,    y26:19,  type:'Inf'},
  'Michelle Keijner':     {y25:13,   y26:17,  type:'Amb'},
  'Laura Manns':          {y25:0,    y26:13,  type:'Amb'},
  'Elise Hylden':         {y25:20,   y26:13,  type:'Amb'},
  'Courtland Nall':       {y25:10,   y26:12,  type:'Amb'},
  'Hillary Ha':           {y25:0,    y26:12,  type:'Amb'},
  'Lexi Fitzgerald':      {y25:0,    y26:11,  type:'Inf'},
  'Dr. Ameet Trivedi':    {y25:105,  y26:11,  type:'Inf'},
  'Brianna Reiser':       {y25:22,   y26:10,  type:'Amb'},
  'Carly Hartwig':        {y25:0,    y26:10,  type:'Inf'},
  'Lauren Peter':         {y25:37,   y26:10,  type:'Amb'},
  'Taylor Dukes':         {y25:0,    y26:10,  type:'Inf'},
  'Karyna Cast Korotkykh':{y25:24,   y26:9,   type:'Amb'},
  'Rachel Jayroe':        {y25:0,    y26:9,   type:'Amb'},
  'Christina Franco':     {y25:0,    y26:8,   type:'Inf'},
  'Jessi Meeks':          {y25:0,    y26:8,   type:'Amb'},
  'Tania O\'Donnell':     {y25:0,    y26:7,   type:'Amb'},
  'Jennee Guerrero':      {y25:0,    y26:7,   type:'Amb'},
  'Julia Lee':            {y25:0,    y26:7,   type:'Amb'},
  'Craig Clayton':        {y25:0,    y26:7,   type:'Inf'},
  'Sara Lininger':        {y25:0,    y26:7,   type:'Inf'},
  'Kelsey Tweeton':       {y25:0,    y26:7,   type:'Amb'},
  'Jordan Schoen':        {y25:0,    y26:7,   type:'Amb'},
  'Amy Migdalia Williams':{y25:0,    y26:6,   type:'Inf'},
  'Emily Morrow':         {y25:31,   y26:6,   type:'Inf'},
  'Kelsey Sem':           {y25:0,    y26:6,   type:'Inf'},
  'Tiffany Hubbard':      {y25:11,   y26:6,   type:'Amb'},
  'Lori Beth Auldridge':  {y25:0,    y26:6,   type:'Amb'},
  'Bailey King':          {y25:0,    y26:6,   type:'Amb'},
  'Samantha Mauermann':   {y25:0,    y26:6,   type:'Inf'},
  'Ashley Vogt':          {y25:0,    y26:5,   type:'Amb'},
  'Cy Tidwell':           {y25:0,    y26:5,   type:'Amb'},
  'Anna Brayton riseandclimb':{y25:0,y26:5,   type:'Amb'},
  'Kayla Monson':         {y25:0,    y26:5,   type:'Inf'},
  'Laura Bruner':         {y25:0,    y26:5,   type:'Amb'},
  'Janell Hampton':       {y25:0,    y26:5,   type:'Amb'},
};

// Launch Bonus Tracker — updated from Salesforce export 2026-08-20
// 136 ambassadors with ≥1 WINDOW submission (counted from window start, not YTD).
// Daily columns through 07/19/2026 (200 col max). Pre-2026 onboards: window starts 04/01/2026.
// 2026 onboards: window starts at onboard date. Tier: Tier 2 = 50+, Tier 1 = 25-49.
// paid = cumulative amount paid out so far. Payouts happen on 1st of each month for prior month earnings.

// Monthly payout history (source of truth for paid amounts)
const LAUNCH_BONUS_PAYOUTS: {month:string; payouts:{name:string;amount:number;tier:string;pending?:boolean;note?:string}[]}[] = [
  { month: 'May 2026', payouts: [
    { name: 'Shannon Tripp', amount: 1250, tier: 'Tier 2' },
    { name: 'Lauren Johnson NNM', amount: 250, tier: 'Tier 1' },
    { name: 'Kendra Needham', amount: 250, tier: 'Tier 1' },
    { name: 'Katelyn Alsop (James)', amount: 250, tier: 'Tier 1' },
    { name: 'Emily Boazman', amount: 250, tier: 'Tier 1' },
    { name: 'Jeff Cruz Talia_likeitis', amount: 250, tier: 'Tier 1' },
  ]},
  { month: 'July 2026', payouts: [
    { name: 'Lauren Johnson NNM', amount: 1000, tier: 'Tier 2' },
    { name: 'Emily Boazman', amount: 1000, tier: 'Tier 2' },
    { name: 'Amy Bernhard', amount: 250, tier: 'Tier 1' },
    { name: 'Ginny Yurich', amount: 250, tier: 'Tier 1' },
    { name: 'Jasyra Santiago-Hines', amount: 250, tier: 'Tier 1' },
    { name: 'Melody Brandon', amount: 250, tier: 'Tier 1' },
    { name: 'Carly Brown', amount: 250, tier: 'Tier 1' },
  ]},
  { month: 'August 2026', payouts: [
    { name: 'Kendra Needham', amount: 1000, tier: 'Tier 2' },
    { name: 'Eden Lee loverlees', amount: 250, tier: 'Tier 1', note: 'Hit T1 07/10 + T2 07/30, T1 payout' },
    { name: 'Hayley Lombard', amount: 250, tier: 'Tier 1', note: 'Has balance — applied toward' },
  ]},
  { month: 'September 2026', payouts: [
    { name: 'Amy Bernhard', amount: 1000, tier: 'Tier 2', pending: true, note: 'Hit 50+ on 07/29' },
    { name: 'Jeff Cruz Talia_likeitis', amount: 1000, tier: 'Tier 2', pending: true, note: 'Hit 50+ on 07/31' },
    { name: 'Melody Brandon', amount: 1000, tier: 'Tier 2', pending: true, note: 'Hit 50+ on 08/03' },
    { name: 'Taylor Kulik', amount: 250, tier: 'Tier 1', pending: true, note: 'Hit 25+ on 07/25' },
    { name: 'Hilary Fritsch*', amount: 250, tier: 'Tier 1', pending: true, note: 'Hit 25+ on 07/31' },
  ]},
];

const launchBonusData: {name:string;bonusSubs:number;tier:number;earned:number;paid:number;winStart:string;winEnd:string;tier1Date?:string;tier2Date?:string;is2026?:boolean;omit?:boolean;pendingPayout?:boolean}[] = [
  {name:'Lauren Johnson NNM',bonusSubs:410,tier:2,earned:1250,paid:1250,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'04/27',tier2Date:'06/11'},
  {name:'Soshanna Salsman',bonusSubs:128,tier:2,earned:1250,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'04/25',tier2Date:'05/28',omit:true},
  {name:'Shannon Tripp',bonusSubs:120,tier:2,earned:1250,paid:1250,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'04/21',tier2Date:'05/26'},
  {name:'Emily Boazman',bonusSubs:75,tier:2,earned:1250,paid:1250,winStart:'04/02/2026',winEnd:'12/31/2026',tier1Date:'05/24',tier2Date:'06/26',is2026:true},
  {name:'Eden Lee loverlees',bonusSubs:71,tier:2,earned:1250,paid:250,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'07/10',tier2Date:'07/30'},
  {name:'Kendra Needham',bonusSubs:68,tier:2,earned:1250,paid:1250,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'05/22',tier2Date:'07/13'},
  {name:'Melody Brandon',bonusSubs:57,tier:2,earned:1250,paid:250,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'06/08',tier2Date:'08/03'},
  {name:'Amy Bernhard',bonusSubs:54,tier:2,earned:1250,paid:250,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'06/03',tier2Date:'07/29'},
  {name:'Jeff Cruz Talia_likeitis',bonusSubs:54,tier:2,earned:1250,paid:250,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'05/19',tier2Date:'07/31'},
  {name:'Jasyra Santiago-Hines',bonusSubs:49,tier:1,earned:250,paid:250,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'06/10'},
  {name:'Ginny Yurich',bonusSubs:47,tier:1,earned:250,paid:250,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'06/02'},
  {name:'Carly Brown',bonusSubs:43,tier:1,earned:250,paid:250,winStart:'04/21/2026',winEnd:'12/31/2026',tier1Date:'06/26',is2026:true},
  {name:'Katelyn Alsop (James)',bonusSubs:42,tier:1,earned:250,paid:250,winStart:'01/19/2026',winEnd:'12/31/2026',tier1Date:'02/21',is2026:true},
  {name:'Taylor Kulik',bonusSubs:31,tier:1,earned:250,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'07/25'},
  {name:'Hilary Fritsch*',bonusSubs:27,tier:1,earned:250,paid:0,winStart:'05/08/2026',winEnd:'12/31/2026',tier1Date:'07/31',is2026:true},
  {name:'Hayley Lombard',bonusSubs:28,tier:1,earned:250,paid:250,winStart:'05/19/2026',winEnd:'12/31/2026',tier1Date:'07/16',is2026:true},
  {name:'Amy Erickson',bonusSubs:24,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Ellen Fisher',bonusSubs:23,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Lauren Stadler',bonusSubs:22,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Melina Moses',bonusSubs:22,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Eryn Carroll (natural minded momma)',bonusSubs:21,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Thuy Improta *ministry*',bonusSubs:20,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Alicia Nussbaum',bonusSubs:19,tier:0,earned:0,paid:0,winStart:'07/06/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Wendy Ostapuk toxinfreeish',bonusSubs:17,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Mary Catherine Oechslin momnp',bonusSubs:16,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Courtland Nall',bonusSubs:11,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Erin Wilkins essentiallyerin',bonusSubs:11,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Lexi Fitzgerald',bonusSubs:11,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Carly Hartwig',bonusSubs:10,tier:0,earned:0,paid:0,winStart:'04/06/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Devon Kuntzman *Transforming Toddlerhood*',bonusSubs:9,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Rachel Jayroe',bonusSubs:9,tier:0,earned:0,paid:0,winStart:'02/06/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Christina Franco',bonusSubs:8,tier:0,earned:0,paid:0,winStart:'05/27/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Hillary Ha',bonusSubs:8,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Taylor Weimar',bonusSubs:8,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Ashley Turner',bonusSubs:7,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Jessi Meeks',bonusSubs:7,tier:0,earned:0,paid:0,winStart:'04/22/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Kelsey Tweeton',bonusSubs:7,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Michelle Keijner',bonusSubs:7,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Dr. Ameet Trivedi truthdds',bonusSubs:6,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Kelsey Sem (holisticmumma)',bonusSubs:6,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Lauren Peter',bonusSubs:6,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Lucy Bochsler',bonusSubs:6,tier:0,earned:0,paid:0,winStart:'08/03/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Bailey King',bonusSubs:5,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Jennee Guerrero',bonusSubs:5,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Jordan Schoen',bonusSubs:5,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Karyna Cast Korotkykh',bonusSubs:5,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Laura Bruner',bonusSubs:5,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:"Tania O'Donnell",bonusSubs:5,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Taylor Dukes',bonusSubs:5,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Allison Ososkie',bonusSubs:4,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Ashley Vogt',bonusSubs:4,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Elise Hylden',bonusSubs:4,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Erika Xavier',bonusSubs:4,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Heather Koch',bonusSubs:4,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Lori Beth Auldridge',bonusSubs:4,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Marissa Mason',bonusSubs:4,tier:0,earned:0,paid:0,winStart:'03/10/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Adrian Schroeder',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Allison Shaughnessy',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/03/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Amy Migdalia Williams',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Anna Brayton riseandclimb',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'AnnaMaria Temple',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Ariana Perdomo Ramirez',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'08/03/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Bodybybree',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Christa Jooste',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Elizabeth Bagwell',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Jackie Parliament',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'01/27/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Julia Lee',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/23/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Kara Barber',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/22/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Kristin Tigges',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Laura Manns',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Logan Randazzo',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'03/19/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Meghan Joy Yancy',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'01/20/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Milli Twitchell mywholehomestead',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Miranda Shell',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Natalie Kennedy',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Natalie Stahl',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/07/2026',winEnd:'12/31/2026',is2026:true},
  {name:"Samantha Mauermann 'Acresandaprons'",bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Sarah Fuller',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/29/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Tanya Marquez',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'06/01/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Amanda Cruz (closequartersmom)',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Amber Thompson',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'02/25/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Alisabeth Dixon',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'07/20/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Ashlee Boyson',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'02/11/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Beth Leon',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Brianna Reiser',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Carmen Kolle',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'06/22/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Chad Rasmussen',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Cy Tidwell',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Emily Morrow',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Gina Primavera',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/22/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Hannah McNeely',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Janell Hampton',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Jessica Klick',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Kale Blossom',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Kara Garcia',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'01/16/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Karen Takacs',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Katie Brooks',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'02/06/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Kayla Monson',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Kristin Hefley',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'05/07/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Lindsay Cardwell',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Lindsey Price',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Maurissa Ashby-Faulkner',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Melissa Long (Natural Minded Mama)',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'05/11/2026',winEnd:'12/31/2026',is2026:true},
  {name:'No One Told Us Podcast',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Ruby Morris',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Sam Johnson',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'02/06/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Taylor Moran',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Alexis Eline',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'06/03/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Airwaymyos -Chantal Duhaime / Michelle Quinto',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Alexis Martinez',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'06/05/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Amanda Knox',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/02/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Amy Eck',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'01/20/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Angela Ribeiro',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Anna Marie Christensen',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Ashney Patoka',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/16/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Bethany Micek',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Brittany Fisher',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'08/03/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Brittany Greenfield',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'01/21/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Brooke Quinn*',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'02/19/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Brook Merkel',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Cami Andersen',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'01/26/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Carly Patterson',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Craig Clayton *Restoration Dentistry*',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Dawn Winkelmann',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Ellie Gilbert',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Emily Bentow/buckingham',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'06/10/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Emily Sexton',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Erin Blatchford',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Erin Rice',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Erin Stanczyk',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Eryka Spera',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Heather Reed',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Jamie Ericksen',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Jana Iankova',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Jennie Hoglund',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Jessie Carlson',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'06/03/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Jordan Zavala',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Justin Fletcher',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'06/10/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Katie Dudley',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/14/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Katie Jewell',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Kayla Lochte',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Kelsey Troyer',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'08/14/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Kristen Knecht',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'05/12/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Lexie Thiery',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Manon Salvi',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'06/03/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Marci Platt',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Megan Crivelli',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Michelle Melerine',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Nicole Mastin',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Phylicia Borden',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/14/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Samantha Smith',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Sara Lininger',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Sara Worth (Sara Joy oil_ohana)',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Stephanie O\'Neill',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Taylor Babich',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/09/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Terah Belle Jones',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Tiffany Hubbard',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Travis Jones',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Vicki LaBarthe',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'06/08/2026',winEnd:'12/31/2026',is2026:true},
];

/* ════════════════════════════════════════════════════════════════════════════
   Helpers
   ════════════════════════════════════════════════════════════════════════ */
const years = [2023, 2024, 2025, 2026] as const;
const MONTHS_JAN24_MAY26: string[] = [];
for (let y = 2024; y <= 2026; y++) {
  const end = y === 2026 ? 8 : 12;
  for (let m = 1; m <= end; m++) {
    MONTHS_JAN24_MAY26.push(`${y}-${String(m).padStart(2, '0')}`);
  }
}
// Full history month keys — Jan 2023 through current 2026
const ALL_MONTHS: string[] = [];
for (let y = 2023; y <= 2026; y++) {
  const end = y === 2026 ? 8 : 12;
  for (let m = 1; m <= end; m++) {
    ALL_MONTHS.push(`${y}-${String(m).padStart(2, '0')}`);
  }
}
const MONTH_LABELS_SHORT = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtMonthLabel(key: string): string {
  const [yr, mo] = key.split('-');
  return `${MONTH_LABELS_SHORT[parseInt(mo, 10)]} '${yr.slice(2)}`;
}

function pctChange(prev: number, curr: number): string {
  if (prev === 0) return 'N/A';
  const pct = ((curr - prev) / prev) * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`;
}

function annualize(ytd: number): number {
  return Math.round(ytd * ANN);
}

/* Shared chart font config for legend */
const legendFont = { usePointStyle: true as const, padding: 16 };

/* ════════════════════════════════════════════════════════════════════════════
   Component
   ════════════════════════════════════════════════════════════════════════ */
export default function AmbassadorGrowth() {
  /* ── Computed paces ── */
  const ambPace = annualize(ambSubsYear[2026]);
  const infPace = annualize(infSubsYear[2026]);
  const combPace = annualize(combSubsYear[2026]);
  const basePace = annualize(baseByYear[2026]);
  const addsAmbPace = annualize(addsAmbYear[2026]);
  const infAddsPace = annualize(addsInfYear[2026]);
  const tenPlus2026Pace = annualize(tenPlusByYear[2026]);
  const ambSubsPace = annualize(ambSubsYear[2026]);

  /* ── Movers computation ── */
  const moverAnnFactor = ANN;
  const moversComputed = useMemo(() => {
    const entries = Object.entries(moversData).map(([name, d]) => {
      const pace = Math.round(d.y26 * moverAnnFactor);
      const pctChg = d.y25 > 0 ? ((pace - d.y25) / d.y25) * 100 : null;
      return { name, ...d, pace, pctChg };
    });
    const up = entries
      .filter(e => e.pctChg !== null && e.pctChg > 0)
      .sort((a, b) => (b.pctChg ?? 0) - (a.pctChg ?? 0))
      .slice(0, 11);
    const newEntrants = entries
      .filter(e => e.y25 === 0 && e.y26 > 0)
      .sort((a, b) => b.y26 - a.y26)
      .slice(0, 11 - up.length);
    const trendingUp = [...up, ...newEntrants].slice(0, 11);
    const down = entries
      .filter(e => e.pctChg !== null && (e.pctChg ?? 0) < 0 && e.y25 > 0)
      .sort((a, b) => (a.pctChg ?? 0) - (b.pctChg ?? 0))
      .slice(0, 11);
    return { trendingUp, trendingDown: down };
  }, []);

  /* ── Launch bonus summary ── */
  const tier1Count = launchBonusData.filter(d => d.tier >= 1).length;
  const tier2Count = launchBonusData.filter(d => d.tier >= 2).length;
  const approachingTier1 = launchBonusData.filter(d => d.tier === 0 && d.bonusSubs >= 15).length;
  const totalEarned = launchBonusData.filter(d => !d.omit).reduce((s, d) => s + d.earned, 0);
  const totalPaid = launchBonusData.filter(d => !d.omit).reduce((s, d) => s + d.paid, 0);
  const totalUnpaid = totalEarned - totalPaid;
  void LAUNCH_BONUS_PAYOUTS; // used for audit trail, referenced in CLAUDE.md

  /* ── Refs for chart plugins (stable reference pattern) ── */
  const ambOnlyLabelRef = useRef<{actual: number[]; paceVal: number}>({actual: [ambSubsYear[2023], ambSubsYear[2024], ambSubsYear[2025], ambSubsYear[2026]], paceVal: ambPace});
  ambOnlyLabelRef.current = {actual: [ambSubsYear[2023], ambSubsYear[2024], ambSubsYear[2025], ambSubsYear[2026]], paceVal: ambPace};

  /* ── Chart: 2026 Recruitment stacked bar ── */
  const recruitChartData: ChartData<'bar'> = {
    labels: recruit26.map(r => r.label),
    datasets: [
      {
        label: 'Ambassador',
        data: recruit26.map(r => r.amb),
        backgroundColor: TP.blue,
        borderRadius: 4,
      },
      {
        label: 'Influencer',
        data: recruit26.map(r => r.inf),
        backgroundColor: TP.gold,
        borderRadius: 4,
      },
    ],
  };
  const recruitChartOpts: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, padding: 16 } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  /* ── Chart: New Adds monthly stacked (Jan 2024 – Jul 2026) ── */
  const now = new Date();
  const currentMonthKey = `2026-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const isCurrentPartial = now.getFullYear() === 2026;
  const daysInCurrentMonth = isCurrentPartial ? new Date(2026, now.getMonth() + 1, 0).getDate() : 31;
  const daysElapsed = isCurrentPartial ? Math.max(now.getDate(), 1) : daysInCurrentMonth;
  const paceFactor = daysInCurrentMonth / daysElapsed;
  const lastIdx26 = MONTHS_JAN24_MAY26.length - 1;
  const curAmbActual = newAddsAmb[currentMonthKey] ?? 0;
  const curInfActual = newAddsInf[currentMonthKey] ?? 0;
  const curAmbProj = Math.round(curAmbActual * paceFactor);
  const curInfProj = Math.round(curInfActual * paceFactor);

  const newAddsChartData: ChartData<'bar'> = {
    labels: MONTHS_JAN24_MAY26.map(fmtMonthLabel),
    datasets: [
      {
        label: 'Projected',
        data: MONTHS_JAN24_MAY26.map((_, i) => i === lastIdx26 ? curAmbProj + curInfProj : 0),
        backgroundColor: MONTHS_JAN24_MAY26.map((_, i) => i === lastIdx26 ? TP.blue + '20' : 'transparent'),
        borderColor: MONTHS_JAN24_MAY26.map((_, i) => i === lastIdx26 ? TP.blue + '40' : 'transparent'),
        borderWidth: 1,
        borderRadius: 4,
        stack: 'projected',
        barPercentage: 1.0,
        categoryPercentage: 0.85,
      },
      {
        label: 'Ambassador',
        data: MONTHS_JAN24_MAY26.map(k => newAddsAmb[k] ?? 0),
        backgroundColor: TP.blue,
        borderRadius: 4,
        stack: 'actual',
      },
      {
        label: 'Influencer',
        data: MONTHS_JAN24_MAY26.map(k => newAddsInf[k] ?? 0),
        backgroundColor: TP.gold,
        borderRadius: 4,
        stack: 'actual',
      },
    ],
  };
  const newAddsChartOpts: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 16,
          filter: (item: { text: string }) => item.text !== 'Projected',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          afterBody: (items: any[]) => {
            if (items[0]?.dataIndex === lastIdx26) {
              return `Projected full month: ${curAmbProj + curInfProj} (${curAmbProj} amb + ${curInfProj} inf)`;
            }
            return '';
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (ctx: any) => {
            if (ctx.dataset.label === 'Projected') return '';
            return `${ctx.dataset.label}: ${ctx.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: { stacked: true, ticks: { maxRotation: 45, font: { size: 10 } } },
      y: { stacked: true, beginAtZero: true },
    },
  };

  /* ── Chart: Channel YOY grouped bar ── */
  const channelChartData: ChartData<'bar'> = {
    labels: ['2023', '2024', '2025', '2026'],
    datasets: [
      {
        label: 'Influencer',
        data: [infSubsYear[2023], infSubsYear[2024], infSubsYear[2025], infSubsYear[2026]],
        backgroundColor: TP.teal,
        borderRadius: 4,
      },
      {
        label: 'Ambassador',
        data: [ambSubsYear[2023], ambSubsYear[2024], ambSubsYear[2025], ambSubsYear[2026]],
        backgroundColor: TP.blue,
        borderRadius: 4,
      },
    ],
  };
  const channelShadowPlugin: Plugin<'bar'> = useMemo(() => ({
    id: 'channelShadow',
    beforeDatasetsDraw(chart) {
      const ctx = chart.ctx;
      const yScale = chart.scales.y;
      const bottom = yScale.getPixelForValue(0);
      [0, 1].forEach((di) => {
        const meta = chart.getDatasetMeta(di);
        const bar = meta.data[3];
        if (!bar) return;
        const paceVal = di === 0 ? infPace : ambPace;
        const label = di === 0 ? 'Inf' : 'Amb';
        const top = yScale.getPixelForValue(paceVal);
        const { x, width } = bar as unknown as { x: number; width: number };
        const color = di === 0 ? TP.teal : TP.blue;
        ctx.save();
        ctx.fillStyle = color + '25';
        ctx.strokeStyle = color + '70';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.rect(x - width / 2, top, width, bottom - top);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = TP.navy;
        ctx.font = '700 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${label} pace: ~${paceVal.toLocaleString()}`, x, top - 6);
        ctx.restore();
      });
    },
  }), [infPace, ambPace]);
  const channelChartOpts: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, padding: 16 } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  /* ── Chart: Base Program stacked bar ── */
  const baseChartData: ChartData<'bar'> = {
    labels: ['2023', '2024', '2025', '2026'],
    datasets: [
      {
        label: 'Base Program',
        data: [baseByYear[2023], baseByYear[2024], baseByYear[2025], baseByYear[2026]],
        backgroundColor: TP.blue,
        borderRadius: 4,
      },
      {
        label: 'Mega-3',
        data: [mega3ByYear[2023], mega3ByYear[2024], mega3ByYear[2025], mega3ByYear[2026]],
        backgroundColor: TP.gold,
        borderRadius: 4,
      },
    ],
  };
  const baseShadowPlugin: Plugin<'bar'> = useMemo(() => ({
    id: 'baseShadow',
    afterDatasetsDraw(chart) {
      const ctx = chart.ctx;
      const yScale = chart.scales.y;
      const projTotal = basePace + Math.round(mega3ByYear[2026] * ANN);
      const actualTotal = baseByYear[2026] + mega3ByYear[2026];
      // Get the 2026 bar position from dataset 0 (index 3 = 4th bar)
      const meta = chart.getDatasetMeta(0);
      const bar = meta.data[3];
      if (!bar) return;
      const { x, width } = bar as unknown as { x: number; width: number };
      const projTop = yScale.getPixelForValue(projTotal);
      const actualTop = yScale.getPixelForValue(actualTotal);
      // Draw dashed box only for the projected portion (above actual)
      ctx.save();
      ctx.fillStyle = TP.navy + '15';
      ctx.strokeStyle = TP.navy + '50';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.rect(x - width / 2, projTop, width, actualTop - projTop);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = TP.navy;
      ctx.font = '700 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Full-year pace: ~${projTotal.toLocaleString()}`, x, projTop - 6);
      ctx.restore();
    },
  }), [basePace]);
  const baseChartOpts: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, padding: 16 } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  /* ── Chart: Ambassador-Only bar with custom labels ── */
  const ambOnlyChartData: ChartData<'bar'> = {
    labels: ['2023', '2024', '2025', '2026'],
    datasets: [
      {
        label: 'Ambassador Submissions',
        data: [ambSubsYear[2023], ambSubsYear[2024], ambSubsYear[2025], ambSubsYear[2026]],
        backgroundColor: [TP.blue, TP.blue, TP.blue, TP.blue],
        borderRadius: 4,
      },
      {
        label: '2026 Projected',
        data: [0, 0, 0, ambPace - ambSubsYear[2026]],
        backgroundColor: [TP.blue + '00', TP.blue + '00', TP.blue + '00', TP.blue + '40'],
        borderRadius: 4,
      },
    ],
  };
  const ambOnlyLabelPlugin: Plugin<'bar'> = useMemo(() => ({
    id: 'ambOnlyLabels',
    afterDraw(chart) {
      const ctx = chart.ctx;
      const ref = ambOnlyLabelRef.current;
      ctx.save();
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = TP.navy;
      ctx.textAlign = 'center';
      const meta0 = chart.getDatasetMeta(0);
      const meta1 = chart.getDatasetMeta(1);
      for (let i = 0; i < 4; i++) {
        const bar0 = meta0.data[i];
        const bar1 = meta1.data[i];
        if (i < 3) {
          ctx.fillText(String(ref.actual[i]), bar0.x, bar0.y - 8);
        } else {
          const topY = Math.min(bar0.y, bar1.y);
          ctx.fillText(`${ref.actual[3]} YTD`, bar0.x, topY - 22);
          ctx.fillStyle = TP.blue + 'A0';
          ctx.fillText(`Full-year pace: ~${ref.paceVal.toLocaleString()}`, bar0.x, topY - 6);
          ctx.fillStyle = TP.navy;
        }
      }
      ctx.restore();
    },
  }), []);
  const ambOnlyChartOpts: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  /* ── Styles ── */
  const sectionHeader: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: TP.navy,
    marginBottom: '0.25rem',
  };
  const sectionSub: React.CSSProperties = {
    fontSize: '0.875rem',
    color: '#666',
    marginBottom: '1.5rem',
    lineHeight: 1.5,
  };
  const card: React.CSSProperties = {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    padding: '1.25rem',
  };
  const statCard = (borderColor: string): React.CSSProperties => ({
    ...card,
    borderTop: `4px solid ${borderColor}`,
    textAlign: 'center' as const,
  });
  const chartWrap: React.CSSProperties = {
    ...card,
    padding: '1.5rem',
  };
  const gridRow = (cols: number): React.CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '1rem',
  });

  const concMax = 9;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ════════ SECTION 1: Ambassador Recruitment — 2026 ════════ */}
      <div>
        <h3 style={sectionHeader}>Ambassador Recruitment — 2026</h3>
        <p style={sectionSub}>Monthly new adds for the current year.</p>

        <div style={{ ...gridRow(6), marginBottom: '1.5rem' }}>
          {recruit26.map(r => {
            const total = r.amb + r.inf;
            const hasTag = 'tag' in r && r.tag;
            return (
              <div key={r.label} style={{
                ...card,
                borderTop: `4px solid ${r.accent}`,
                textAlign: 'center',
                position: 'relative',
              }}>
                {hasTag && (
                  <span style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: TP.purple,
                    color: '#fff',
                    fontSize: '0.6rem',
                    padding: '2px 6px',
                    borderRadius: 8,
                    fontWeight: 600,
                  }}>{r.tag}</span>
                )}
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: TP.navy }}>{r.label}</div>
                <div style={{ fontSize: '0.65rem', color: TP.purple, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>NEW ADDS</div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: TP.navy, margin: '0.25rem 0' }}>{total}</div>
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.75rem', color: '#666' }}>
                    <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: TP.blue, marginRight: 4, verticalAlign: 'middle' }} />AMB {r.amb}</span>
                    <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: TP.gold, marginRight: 4, verticalAlign: 'middle' }} />INF {r.inf}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={chartWrap}>
          <div style={{ height: 280 }}>
            <Bar data={recruitChartData} options={recruitChartOpts} />
          </div>
        </div>
      </div>

      {/* ════════ SECTION 3: New Ambassadors Added Per Month ════════ */}
      <div>
        <h3 style={sectionHeader}>New Ambassadors Added Per Month</h3>
        <p style={sectionSub}>Yearly totals and monthly breakdown of ambassador and influencer onboarding.</p>

        <div style={{ ...gridRow(4), marginBottom: '1.5rem' }}>
          {years.map(y => {
            const total = addsTotalYear[y];
            const amb = addsAmbYear[y];
            const inf = addsInfYear[y];
            const isPace = y === 2026;
            return (
              <div key={y} style={statCard(TP.blue)}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666' }}>{y}{isPace ? ' YTD' : ''}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: TP.navy }}>{total}</div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>
                  {amb} amb / {inf} inf
                </div>
                {isPace && (
                  <div style={{ fontSize: '0.7rem', color: TP.purple, fontWeight: 600, marginTop: 4 }}>
                    Pace: ~{annualize(total)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={chartWrap}>
          <div style={{ height: 320 }}>
            <Bar data={newAddsChartData} options={newAddsChartOpts} />
          </div>
        </div>
      </div>

      {/* ════════ SECTION 4: Submissions by Channel — Year Over Year ════════ */}
      <div>
        <h3 style={sectionHeader}>Submissions by Channel — Year Over Year</h3>
        <p style={sectionSub}>Comparing influencer and ambassador submission volume across years.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Influencer card */}
          <div style={{ ...card, borderTop: `4px solid ${TP.teal}` }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: TP.navy, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Influencers</h4>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '4px 0', color: '#888' }}>Year</th>
                  <th style={{ textAlign: 'right', padding: '4px 0', color: '#888' }}>Submissions</th>
                  <th style={{ textAlign: 'right', padding: '4px 0', color: '#888' }}>New Adds</th>
                </tr>
              </thead>
              <tbody>
                {years.map(y => (
                  <tr key={y} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px 0', fontWeight: 600, color: TP.navy }}>{y}{y === 2026 ? ' YTD' : ''}</td>
                    <td style={{ textAlign: 'right', padding: '6px 0', color: '#444' }}>{infSubsYear[y].toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '6px 0', color: '#444' }}>{addsInfYear[y]}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid #e5e7eb', background: '#f9fafb' }}>
                  <td style={{ padding: '6px 0', fontWeight: 700, color: TP.purple }}>2026 Pace</td>
                  <td style={{ textAlign: 'right', padding: '6px 0', fontWeight: 700, color: TP.purple }}>~{infPace.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', padding: '6px 0', fontWeight: 700, color: TP.purple }}>~{infAddsPace}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Ambassador card */}
          <div style={{ ...card, borderTop: `4px solid ${TP.blue}` }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: TP.navy, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Ambassadors</h4>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '4px 0', color: '#888' }}>Year</th>
                  <th style={{ textAlign: 'right', padding: '4px 0', color: '#888' }}>Submissions</th>
                  <th style={{ textAlign: 'right', padding: '4px 0', color: '#888' }}>New Adds</th>
                </tr>
              </thead>
              <tbody>
                {years.map(y => (
                  <tr key={y} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px 0', fontWeight: 600, color: TP.navy }}>{y}{y === 2026 ? ' YTD' : ''}</td>
                    <td style={{ textAlign: 'right', padding: '6px 0', color: '#444' }}>{ambSubsYear[y].toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '6px 0', color: '#444' }}>{addsAmbYear[y]}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid #e5e7eb', background: '#f9fafb' }}>
                  <td style={{ padding: '6px 0', fontWeight: 700, color: TP.purple }}>2026 Pace</td>
                  <td style={{ textAlign: 'right', padding: '6px 0', fontWeight: 700, color: TP.purple }}>~{ambPace.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', padding: '6px 0', fontWeight: 700, color: TP.purple }}>~{addsAmbPace}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={chartWrap}>
          <div style={{ height: 320 }}>
            <Bar data={channelChartData} options={channelChartOpts} plugins={[channelShadowPlugin]} />
          </div>
        </div>
      </div>

      {/* ════════ SECTION 4B: Monthly History — Influencer vs Ambassador ════════ */}
      <div>
        <h3 style={sectionHeader}>Monthly Referral History</h3>
        <p style={sectionSub}>Month-by-month submission volume for each channel since the program started.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Influencer monthly */}
          <div style={chartWrap}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: TP.navy, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Influencer — Monthly Submissions
            </h4>
            <div style={{ height: 260 }}>
              <Bar
                data={{
                  labels: ALL_MONTHS.map(fmtMonthLabel),
                  datasets: [{
                    label: 'Influencer Submissions',
                    data: ALL_MONTHS.map(k => infSubs[k] ?? 0),
                    backgroundColor: ALL_MONTHS.map(k => {
                      const y = parseInt(k.split('-')[0]);
                      return y === 2026 ? TP.teal : y === 2025 ? TP.teal + 'B0' : y === 2024 ? TP.teal + '80' : TP.teal + '50';
                    }),
                    borderRadius: 2,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false },
                  },
                  scales: {
                    x: { ticks: { maxRotation: 90, font: { size: 8 }, callback: function(_, i) { const k = ALL_MONTHS[i]; return k?.endsWith('-01') ? k?.split('-')[0] : ''; } } },
                    y: { beginAtZero: true, title: { display: true, text: 'Submissions', font: { size: 10 } } },
                  },
                } satisfies ChartOptions<'bar'>}
              />
            </div>
          </div>

          {/* Ambassador monthly */}
          <div style={chartWrap}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: TP.navy, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Ambassador — Monthly Submissions
            </h4>
            <div style={{ height: 260 }}>
              <Bar
                data={{
                  labels: ALL_MONTHS.map(fmtMonthLabel),
                  datasets: [{
                    label: 'Ambassador Submissions',
                    data: ALL_MONTHS.map(k => ambSubs[k] ?? 0),
                    backgroundColor: ALL_MONTHS.map(k => {
                      const y = parseInt(k.split('-')[0]);
                      return y === 2026 ? TP.blue : y === 2025 ? TP.blue + 'B0' : y === 2024 ? TP.blue + '80' : TP.blue + '50';
                    }),
                    borderRadius: 2,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false },
                  },
                  scales: {
                    x: { ticks: { maxRotation: 90, font: { size: 8 }, callback: function(_, i) { const k = ALL_MONTHS[i]; return k?.endsWith('-01') ? k?.split('-')[0] : ''; } } },
                    y: { beginAtZero: true, title: { display: true, text: 'Submissions', font: { size: 10 } } },
                  },
                } satisfies ChartOptions<'bar'>}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ════════ SECTION 5: Base Program Without Viral Spikes ════════ */}
      <div>
        <h3 style={sectionHeader}>Base Program Without Viral Spikes</h3>
        <p style={sectionSub}>
          Lauren Johnson (NNM), Kendra Needham, and Ginny Yurich have produced viral moments that inflate yearly totals. Removing those three mega-influencers shows the true underlying program trajectory.
        </p>

        <div style={{ ...gridRow(4), marginBottom: '1.5rem' }}>
          {years.map((y, i) => {
            const val = baseByYear[y];
            const isPace = y === 2026;
            const yoy = i > 0 ? pctChange(baseByYear[years[i - 1]], val) : null;
            const yoyPace = isPace ? pctChange(baseByYear[2025], basePace) : null;
            return (
              <div key={y} style={statCard(isPace ? TP.purple : TP.blue)}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666' }}>{y}{isPace ? ' YTD' : ''}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: TP.navy }}>{val.toLocaleString()}</div>
                {yoy && !isPace && (
                  <div style={{ fontSize: '0.7rem', color: val > baseByYear[years[i - 1]] ? '#16a34a' : TP.red, fontWeight: 600 }}>
                    {yoy} vs {years[i - 1]}
                  </div>
                )}
                {isPace && (
                  <div style={{ fontSize: '0.7rem', color: TP.purple, fontWeight: 600, marginTop: 4 }}>
                    Pace: ~{basePace.toLocaleString()} ({yoyPace} vs 2025)
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={chartWrap}>
          <div style={{ height: 320 }}>
            <Bar data={baseChartData} options={baseChartOpts} plugins={[baseShadowPlugin]} />
          </div>
        </div>
      </div>

      {/* ════════ SECTION 5b: Ambassador-Only Submissions ════════ */}
      <div>
        <h3 style={sectionHeader}>Ambassador-Only Submissions</h3>
        <p style={sectionSub}>Submissions driven by Airway Ambassadors only (excludes influencer channel).</p>

        <div style={{ ...gridRow(4), marginBottom: '1.5rem' }}>
          {years.map((y, i) => {
            const val = ambSubsYear[y];
            const isPace = y === 2026;
            return (
              <div key={y} style={statCard(TP.blue)}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666' }}>{y}{isPace ? ' YTD' : ''}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: TP.navy }}>{val}</div>
                {i > 0 && !isPace && (
                  <div style={{ fontSize: '0.7rem', color: val > ambSubsYear[years[i - 1]] ? '#16a34a' : TP.red, fontWeight: 600 }}>
                    {pctChange(ambSubsYear[years[i - 1]], val)} vs {years[i - 1]}
                  </div>
                )}
                {isPace && (
                  <div style={{ fontSize: '0.7rem', color: TP.purple, fontWeight: 600, marginTop: 4 }}>
                    Pace: ~{ambPace}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={chartWrap}>
          <div style={{ height: 320 }}>
            <Bar data={ambOnlyChartData} options={ambOnlyChartOpts} plugins={[ambOnlyLabelPlugin]} />
          </div>
        </div>
      </div>

      {/* ════════ SECTION 5c: Active Ambassadors Per Year ════════ */}
      <div>
        <h3 style={sectionHeader}>Active Ambassadors Per Year</h3>
        <p style={sectionSub}>Ambassadors with at least 1 submission in the given year. 2026 is YTD through August.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '1rem' }}>
          {([2023, 2024, 2025, 2026] as const).map((y) => {
            const total = activeTotalByYear[y];
            const inf = activeInfByYear[y];
            const amb = activeAmbByYear[y];
            const label = y === 2026 ? '2026 YTD' : String(y);
            const prev = y > 2023 ? activeTotalByYear[(y - 1) as 2023 | 2024 | 2025 | 2026] : 0;
            const yoyPct = prev > 0 ? Math.round(((total - prev) / prev) * 100) : 0;
            const yoyColor = yoyPct >= 0 ? TP.teal : TP.red;
            return (
              <div key={y} style={{ background: '#fff', borderRadius: 12, padding: '1.125rem', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', textAlign: 'center', borderTop: `3px solid ${TP.blue}` }}>
                <div style={{ fontSize: '0.78rem', color: '#888', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: TP.navy }}>{total}</div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 4 }}>{inf} inf · {amb} amb</div>
                {y > 2023 && y < 2026 && (
                  <div style={{ fontSize: '0.78rem', color: yoyColor, marginTop: 4, fontWeight: 600 }}>
                    {yoyPct >= 0 ? '+' : ''}{yoyPct}% vs {y - 1}
                  </div>
                )}
                {y === 2026 && (
                  <div style={{ fontSize: '0.78rem', color: TP.teal, marginTop: 4, fontWeight: 600 }}>
                    Pace: ~{Math.round(total * ANN)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bar chart — projection shown as shadow overlay on 2026 bar */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
          <div style={{ height: 280 }}>
            <Bar
              data={{
                labels: ['2023', '2024', '2025', '2026'],
                datasets: [
                  {
                    label: 'Influencer',
                    data: [activeInfByYear[2023], activeInfByYear[2024], activeInfByYear[2025], activeInfByYear[2026]],
                    backgroundColor: TP.teal,
                    borderRadius: 4,
                  },
                  {
                    label: 'Ambassador',
                    data: [activeAmbByYear[2023], activeAmbByYear[2024], activeAmbByYear[2025], activeAmbByYear[2026]],
                    backgroundColor: TP.blue,
                    borderRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                    labels: { usePointStyle: true, padding: 16, font: { size: 12 } },
                  },
                  tooltip: { mode: 'index' as const, intersect: false },
                },
                scales: {
                  x: { stacked: true },
                  y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Active Ambassadors', font: { size: 11 } } },
                },
              } satisfies ChartOptions<'bar'>}
              plugins={[{
                id: 'projectedShadow',
                beforeDatasetsDraw(chart) {
                  const meta = chart.getDatasetMeta(0);
                  const bar2026 = meta.data[3];
                  if (!bar2026) return;
                  const projTotal = Math.round(activeInfByYear[2026] * ANN) + Math.round(activeAmbByYear[2026] * ANN);
                  const yScale = chart.scales.y;
                  const projTop = yScale.getPixelForValue(projTotal);
                  const projBottom = yScale.getPixelForValue(0);
                  const { x, width } = bar2026 as unknown as { x: number; width: number };
                  const ctx = chart.ctx;
                  ctx.save();
                  ctx.fillStyle = TP.navy + '20';
                  ctx.strokeStyle = TP.navy + '60';
                  ctx.lineWidth = 2;
                  ctx.setLineDash([6, 3]);
                  const r = 4;
                  const left = x - width / 2;
                  ctx.beginPath();
                  ctx.moveTo(left + r, projTop);
                  ctx.lineTo(left + width - r, projTop);
                  ctx.quadraticCurveTo(left + width, projTop, left + width, projTop + r);
                  ctx.lineTo(left + width, projBottom);
                  ctx.lineTo(left, projBottom);
                  ctx.lineTo(left, projTop + r);
                  ctx.quadraticCurveTo(left, projTop, left + r, projTop);
                  ctx.closePath();
                  ctx.fill();
                  ctx.stroke();
                  // Label
                  ctx.setLineDash([]);
                  ctx.fillStyle = TP.navy;
                  ctx.font = '700 12px system-ui, sans-serif';
                  ctx.textAlign = 'center';
                  ctx.fillText(`Full-year pace: ~${projTotal.toLocaleString()}`, x, projTop - 7);
                  ctx.restore();
                },
              } satisfies Plugin<'bar'>]}
            />
          </div>
        </div>

      </div>

      {/* ════════ SECTION 6: Ambassador Program Health ════════ */}
      <div>
        <h3 style={sectionHeader}>Ambassador Program Health</h3>
        <p style={sectionSub}>Measuring concentration risk and depth of the active producer base.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* LEFT: People needed to reach 50% */}
          <div style={card}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: TP.navy, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              People needed to reach 50%
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {concRows.map(row => {
                const pct = (row.n / concMax) * 100;
                return (
                  <div key={row.y}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: TP.navy, fontSize: '0.85rem' }}>{row.y}</span>
                      <span style={{ fontWeight: 800, color: TP.navy, fontSize: '1.1rem' }}>{row.n}</span>
                    </div>
                    <div style={{ background: '#f3f4f6', borderRadius: 6, height: 20, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.max(pct, 8)}%`,
                        background: row.color,
                        borderRadius: 6,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 3 }}>{row.names}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Ambassadors with 10+ submissions */}
          <div style={card}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: TP.navy, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              Ambassadors with 10+ submissions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {years.map(y => {
                const val = tenPlusByYear[y];
                const maxVal = Math.max(...years.map(yr => yr === 2026 ? tenPlus2026Pace : tenPlusByYear[yr]));
                const pct = (val / maxVal) * 100;
                const pacePct = y === 2026 ? (tenPlus2026Pace / maxVal) * 100 : 0;
                const barColors: Record<number, string> = { 2023: TP.gold, 2024: TP.teal, 2025: TP.blue, 2026: TP.blue };
                return (
                  <div key={y}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: TP.navy, fontSize: '0.85rem' }}>{y}</span>
                      <span style={{ fontWeight: 800, color: TP.navy, fontSize: '1.1rem' }}>{val}</span>
                    </div>
                    <div style={{ position: 'relative', background: '#f3f4f6', borderRadius: 6, height: 20, overflow: 'hidden' }}>
                      {y === 2026 && (
                        <div style={{
                          position: 'absolute',
                          height: '100%',
                          width: `${Math.max(pacePct, 8)}%`,
                          background: barColors[y] + '40',
                          borderRadius: 6,
                        }} />
                      )}
                      <div style={{
                        position: 'relative',
                        height: '100%',
                        width: `${Math.max(pct, 8)}%`,
                        background: barColors[y],
                        borderRadius: 6,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 12 }}>
              Solid = {tenPlusByYear[2026]} YTD · Faded = ~{tenPlus2026Pace} projected pace
            </div>
          </div>
        </div>
      </div>

      {/* ════════ SECTION 6b: Individual Ambassador Performance vs 2025 ════════ */}
      <div>
        <h3 style={sectionHeader}>Individual Ambassador Performance vs 2025</h3>
        <p style={sectionSub}>Top movers in each direction based on annualized 2026 pace compared to full-year 2025.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Trending Up */}
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ background: '#16a34a', color: '#fff', padding: '0.75rem 1.25rem', fontWeight: 700, fontSize: '0.85rem' }}>
              Trending Up vs 2025
            </div>
            <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0fdf4', borderBottom: '2px solid #d1fae5' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#166534' }}>Name</th>
                  <th style={{ textAlign: 'right', padding: '8px 8px', color: '#166534' }}>2025</th>
                  <th style={{ textAlign: 'right', padding: '8px 8px', color: '#166534' }}>YTD</th>
                  <th style={{ textAlign: 'right', padding: '8px 8px', color: '#166534' }}>Pace</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: '#166534' }}>vs 25</th>
                </tr>
              </thead>
              <tbody>
                {moversComputed.trendingUp.map((m, i) => (
                  <tr key={m.name} style={{ background: i % 2 === 0 ? '#f0fdf4' : '#fff', borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '6px 12px', fontWeight: 600, color: TP.navy }}>
                      {m.name}
                      <span style={{ marginLeft: 6, fontSize: '0.6rem', color: m.type === 'Inf' ? TP.teal : TP.blue, fontWeight: 700 }}>
                        {m.type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '6px 8px', color: '#444' }}>{m.y25}</td>
                    <td style={{ textAlign: 'right', padding: '6px 8px', color: '#444' }}>{m.y26}</td>
                    <td style={{ textAlign: 'right', padding: '6px 8px', color: '#444' }}>{m.pace}</td>
                    <td style={{ textAlign: 'right', padding: '6px 12px', fontWeight: 700, color: '#16a34a' }}>
                      {m.y25 === 0 ? 'New' : `+${Math.round(m.pctChg ?? 0)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Trending Down */}
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ background: TP.red, color: '#fff', padding: '0.75rem 1.25rem', fontWeight: 700, fontSize: '0.85rem' }}>
              Trending Down vs 2025
            </div>
            <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fef2f2', borderBottom: '2px solid #fecaca' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#991b1b' }}>Name</th>
                  <th style={{ textAlign: 'right', padding: '8px 8px', color: '#991b1b' }}>2025</th>
                  <th style={{ textAlign: 'right', padding: '8px 8px', color: '#991b1b' }}>YTD</th>
                  <th style={{ textAlign: 'right', padding: '8px 8px', color: '#991b1b' }}>Pace</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: '#991b1b' }}>vs 25</th>
                </tr>
              </thead>
              <tbody>
                {moversComputed.trendingDown.map((m, i) => (
                  <tr key={m.name} style={{ background: i % 2 === 0 ? '#fef2f2' : '#fff', borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '6px 12px', fontWeight: 600, color: TP.navy }}>
                      {m.name}
                      <span style={{ marginLeft: 6, fontSize: '0.6rem', color: m.type === 'Inf' ? TP.teal : TP.blue, fontWeight: 700 }}>
                        {m.type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '6px 8px', color: '#444' }}>{m.y25}</td>
                    <td style={{ textAlign: 'right', padding: '6px 8px', color: '#444' }}>{m.y26}</td>
                    <td style={{ textAlign: 'right', padding: '6px 8px', color: '#444' }}>{m.pace}</td>
                    <td style={{ textAlign: 'right', padding: '6px 12px', fontWeight: 700, color: TP.red }}>
                      {Math.round(m.pctChg ?? 0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 8, textAlign: 'center' }}>
          Annualization factor: 12 / {_monthsElapsed.toFixed(1)} = {moverAnnFactor.toFixed(2)}x. Pace = YTD x {moverAnnFactor.toFixed(2)}. &quot;New&quot; = no 2025 submissions on record.
        </div>
      </div>

      {/* ════════ SECTION 6c: Top Producers — 3 Year History ════════ */}
      <div>
        <h3 style={sectionHeader}>Top Producers — 3 Year History</h3>
        <p style={sectionSub}>
          The top 5 producers dropped by {((1 - TOP5_CONCENTRATION[2].top5 * ANN / TOP5_CONCENTRATION[0].top5) * 100).toFixed(0)}% (annualized) from 2024 to 2026.
          But the rest of the program grew — more producers contributing, less concentration risk.
        </p>

        {/* KPI cards — the headline numbers */}
        <div style={{ ...gridRow(4), marginBottom: '1.5rem' }}>
          <div style={statCard(TP.red)}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Top 5 Drop</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: TP.red }}>
              {TOP5_CONCENTRATION[0].top5.toLocaleString()} → ~{Math.round(TOP5_CONCENTRATION[2].top5 * ANN).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: TP.red, fontWeight: 600 }}>
              {((1 - TOP5_CONCENTRATION[2].top5 * ANN / TOP5_CONCENTRATION[0].top5) * -100).toFixed(0)}% annualized 2024→2026
            </div>
          </div>
          <div style={statCard(TP.teal)}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Base (Rest) Growth</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: TP.teal }}>
              {TOP5_CONCENTRATION[0].rest.toLocaleString()} → ~{Math.round(TOP5_CONCENTRATION[2].rest * ANN).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>
              +{((TOP5_CONCENTRATION[2].rest * ANN / TOP5_CONCENTRATION[0].rest - 1) * 100).toFixed(0)}% annualized 2024→2026
            </div>
          </div>
          <div style={statCard(TP.blue)}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Active Producers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: TP.blue }}>
              {activeTotalByYear[2024]} → {activeTotalByYear[2026]}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>
              +{((activeTotalByYear[2026] / activeTotalByYear[2024] - 1) * 100).toFixed(0)}% more producers
            </div>
          </div>
          <div style={statCard(TP.gold)}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Top 5 Share</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: TP.navy }}>
              {TOP5_CONCENTRATION[0].top5Pct}% → {TOP5_CONCENTRATION[2].top5Pct}%
            </div>
            <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>
              Concentration cut nearly in half
            </div>
          </div>
        </div>

        {/* Stacked bar chart — Top 5 vs Rest */}
        <div style={chartWrap}>
          <div style={{ height: 320 }}>
            <Bar
              data={{
                labels: TOP5_CONCENTRATION.map(r => r.year === 2026 ? `2026 (ann.)` : String(r.year)),
                datasets: [
                  {
                    label: 'Top 5 Producers',
                    data: TOP5_CONCENTRATION.map(r => r.year === 2026 ? Math.round(r.top5 * ANN) : r.top5),
                    backgroundColor: TP.red + 'CC',
                    borderRadius: 4,
                  },
                  {
                    label: 'Rest of Program',
                    data: TOP5_CONCENTRATION.map(r => r.year === 2026 ? Math.round(r.rest * ANN) : r.rest),
                    backgroundColor: TP.teal,
                    borderRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', labels: { usePointStyle: true, padding: 16 } },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                      afterBody: (items) => {
                        const total = items.reduce((s, i) => s + (i.raw as number), 0);
                        return `Total: ${total.toLocaleString()}`;
                      },
                    },
                  },
                },
                scales: {
                  x: { stacked: true },
                  y: { stacked: true, beginAtZero: true, ticks: { callback: (v) => Number(v).toLocaleString() } },
                },
              }}
              plugins={[{
                id: 'stackedTotalLabel',
                afterDatasetsDraw(chart) {
                  const ctx = chart.ctx;
                  const meta0 = chart.getDatasetMeta(0);
                  const meta1 = chart.getDatasetMeta(1);
                  ctx.save();
                  ctx.font = 'bold 13px system-ui';
                  ctx.textAlign = 'center';
                  ctx.fillStyle = TP.navy;
                  for (let i = 0; i < meta1.data.length; i++) {
                    const bar = meta1.data[i];
                    const v0 = chart.data.datasets[0].data[i] as number;
                    const v1 = chart.data.datasets[1].data[i] as number;
                    ctx.fillText((v0 + v1).toLocaleString(), bar.x, bar.y - 6);
                  }
                  // Draw rest % inside teal bar
                  ctx.font = 'bold 12px system-ui';
                  ctx.fillStyle = '#fff';
                  for (let i = 0; i < meta1.data.length; i++) {
                    const el1 = meta1.data[i];
                    const bar1 = el1 as unknown as {x:number; y:number; height:number; base:number};
                    const v0 = chart.data.datasets[0].data[i] as number;
                    const v1 = chart.data.datasets[1].data[i] as number;
                    const pct = ((v1 / (v0 + v1)) * 100).toFixed(0);
                    const midY = (bar1.y + bar1.base) / 2;
                    if (bar1.base - bar1.y > 20) {
                      ctx.fillText(`${pct}%`, bar1.x, midY + 4);
                    }
                  }
                  // Draw top5 % inside red bar
                  for (let i = 0; i < meta0.data.length; i++) {
                    const el0 = meta0.data[i];
                    const bar0 = el0 as unknown as {x:number; y:number; height:number; base:number};
                    const v0 = chart.data.datasets[0].data[i] as number;
                    const v1 = chart.data.datasets[1].data[i] as number;
                    const pct = ((v0 / (v0 + v1)) * 100).toFixed(0);
                    const midY = (bar0.y + bar0.base) / 2;
                    if (bar0.base - bar0.y > 20) {
                      ctx.fillText(`${pct}%`, bar0.x, midY + 4);
                    }
                  }
                  ctx.restore();
                },
              }]}
            />
          </div>
          <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 8, textAlign: 'center' }}>
            2026 annualized at {ANN.toFixed(2)}x. The base grew {((TOP5_CONCENTRATION[1].rest / TOP5_CONCENTRATION[0].rest - 1) * 100).toFixed(0)}% from 2024→2025 even as top 5 dropped {((1 - TOP5_CONCENTRATION[1].top5 / TOP5_CONCENTRATION[0].top5) * 100).toFixed(0)}%.
          </div>
        </div>

        {/* Concentration bars */}
        <div style={{ ...card, marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: TP.navy, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Top 5 Concentration — Declining
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {TOP5_CONCENTRATION.map(row => (
              <div key={row.year}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: TP.navy, fontSize: '0.85rem' }}>{row.year}{row.year === 2026 ? ' YTD' : ''}</span>
                  <span style={{ fontSize: '0.75rem', color: '#666' }}>{row.names}</span>
                </div>
                <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 28 }}>
                  <div style={{
                    width: `${row.top5Pct}%`,
                    background: TP.red + 'CC',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '0.7rem', fontWeight: 700, minWidth: 60,
                  }}>
                    Top 5: {row.top5Pct}%
                  </div>
                  <div style={{
                    width: `${row.restPct}%`,
                    background: TP.teal,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '0.7rem', fontWeight: 700, minWidth: 60,
                  }}>
                    Rest: {row.restPct}%
                  </div>
                </div>
                <div style={{ fontSize: '0.65rem', color: '#999', marginTop: 2 }}>
                  Top 5: {row.top5.toLocaleString()} · Rest: {row.rest.toLocaleString()} · Total: {row.total.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 producers by month — stacked bar chart */}
        <div style={{ ...card, marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: TP.navy, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            Top 3 Producers by Month
          </h4>
          <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: 16 }}>
            Who drove the Influencer + Ambassador line each month. Hover for names. Aug 2026 = 20 days.
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: '0.7rem', color: '#666' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: TP.blue, display: 'inline-block' }} />#1</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: TP.gold, display: 'inline-block' }} />#2</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: TP.teal, display: 'inline-block' }} />#3</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#e5e7eb', display: 'inline-block' }} />Everyone else</span>
          </div>
          <div style={{ position: 'relative', height: 320 }}>
            <Bar
              data={{
                labels: TOP3_MONTHLY.map(d => d.label),
                datasets: [
                  { label: 'Everyone else', data: TOP3_MONTHLY.map(d => d.rest), backgroundColor: '#e5e7eb', borderRadius: 0 },
                  { label: '#3', data: TOP3_MONTHLY.map(d => d.p3.count), backgroundColor: TP.teal, borderRadius: 0 },
                  { label: '#2', data: TOP3_MONTHLY.map(d => d.p2.count), backgroundColor: TP.gold, borderRadius: 0 },
                  { label: '#1', data: TOP3_MONTHLY.map(d => d.p1.count), backgroundColor: TP.blue, borderRadius: { topLeft: 3, topRight: 3, bottomLeft: 0, bottomRight: 0 } as unknown as number },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    stacked: true,
                    ticks: { font: { size: 9 }, maxRotation: 45, minRotation: 0 },
                    grid: { display: false },
                  },
                  y: {
                    stacked: true,
                    title: { display: true, text: 'Submissions', font: { size: 11 } },
                    grid: { color: '#f0f0f0' },
                  },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      title: (ctx) => {
                        const i = ctx[0].dataIndex;
                        const d = TOP3_MONTHLY[i];
                        return `${d.month} — ${d.total.toLocaleString()} total`;
                      },
                      label: (ctx) => {
                        const i = ctx.dataIndex;
                        const si = ctx.datasetIndex;
                        const d = TOP3_MONTHLY[i];
                        const pct = (v: number) => Math.round(v / d.total * 100);
                        if (si === 0) return `Everyone else: ${d.rest} (${pct(d.rest)}%)`;
                        if (si === 1) return `#3 ${d.p3.name}: ${d.p3.count} (${pct(d.p3.count)}%)`;
                        if (si === 2) return `#2 ${d.p2.name}: ${d.p2.count} (${pct(d.p2.count)}%)`;
                        return `#1 ${d.p1.name}: ${d.p1.count} (${pct(d.p1.count)}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
          <div style={{ fontSize: '0.65rem', color: '#999', marginTop: 8, textAlign: 'center' }}>
            Source: Launch Bonus Tracker daily exports (2024 H1+H2, 2025 H1+H2, 2026 H1+H2).
          </div>

          {/* Reference table — names visible without hover */}
          <div style={{ marginTop: 16, overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.7rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${TP.navy}` }}>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: TP.navy, fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Month</th>
                  <th style={{ textAlign: 'right', padding: '6px 6px', color: TP.navy, fontWeight: 700, fontSize: '0.65rem' }}>Total</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: TP.blue, fontWeight: 700, fontSize: '0.65rem' }}>#1</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: '#B8860B', fontWeight: 700, fontSize: '0.65rem' }}>#2</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: '#0E8A6D', fontWeight: 700, fontSize: '0.65rem' }}>#3</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px', color: TP.navy, fontWeight: 700, fontSize: '0.65rem' }}>Top 3 %</th>
                </tr>
              </thead>
              <tbody>
                {TOP3_MONTHLY.map((d, i) => {
                  const top3sum = d.p1.count + d.p2.count + d.p3.count;
                  const top3pct = Math.round(top3sum / d.total * 100);
                  const isYearStart = d.month.endsWith('-01');
                  const firstName = (n: string) => n.split(' ')[0];
                  const lastName = (n: string) => { const parts = n.split(' '); return parts.length > 1 ? parts[parts.length - 1] : ''; };
                  const shortName = (n: string) => {
                    const f = firstName(n);
                    const l = lastName(n);
                    return l ? `${f} ${l.charAt(0)}.` : f;
                  };
                  return (
                    <tr key={d.month} style={{
                      borderBottom: '1px solid #f0f0f0',
                      background: i % 2 === 0 ? '#fff' : '#fafafa',
                      borderTop: isYearStart && i > 0 ? `2px solid ${TP.lightBlue}` : undefined,
                    }}>
                      <td style={{ padding: '4px 8px', fontWeight: isYearStart ? 700 : 400, color: TP.navy, whiteSpace: 'nowrap' }}>{d.label}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 700, color: TP.navy }}>{d.total.toLocaleString()}</td>
                      <td style={{ padding: '4px 8px', color: TP.blue }}>
                        <span style={{ fontWeight: 600 }}>{shortName(d.p1.name)}</span>
                        <span style={{ color: '#999', marginLeft: 4 }}>{d.p1.count}</span>
                      </td>
                      <td style={{ padding: '4px 8px', color: '#B8860B' }}>
                        <span style={{ fontWeight: 600 }}>{shortName(d.p2.name)}</span>
                        <span style={{ color: '#999', marginLeft: 4 }}>{d.p2.count}</span>
                      </td>
                      <td style={{ padding: '4px 8px', color: '#0E8A6D' }}>
                        <span style={{ fontWeight: 600 }}>{shortName(d.p3.name)}</span>
                        <span style={{ color: '#999', marginLeft: 4 }}>{d.p3.count}</span>
                      </td>
                      <td style={{
                        padding: '4px 8px', textAlign: 'right', fontWeight: 600,
                        color: top3pct >= 70 ? TP.red : top3pct >= 50 ? '#B8860B' : '#16a34a',
                      }}>{top3pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Producer history table */}
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: TP.navy, color: '#fff' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px' }}>#</th>
                <th style={{ textAlign: 'left', padding: '10px 12px' }}>Name</th>
                <th style={{ textAlign: 'right', padding: '10px 8px' }}>2024</th>
                <th style={{ textAlign: 'right', padding: '10px 8px' }}>2025</th>
                <th style={{ textAlign: 'right', padding: '10px 8px' }}>2026 YTD</th>
                <th style={{ textAlign: 'right', padding: '10px 8px' }}>Pace</th>
                <th style={{ textAlign: 'right', padding: '10px 12px' }}>3-Year Total</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCER_HISTORY.map((p, i) => {
                const pace26 = Math.round(p.y26 * ANN);
                const total = p.y24 + p.y25 + p.y26;
                const trendColor = p.y26 > 0 && (p.y25 === 0 || pace26 > p.y25) ? '#16a34a' : pace26 < p.y25 ? TP.red : '#444';
                return (
                  <tr key={p.name} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '6px 12px', color: '#999', fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: '6px 12px', fontWeight: 600, color: TP.navy }}>
                      {p.name.replace(' NNM', '').replace(' essentiallyerin', '')}
                    </td>
                    <td style={{ textAlign: 'right', padding: '6px 8px', color: p.y24 > 0 ? '#444' : '#ccc' }}>{p.y24 > 0 ? p.y24.toLocaleString() : '—'}</td>
                    <td style={{ textAlign: 'right', padding: '6px 8px', color: p.y25 > 0 ? '#444' : '#ccc' }}>{p.y25 > 0 ? p.y25.toLocaleString() : '—'}</td>
                    <td style={{ textAlign: 'right', padding: '6px 8px', color: '#444' }}>{p.y26.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '6px 8px', color: trendColor, fontWeight: 600 }}>~{pace26.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '6px 12px', fontWeight: 800, color: TP.navy }}>{total.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ fontSize: '0.7rem', color: '#888', padding: '8px 12px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
            2024 data from H1+H2 Launch Bonus Tracker exports (full year). 2026 pace annualized at {ANN.toFixed(2)}x.
            Green = on pace to beat 2025. Red = trailing 2025. Dash = no recorded submissions.
          </div>
        </div>
      </div>

      {/* ════════ SECTION 7: Launch Bonus Tracker ════════ */}
      <div>
        <h3 style={sectionHeader}>Launch Bonus Tracker</h3>
        <p style={sectionSub}>Tracking ambassador progress toward bonus tiers within their eligible windows.</p>

        {/* KPI cards */}
        <div style={{ ...gridRow(4), marginBottom: '1.5rem' }}>
          <div style={{ ...card, borderLeft: `4px solid ${TP.teal}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Earned</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: TP.teal }}>${totalEarned.toLocaleString()}</div>
            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 2 }}>{tier1Count} at Tier 1+, {tier2Count} at Tier 2</div>
          </div>
          <div style={{ ...card, borderLeft: `4px solid ${TP.blue}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Paid Out</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: TP.blue }}>${totalPaid.toLocaleString()}</div>
            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 2 }}>{launchBonusData.filter(d => d.paid > 0).length} ambassadors paid</div>
          </div>
          <div style={{ ...card, borderLeft: `4px solid ${TP.red}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Unpaid / Owed</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: TP.red }}>${totalUnpaid.toLocaleString()}</div>
            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 2 }}>{launchBonusData.filter(d => d.earned > d.paid).length} with balance due</div>
          </div>
          <div style={{ ...card, borderLeft: `4px solid ${TP.gold}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Approaching Tier 1</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#D4960A' }}>{approachingTier1}</div>
            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 2 }}>15-24 submissions</div>
          </div>
        </div>

        {/* Bonus rules note */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: 10,
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          fontSize: '0.8rem',
          lineHeight: 1.6,
          color: '#555',
        }}>
          <strong style={{ color: TP.navy }}>Bonus structure:</strong> $250 at 25 submissions (Tier 1), $1,250 total at 50 submissions (Tier 2).
          Pre-2026 onboards: window starts April 1, 2026. 2026 onboards: window starts at onboard date. Each window lasts 1 year.
        </div>

        {/* Bonus table */}
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: TP.blue, color: '#fff' }}>
                <th style={{ textAlign: 'center', padding: '10px 6px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5, width: 32 }}>#</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Ambassador</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Subs</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5, minWidth: 100 }}>Progress</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Tier 1</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Tier 2</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Earned</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Paid</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {launchBonusData.map((row, i) => {
                const nextTarget = row.bonusSubs >= 25 ? 50 : 25;
                const barPct = Math.min(100, Math.round(row.bonusSubs / nextTarget * 100));
                const barColor = row.tier >= 2 ? TP.blue : row.tier >= 1 ? TP.teal : row.bonusSubs >= 15 ? TP.gold : TP.lightBlue;
                const remaining = row.earned - row.paid;
                const nextTierText = row.bonusSubs >= 50
                  ? ''
                  : row.bonusSubs >= 25
                    ? `${50 - row.bonusSubs} to Tier 2`
                    : `${25 - row.bonusSubs} to Tier 1`;
                return (
                  <tr key={row.name} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ textAlign: 'center', padding: '10px 6px', fontSize: '0.75rem', color: '#999', width: 32 }}>{i + 1}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: row.omit ? '#999' : row.is2026 ? TP.purple : TP.navy, fontSize: '0.82rem', textDecoration: row.omit ? 'line-through' : 'none', textDecorationColor: '#E24B4A' }}>
                      {row.name}
                      {row.is2026 && <span style={{ fontSize: '0.6rem', background: '#f3e8f1', color: TP.purple, padding: '1px 6px', borderRadius: 4, marginLeft: 4 }}>2026</span>}
                      {row.pendingPayout && <span style={{ fontSize: '0.6rem', background: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: 4, marginLeft: 4 }}>pending</span>}
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 700, fontSize: '0.88rem', color: TP.navy }}>{row.bonusSubs}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden', minWidth: 60 }}>
                          <div style={{
                            width: `${barPct}%`,
                            height: '100%',
                            background: barColor,
                            borderRadius: 4,
                          }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#888', whiteSpace: 'nowrap' }}>{row.bonusSubs}/{nextTarget}{nextTierText ? '' : ' ✓'}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.78rem', color: row.tier1Date ? TP.navy : '#ddd' }}>
                      {row.tier1Date || '—'}
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.78rem', color: row.tier2Date ? TP.navy : '#ddd' }}>
                      {row.tier2Date || '—'}
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.82rem' }}>
                      {row.earned > 0
                        ? <span style={{ color: TP.teal, fontWeight: 700 }}>${row.earned.toLocaleString()}</span>
                        : <span style={{ color: '#ccc' }}>$0</span>
                      }
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.82rem' }}>
                      {row.paid > 0
                        ? <span style={{ color: TP.blue, fontWeight: 700 }}>${row.paid.toLocaleString()}</span>
                        : <span style={{ color: '#ccc' }}>—</span>
                      }
                    </td>
                    <td style={{ textAlign: 'right', padding: '10px 12px', fontSize: '0.82rem', fontWeight: 600 }}>
                      {row.omit
                        ? <span style={{ color: '#E24B4A' }}>OMIT</span>
                        : remaining > 0
                          ? <span style={{ color: TP.red }}>${remaining.toLocaleString()}</span>
                          : row.earned > 0
                            ? <span style={{ color: TP.teal }}>Paid in full</span>
                            : <span style={{ color: '#ccc', fontWeight: 400 }}>{nextTierText}</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 8, textAlign: 'center' }}>
          {launchBonusData.length} ambassadors with ≥1 submission. Source: Salesforce Launch Bonus Tracker, August 10 2026.
        </div>
      </div>


    </div>
  );
}
