'use client';

import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

/* ────── TP Kids Color Palette ────── */
const TP = {
  blue: '#3A6EA4', skyBlue: '#B6CAE3', lightBlue: '#D6E5F7',
  cream: '#FEF8EE', green: '#8CD1C8', yellow: '#FDBE67',
  peach: '#FBCCC5', red: '#DD5759', darkPurple: '#B26CA6',
  lightPurple: '#DDBBD9', bubblegum: '#F6AACB', maroon: '#D46476',
  text: '#333333', navy: '#1B2A4A',
};

/* ═══════════════════════════════════════════════════════════════════════
   HARDCODED REFERRER DATA — source of truth from Salesforce exports
   (matches submission-dashboard.html referrerData object)
   ═══════════════════════════════════════════════════════════════════════ */

interface RefMonth {
  total: number;
  Parent: number;
  'Dental Office': number;
  'Airway Ambassador': number;
  Influencer: number;
  Podcast: number;
  Instagram: number;
  TikTok: number;
  Facebook: number;
  'Meta Ad': number;
  'Online Search': number;
  'Unknown Referral': number;
  'Unknown Professional Referral': number;
  Other: number;
  [key: string]: number;
}

const REFERRER_DATA: Record<string, RefMonth> = {
  "2023-01": {total:24, Parent:8, "Dental Office":6, "Airway Ambassador":9, Influencer:0, Podcast:0, Instagram:0, TikTok:0, Facebook:0, "Meta Ad":0, "Online Search":0, "Unknown Referral":0, "Unknown Professional Referral":0, Other:1},
  "2023-02": {total:60, Parent:19, "Dental Office":19, "Airway Ambassador":20, Influencer:0, Podcast:0, Instagram:0, TikTok:0, Facebook:0, "Meta Ad":0, "Online Search":1, "Unknown Referral":0, "Unknown Professional Referral":0, Other:1},
  "2023-03": {total:51, Parent:18, "Dental Office":18, "Airway Ambassador":11, Influencer:0, Podcast:0, Instagram:0, TikTok:0, Facebook:0, "Meta Ad":0, "Online Search":1, "Unknown Referral":0, "Unknown Professional Referral":0, Other:3},
  "2023-04": {total:21, Parent:1, "Dental Office":3, "Airway Ambassador":16, Influencer:0, Podcast:0, Instagram:0, TikTok:0, Facebook:0, "Meta Ad":0, "Online Search":0, "Unknown Referral":0, "Unknown Professional Referral":0, Other:1},
  "2023-05": {total:31, Parent:4, "Dental Office":4, "Airway Ambassador":15, Influencer:2, Podcast:0, Instagram:0, TikTok:0, Facebook:0, "Meta Ad":0, "Online Search":6, "Unknown Referral":0, "Unknown Professional Referral":0, Other:0},
  "2023-06": {total:240, Parent:4, "Dental Office":2, "Airway Ambassador":221, Influencer:0, Podcast:1, Instagram:0, TikTok:1, Facebook:0, "Meta Ad":0, "Online Search":7, "Unknown Referral":4, "Unknown Professional Referral":0, Other:0},
  "2023-07": {total:144, Parent:9, "Dental Office":6, "Airway Ambassador":81, Influencer:1, Podcast:0, Instagram:6, TikTok:6, Facebook:1, "Meta Ad":0, "Online Search":30, "Unknown Referral":3, "Unknown Professional Referral":0, Other:1},
  "2023-08": {total:44, Parent:10, "Dental Office":6, "Airway Ambassador":15, Influencer:0, Podcast:0, Instagram:0, TikTok:0, Facebook:0, "Meta Ad":0, "Online Search":11, "Unknown Referral":0, "Unknown Professional Referral":0, Other:2},
  "2023-09": {total:52, Parent:6, "Dental Office":6, "Airway Ambassador":22, Influencer:1, Podcast:0, Instagram:1, TikTok:1, Facebook:1, "Meta Ad":0, "Online Search":13, "Unknown Referral":0, "Unknown Professional Referral":0, Other:1},
  "2023-10": {total:72, Parent:11, "Dental Office":9, "Airway Ambassador":17, Influencer:6, Podcast:0, Instagram:3, TikTok:3, Facebook:3, "Meta Ad":0, "Online Search":17, "Unknown Referral":0, "Unknown Professional Referral":1, Other:2},
  "2023-11": {total:364, Parent:15, "Dental Office":4, "Airway Ambassador":22, Influencer:294, Podcast:0, Instagram:12, TikTok:1, Facebook:1, "Meta Ad":0, "Online Search":13, "Unknown Referral":0, "Unknown Professional Referral":0, Other:2},
  "2023-12": {total:1254, Parent:50, "Dental Office":23, "Airway Ambassador":20, Influencer:1039, Podcast:0, Instagram:37, TikTok:2, Facebook:5, "Meta Ad":0, "Online Search":56, "Unknown Referral":12, "Unknown Professional Referral":2, Other:8},
  "2024-01": {total:620, Parent:52, "Dental Office":18, "Airway Ambassador":14, Influencer:431, Podcast:0, Instagram:33, TikTok:0, Facebook:6, "Meta Ad":0, "Online Search":54, "Unknown Referral":8, "Unknown Professional Referral":0, Other:4},
  "2024-02": {total:472, Parent:36, "Dental Office":14, "Airway Ambassador":16, Influencer:316, Podcast:0, Instagram:25, TikTok:0, Facebook:4, "Meta Ad":0, "Online Search":48, "Unknown Referral":3, "Unknown Professional Referral":1, Other:9},
  "2024-03": {total:1859, Parent:48, "Dental Office":14, "Airway Ambassador":31, Influencer:1593, Podcast:0, Instagram:57, TikTok:1, Facebook:10, "Meta Ad":0, "Online Search":70, "Unknown Referral":18, "Unknown Professional Referral":8, Other:9},
  "2024-04": {total:869, Parent:72, "Dental Office":12, "Airway Ambassador":31, Influencer:569, Podcast:0, Instagram:59, TikTok:0, Facebook:6, "Meta Ad":0, "Online Search":84, "Unknown Referral":17, "Unknown Professional Referral":9, Other:10},
  "2024-05": {total:997, Parent:64, "Dental Office":21, "Airway Ambassador":35, Influencer:654, Podcast:1, Instagram:91, TikTok:1, Facebook:4, "Meta Ad":0, "Online Search":89, "Unknown Referral":22, "Unknown Professional Referral":3, Other:12},
  "2024-06": {total:1640, Parent:83, "Dental Office":21, "Airway Ambassador":25, Influencer:1253, Podcast:0, Instagram:99, TikTok:1, Facebook:10, "Meta Ad":0, "Online Search":115, "Unknown Referral":15, "Unknown Professional Referral":4, Other:14},
  "2024-07": {total:901, Parent:65, "Dental Office":67, "Airway Ambassador":36, Influencer:485, Podcast:3, Instagram:80, TikTok:0, Facebook:2, "Meta Ad":0, "Online Search":118, "Unknown Referral":27, "Unknown Professional Referral":7, Other:11},
  "2024-08": {total:1228, Parent:50, "Dental Office":184, "Airway Ambassador":47, Influencer:595, Podcast:0, Instagram:110, TikTok:0, Facebook:6, "Meta Ad":0, "Online Search":170, "Unknown Referral":47, "Unknown Professional Referral":13, Other:6},
  "2024-09": {total:1798, Parent:101, "Dental Office":143, "Airway Ambassador":71, Influencer:1127, Podcast:4, Instagram:106, TikTok:2, Facebook:5, "Meta Ad":0, "Online Search":192, "Unknown Referral":36, "Unknown Professional Referral":8, Other:3},
  "2024-10": {total:951, Parent:50, "Dental Office":98, "Airway Ambassador":32, Influencer:498, Podcast:6, Instagram:62, TikTok:1, Facebook:4, "Meta Ad":0, "Online Search":149, "Unknown Referral":43, "Unknown Professional Referral":8, Other:0},
  "2024-11": {total:937, Parent:65, "Dental Office":110, "Airway Ambassador":40, Influencer:367, Podcast:2, Instagram:103, TikTok:3, Facebook:5, "Meta Ad":0, "Online Search":170, "Unknown Referral":53, "Unknown Professional Referral":14, Other:5},
  "2024-12": {total:1154, Parent:79, "Dental Office":86, "Airway Ambassador":63, Influencer:515, Podcast:2, Instagram:127, TikTok:0, Facebook:7, "Meta Ad":0, "Online Search":206, "Unknown Referral":54, "Unknown Professional Referral":11, Other:4},
  "2025-01": {total:1429, Parent:104, "Dental Office":111, "Airway Ambassador":60, Influencer:521, Podcast:1, Instagram:181, TikTok:4, Facebook:21, "Meta Ad":0, "Online Search":298, "Unknown Referral":108, "Unknown Professional Referral":14, Other:6},
  "2025-02": {total:1554, Parent:75, "Dental Office":115, "Airway Ambassador":69, Influencer:605, Podcast:26, Instagram:185, TikTok:31, Facebook:11, "Meta Ad":0, "Online Search":330, "Unknown Referral":85, "Unknown Professional Referral":20, Other:2},
  "2025-03": {total:1508, Parent:88, "Dental Office":238, "Airway Ambassador":64, Influencer:521, Podcast:30, Instagram:152, TikTok:12, Facebook:6, "Meta Ad":0, "Online Search":285, "Unknown Referral":88, "Unknown Professional Referral":20, Other:4},
  "2025-04": {total:1659, Parent:85, "Dental Office":399, "Airway Ambassador":59, Influencer:511, Podcast:46, Instagram:120, TikTok:8, Facebook:12, "Meta Ad":0, "Online Search":251, "Unknown Referral":136, "Unknown Professional Referral":26, Other:6},
  "2025-05": {total:1326, Parent:67, "Dental Office":289, "Airway Ambassador":47, Influencer:428, Podcast:7, Instagram:123, TikTok:5, Facebook:10, "Meta Ad":0, "Online Search":259, "Unknown Referral":57, "Unknown Professional Referral":21, Other:13},
  "2025-06": {total:1035, Parent:65, "Dental Office":252, "Airway Ambassador":45, Influencer:330, Podcast:6, Instagram:78, TikTok:6, Facebook:8, "Meta Ad":0, "Online Search":177, "Unknown Referral":45, "Unknown Professional Referral":20, Other:3},
  "2025-07": {total:2589, Parent:102, "Dental Office":245, "Airway Ambassador":28, Influencer:906, Podcast:720, Instagram:145, TikTok:7, Facebook:10, "Meta Ad":0, "Online Search":292, "Unknown Referral":113, "Unknown Professional Referral":19, Other:2},
  "2025-08": {total:2477, Parent:91, "Dental Office":322, "Airway Ambassador":47, Influencer:440, Podcast:1008, Instagram:120, TikTok:7, Facebook:5, "Meta Ad":0, "Online Search":294, "Unknown Referral":116, "Unknown Professional Referral":19, Other:8},
  "2025-09": {total:1550, Parent:75, "Dental Office":393, "Airway Ambassador":39, Influencer:290, Podcast:357, Instagram:91, TikTok:0, Facebook:4, "Meta Ad":1, "Online Search":197, "Unknown Referral":75, "Unknown Professional Referral":27, Other:1},
  "2025-10": {total:1475, Parent:78, "Dental Office":509, "Airway Ambassador":40, Influencer:273, Podcast:200, Instagram:81, TikTok:1, Facebook:10, "Meta Ad":0, "Online Search":198, "Unknown Referral":62, "Unknown Professional Referral":18, Other:5},
  "2025-11": {total:1589, Parent:74, "Dental Office":459, "Airway Ambassador":39, Influencer:485, Podcast:138, Instagram:65, TikTok:0, Facebook:12, "Meta Ad":0, "Online Search":221, "Unknown Referral":69, "Unknown Professional Referral":25, Other:2},
  "2025-12": {total:1226, Parent:57, "Dental Office":453, "Airway Ambassador":29, Influencer:273, Podcast:75, Instagram:79, TikTok:2, Facebook:9, "Meta Ad":8, "Online Search":169, "Unknown Referral":47, "Unknown Professional Referral":23, Other:2},
  "2026-01": {total:1410, Parent:76, "Dental Office":367, "Airway Ambassador":53, Influencer:312, Podcast:151, Instagram:87, TikTok:2, Facebook:16, "Meta Ad":12, "Online Search":233, "Unknown Referral":74, "Unknown Professional Referral":23, Other:4},
  "2026-02": {total:1503, Parent:66, "Dental Office":312, "Airway Ambassador":58, Influencer:517, Podcast:92, Instagram:70, TikTok:3, Facebook:25, "Meta Ad":5, "Online Search":282, "Unknown Referral":46, "Unknown Professional Referral":27, Other:0},
  "2026-03": {total:1604, Parent:75, "Dental Office":321, "Airway Ambassador":64, Influencer:463, Podcast:163, Instagram:74, TikTok:1, Facebook:11, "Meta Ad":2, "Online Search":339, "Unknown Referral":58, "Unknown Professional Referral":21, Other:12},
  "2026-04": {total:1229, Parent:76, "Dental Office":260, "Airway Ambassador":64, Influencer:237, Podcast:125, Instagram:39, TikTok:1, Facebook:10, "Meta Ad":0, "Online Search":297, "Unknown Referral":70, "Unknown Professional Referral":26, Other:24},
};

