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
  '2026-01':53,'2026-02':60,'2026-03':70,'2026-04':68,'2026-05':53,'2026-06':46,'2026-07':84,'2026-08':21,
};
const infSubs: Record<string, number> = {
  '2023-05':2,'2023-09':1,'2023-10':6,'2023-11':293,'2023-12':1035,
  '2024-01':431,'2024-02':313,'2024-03':1590,'2024-04':565,'2024-05':642,'2024-06':1231,'2024-07':480,'2024-08':553,'2024-09':1114,'2024-10':490,'2024-11':357,'2024-12':513,
  '2025-01':514,'2025-02':601,'2025-03':515,'2025-04':504,'2025-05':428,'2025-06':328,'2025-07':897,'2025-08':434,'2025-09':285,'2025-10':267,'2025-11':486,'2025-12':272,
  '2026-01':309,'2026-02':510,'2026-03':461,'2026-04':232,'2026-05':269,'2026-06':306,'2026-07':599,'2026-08':108,
};

const newAddsAmb: Record<string, number> = {
  '2024-01':4,'2024-02':7,'2024-03':7,'2024-04':6,'2024-05':3,'2024-06':7,'2024-07':10,'2024-08':2,'2024-09':6,'2024-10':7,'2024-11':7,'2024-12':7,
  '2025-01':7,'2025-02':84,'2025-03':7,'2025-04':6,'2025-05':5,'2025-06':6,'2025-07':1,'2025-08':15,'2025-09':2,'2025-10':1,'2025-11':6,'2025-12':1,
  '2026-01':5,'2026-02':12,'2026-03':10,'2026-04':28,'2026-05':20,'2026-06':28,'2026-07':29,'2026-08':18,
};
const newAddsInf: Record<string, number> = {
  '2024-01':1,'2024-02':8,'2024-03':3,'2024-04':4,'2024-05':9,'2024-06':2,'2024-07':7,'2024-08':2,'2024-09':4,'2024-10':6,'2024-11':6,'2024-12':9,
  '2025-01':11,'2025-02':3,'2025-03':7,'2025-04':2,'2025-05':0,'2025-06':3,'2025-07':0,'2025-08':1,'2025-09':0,'2025-10':0,'2025-11':1,'2025-12':1,
  '2026-01':3,'2026-02':2,'2026-03':2,'2026-04':5,'2026-05':6,'2026-06':4,'2026-07':2,'2026-08':0,
};

const ambSubsYear: Record<number, number> = {2023:465, 2024:443, 2025:574, 2026:455};
const infSubsYear: Record<number, number> = {2023:1337, 2024:8279, 2025:5531, 2026:2794};
const combSubsYear: Record<number, number> = {2023:1802, 2024:8722, 2025:6105, 2026:3249};
const addsAmbYear: Record<number, number> = {2023:4, 2024:72, 2025:141, 2026:150};
const addsInfYear: Record<number, number> = {2023:2, 2024:61, 2025:29, 2026:24};
const addsTotalYear: Record<number, number> = {2023:6, 2024:133, 2025:171, 2026:182};
// Note: adds counts are from ambassador program tracking, not Salesforce referral exports

// Active ambassadors with ≥1 submission per year (from Salesforce)
const activeInfByYear: Record<number, number> = {2023:6, 2024:60, 2025:82, 2026:79};
const activeAmbByYear: Record<number, number> = {2023:24, 2024:85, 2025:127, 2026:140};
const activeTotalByYear: Record<number, number> = {2023:30, 2024:145, 2025:209, 2026:219};

const halfCarriedBy: Record<number, number> = {2023:1, 2024:2, 2025:5, 2026:7};
const tenPlusByYear: Record<number, number> = {2023:8, 2024:40, 2025:55, 2026:42};
// Mega-3 = Lauren Johnson + Kendra Needham + Ginny Yurich (top recruited-ambassador producers)
const mega3ByYear: Record<number, number> = {2023:1290, 2024:5935, 2025:1508, 2026:791};
const baseByYear: Record<number, number> = {2023:517, 2024:2898, 2025:4642, 2026:2458};

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
  {label:'Aug', amb:18, inf:0, accent:'#D6E5F7'},
];

const concRows = [
  {y:'2023', n:1, color:'#FDBE67', names:'Kendra'},
  {y:'2024', n:2, color:'#FDBE67', names:'Lauren, Kendra'},
  {y:'2025', n:5, color:'#8CD1C8', names:'Sosh, Shannon, Lauren, Kendra, Ginny'},
  {y:'2026', n:7, color:'#8CD1C8', names:'Shannon, Sosh, Lauren, Kendra, Jeff, Amy B., Melody'},
];

