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
  '2023-01':9,'2023-02':20,'2023-03':10,'2023-04':16,'2023-05':14,'2023-06':219,'2023-07':81,'2023-08':15,'2023-09':22,'2023-10':17,'2023-11':22,'2023-12':20,
  '2024-01':14,'2024-02':16,'2024-03':29,'2024-04':31,'2024-05':32,'2024-06':24,'2024-07':36,'2024-08':47,'2024-09':71,'2024-10':32,'2024-11':40,'2024-12':63,
  '2025-01':60,'2025-02':69,'2025-03':64,'2025-04':59,'2025-05':47,'2025-06':45,'2025-07':28,'2025-08':47,'2025-09':39,'2025-10':40,'2025-11':39,'2025-12':29,
  '2026-01':53,'2026-02':58,'2026-03':64,'2026-04':64,'2026-05':23,
};
const infSubs: Record<string, number> = {
  '2023-10':6,'2023-11':294,'2023-12':1039,
  '2024-01':431,'2024-02':315,'2024-03':1593,'2024-04':569,'2024-05':654,'2024-06':1253,'2024-07':485,'2024-08':594,'2024-09':1124,'2024-10':498,'2024-11':367,'2024-12':515,
  '2025-01':521,'2025-02':605,'2025-03':521,'2025-04':511,'2025-05':428,'2025-06':330,'2025-07':906,'2025-08':440,'2025-09':290,'2025-10':273,'2025-11':485,'2025-12':273,
  '2026-01':312,'2026-02':517,'2026-03':463,'2026-04':237,'2026-05':145,
};

const newAddsAmb: Record<string, number> = {
  '2024-01':4,'2024-02':7,'2024-03':7,'2024-04':6,'2024-05':3,'2024-06':7,'2024-07':10,'2024-08':2,'2024-09':6,'2024-10':7,'2024-11':7,'2024-12':7,
  '2025-01':7,'2025-02':84,'2025-03':7,'2025-04':6,'2025-05':5,'2025-06':6,'2025-07':1,'2025-08':15,'2025-09':2,'2025-10':1,'2025-11':6,'2025-12':1,
  '2026-01':5,'2026-02':13,'2026-03':11,'2026-04':28,'2026-05':19,
};
const newAddsInf: Record<string, number> = {
  '2024-01':1,'2024-02':8,'2024-03':3,'2024-04':4,'2024-05':9,'2024-06':2,'2024-07':7,'2024-08':2,'2024-09':4,'2024-10':6,'2024-11':6,'2024-12':9,
  '2025-01':11,'2025-02':3,'2025-03':7,'2025-04':2,'2025-05':0,'2025-06':3,'2025-07':0,'2025-08':1,'2025-09':0,'2025-10':0,'2025-11':1,'2025-12':1,
  '2026-01':3,'2026-02':1,'2026-03':2,'2026-04':5,'2026-05':5,
};

const ambSubsYear: Record<number, number> = {2023:465, 2024:435, 2025:566, 2026:267};
const infSubsYear: Record<number, number> = {2023:1339, 2024:8398, 2025:5583, 2026:1714};
const combSubsYear: Record<number, number> = {2023:1804, 2024:8833, 2025:6149, 2026:1981};
const addsAmbYear: Record<number, number> = {2023:4, 2024:72, 2025:141, 2026:76};
const addsInfYear: Record<number, number> = {2023:2, 2024:61, 2025:29, 2026:16};
const addsTotalYear: Record<number, number> = {2023:6, 2024:133, 2025:171, 2026:92};

// Active ambassadors with ≥1 submission per year (from Salesforce)
const activeInfByYear: Record<number, number> = {2023:6, 2024:60, 2025:82, 2026:66};
const activeAmbByYear: Record<number, number> = {2023:24, 2024:85, 2025:127, 2026:104};
const activeTotalByYear: Record<number, number> = {2023:30, 2024:145, 2025:209, 2026:170};