/* ────── May 2026 Projection (Salesforce snapshot + pace) ────── */
const MAY_2026_SF: Record<string, number> = {
  total: 823, Parent: 43, 'Dental Office': 176, 'Airway Ambassador': 25,
  Influencer: 178, Podcast: 74, Instagram: 39, TikTok: 4, Facebook: 9,
  'Meta Ad': 1, 'Online Search': 205, 'Unknown Referral': 44,
  'Unknown Professional Referral': 5, 'Google Ad': 19, MYO: 1,
  'Health Care Professional': 0,
};
const MAY_2026_SF_DAYS = 26;
const MAY_2026_DAYS_IN_MONTH = 31;

function buildMay2026Projected(): { actual: RefMonth; projected: RefMonth } {
  const sfTotal = MAY_2026_SF.total || 1;
  const pace = MAY_2026_DAYS_IN_MONTH / MAY_2026_SF_DAYS;
  const srcKeys = [
    'Parent', 'Dental Office', 'Airway Ambassador', 'Influencer', 'Podcast',
    'Instagram', 'TikTok', 'Facebook', 'Meta Ad', 'Online Search',
    'Unknown Referral', 'Unknown Professional Referral',
  ];

  const actual: Record<string, number> = { total: sfTotal };
  const projected: Record<string, number> = { total: 0 };

  let scaledSum = 0;
  srcKeys.forEach((k) => {
    const v = MAY_2026_SF[k] || 0;
    actual[k] = v;
    const proj = Math.round(v * pace);
    projected[k] = proj;
    projected.total += proj;
    scaledSum += v;
  });

  // Fill Other
  actual.Other = Math.max(0, sfTotal - scaledSum);
  projected.Other = Math.round(actual.Other * pace);

  return { actual: actual as unknown as RefMonth, projected: projected as unknown as RefMonth };
}