// Updated from Salesforce Launch Bonus Tracker export 2026-08-12
// Source: LB Tracker combined H1 (Jan-Jul19) + H2 (Jul20-Aug12), exported 2026-08-12
const moversData: Record<string, {y25:number; y26:number; type:string}> = {
  'Lauren Johnson NNM':   {y25:831,  y26:514, type:'Inf'},
  'Shannon Tripp':        {y25:866,  y26:323, type:'Inf'},
  'Soshanna Salsman':     {y25:914,  y26:247, type:'Inf'},
  'Kendra Needham':       {y25:386,  y26:175, type:'Inf'},
  'Jeff Cruz':            {y25:84,   y26:138, type:'Inf'},
  'Amy Bernhard':         {y25:112,  y26:133, type:'Inf'},
  'Melody Brandon':       {y25:123,  y26:117, type:'Inf'},
  'Ginny Yurich':         {y25:291,  y26:102, type:'Inf'},
  'Eden Lee':             {y25:185,  y26:100, type:'Inf'},
  'Jasyra Santiago-Hines':{y25:57,   y26:98,  type:'Inf'},
  'Emily Boazman':        {y25:0,    y26:74,  type:'Inf'},
  'Ellen Fisher':         {y25:53,   y26:73,  type:'Inf'},
  'Taylor Kulik':         {y25:103,  y26:67,  type:'Inf'},
  'Amy Erickson':         {y25:51,   y26:45,  type:'Inf'},
  'Carly Brown':          {y25:0,    y26:44,  type:'Inf'},
  'Lauren Stadler':       {y25:93,   y26:44,  type:'Inf'},
  'Katelyn Alsop':        {y25:0,    y26:40,  type:'Inf'},
  'Thuy Improta':         {y25:245,  y26:35,  type:'Inf'},
  'Eryn Carroll NMM':     {y25:104,  y26:30,  type:'Inf'},
  'Hilary Fritsch':       {y25:0,    y26:28,  type:'Inf'},
  'Melina Moses':         {y25:28,   y26:27,  type:'Amb'},
  'Ashley Turner':        {y25:39,   y26:26,  type:'Inf'},
  'Hayley Lombard':       {y25:0,    y26:26,  type:'Inf'},
  'Jennie Hoglund':       {y25:29,   y26:25,  type:'Inf'},
  'Erin Wilkins':         {y25:111,  y26:21,  type:'Inf'},
  'Taylor Moran':         {y25:62,   y26:20,  type:'Inf'},
  'Alicia Nussbaum':      {y25:0,    y26:19,  type:'Amb'},
  'Mary Catherine Oechslin':{y25:0,  y26:19,  type:'Inf'},
  'Devon Kuntzman':       {y25:90,   y26:19,  type:'Inf'},
  'Taylor Weimar':        {y25:0,    y26:19,  type:'Inf'},
  'Wendy Ostapuk':        {y25:104,  y26:18,  type:'Inf'},
  'Michelle Keijner':     {y25:13,   y26:17,  type:'Amb'},
  'Laura Manns':          {y25:0,    y26:13,  type:'Amb'},
  'Courtland Nall':       {y25:10,   y26:12,  type:'Amb'},
  'Hillary Ha':           {y25:0,    y26:12,  type:'Amb'},
  'Elise Hylden':         {y25:20,   y26:12,  type:'Amb'},
  'Lexi Fitzgerald':      {y25:0,    y26:11,  type:'Inf'},
  'Dr. Ameet Trivedi':    {y25:105,  y26:11,  type:'Inf'},
  'Carly Hartwig':        {y25:0,    y26:10,  type:'Inf'},
  'Lauren Peter':         {y25:37,   y26:10,  type:'Amb'},
  'Taylor Dukes':         {y25:0,    y26:10,  type:'Inf'},
  'Brianna Reiser':       {y25:22,   y26:10,  type:'Amb'},
  'Karyna Cast Korotkykh':{y25:24,   y26:9,   type:'Amb'},
  'Rachel Jayroe':        {y25:0,    y26:9,   type:'Amb'},
  'Christina Franco':     {y25:0,    y26:8,   type:'Inf'},
  'Jessi Meeks':          {y25:0,    y26:8,   type:'Amb'},
  'Tania O\'Donnell':     {y25:0,    y26:7,   type:'Inf'},
  'Jennee Guerrero':      {y25:0,    y26:7,   type:'Amb'},
  'Julia Lee':            {y25:0,    y26:7,   type:'Amb'},
  'Craig Clayton':        {y25:0,    y26:7,   type:'Inf'},
  'Sara Lininger':        {y25:0,    y26:7,   type:'Inf'},
  'Kelsey Tweeton':       {y25:0,    y26:7,   type:'Amb'},
  'Amy Migdalia Williams':{y25:0,    y26:6,   type:'Inf'},
  'Jordan Schoen':        {y25:0,    y26:6,   type:'Amb'},
  'Emily Morrow':         {y25:31,   y26:6,   type:'Inf'},
  'Kelsey Sem':           {y25:0,    y26:6,   type:'Inf'},
  'Tiffany Hubbard':      {y25:11,   y26:6,   type:'Amb'},
  'Lori Beth Auldridge':  {y25:0,    y26:6,   type:'Amb'},
  'Bailey King':          {y25:0,    y26:6,   type:'Amb'},
  'Ashley Vogt':          {y25:0,    y26:5,   type:'Amb'},
  'Cy Tidwell':           {y25:0,    y26:5,   type:'Amb'},
  'Anna Brayton riseandclimb':{y25:0,y26:5,   type:'Amb'},
  'Kayla Monson':         {y25:0,    y26:5,   type:'Inf'},
  'Samantha Mauermann':   {y25:0,    y26:5,   type:'Inf'},
  'Janell Hampton':       {y25:0,    y26:5,   type:'Amb'},
};