const halfCarriedBy: Record<number, number> = {2023:1, 2024:2, 2025:5, 2026:7};
const tenPlusByYear: Record<number, number> = {2023:8, 2024:40, 2025:55, 2026:30};
// Mega-3 = Lauren Johnson + Kendra Needham + Ginny Yurich (top recruited-ambassador producers)
const mega3ByYear: Record<number, number> = {2023:1290, 2024:5935, 2025:1508, 2026:371};
const baseByYear: Record<number, number> = {2023:517, 2024:2898, 2025:4642, 2026:1610};

const ANN = 12 / 4.871; // 4 full months + 27/31 of May through 5/27

const recruit26 = [
  {label:'Jan', amb:5, inf:3, accent:'#B6CAE3'},
  {label:'Feb', amb:13, inf:1, accent:'#8CD1C8'},
  {label:'Mar', amb:11, inf:2, accent:'#3A6EA4'},
  {label:'Apr', amb:28, inf:5, accent:'#FDBE67'},
  {label:'May', amb:19, inf:5, accent:'#B26CA6', tag:'through 5/27'},
];

const concRows = [
  {y:'2023', n:1, color:'#FDBE67', names:'Kendra'},
  {y:'2024', n:2, color:'#FDBE67', names:'Lauren, Kendra'},
  {y:'2025', n:5, color:'#8CD1C8', names:'Sosh, Shannon, Lauren, Kendra, Ginny'},
  {y:'2026', n:7, color:'#8CD1C8', names:'Shannon, Sosh, Lauren, Kendra, Jeff, Amy B., Melody'},
];

const moversData: Record<string, {y25:number; y26:number; type:string}> = {
  'Shannon Tripp':        {y25:866,  y26:257, type:'Inf'},
  'Soshanna Salsman':     {y25:914,  y26:162, type:'Inf'},
  'Lauren Johnson NNM':   {y25:831,  y26:156, type:'Inf'},
  'Kendra Needham':       {y25:386,  y26:138, type:'Inf'},
  'Jeff Cruz':            {y25:84,   y26:111, type:'Inf'},
  'Amy Bernhard':         {y25:112,  y26:93,  type:'Inf'},
  'Ginny Yurich':         {y25:291,  y26:77,  type:'Inf'},
  'Melody Brandon':       {y25:123,  y26:75,  type:'Inf'},
  'Jasyra Santiago-Hines':{y25:57,   y26:72,  type:'Inf'},
  'Ellen Fisher':         {y25:53,   y26:57,  type:'Inf'},
  'Taylor Kulik':         {y25:103,  y26:47,  type:'Inf'},
  'Eden Lee':             {y25:185,  y26:41,  type:'Inf'},
  'Katelyn Alsop':        {y25:0,    y26:40,  type:'Inf'},
  'Amy Erickson':         {y25:51,   y26:34,  type:'Inf'},
  'Emily Boazman':        {y25:0,    y26:28,  type:'Inf'},
  'Jennie Hoglund':       {y25:29,   y26:24,  type:'Inf'},
  'Lauren Stadler':       {y25:93,   y26:25,  type:'Inf'},
  'Thuy Improta':         {y25:245,  y26:24,  type:'Inf'},
  'Ashley Turner':        {y25:39,   y26:21,  type:'Inf'},
  'Carly Brown':          {y25:0,    y26:21,  type:'Inf'},
  'Taylor Moran':         {y25:62,   y26:19,  type:'Inf'},
  'Eryn Carroll NMM':     {y25:104,  y26:17,  type:'Inf'},
  'Taylor Weimar':        {y25:0,    y26:14,  type:'Inf'},
  'Devon Kuntzman':       {y25:90,   y26:13,  type:'Inf'},
  'Erin Wilkins':         {y25:111,  y26:13,  type:'Inf'},
  'Karalynne Call':       {y25:25,   y26:11,  type:'Inf'},
  'Dr. Ameet Trivedi':    {y25:105,  y26:7,   type:'Inf'},
  'Emily Morrow':         {y25:31,   y26:5,   type:'Inf'},
  'Wendy Ostapuk':        {y25:104,  y26:3,   type:'Inf'},
  'Michelle Keijner':     {y25:13,   y26:14,  type:'Amb'},
  'Melina Moses':         {y25:28,   y26:15,  type:'Amb'},
  'Laura Manns':          {y25:0,    y26:10,  type:'Amb'},
  'Brianna Reiser':       {y25:22,   y26:9,   type:'Amb'},
  'Hillary Ha':           {y25:0,    y26:9,   type:'Amb'},
  'Elise Hylden':         {y25:20,   y26:8,   type:'Amb'},
  'Rachel Jayroe':        {y25:0,    y26:7,   type:'Amb'},
  'Tiffany Hubbard':      {y25:11,   y26:6,   type:'Amb'},
  'Karyna Cast Korotkykh':{y25:24,   y26:6,   type:'Amb'},
  'Lauren Peter':         {y25:37,   y26:5,   type:'Amb'},
  'Courtland Nall':       {y25:10,   y26:8,   type:'Amb'},
  'Ashley Vogt':          {y25:0,    y26:5,   type:'Amb'},
  'Erin Rice':            {y25:22,   y26:3,   type:'Amb'},
  'Jennee Guerrero':      {y25:18,   y26:3,   type:'Amb'},
  'Cy Tidwell':           {y25:12,   y26:4,   type:'Amb'},
  'Anna Brayton':         {y25:19,   y26:3,   type:'Amb'},
  "Tania O'Donnell":      {y25:0,    y26:3,   type:'Amb'},
  'Michelle Melerine':    {y25:13,   y26:2,   type:'Amb'},
  'Jessica Klick':        {y25:9,    y26:1,   type:'Amb'},
  'Heather Reed':         {y25:4,    y26:1,   type:'Amb'},
};