const { actual: may2026Actual, projected: may2026Projected } = buildMay2026Projected();

// Inject May 2026 ACTUALS into referrer data (chart shows real numbers)
const ALL_DATA: Record<string, RefMonth> = { ...REFERRER_DATA, '2026-05': may2026Actual };

/* ────── Chart source definitions ────── */

const CHART_SOURCES = [
  { key: 'Dental Office', color: '#E5A04B', label: 'Dental Office' },
  { key: 'Online Search', color: TP.blue, label: 'Online Search' },
  { key: 'Influencer + Ambassador', color: TP.green, label: 'Influencer + Ambassador', combo: ['Influencer', 'Airway Ambassador'] },
  { key: 'Podcast', color: TP.darkPurple, label: 'Podcast' },
  { key: 'Social Media', color: '#E57373', label: 'Social Media', combo: ['Instagram', 'Facebook', 'TikTok'] },
  { key: 'Parent', color: '#7BAFD4', label: 'Parent' },
  { key: 'Unknown Referral', color: '#999999', label: 'Unknown Referral', combo: ['Unknown Referral', 'Unknown Professional Referral'] },
];

const TABLE_SOURCES = [
  { key: 'Dental Office', color: '#E5A04B', label: 'Dental Office' },
  { key: 'Online Search', color: TP.blue, label: 'Online Search' },
  { key: 'Influencer', color: TP.green, label: 'Influencer' },
  { key: 'Podcast', color: TP.darkPurple, label: 'Podcast' },
  { key: 'Instagram', color: '#E57373', label: 'Instagram' },
  { key: 'Airway Ambassador', color: '#5BA88C', label: 'Ambassador' },
  { key: 'Parent', color: '#7BAFD4', label: 'Parent' },
  { key: 'Facebook', color: '#4267B2', label: 'Facebook' },
  { key: 'TikTok', color: '#333333', label: 'TikTok' },
  { key: 'Meta Ad', color: TP.red, label: 'Meta Ad' },
  { key: 'Unknown Referral', color: '#999999', label: 'Unknown Referral' },
  { key: 'Unknown Professional Referral', color: '#BBBBBB', label: 'Unknown Prof. Referral' },
];

const PER_SOURCE_DEFS = [
  { key: 'Dental Office', color: '#E5A04B', label: 'Dental Office' },
  { key: 'Online Search', color: TP.blue, label: 'Online Search' },
  { key: 'Influencer', color: TP.green, label: 'Influencer' },
  { key: 'Podcast', color: TP.darkPurple, label: 'Podcast' },
  { key: 'Instagram', color: '#E57373', label: 'Instagram' },
  { key: 'Facebook', color: '#4267B2', label: 'Facebook' },
  { key: 'Airway Ambassador', color: '#5BA88C', label: 'Ambassador' },
  { key: 'Parent', color: '#7BAFD4', label: 'Parent' },
  { key: 'Meta Ad', color: TP.red, label: 'Meta Ad' },
  { key: 'TikTok', color: '#333333', label: 'TikTok' },
  { key: 'Unknown Referral', color: '#999999', label: 'Unknown Referral' },
];

/* ────── Ambassador YOY Data ────── */

interface AmbEntry { 2023: number; 2024: number; 2025: number; 2026: number; type: string; _pace2026?: number }