// Launch Bonus Tracker — updated from Salesforce export 2026-08-12
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
    { name: 'Kendra Needham', amount: 1000, tier: 'Tier 2', pending: true },
    { name: 'Eden Lee loverlees', amount: 1250, tier: 'Tier 2', pending: true, note: 'Hit T1 07/10 + T2 07/30, first payout' },
    { name: 'Hayley Lombard', amount: 250, tier: 'Tier 1', pending: true, note: 'Has balance — apply toward' },
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
  {name:'Lauren Johnson NNM',bonusSubs:399,tier:2,earned:1250,paid:1250,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'04/27',tier2Date:'06/11'},
  {name:'Soshanna Salsman',bonusSubs:126,tier:2,earned:1250,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'04/25',tier2Date:'05/28',omit:true},
  {name:'Shannon Tripp',bonusSubs:116,tier:2,earned:1250,paid:1250,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'04/21',tier2Date:'05/26'},
  {name:'Emily Boazman',bonusSubs:71,tier:2,earned:1250,paid:1250,winStart:'04/02/2026',winEnd:'12/31/2026',tier1Date:'05/24',tier2Date:'06/26',is2026:true},
  {name:'Eden Lee loverlees',bonusSubs:69,tier:2,earned:1250,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'07/10',tier2Date:'07/30',pendingPayout:true},
  {name:'Kendra Needham',bonusSubs:64,tier:2,earned:1250,paid:250,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'05/22',tier2Date:'07/13',pendingPayout:true},
  {name:'Amy Bernhard',bonusSubs:52,tier:2,earned:1250,paid:250,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'06/03',tier2Date:'07/29'},
  {name:'Jeff Cruz Talia_likeitis',bonusSubs:53,tier:2,earned:1250,paid:250,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'05/19',tier2Date:'07/31'},
  {name:'Melody Brandon',bonusSubs:53,tier:2,earned:1250,paid:250,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'06/08',tier2Date:'08/03'},
  {name:'Jasyra Santiago-Hines',bonusSubs:46,tier:1,earned:250,paid:250,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'06/10'},
  {name:'Ginny Yurich',bonusSubs:44,tier:1,earned:250,paid:250,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'06/02'},
  {name:'Carly Brown',bonusSubs:43,tier:1,earned:250,paid:250,winStart:'04/21/2026',winEnd:'12/31/2026',tier1Date:'06/26',is2026:true},
  {name:'Katelyn Alsop (James)',bonusSubs:40,tier:1,earned:250,paid:250,winStart:'01/19/2026',winEnd:'12/31/2026',tier1Date:'02/21',is2026:true},
  {name:'Taylor Kulik',bonusSubs:32,tier:1,earned:250,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026',tier1Date:'07/25'},
  {name:'Hayley Lombard',bonusSubs:26,tier:1,earned:250,paid:0,winStart:'05/19/2026',winEnd:'12/31/2026',tier1Date:'07/16',is2026:true,pendingPayout:true},
  {name:'Hilary Fritsch*',bonusSubs:26,tier:1,earned:250,paid:0,winStart:'05/08/2026',winEnd:'12/31/2026',tier1Date:'07/31',is2026:true},
  {name:'Amy Erickson',bonusSubs:24,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Ellen Fisher',bonusSubs:23,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Eryn Carroll (natural minded momma)',bonusSubs:21,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Lauren Stadler',bonusSubs:21,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Melina Moses',bonusSubs:21,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Thuy Improta *ministry*',bonusSubs:20,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Alicia Nussbaum',bonusSubs:19,tier:0,earned:0,paid:0,winStart:'07/06/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Wendy Ostapuk toxinfreeish',bonusSubs:16,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Mary Catherine Oechslin momnp',bonusSubs:14,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Courtland Nall',bonusSubs:11,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Lexi Fitzgerald',bonusSubs:11,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Carly Hartwig',bonusSubs:10,tier:0,earned:0,paid:0,winStart:'04/06/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Erin Wilkins essentiallyerin',bonusSubs:11,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
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
  {name:'Jennee Guerrero',bonusSubs:5,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Karyna Cast Korotkykh',bonusSubs:5,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:"Tania O'Donnell",bonusSubs:5,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Taylor Dukes',bonusSubs:5,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Anna Brayton riseandclimb',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Bailey King',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Julia Lee',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/23/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Logan Randazzo',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'03/19/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Meghan Joy Yancy',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'01/20/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Milli Twitchell mywholehomestead',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Natalie Kennedy',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Sarah Fuller',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/29/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Tanya Marquez',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'06/01/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Adrian Schroeder',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Amanda Cruz (closequartersmom)',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Amber Thompson',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'02/25/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Amy Migdalia Williams',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Brianna Reiser',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Carmen Kolle',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'06/22/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Chad Rasmussen',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Christa Jooste',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Cy Tidwell',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Elise Hylden',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Elizabeth Bagwell',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Emily Morrow',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Gina Primavera',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/22/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Jackie Parliament',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'01/27/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Jessica Klick',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Kale Blossom',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Kara Garcia',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'01/16/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Karen Takacs',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Katie Brooks',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'02/06/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Kristin Hefley',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'05/07/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Laura Bruner',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Lindsay Cardwell',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Lindsey Price',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Lori Beth Auldridge',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Maurissa Ashby-Faulkner',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Melissa Long (Natural Minded Mama)',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'05/11/2026',winEnd:'12/31/2026',is2026:true},
  {name:'No One Told Us Podcast',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Ruby Morris',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Sam Johnson',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'02/06/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Taylor Moran',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Airwaymyos -Chantal Duhaime / Michelle Quinto',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Amy Eck',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'01/20/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Angela Ribeiro',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'AnnaMaria Temple',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Ashlee Boyson',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'02/11/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Bethany Micek',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Brittany Greenfield',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'01/21/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Brooke Quinn*',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'02/19/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Brook Merkel',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Cami Andersen',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'01/26/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Carly Patterson',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Craig Clayton *Restoration Dentistry*',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Dawn Winkelmann',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Ellie Gilbert',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Emily Sexton',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Erin Blatchford',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Erin Rice',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Erin Stanczyk',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Eryka Spera',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Hannah McNeely',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Heather Koch',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Jana Iankova',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Janell Hampton',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Jennie Hoglund',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Jessie Carlson',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'06/03/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Jordan Zavala',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Katie Dudley',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/14/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Katie Jewell',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Kayla Lochte',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Kristen Knecht',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'05/12/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Lexie Thiery',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Manon Salvi',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'06/03/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Marci Platt',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Miranda Shell',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Phylicia Borden',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/14/2026',winEnd:'12/31/2026',is2026:true},
  {name:"Samantha Mauermann 'Acresandaprons'",bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Samantha Smith',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Sara Lininger',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Sara Worth (Sara Joy oil_ohana)',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Taylor Babich',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/09/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Terah Belle Jones',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Tiffany Hubbard',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},

  {name:'Vicki LaBarthe',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'06/08/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Lucy Bochsler',bonusSubs:6,tier:0,earned:0,paid:0,winStart:'08/03/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Ariana Perdomo Ramirez',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'08/03/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Beth Leon',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Brittany Fisher',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'08/03/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Nicole Mastin',bonusSubs:1,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Allison Ososkie',bonusSubs:4,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Erika Xavier',bonusSubs:4,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Marissa Mason',bonusSubs:4,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Allison Shaughnessy',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Bodybybree',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Kristin Tigges',bonusSubs:3,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Alexis Eline',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
  {name:'Alisabeth Dixon',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'07/20/2026',winEnd:'12/31/2026',is2026:true},
  {name:'Kayla Monson',bonusSubs:2,tier:0,earned:0,paid:0,winStart:'04/01/2026',winEnd:'12/31/2026'},
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