// Launch Bonus Tracker — updated from Salesforce export 2026-05-27
// bonusSubs = submissions counted ONLY from window start date forward
const launchBonusData = [
  {name:'Shannon Tripp',onboard:'06/27/2025',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:50,tier:1,earned:250},
  {name:'Lauren Johnson NNM',onboard:'05/01/2024',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:41,tier:1,earned:250},
  {name:'Soshanna Salsman',onboard:'04/30/2024',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:40,tier:1,earned:250},
  {name:'Kendra Needham',onboard:'11/01/2023',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:28,tier:1,earned:250},
  {name:'Emily Boazman',onboard:'04/02/2026',is2026:true,winStart:'04/02/2026',winEnd:'04/02/2027',bonusSubs:27,tier:1,earned:250},
  {name:'Jeff Cruz Talia_likeitis',onboard:'08/01/2024',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:26,tier:1,earned:250},
  {name:'Carly Brown',onboard:'04/21/2026',is2026:true,winStart:'04/21/2026',winEnd:'04/21/2027',bonusSubs:21,tier:0,earned:0},
  {name:'Jasyra Santiago-Hines',onboard:'02/01/2024',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:20,tier:0,earned:0},
  {name:'Ginny Yurich',onboard:'06/01/2024',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:19,tier:0,earned:0},
  {name:'Hayley Lombard',onboard:'04/14/2026',is2026:true,winStart:'04/14/2026',winEnd:'04/14/2027',bonusSubs:13,tier:0,earned:0},
  {name:'Amy Erickson',onboard:'01/01/2024',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:13,tier:0,earned:0},
  {name:'Amy Bernhard',onboard:'08/25/2025',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:12,tier:0,earned:0},
  {name:'Taylor Kulik',onboard:'02/01/2024',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:11,tier:0,earned:0},
  {name:'Eden Lee loverlees',onboard:'12/01/2024',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:10,tier:0,earned:0},
  {name:'Melody Brandon',onboard:'04/01/2024',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:10,tier:0,earned:0},
  {name:'Katelyn Alsop (James)',onboard:'01/19/2026',is2026:true,winStart:'01/19/2026',winEnd:'01/19/2027',bonusSubs:40,tier:1,earned:250},
  {name:'Melina Moses',onboard:'01/01/2024',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:9,tier:0,earned:0},
  {name:'Thuy Improta *ministry*',onboard:'07/01/2024',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:9,tier:0,earned:0},
  {name:'Eryn Carroll NMM',onboard:'07/01/2024',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:8,tier:0,earned:0},
  {name:'Courtland Nall',onboard:'10/01/2024',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:7,tier:0,earned:0},
  {name:'Ellen Fisher',onboard:'01/01/2024',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:7,tier:0,earned:0},
  {name:'Hilary Fritsch',onboard:'01/01/2024',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:7,tier:0,earned:0},
  {name:'Karalynne Call *Just Ingredients*',onboard:'08/01/2024',is2026:false,winStart:'04/01/2026',winEnd:'04/01/2027',bonusSubs:6,tier:0,earned:0},
  {name:'Hillary Ha',onboard:'04/07/2026',is2026:true,winStart:'04/07/2026',winEnd:'04/07/2027',bonusSubs:5,tier:0,earned:0},
];