const AMB_YOY_DATA: Record<string, AmbEntry> = {
  'Lauren Johnson NNM':    {2023:4,    2024:2968, 2025:831,  2026:144, type:'Influencer'},
  'Kendra Needham':        {2023:1286, 2024:1856, 2025:386,  2026:133, type:'Influencer'},
  'Ginny Yurich':          {2023:0,    2024:1111, 2025:291,  2026:73,  type:'Influencer'},
  'Soshanna Salsman':      {2023:0,    2024:299,  2025:914,  2026:155, type:'Influencer'},
  'Shannon Tripp':         {2023:0,    2024:0,    2025:866,  2026:247, type:'Influencer'},
  'Thuy Improta':          {2023:0,    2024:205,  2025:245,  2026:22,  type:'Influencer'},
  'Jeff Cruz':             {2023:0,    2024:263,  2025:84,   2026:104, type:'Influencer'},
  'Erin Wilkins':          {2023:0,    2024:287,  2025:111,  2026:12,  type:'Influencer'},
  'Eden Lee':              {2023:0,    2024:25,   2025:185,  2026:38,  type:'Influencer'},
  'Melody Brandon':        {2023:0,    2024:138,  2025:123,  2026:71,  type:'Influencer'},
  'Eryn Carroll NMM':      {2023:1,    2024:144,  2025:104,  2026:12,  type:'Influencer'},
  'Taylor Kulik':          {2023:0,    2024:156,  2025:103,  2026:42,  type:'Influencer'},
  'Amy Bernhard':          {2023:0,    2024:0,    2025:112,  2026:91,  type:'Influencer'},
  'Amy Erickson':          {2023:42,   2024:141,  2025:51,   2026:25,  type:'Influencer'},
  'Emily Morrow':          {2023:0,    2024:108,  2025:31,   2026:5,   type:'Influencer'},
  'Jasyra Santiago-Hines': {2023:0,    2024:101,  2025:57,   2026:63,  type:'Influencer'},
  'Devon Kuntzman':        {2023:0,    2024:28,   2025:90,   2026:13,  type:'Influencer'},
  'Dr. Ameet Trivedi':     {2023:0,    2024:0,    2025:105,  2026:5,   type:'Influencer'},
  'Ashley Turner':         {2023:0,    2024:87,   2025:39,   2026:21,  type:'Influencer'},
  'Ellen Fisher':          {2023:0,    2024:1,    2025:53,   2026:54,  type:'Influencer'},
  'Wendy Ostapuk':         {2023:0,    2024:0,    2025:104,  2026:3,   type:'Influencer'},
  'Lauren Stadler':        {2023:0,    2024:0,    2025:93,   2026:24,  type:'Influencer'},
  'Karalynne Call':        {2023:0,    2024:65,   2025:25,   2026:10,  type:'Influencer'},
  'Jennie Hoglund':        {2023:0,    2024:53,   2025:29,   2026:24,  type:'Influencer'},
  'Taylor Moran':          {2023:0,    2024:22,   2025:62,   2026:18,  type:'Influencer'},
  'Katelyn Alsop':         {2023:0,    2024:0,    2025:0,    2026:40,  type:'Influencer'},
  'Carly Brown':           {2023:0,    2024:0,    2025:0,    2026:13,  type:'Influencer'},
  'Taylor Weimar':         {2023:0,    2024:0,    2025:0,    2026:13,  type:'Influencer'},
  'Emily Boazman':         {2023:0,    2024:0,    2025:0,    2026:12,  type:'Influencer'},
  'Craig Clayton':         {2023:0,    2024:0,    2025:0,    2026:6,   type:'Influencer'},
  'Sara Lininger':         {2023:0,    2024:0,    2025:0,    2026:6,   type:'Influencer'},
  'Taylor Dukes':          {2023:0,    2024:0,    2025:0,    2026:5,   type:'Influencer'},
  'Mary Catherine Oechslin': {2023:0,  2024:0,    2025:0,    2026:5,   type:'Influencer'},
  'Brianna Reiser':        {2023:334,  2024:25,   2025:22,   2026:9,   type:'Ambassador'},
  'Erin Rice':             {2023:5,    2024:32,   2025:22,   2026:3,   type:'Ambassador'},
  'Tiffany Hubbard':       {2023:24,   2024:16,   2025:11,   2026:6,   type:'Ambassador'},
  'Lauren Peter':          {2023:0,    2024:12,   2025:37,   2026:5,   type:'Ambassador'},
  'Elise Hylden':          {2023:0,    2024:25,   2025:20,   2026:8,   type:'Ambassador'},
  'Melina Moses':          {2023:1,    2024:5,    2025:28,   2026:12,  type:'Ambassador'},
  'Courtland Nall':        {2023:0,    2024:22,   2025:10,   2026:5,   type:'Ambassador'},
  'Jessica Klick':         {2023:0,    2024:23,   2025:9,    2026:1,   type:'Ambassador'},
  'Karyna Cast Korotkykh': {2023:0,    2024:1,    2025:24,   2026:5,   type:'Ambassador'},
  'Cy Tidwell':            {2023:0,    2024:11,   2025:12,   2026:3,   type:'Ambassador'},
  'Michelle Keijner':      {2023:0,    2024:2,    2025:13,   2026:14,  type:'Ambassador'},
  'Jennee Guerrero':       {2023:0,    2024:1,    2025:18,   2026:3,   type:'Ambassador'},
  'Anna Brayton':          {2023:0,    2024:0,    2025:19,   2026:3,   type:'Ambassador'},
  'Heather Reed':          {2023:0,    2024:16,   2025:4,    2026:1,   type:'Ambassador'},
  'Laura Bruner':          {2023:0,    2024:0,    2025:17,   2026:0,   type:'Ambassador'},
  'Michelle Melerine':     {2023:0,    2024:0,    2025:13,   2026:2,   type:'Ambassador'},
  'Laura Manns':           {2023:0,    2024:0,    2025:0,    2026:10,  type:'Ambassador'},
  'Hillary Ha':            {2023:0,    2024:0,    2025:0,    2026:9,   type:'Ambassador'},
  'Rachel Jayroe':         {2023:0,    2024:0,    2025:0,    2026:6,   type:'Ambassador'},
  'Ashley Vogt':           {2023:0,    2024:0,    2025:0,    2026:5,   type:'Ambassador'},
  'Jordan Schoen':         {2023:0,    2024:0,    2025:0,    2026:4,   type:'Ambassador'},
  'Julia Lee':             {2023:0,    2024:0,    2025:0,    2026:4,   type:'Ambassador'},
  'Tracy Gillet':          {2023:0,    2024:0,    2025:0,    2026:4,   type:'Ambassador'},
  'Brittany Lockie':       {2023:0,    2024:0,    2025:0,    2026:4,   type:'Ambassador'},
  "Tania O'Donnell":       {2023:0,    2024:0,    2025:0,    2026:3,   type:'Ambassador'},
};

const AMB_TOTALS = { 2023: 1342 + 465, 2024: 8383 + 435, 2025: 5576 + 554, 2026: 1674 + 262 };
const AMB_COUNTS = { 2023: 6 + 24, 2024: 60 + 85, 2025: 82 + 127, 2026: 64 + 97 };
const INF_TOTALS = { 2023: 1342, 2024: 8383, 2025: 5576, 2026: 1674 };
const AIR_TOTALS = { 2023: 465, 2024: 435, 2025: 554, 2026: 262 };
const ANN_FACTOR = 12 / 4.742;

/* ────── Helpers ────── */

const allMonths = Object.keys(ALL_DATA).sort();

function fmtMonth(key: string): string {
  const [y, m] = key.split('-');
  const names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[parseInt(m)]} ${y.slice(2)}`;
}

function fmtMonthFull(key: string): string {
  const [y, m] = key.split('-');
  const names = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${names[parseInt(m)]} ${y}`;
}