/* ════════════════════════════════════════════════════════════════════════════
   Helpers
   ════════════════════════════════════════════════════════════════════════ */
const years = [2023, 2024, 2025, 2026] as const;
const MONTHS_JAN24_MAY26: string[] = [];
for (let y = 2024; y <= 2026; y++) {
  const end = y === 2026 ? 5 : 12;
  for (let m = 1; m <= end; m++) {
    MONTHS_JAN24_MAY26.push(`${y}-${String(m).padStart(2, '0')}`);
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
  const moverAnnFactor = 12 / 4.742;
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
  const approachingTier1 = launchBonusData.filter(d => d.tier === 0 && d.bonusSubs >= 15).length;
  const totalEarned = launchBonusData.reduce((s, d) => s + d.earned, 0);
  const lbMaxLiability = 72 * 1250; // 72 tracked ambassadors * $1,250 max each

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

  /* ── Chart: New Adds monthly stacked (Jan 2024 – May 2026) ── */
  const mayPaceFactor = 31 / 23; // May 2026: 23 days so far out of 31
  const lastIdx26 = MONTHS_JAN24_MAY26.length - 1;
  const mayAmbActual = newAddsAmb['2026-05'] ?? 0;
  const mayInfActual = newAddsInf['2026-05'] ?? 0;
  const mayAmbProj = Math.round(mayAmbActual * mayPaceFactor);
  const mayInfProj = Math.round(mayInfActual * mayPaceFactor);

  const newAddsChartData: ChartData<'bar'> = {
    labels: MONTHS_JAN24_MAY26.map(fmtMonthLabel),
    datasets: [
      {
        label: 'Projected',
        data: MONTHS_JAN24_MAY26.map((_, i) => i === lastIdx26 ? mayAmbProj + mayInfProj : 0),
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
              return `Projected full month: ${mayAmbProj + mayInfProj} (${mayAmbProj} amb + ${mayInfProj} inf)`;
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
    labels: ['2023', '2024', '2025', '2026 YTD', '2026 Pace'],
    datasets: [
      {
        label: 'Influencer',
        data: [infSubsYear[2023], infSubsYear[2024], infSubsYear[2025], infSubsYear[2026], infPace],
        backgroundColor: [TP.teal, TP.teal, TP.teal, TP.teal + '80', TP.teal + '40'],
        borderRadius: 4,
      },
      {
        label: 'Ambassador',
        data: [ambSubsYear[2023], ambSubsYear[2024], ambSubsYear[2025], ambSubsYear[2026], ambPace],
        backgroundColor: [TP.blue, TP.blue, TP.blue, TP.blue + '80', TP.blue + '40'],
        borderRadius: 4,
      },
    ],
  };
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
    labels: ['2023', '2024', '2025', '2026 Pace'],
    datasets: [
      {
        label: 'Base Program',
        data: [baseByYear[2023], baseByYear[2024], baseByYear[2025], basePace],
        backgroundColor: TP.blue,
        borderRadius: 4,
      },
      {
        label: 'Mega-3',
        data: [mega3ByYear[2023], mega3ByYear[2024], mega3ByYear[2025], Math.round(mega3ByYear[2026] * ANN)],
        backgroundColor: TP.gold,
        borderRadius: 4,
      },
    ],
  };
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
          ctx.fillText(`~${ref.paceVal} pace`, bar0.x, topY - 6);
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

      {/* ════════ SECTION 2: Ambassador Recruitment — 2026 ════════ */}
      <div>
        <h3 style={sectionHeader}>Ambassador Recruitment — 2026</h3>
        <p style={sectionSub}>Monthly new adds for the current year.</p>

        <div style={{ ...gridRow(5), marginBottom: '1.5rem' }}>
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

        {/* Green callout */}
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: 10,
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          lineHeight: 1.65,
          fontSize: '0.875rem',
          color: '#1a3a2a',
        }}>
          <strong>Ambassador recruitment is the growth story.</strong> Ambassador adds went from 73 (2024) to 141 (2025) to a 2026 pace of ~{addsAmbPace}.
          Influencer adds have slowed (61 → 29 → pace ~{infAddsPace}), but that&apos;s because the ambassador channel is where the scalable growth is — these are parents who go through the program and refer others.
          They don&apos;t require influencer outreach or management.
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
            <Bar data={channelChartData} options={channelChartOpts} />
          </div>
        </div>
      </div>

      {/* ════════ SECTION 5: Base Program Without Viral Spikes ════════ */}
      <div>
        <h3 style={sectionHeader}>The Real Growth Story — Base Program Without Viral Spikes</h3>
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
            <Bar data={baseChartData} options={baseChartOpts} />
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
        <p style={sectionSub}>Ambassadors with at least 1 submission in the given year. 2026 is YTD through May 23.</p>

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

        {/* Bar chart */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
          <div style={{ height: 280 }}>
            <Bar
              data={{
                labels: ['2023', '2024', '2025', '2026 YTD', '2026 Projected'],
                datasets: [
                  {
                    label: 'Influencer',
                    data: [activeInfByYear[2023], activeInfByYear[2024], activeInfByYear[2025], activeInfByYear[2026], 0],
                    backgroundColor: TP.teal,
                    borderRadius: 4,
                    stack: 'actual',
                  },
                  {
                    label: 'Ambassador',
                    data: [activeAmbByYear[2023], activeAmbByYear[2024], activeAmbByYear[2025], activeAmbByYear[2026], 0],
                    backgroundColor: TP.blue,
                    borderRadius: 4,
                    stack: 'actual',
                  },
                  {
                    label: 'Projected Influencer',
                    data: [0, 0, 0, 0, Math.round(activeInfByYear[2026] * ANN)],
                    backgroundColor: TP.teal + '30',
                    borderColor: TP.teal + '60',
                    borderWidth: 1,
                    borderRadius: 4,
                    stack: 'projected',
                  },
                  {
                    label: 'Projected Ambassador',
                    data: [0, 0, 0, 0, Math.round(activeAmbByYear[2026] * ANN)],
                    backgroundColor: TP.blue + '30',
                    borderColor: TP.blue + '60',
                    borderWidth: 1,
                    borderRadius: 4,
                    stack: 'projected',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                    labels: {
                      usePointStyle: true, padding: 16, font: { size: 12 },
                      filter: (item: { text: string }) => !item.text.startsWith('Projected'),
                    },
                  },
                  tooltip: {
                    mode: 'index' as const, intersect: false,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    callbacks: { label: (ctx: any) => { if (ctx.parsed.y === 0) return ''; return `${ctx.dataset.label}: ${ctx.parsed.y}`; } },
                  },
                },
                scales: {
                  x: { stacked: true },
                  y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Active Ambassadors', font: { size: 11 } } },
                },
              } satisfies ChartOptions<'bar'>}
            />
          </div>
        </div>

        <div style={{ background: '#f0f7f4', borderRadius: 10, padding: '0.875rem 1.125rem', marginTop: '1rem', fontSize: '0.88rem', lineHeight: 1.6 }}>
          <strong style={{ color: TP.navy }}>The base is widening.</strong>{' '}
          In 2023, 30 people generated submissions. By 2025 that grew to 209. Even at 4.5 months into 2026, 161 people have already submitted at least once — on pace for ~{Math.round(activeTotalByYear[2026] * ANN)} for the year.
          More people producing means less dependence on any single ambassador.
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
          Annualization factor: 12 / 4.742 = {moverAnnFactor.toFixed(2)}x. Pace = YTD x {moverAnnFactor.toFixed(2)}. &quot;New&quot; = no 2025 submissions on record.
        </div>
      </div>

      {/* ════════ SECTION 7: Launch Bonus Tracker ════════ */}
      <div>
        <h3 style={sectionHeader}>Launch Bonus Tracker</h3>
        <p style={sectionSub}>Tracking ambassador progress toward bonus tiers within their eligible windows.</p>

        {/* KPI cards */}
        <div style={{ ...gridRow(4), marginBottom: '1.5rem' }}>
          <div style={{ ...card, borderLeft: `4px solid ${TP.teal}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Tier 1 Reached ($250)</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: TP.teal }}>{tier1Count}</div>
            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 2 }}>25+ submissions</div>
          </div>
          <div style={{ ...card, borderLeft: `4px solid ${TP.gold}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Approaching Tier 1</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#D4960A' }}>{approachingTier1}</div>
            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 2 }}>15-24 submissions</div>
          </div>
          <div style={{ ...card, borderLeft: `4px solid ${TP.blue}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Bonuses Earned</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: TP.blue }}>${totalEarned.toLocaleString()}</div>
            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 2 }}>of ${lbMaxLiability.toLocaleString()} max</div>
          </div>
          <div style={{ ...card, borderLeft: `4px solid ${TP.purple}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Ambassadors Tracked</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: TP.purple }}>66</div>
            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 2 }}>with bonus-eligible subs</div>
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
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Ambassador</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Window Start</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Window End</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Bonus Subs</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5, minWidth: 120 }}>Progress</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Earned</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Next Tier</th>
              </tr>
            </thead>
            <tbody>
              {launchBonusData.map((row, i) => {
                const nextTarget = row.bonusSubs >= 25 ? 50 : 25;
                const barPct = Math.min(100, Math.round(row.bonusSubs / nextTarget * 100));
                const barColor = row.tier >= 1 ? TP.teal : row.bonusSubs >= 15 ? TP.gold : TP.lightBlue;
                const nextTier = row.bonusSubs >= 50
                  ? 'Complete'
                  : row.bonusSubs >= 25
                    ? `${50 - row.bonusSubs} to $1,250`
                    : `${25 - row.bonusSubs} to $250`;
                return (
                  <tr key={row.name} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: row.is2026 ? TP.purple : TP.navy, fontSize: '0.82rem' }}>
                      {row.name}
                      {row.is2026 && (
                        <span style={{ fontSize: '0.6rem', background: '#f3e8f1', color: TP.purple, padding: '1px 6px', borderRadius: 4, marginLeft: 4 }}>2026</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.8rem', color: '#666' }}>{row.winStart}</td>
                    <td style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.8rem', color: '#666' }}>{row.winEnd}</td>
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
                        <span style={{ fontSize: '0.7rem', color: '#888', whiteSpace: 'nowrap' }}>{row.bonusSubs}/{nextTarget}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.82rem' }}>
                      {row.earned > 0
                        ? <span style={{ color: TP.teal, fontWeight: 700 }}>${row.earned}</span>
                        : <span style={{ color: '#ccc' }}>$0</span>
                      }
                    </td>
                    <td style={{ textAlign: 'right', padding: '10px 12px', fontSize: '0.78rem', color: TP.navy }}>{nextTier}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 8, textAlign: 'center' }}>
          49 additional ambassadors have 1–2 bonus-eligible submissions. 72 total tracked.
        </div>
      </div>

    </div>
  );
}