function getChartVal(d: RefMonth, src: typeof CHART_SOURCES[0]): number {
  if ('combo' in src && src.combo) {
    return src.combo.reduce((s, k) => s + (d[k] || 0), 0);
  }
  return d[src.key] || 0;
}

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export default function ReferrerView() {
  const [perSourceExpanded, setPerSourceExpanded] = useState(false);

  const latestKey = allMonths[allMonths.length - 1];
  const latest = ALL_DATA[latestKey];
  const isProjected = latestKey === '2026-05';

  /* ──── Top source cards ──── */
  const topSources = useMemo(() => {
    return TABLE_SOURCES
      .map((s) => ({ ...s, val: latest[s.key] || 0, actual: isProjected ? (may2026Actual[s.key as keyof RefMonth] || 0) : undefined }))
      .sort((a, b) => b.val - a.val)
      .slice(0, 6);
  }, [latest, isProjected]);

  /* ──── Growth line chart datasets ──── */
  const lineLabels = allMonths.map((m) => fmtMonth(m));

  const growthDatasets = CHART_SOURCES.map((src) => ({
    label: src.label,
    data: allMonths.map((m) => getChartVal(ALL_DATA[m], src)),
    borderColor: src.color,
    backgroundColor: src.color + '15',
    tension: 0.4,
    borderWidth: 2,
    fill: false,
    pointRadius: allMonths.map((m) => m === '2026-05' ? 5 : 3),
    pointBackgroundColor: allMonths.map((m) => m === '2026-05' ? src.color + '60' : src.color),
    pointBorderColor: allMonths.map((m) => m === '2026-05' ? src.color : src.color),
    pointStyle: allMonths.map((m) => m === '2026-05' ? 'rectRot' as const : 'circle' as const),
    segment: {
      borderDash: (ctx: { p1DataIndex: number }) => ctx.p1DataIndex === allMonths.length - 1 ? [6, 3] : undefined,
      borderColor: (ctx: { p1DataIndex: number }) => ctx.p1DataIndex === allMonths.length - 1 ? src.color + '80' : undefined,
    },
  }));

  /* ──── Parent vs Ambassador gap tracking ──── */
  const pvAmbData = useMemo(() => {
    return allMonths.map((m) => {
      const p = ALL_DATA[m].Parent || 0;
      const a = ALL_DATA[m]['Airway Ambassador'] || 0;
      const gap = p - a;
      const pct = p > 0 ? Math.round((a / p) * 100) : (a > 0 ? 999 : 0);
      return { parent: p, amb: a, gap, pct, crossed: a >= p };
    });
  }, []);

  const latestGap = pvAmbData[pvAmbData.length - 1];
  const gapTrend6 = pvAmbData.length >= 7 ? pvAmbData[pvAmbData.length - 7] : pvAmbData[0];
  const gapTrend6Label = pvAmbData.length >= 7 ? lineLabels[pvAmbData.length - 7] : lineLabels[0];
  const gapNarrowed = Math.abs(gapTrend6.gap) - Math.abs(latestGap.gap);
  const trendColor6 = gapNarrowed > 0 ? '#0F6E56' : gapNarrowed < 0 ? '#A32D2D' : '#666';
  const trendWord6 = gapNarrowed > 0 ? `Narrowed by ${gapNarrowed}` : gapNarrowed < 0 ? `Widened by ${Math.abs(gapNarrowed)}` : 'No change';

  // Parent vs Ambassador chart — last 15 months
  const pvAmbSlice = allMonths.slice(-15);
  const pvAmbLabels = pvAmbSlice.map(fmtMonth);

  /* ──── Per-source deep dives ──── */
  const perSourceSections = useMemo(() => {
    return PER_SOURCE_DEFS.map((src) => {
      const vals = allMonths.map((m) => ALL_DATA[m][src.key] || 0);
      const hasData = vals.some((v) => v > 0);
      if (!hasData) return null;

      const firstIdx = vals.findIndex((v) => v > 0);
      const trimMonths = allMonths.slice(firstIdx);
      const trimLabels = trimMonths.map(fmtMonth);
      const trimVals = vals.slice(firstIdx);

      const lastIdx = trimVals.length - 1;
      const currentVal = trimVals[lastIdx];
      const actualVal = isProjected ? (may2026Actual[src.key as keyof RefMonth] || 0) : currentVal;

      // 3-month avg (excluding current)
      let avg3Sum = 0, avg3Count = 0;
      for (let i = Math.max(0, lastIdx - 3); i < lastIdx; i++) {
        if (trimVals[i] > 0) { avg3Sum += trimVals[i]; avg3Count++; }
      }
      const avg3 = avg3Count > 0 ? Math.round(avg3Sum / avg3Count) : 0;

      // YOY
      const currentMonthKey = trimMonths[lastIdx];
      const [cy, cm] = currentMonthKey.split('-');
      const yoyKey = `${parseInt(cy) - 1}-${cm}`;
      const yoyVal = ALL_DATA[yoyKey] ? (ALL_DATA[yoyKey][src.key] || 0) : 0;
      const yoyPct = yoyVal > 0 ? Math.round((currentVal - yoyVal) / yoyVal * 100) : 0;

      // Peak
      const peakVal = Math.max(...trimVals);
      const peakIdx = trimVals.indexOf(peakVal);

      const projectedVal = isProjected ? (may2026Projected[src.key as keyof RefMonth] || 0) : currentVal;

      return {
        ...src,
        trimMonths,
        trimLabels,
        trimVals,
        currentVal,
        actualVal: actualVal as number,
        projectedVal: projectedVal as number,
        avg3,
        yoyVal,
        yoyPct,
        peakVal,
        peakLabel: trimLabels[peakIdx],
      };
    }).filter(Boolean);
  }, [isProjected]);

  /* ──── Ambassador YOY sorted ──── */
  const sortedAmbNames = useMemo(() => {
    const names = Object.keys(AMB_YOY_DATA);
    // Compute pace
    names.forEach((n) => {
      AMB_YOY_DATA[n]._pace2026 = Math.round((AMB_YOY_DATA[n][2026] || 0) * ANN_FACTOR);
    });
    // Sort by 2026 pace vs 2025 % change
    return names.sort((a, b) => {
      const da = AMB_YOY_DATA[a], db = AMB_YOY_DATA[b];
      const paceA = da._pace2026 || 0, paceB = db._pace2026 || 0;
      const prevA = da[2025] || 0, prevB = db[2025] || 0;
      const chgA = prevA > 0 ? ((paceA - prevA) / prevA * 100) : (paceA > 0 ? 99999 : -99999);
      const chgB = prevB > 0 ? ((paceB - prevB) / prevB * 100) : (paceB > 0 ? 99999 : -99999);
      return chgB - chgA;
    });
  }, []);

  const chartTop12 = useMemo(() => {
    return [...sortedAmbNames].sort((a, b) => (AMB_YOY_DATA[b]._pace2026 || 0) - (AMB_YOY_DATA[a]._pace2026 || 0)).slice(0, 12);
  }, [sortedAmbNames]);

  // Diversification
  const megaThree = ['Lauren Johnson NNM', 'Kendra Needham', 'Ginny Yurich'];
  const top3ByYear: Record<number, number> = { 2023: 0, 2024: 0, 2025: 0, 2026: 0 };
  megaThree.forEach((n) => {
    [2023, 2024, 2025, 2026].forEach((y) => { top3ByYear[y] += AMB_YOY_DATA[n]?.[y as 2023 | 2024 | 2025 | 2026] || 0; });
  });

  /* ──── RENDER ──── */

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: TP.text, margin: 0 }}>Referrer Source Breakdown</h2>
        <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
          Data from Salesforce exports, {fmtMonthFull(allMonths[0])} through {fmtMonthFull(latestKey)}
        </p>
      </div>

      {/* Projection banner */}
      {isProjected && (
        <div style={{
          background: '#f0f4f8', borderRadius: 10, padding: '14px 18px',
          marginBottom: 18, fontSize: '0.88em', color: '#555',
        }}>
          {fmtMonthFull('2026-05')} -- Through day {MAY_2026_SF_DAYS} of {MAY_2026_DAYS_IN_MONTH} · Actual: <strong>{may2026Actual.total.toLocaleString()}</strong> · Projected end-of-month: <strong>{may2026Projected.total.toLocaleString()}</strong>
        </div>
      )}

      {/* Top source cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {topSources.map((s) => {
          const projVal = may2026Projected[s.key as keyof RefMonth] || 0;
          const subText = isProjected
            ? `${s.val.toLocaleString()} actual → ${Number(projVal).toLocaleString()} projected`
            : `${(latest.total > 0 ? (s.val / latest.total * 100).toFixed(1) : '0')}% of ${latest.total.toLocaleString()} total`;
          return (
            <StatCard key={s.key} label={s.label} color={s.color}
              value={s.val}
              sub={subText}
            />
          );
        })}
      </div>

      {/* Referrer Source Growth Chart + Projected Box */}
      <div style={{ display: 'grid', gridTemplateColumns: isProjected ? '1fr 200px' : '1fr', gap: 14, alignItems: 'start' }}>
        <ChartCard title="Referrer Source Growth" subtitle={`All sources · 2023--Present${isProjected ? ' · May = actual through day ' + MAY_2026_SF_DAYS : ''}`}>
          <div style={{ height: 450 }}>
            <Line
              data={{ labels: lineLabels, datasets: growthDatasets }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', labels: { usePointStyle: true, padding: 12, font: { size: 11 } } },
                  tooltip: {
                    mode: 'index' as const, intersect: false,
                    callbacks: {
                      title: (items: { label: string }[]) => {
                        const label = items[0]?.label || '';
                        return label === fmtMonth('2026-05') ? `${label} (${MAY_2026_SF_DAYS} days)` : label;
                      },
                    },
                  },
                },
                interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </ChartCard>

        {isProjected && (
          <div style={{
            background: '#f8f9fb', border: '1px solid #e2e8f0', borderRadius: 10,
            padding: '14px 16px', marginTop: 0,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TP.text, marginBottom: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
              Projected May
            </div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>
              Based on {MAY_2026_SF_DAYS}-day pace
            </div>
            {CHART_SOURCES.map((src) => {
              const projVal = getChartVal(may2026Projected, src);
              const actVal = getChartVal(may2026Actual, src);
              return (
                <div key={src.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: 11, color: '#555', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: src.color, display: 'inline-block' }} />
                    {src.label}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: TP.text }}>{projVal.toLocaleString()}</span>
                </div>
              );
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0 0', marginTop: 4, borderTop: '2px solid #e2e8f0' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: TP.text }}>Total</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: TP.text }}>{may2026Projected.total.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* ──── Parent vs Ambassador ──── */}
      <SectionHeader color="#5BA88C" label="Parent vs Ambassador" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <StatCard label={`May So Far (${MAY_2026_SF_DAYS} days)`} color={TP.text}
          value={`Parent ${may2026Actual.Parent} · Amb ${may2026Actual['Airway Ambassador']}`}
          sub={`On pace for Parent ${latestGap.parent} · Amb ${latestGap.amb}`}
          isText
        />
        <StatCard label="6-Month Trend" color={trendColor6}
          value={trendWord6}
          sub={`Gap was ${Math.abs(gapTrend6.gap)} in ${gapTrend6Label}, now ${Math.abs(latestGap.gap)}`}
          isText
        />
        <StatCard label="Goal" color={latestGap.crossed ? '#0F6E56' : TP.blue}
          value={latestGap.crossed ? 'Crossed' : `${Math.abs(latestGap.gap)} away`}
          sub="Ambassadors overtake parent submissions"
          isText
        />
      </div>

      <ChartCard title="Parent vs Ambassador" subtitle="Monthly submissions · Goal: ambassador line overtakes parent line">
        <div style={{ height: 380 }}>
          <Line
            data={{
              labels: pvAmbLabels,
              datasets: [
                {
                  label: 'Parent',
                  data: pvAmbSlice.map((m) => ALL_DATA[m].Parent || 0),
                  borderColor: '#7BAFD4', backgroundColor: '#7BAFD420',
                  tension: 0.4, borderWidth: 3, fill: true, pointRadius: 4, pointBackgroundColor: '#7BAFD4',
                },
                {
                  label: 'Airway Ambassador',
                  data: pvAmbSlice.map((m) => ALL_DATA[m]['Airway Ambassador'] || 0),
                  borderColor: '#5BA88C', backgroundColor: '#5BA88C20',
                  tension: 0.4, borderWidth: 3, fill: true, pointRadius: 4, pointBackgroundColor: '#5BA88C',
                },
              ],
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top', labels: { usePointStyle: true, padding: 16, font: { size: 12, weight: 'bold' } } },
                tooltip: { mode: 'index' as const, intersect: false },
              },
              interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
              scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Submissions', font: { size: 11 } } },
              },
            }}
          />
        </div>
      </ChartCard>

      {/* ──── Per-Source Sections ──── */}
      <div style={{ marginTop: 16 }}>
        <button
          onClick={() => setPerSourceExpanded(!perSourceExpanded)}
          style={{
            background: TP.navy, color: '#fff', border: 'none', borderRadius: 6,
            padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            marginBottom: 16,
          }}
        >
          {perSourceExpanded ? 'Hide Per-Source Deep Dives' : 'Show Per-Source Deep Dives'}
        </button>
      </div>

      {perSourceExpanded && perSourceSections.map((src) => {
        if (!src) return null;
        const yoyColor = src.yoyPct >= 0 ? '#0F6E56' : '#A32D2D';
        const yoySign = src.yoyPct >= 0 ? '+' : '';
        return (
          <div key={src.key}>
            <SectionHeader color={src.color} label={src.label} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
              {isProjected ? (
                <>
                  <StatCard label={`Actual (day ${MAY_2026_SF_DAYS})`} color={src.color} value={src.currentVal} sub={`of ${may2026Actual.total.toLocaleString()} total`} />
                  <StatCard label="Projected" color={src.color} value={src.projectedVal} sub="end of month" />
                </>
              ) : (
                <>
                  <StatCard label="Current Month" color={src.color} value={src.currentVal} sub={src.trimLabels[src.trimLabels.length - 1]} />
                  <StatCard label="Previous Month" color={src.color}
                    value={src.trimVals.length > 1 ? src.trimVals[src.trimVals.length - 2] : 0}
                    sub={src.trimLabels.length > 1 ? src.trimLabels[src.trimLabels.length - 2] : '--'}
                  />
                </>
              )}
              <StatCard label="3-Month Avg" color="#666" value={src.avg3} sub="submissions/mo" />
              {src.yoyVal > 0 ? (
                <StatCard label="YOY Change" color={yoyColor} value={`${yoySign}${src.yoyPct}%`} sub={`vs ${src.yoyVal} same month last year`} isText />
              ) : (
                <StatCard label="Peak" color="#666" value={src.peakVal} sub={src.peakLabel} />
              )}
            </div>
            <ChartCard title="">
              <div style={{ height: 280 }}>
                <Bar
                  data={{
                    labels: src.trimLabels,
                    datasets: [{
                      label: src.label,
                      data: src.trimVals,
                      backgroundColor: src.trimMonths.map((m) => m === '2026-05' ? src.color + '40' : src.color),
                      borderColor: src.color,
                      borderWidth: 1,
                      borderRadius: 3,
                    }],
                  }}
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#888', font: { size: 11 } } },
                      x: { grid: { display: false }, ticks: { color: '#888', font: { size: 10 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 18 } },
                    },
                  }}
                />
              </div>
            </ChartCard>
          </div>
        );
      })}

      {/* ──── Monthly Breakdown Table ──── */}
      <ChartCard title="Monthly Breakdown">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82em', background: '#fff', borderRadius: 10, overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: TP.navy }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: '#fff', minWidth: 90 }}>Source</th>
                {allMonths.map((m) => (
                  <th key={m} style={{ padding: '6px 4px', textAlign: 'right', color: '#fff', fontSize: '0.8em', fontWeight: 600, whiteSpace: 'nowrap', minWidth: 46 }}>
                    {fmtMonth(m)}{m === '2026-05' ? ` (${MAY_2026_SF_DAYS}d)` : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE_SOURCES.map((src, idx) => (
                <tr key={src.key} style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                  <td style={{ padding: '6px 10px', fontWeight: 600, color: src.color }}>{src.label}</td>
                  {allMonths.map((m) => {
                    const v = ALL_DATA[m][src.key] || 0;
                    return (
                      <td key={m} style={{ padding: '6px 4px', textAlign: 'right' }}>
                        {v > 0 ? v.toLocaleString() : '--'}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr style={{ background: TP.navy, fontWeight: 'bold' }}>
                <td style={{ padding: '8px 10px', color: '#fff' }}>Total</td>
                {allMonths.map((m) => (
                  <td key={m} style={{ padding: '8px 4px', textAlign: 'right', color: '#fff' }}>
                    {ALL_DATA[m].total.toLocaleString()}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* ═══════════════════════════════════════════════════════════
         INDIVIDUAL AMBASSADOR TRACKING
         ═══════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb',
        padding: 16, marginTop: 32, borderTop: `3px solid ${TP.navy}`,
      }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: TP.text, marginBottom: 4 }}>Individual Ambassador Tracking</div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
          Year-over-year submissions · Influencers + Airway Ambassadors combined · 2026 = YTD through May 23
        </div>

        {/* Diversification callout */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f7fa, #e8f4ec)',
          borderRadius: 10, padding: '16px 20px', margin: '0 0 20px', fontSize: '0.88em', lineHeight: 1.6,
        }}>
          <strong style={{ color: TP.navy }}>The diversification story:</strong>{' '}
          In 2024, the top 3 (Lauren, Kendra, Ginny) drove <strong>{(top3ByYear[2024] / AMB_TOTALS[2024] * 100).toFixed(0)}%</strong> of all ambassador submissions.{' '}
          In 2025, those same 3 dropped to <strong>{(top3ByYear[2025] / AMB_TOTALS[2025] * 100).toFixed(0)}%</strong>.{' '}
          In 2026 YTD, they account for just <strong>{(top3ByYear[2026] / AMB_TOTALS[2026] * 100).toFixed(0)}%</strong>.{' '}
          In 2023, 1 person carried 50% of submissions. In 2024, it took 2. In 2025, it took 5. In 2026, it takes 7. The weight is spreading across more people every year.
        </div>

        {/* Year total cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {([2023, 2024, 2025, 2026] as const).map((y) => {
            const label = y === 2026 ? '2026 YTD' : String(y);
            let yoyLine = '';
            let yoyColor = '';
            if (y === 2026) {
              const annualized = Math.round(AMB_TOTALS[2026] * (12 / 3.5));
              yoyLine = `~${annualized.toLocaleString()} annualized pace`;
              yoyColor = '#888';
            } else if (y > 2023) {
              const prev = AMB_TOTALS[(y - 1) as 2023 | 2024 | 2025];
              const cur = AMB_TOTALS[y];
              const pctChg = ((cur - prev) / prev * 100).toFixed(0);
              const arrow = cur >= prev ? '↑' : '↓';
              yoyColor = cur >= prev ? '#2e7d32' : '#c62828';
              yoyLine = `${arrow} ${Number(pctChg) > 0 ? '+' : ''}${pctChg}% YOY`;
            }
            return (
              <div key={y} style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: 12 }}>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: TP.navy, marginTop: 4 }}>{AMB_TOTALS[y].toLocaleString()}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{AMB_COUNTS[y]} active ambassadors</div>
                {yoyLine && <div style={{ fontSize: 12, color: yoyColor, marginTop: 2 }}>{yoyLine}</div>}
              </div>
            );
          })}
        </div>

        {/* Top 12 horizontal bar chart */}
        <div style={{ fontSize: '0.82em', color: '#888', marginBottom: 8 }}>Top 12 by 2026 annualized pace vs 2025 actual</div>
        <div style={{ height: 460 }}>
          <Bar
            data={{
              labels: chartTop12.map((n) => n.length > 22 ? n.substring(0, 20) + '...' : n),
              datasets: [
                {
                  label: '2025 Actual',
                  data: chartTop12.map((n) => AMB_YOY_DATA[n][2025] || 0),
                  backgroundColor: '#7BAFD4',
                  borderRadius: 4,
                  barPercentage: 0.7,
                },
                {
                  label: '2026 Annualized Pace',
                  data: chartTop12.map((n) => AMB_YOY_DATA[n]._pace2026 || 0),
                  backgroundColor: '#E5A04B',
                  borderRadius: 4,
                  barPercentage: 0.7,
                },
              ],
            }}
            options={{
              indexAxis: 'y' as const,
              responsive: true, maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top', labels: { usePointStyle: true, padding: 16, font: { size: 11 } } },
                tooltip: {
                  callbacks: {
                    afterBody: (ctx) => {
                      const idx = ctx[0].dataIndex;
                      const name = chartTop12[idx];
                      return `YTD actual: ${AMB_YOY_DATA[name][2026] || 0} (3.5 months)`;
                    },
                  },
                },
              },
              scales: {
                x: { beginAtZero: true, title: { display: true, text: 'Submissions', font: { size: 11 } } },
                y: { ticks: { font: { size: 11 } } },
              },
            }}
          />
        </div>

        {/* Full ambassador table */}
        <div style={{ overflowX: 'auto', marginTop: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84em', background: '#fff', borderRadius: 10, overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: TP.navy }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: '#fff' }}>Ambassador</th>
                <th style={{ padding: '8px 8px', textAlign: 'center', color: '#fff' }}>Type</th>
                {[2023, 2024, 2025, 2026].map((y) => (
                  <th key={y} style={{ padding: '8px 10px', textAlign: 'right', color: '#fff' }}>{y === 2026 ? '2026 YTD' : y}</th>
                ))}
                <th style={{ padding: '8px 10px', textAlign: 'right', color: '#fff' }}>2026 Pace</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: '#fff' }}>vs 2025</th>
              </tr>
            </thead>
            <tbody>
              {sortedAmbNames.map((name, idx) => {
                const d = AMB_YOY_DATA[name];
                const pace = d._pace2026 || 0;
                const prev = d[2025] || 0;
                let vs2025 = '--';
                let vs2025Color = '#666';
                if (pace > 0 && prev > 0) {
                  const chg = ((pace - prev) / prev * 100).toFixed(0);
                  if (pace > prev) { vs2025 = `↑ +${chg}%`; vs2025Color = '#2e7d32'; }
                  else if (pace < prev) { vs2025 = `↓ ${chg}%`; vs2025Color = '#c62828'; }
                  else vs2025 = '--';
                } else if (pace > 0 && prev === 0) { vs2025 = 'New'; vs2025Color = '#2e7d32'; }
                else if (pace === 0 && prev > 0) { vs2025 = 'Inactive'; vs2025Color = '#c62828'; }

                const displayName = name.length > 25 ? name.substring(0, 23) + '...' : name;
                return (
                  <tr key={name} style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                    <td style={{ padding: '6px 12px', fontWeight: 600, whiteSpace: 'nowrap' }} title={name}>{displayName}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      <span style={{ color: d.type === 'Influencer' ? TP.green : '#5BA88C', fontSize: '0.8em' }}>{d.type}</span>
                    </td>
                    {([2023, 2024, 2025, 2026] as const).map((y) => (
                      <td key={y} style={{ padding: '6px 10px', textAlign: 'right' }}>
                        {d[y] > 0 ? d[y].toLocaleString() : '--'}
                      </td>
                    ))}
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: TP.navy }}>
                      {pace > 0 ? `~${pace.toLocaleString()}` : '--'}
                    </td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', color: vs2025Color }}>{vs2025}</td>
                  </tr>
                );
              })}

              {/* Influencer subtotal */}
              <SubtotalRow label="Influencer Subtotal" bg="#3a5a7a" totals={INF_TOTALS} />
              {/* Ambassador subtotal */}
              <SubtotalRow label="Ambassador Subtotal" bg="#4a6a8a" totals={AIR_TOTALS} />
              {/* Combined total */}
              <SubtotalRow label="All Ambassadors (Program)" bg={TP.navy} totals={AMB_TOTALS} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   Reusable Sub-Components
   ════════════════════════════════════════════════ */

function SectionHeader({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 30, marginBottom: 12, fontWeight: 700, fontSize: 15, color: '#333' }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color, display: 'inline-block', flexShrink: 0 }} />
      <span>{label}</span>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: 16, marginBottom: 24 }}>
      {title && <div style={{ fontWeight: 600, fontSize: 14, color: '#333', marginBottom: subtitle ? 2 : 12 }}>{title}</div>}
      {subtitle && <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

function StatCard({ label, color, value, sub, isText }: { label: string; color: string; value: number | string; sub: string; isText?: boolean }) {
  return (
    <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', borderLeft: `4px solid ${color}`, padding: 12 }}>
      <div style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: isText ? 16 : 22, fontWeight: 700, color, marginTop: 4 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function SubtotalRow({ label, bg, totals }: { label: string; bg: string; totals: Record<number, number> }) {
  const pace = Math.round(totals[2026] * ANN_FACTOR);
  const prev = totals[2025];
  const pctChg = ((pace - prev) / prev * 100).toFixed(0);
  const arrow = pace >= prev ? '↑ +' : '↓ ';
  return (
    <tr style={{ background: bg, fontWeight: 'bold' }}>
      <td style={{ padding: '8px 12px', color: '#fff' }}>{label}</td>
      <td style={{ padding: '8px 8px', textAlign: 'center', color: '#fff', fontSize: '0.8em' }}>--</td>
      {([2023, 2024, 2025, 2026] as const).map((y) => (
        <td key={y} style={{ padding: '8px 10px', textAlign: 'right', color: '#fff' }}>{totals[y].toLocaleString()}</td>
      ))}
      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#fff' }}>~{pace.toLocaleString()}</td>
      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#fff' }}>{arrow}{pctChg}%</td>
    </tr>
  );
}
