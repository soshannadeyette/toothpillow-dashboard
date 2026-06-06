/**
 * Seed script — imports all existing hardcoded dashboard data into Supabase.
 * Run once after creating the Supabase tables:
 *   npx tsx scripts/seed-data.ts
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ===================== DAILY SUBMISSIONS =====================

const jan2026Daily = [
    {date:'2026-01-02',online:0,hybrid:4,prime:0,visitors:500,income:0},
    {date:'2026-01-04',online:0,hybrid:1,prime:0,visitors:320,income:0},
    {date:'2026-01-05',online:0,hybrid:21,prime:0,visitors:680,income:0},
    {date:'2026-01-06',online:53,hybrid:28,prime:0,visitors:1450,income:265},
    {date:'2026-01-07',online:37,hybrid:32,prime:0,visitors:1320,income:185},
    {date:'2026-01-08',online:48,hybrid:19,prime:0,visitors:1680,income:240},
    {date:'2026-01-09',online:44,hybrid:9,prime:0,visitors:1290,income:220},
    {date:'2026-01-10',online:23,hybrid:0,prime:0,visitors:850,income:115},
    {date:'2026-01-11',online:35,hybrid:0,prime:0,visitors:920,income:175},
    {date:'2026-01-12',online:41,hybrid:10,prime:0,visitors:1150,income:205},
    {date:'2026-01-13',online:50,hybrid:19,prime:0,visitors:1680,income:250},
    {date:'2026-01-14',online:45,hybrid:9,prime:0,visitors:1340,income:225},
    {date:'2026-01-15',online:43,hybrid:13,prime:0,visitors:1520,income:215},
    {date:'2026-01-16',online:35,hybrid:18,prime:0,visitors:1210,income:175},
    {date:'2026-01-17',online:24,hybrid:1,prime:0,visitors:780,income:120},
    {date:'2026-01-18',online:36,hybrid:0,prime:0,visitors:900,income:180},
    {date:'2026-01-19',online:48,hybrid:24,prime:0,visitors:1560,income:240},
    {date:'2026-01-20',online:37,hybrid:28,prime:0,visitors:1430,income:185},
    {date:'2026-01-21',online:39,hybrid:15,prime:0,visitors:1120,income:195},
    {date:'2026-01-22',online:30,hybrid:29,prime:0,visitors:1340,income:150},
    {date:'2026-01-23',online:24,hybrid:10,prime:0,visitors:920,income:120},
    {date:'2026-01-24',online:18,hybrid:0,prime:0,visitors:560,income:90},
    {date:'2026-01-25',online:19,hybrid:0,prime:0,visitors:640,income:95},
    {date:'2026-01-26',online:36,hybrid:4,prime:0,visitors:1050,income:180},
    {date:'2026-01-27',online:41,hybrid:10,prime:0,visitors:1340,income:205},
    {date:'2026-01-28',online:44,hybrid:13,prime:0,visitors:1520,income:220},
    {date:'2026-01-29',online:36,hybrid:22,prime:0,visitors:1180,income:180},
    {date:'2026-01-30',online:24,hybrid:4,prime:0,visitors:780,income:120},
    {date:'2026-01-31',online:28,hybrid:0,prime:0,visitors:870,income:140},
];

const feb2026Daily = [
    {date:'2026-02-01',online:23,hybrid:1,prime:0,visitors:680,income:115},
    {date:'2026-02-02',online:24,hybrid:9,prime:2,visitors:820,income:130},
    {date:'2026-02-03',online:36,hybrid:25,prime:0,visitors:1240,income:180},
    {date:'2026-02-04',online:49,hybrid:9,prime:1,visitors:1560,income:250},
    {date:'2026-02-05',online:29,hybrid:24,prime:1,visitors:1120,income:155},
    {date:'2026-02-06',online:32,hybrid:9,prime:2,visitors:950,income:170},
    {date:'2026-02-07',online:24,hybrid:0,prime:0,visitors:720,income:120},
    {date:'2026-02-08',online:17,hybrid:0,prime:0,visitors:540,income:85},
    {date:'2026-02-09',online:45,hybrid:10,prime:1,visitors:1430,income:235},
    {date:'2026-02-10',online:27,hybrid:9,prime:0,visitors:890,income:135},
    {date:'2026-02-11',online:24,hybrid:7,prime:0,visitors:780,income:120},
    {date:'2026-02-12',online:29,hybrid:25,prime:0,visitors:1180,income:165},
    {date:'2026-02-13',online:39,hybrid:3,prime:2,visitors:1320,income:205},
    {date:'2026-02-14',online:19,hybrid:0,prime:0,visitors:600,income:95},
    {date:'2026-02-15',online:15,hybrid:1,prime:0,visitors:520,income:75},
    {date:'2026-02-16',online:70,hybrid:21,prime:0,visitors:1850,income:350},
    {date:'2026-02-17',online:65,hybrid:25,prime:1,visitors:1720,income:335},
    {date:'2026-02-18',online:48,hybrid:18,prime:2,visitors:1540,income:260},
    {date:'2026-02-19',online:50,hybrid:14,prime:0,visitors:1380,income:250},
    {date:'2026-02-20',online:47,hybrid:10,prime:3,visitors:1290,income:270},
    {date:'2026-02-21',online:24,hybrid:0,prime:0,visitors:720,income:120},
    {date:'2026-02-22',online:37,hybrid:1,prime:0,visitors:980,income:185},
    {date:'2026-02-23',online:113,hybrid:9,prime:0,visitors:2340,income:565},
    {date:'2026-02-24',online:80,hybrid:9,prime:1,visitors:1860,income:410},
    {date:'2026-02-25',online:68,hybrid:29,prime:0,visitors:1720,income:340},
    {date:'2026-02-26',online:69,hybrid:16,prime:2,visitors:1650,income:360},
    {date:'2026-02-27',online:53,hybrid:9,prime:0,visitors:1420,income:265},
    {date:'2026-02-28',online:51,hybrid:0,prime:0,visitors:1260,income:255},
];

const mar2026Daily = [
    {date:'2026-03-01',online:41,hybrid:0,prime:0,visitors:1115,income:205},
    {date:'2026-03-02',online:50,hybrid:21,prime:3,visitors:1348,income:250},
    {date:'2026-03-03',online:59,hybrid:18,prime:3,visitors:1443,income:295},
    {date:'2026-03-04',online:65,hybrid:17,prime:3,visitors:1385,income:325},
    {date:'2026-03-05',online:47,hybrid:25,prime:0,visitors:1085,income:235},
    {date:'2026-03-06',online:28,hybrid:6,prime:1,visitors:960,income:140},
    {date:'2026-03-07',online:24,hybrid:0,prime:0,visitors:726,income:120},
    {date:'2026-03-08',online:28,hybrid:0,prime:0,visitors:613,income:140},
    {date:'2026-03-09',online:45,hybrid:5,prime:1,visitors:1687,income:225},
    {date:'2026-03-10',online:52,hybrid:13,prime:1,visitors:1924,income:260},
    {date:'2026-03-11',online:45,hybrid:22,prime:0,visitors:1638,income:225},
    {date:'2026-03-12',online:46,hybrid:19,prime:0,visitors:1492,income:230},
    {date:'2026-03-13',online:42,hybrid:5,prime:1,visitors:1262,income:210},
    {date:'2026-03-14',online:35,hybrid:1,prime:0,visitors:972,income:175},
    {date:'2026-03-15',online:34,hybrid:0,prime:0,visitors:1016,income:170},
    {date:'2026-03-16',online:84,hybrid:11,prime:1,visitors:1790,income:420},
    {date:'2026-03-17',online:49,hybrid:22,prime:1,visitors:1316,income:245},
    {date:'2026-03-18',online:53,hybrid:17,prime:2,visitors:1927,income:265},
    {date:'2026-03-19',online:34,hybrid:5,prime:0,visitors:1546,income:170},
    {date:'2026-03-20',online:38,hybrid:9,prime:1,visitors:1078,income:190},
    {date:'2026-03-21',online:22,hybrid:0,prime:0,visitors:808,income:110},
    {date:'2026-03-22',online:21,hybrid:0,prime:0,visitors:763,income:105},
    {date:'2026-03-23',online:35,hybrid:10,prime:1,visitors:1245,income:175},
    {date:'2026-03-24',online:47,hybrid:14,prime:0,visitors:1238,income:235},
    {date:'2026-03-25',online:38,hybrid:12,prime:0,visitors:1793,income:190},
    {date:'2026-03-26',online:45,hybrid:9,prime:0,visitors:1855,income:225},
    {date:'2026-03-27',online:45,hybrid:9,prime:1,visitors:2135,income:225},
    {date:'2026-03-28',online:36,hybrid:0,prime:0,visitors:1534,income:180},
    {date:'2026-03-29',online:30,hybrid:0,prime:0,visitors:1393,income:150},
    {date:'2026-03-30',online:39,hybrid:17,prime:1,visitors:1831,income:195},
    {date:'2026-03-31',online:36,hybrid:12,prime:0,visitors:1171,income:180},
];

const apr2026Daily = [
    {date:'2026-04-01',online:40,hybrid:10,prime:1,visitors:1250,income:200},
    {date:'2026-04-02',online:30,hybrid:8,prime:0,visitors:940,income:150},
    {date:'2026-04-03',online:27,hybrid:7,prime:0,visitors:827,income:132},
    {date:'2026-04-04',online:18,hybrid:5,prime:0,visitors:574,income:92},
    {date:'2026-04-05',online:27,hybrid:7,prime:0,visitors:838,income:134},
    {date:'2026-04-06',online:46,hybrid:12,prime:1,visitors:1429,income:228},
    {date:'2026-04-07',online:45,hybrid:12,prime:1,visitors:1400,income:224},
    {date:'2026-04-08',online:34,hybrid:9,prime:0,visitors:1051,income:168},
    {date:'2026-04-09',online:34,hybrid:9,prime:0,visitors:1070,income:171},
    {date:'2026-04-10',online:24,hybrid:6,prime:0,visitors:762,income:122},
    {date:'2026-04-11',online:18,hybrid:5,prime:0,visitors:573,income:92},
    {date:'2026-04-12',online:25,hybrid:6,prime:0,visitors:784,income:125},
    {date:'2026-04-13',online:37,hybrid:10,prime:1,visitors:1164,income:186},
    {date:'2026-04-14',online:36,hybrid:9,prime:1,visitors:1139,income:182},
    {date:'2026-04-15',online:40,hybrid:10,prime:1,visitors:1254,income:200},
    {date:'2026-04-16',online:36,hybrid:9,prime:0,visitors:1110,income:177},
    {date:'2026-04-17',online:26,hybrid:7,prime:0,visitors:813,income:130},
    {date:'2026-04-18',online:21,hybrid:5,prime:0,visitors:643,income:103},
    {date:'2026-04-19',online:27,hybrid:7,prime:0,visitors:855,income:137},
    {date:'2026-04-20',online:37,hybrid:9,prime:1,visitors:1156,income:185},
    {date:'2026-04-21',online:44,hybrid:11,prime:1,visitors:1367,income:218},
    {date:'2026-04-22',online:41,hybrid:10,prime:1,visitors:1271,income:203},
    {date:'2026-04-23',online:33,hybrid:9,prime:0,visitors:1043,income:167},
    {date:'2026-04-24',online:25,hybrid:7,prime:0,visitors:795,income:127},
    {date:'2026-04-25',online:23,hybrid:6,prime:0,visitors:712,income:114},
    {date:'2026-04-26',online:24,hybrid:6,prime:0,visitors:744,income:119},
    {date:'2026-04-27',online:38,hybrid:10,prime:1,visitors:1191,income:190},
    {date:'2026-04-28',online:35,hybrid:9,prime:0,visitors:1101,income:176},
    {date:'2026-04-29',online:42,hybrid:11,prime:1,visitors:1325,income:212},
    {date:'2026-04-30',online:36,hybrid:9,prime:0,visitors:1130,income:181},
];

// Source: Salesforce exports pulled May 29, 2026 12:34 PST
const may2026Seed = [
    {date:'2026-05-01',online:31,hybrid:3,prime:3,visitors:1302,income:155},
    {date:'2026-05-02',online:17,hybrid:0,prime:0,visitors:1037,income:85},
    {date:'2026-05-03',online:21,hybrid:0,prime:0,visitors:823,income:105},
    {date:'2026-05-04',online:36,hybrid:13,prime:1,visitors:1218,income:180},
    {date:'2026-05-05',online:26,hybrid:11,prime:0,visitors:1157,income:130},
    {date:'2026-05-06',online:34,hybrid:10,prime:1,visitors:1713,income:170},
    {date:'2026-05-07',online:27,hybrid:8,prime:2,visitors:1303,income:135},
    {date:'2026-05-08',online:23,hybrid:2,prime:3,visitors:1181,income:115},
    {date:'2026-05-09',online:16,hybrid:0,prime:0,visitors:832,income:80},
    {date:'2026-05-10',online:15,hybrid:0,prime:0,visitors:664,income:75},
    {date:'2026-05-11',online:37,hybrid:3,prime:0,visitors:1294,income:185},
    {date:'2026-05-12',online:28,hybrid:11,prime:0,visitors:1294,income:140},
    {date:'2026-05-13',online:33,hybrid:13,prime:0,visitors:1478,income:165},
    {date:'2026-05-14',online:28,hybrid:18,prime:0,visitors:1382,income:140},
    {date:'2026-05-15',online:22,hybrid:3,prime:0,visitors:1082,income:110},
    {date:'2026-05-16',online:18,hybrid:0,prime:0,visitors:823,income:90},
    {date:'2026-05-17',online:15,hybrid:0,prime:0,visitors:610,income:75},
    {date:'2026-05-18',online:41,hybrid:9,prime:0,visitors:1129,income:205},
    {date:'2026-05-19',online:34,hybrid:6,prime:0,visitors:1155,income:170},
    {date:'2026-05-20',online:29,hybrid:14,prime:0,visitors:1359,income:145},
    {date:'2026-05-21',online:20,hybrid:8,prime:0,visitors:1077,income:100},
    {date:'2026-05-22',online:32,hybrid:5,prime:0,visitors:1186,income:160},
    {date:'2026-05-23',online:29,hybrid:0,prime:0,visitors:1133,income:145},
    {date:'2026-05-24',online:17,hybrid:0,prime:0,visitors:752,income:85},
    {date:'2026-05-25',online:23,hybrid:1,prime:0,visitors:989,income:115},
    {date:'2026-05-26',online:40,hybrid:22,prime:0,visitors:1378,income:200},
    {date:'2026-05-27',online:40,hybrid:15,prime:1,visitors:1478,income:200},
    {date:'2026-05-28',online:70,hybrid:11,prime:1,visitors:1415,income:350},
    {date:'2026-05-29',online:68,hybrid:3,prime:1,visitors:1014,income:340},
    {date:'2026-05-30',online:38,hybrid:0,prime:0,visitors:1100,income:190},
    {date:'2026-05-31',online:26,hybrid:0,prime:0,visitors:850,income:130},
    {date:'2026-06-01',online:77,hybrid:13,prime:0,visitors:0,income:385},
    {date:'2026-06-02',online:62,hybrid:12,prime:0,visitors:0,income:310},
    {date:'2026-06-03',online:42,hybrid:18,prime:0,visitors:0,income:210},
    {date:'2026-06-04',online:50,hybrid:8,prime:0,visitors:0,income:250},
    {date:'2026-06-05',online:1,hybrid:0,prime:0,visitors:0,income:5},
];

const allDailySubmissions = [
    ...jan2026Daily,
    ...feb2026Daily,
    ...mar2026Daily,
    ...apr2026Daily,
    ...may2026Seed,
];

// ===================== GOOGLE ADS DAILY =====================

// Google Ads daily — ALL REAL DATA
// submit = GA conversions. started/finished/treatment from Salesforce pipeline.
// Blackout May 11-20: tracking unreliable.
// March entries zeroed out to overwrite old stale Supabase data.
const googleAdsDaily = [
    { date: '2026-03-25', spend: 0, impressions: 0, clicks: 0, submit: 0, started: 0, finished: 0, treatment: 0 },
    { date: '2026-03-26', spend: 0, impressions: 0, clicks: 0, submit: 0, started: 0, finished: 0, treatment: 0 },
    { date: '2026-03-27', spend: 0, impressions: 0, clicks: 0, submit: 0, started: 0, finished: 0, treatment: 0 },
    { date: '2026-03-28', spend: 0, impressions: 0, clicks: 0, submit: 0, started: 0, finished: 0, treatment: 0 },
    { date: '2026-03-31', spend: 0, impressions: 0, clicks: 0, submit: 0, started: 0, finished: 0, treatment: 0 },
    { date: '2026-04-03', spend: 11.99, impressions: 24, clicks: 4, submit: 0, started: 0, finished: 0, treatment: 0 },
    { date: '2026-04-04', spend: 103.63, impressions: 568, clicks: 28, submit: 0, started: 0, finished: 0, treatment: 0 },
    { date: '2026-04-05', spend: 107.09, impressions: 561, clicks: 32, submit: 3, started: 0, finished: 0, treatment: 0 },
    { date: '2026-04-06', spend: 127.50, impressions: 674, clicks: 52, submit: 7, started: 0, finished: 0, treatment: 0 },
    { date: '2026-04-07', spend: 154.59, impressions: 1228, clicks: 49, submit: 3, started: 2, finished: 2, treatment: 1 },
    { date: '2026-04-08', spend: 258.41, impressions: 1924, clicks: 70, submit: 10, started: 0, finished: 0, treatment: 0 },
    { date: '2026-04-09', spend: 212.83, impressions: 1542, clicks: 65, submit: 8, started: 1, finished: 1, treatment: 0 },
    { date: '2026-04-10', spend: 116.18, impressions: 1021, clicks: 39, submit: 6, started: 1, finished: 1, treatment: 0 },
    { date: '2026-04-11', spend: 105.61, impressions: 662, clicks: 47, submit: 4, started: 1, finished: 1, treatment: 0 },
    { date: '2026-04-12', spend: 136.62, impressions: 1011, clicks: 52, submit: 8, started: 0, finished: 0, treatment: 0 },
    { date: '2026-04-13', spend: 268.66, impressions: 1610, clicks: 78, submit: 8, started: 1, finished: 1, treatment: 0 },
    { date: '2026-04-14', spend: 249.37, impressions: 1189, clicks: 66, submit: 9, started: 1, finished: 1, treatment: 1 },
    { date: '2026-04-15', spend: 227.47, impressions: 1116, clicks: 61, submit: 5, started: 0, finished: 0, treatment: 0 },
    { date: '2026-04-16', spend: 181.71, impressions: 1099, clicks: 42, submit: 10, started: 0, finished: 0, treatment: 0 },
    { date: '2026-04-17', spend: 197.63, impressions: 597, clicks: 42, submit: 6, started: 0, finished: 0, treatment: 0 },
    { date: '2026-04-18', spend: 185.28, impressions: 793, clicks: 48, submit: 8, started: 3, finished: 3, treatment: 0 },
    { date: '2026-04-19', spend: 232.27, impressions: 602, clicks: 44, submit: 9, started: 2, finished: 2, treatment: 0 },
    { date: '2026-04-20', spend: 198.62, impressions: 738, clicks: 47, submit: 5, started: 0, finished: 0, treatment: 0 },
    { date: '2026-04-21', spend: 190.47, impressions: 667, clicks: 46, submit: 12, started: 0, finished: 0, treatment: 0 },
    { date: '2026-04-22', spend: 192.03, impressions: 782, clicks: 48, submit: 8, started: 0, finished: 0, treatment: 0 },
    { date: '2026-04-23', spend: 222.05, impressions: 741, clicks: 54, submit: 9, started: 1, finished: 1, treatment: 0 },
    { date: '2026-04-24', spend: 197.48, impressions: 578, clicks: 57, submit: 7, started: 2, finished: 2, treatment: 0 },
    { date: '2026-04-25', spend: 168.25, impressions: 705, clicks: 46, submit: 4, started: 1, finished: 1, treatment: 0 },
    { date: '2026-04-26', spend: 155.43, impressions: 1127, clicks: 43, submit: 1, started: 0, finished: 0, treatment: 0 },
    { date: '2026-04-27', spend: 221.08, impressions: 1184, clicks: 50, submit: 11, started: 1, finished: 1, treatment: 0 },
    { date: '2026-04-28', spend: 219.01, impressions: 689, clicks: 76, submit: 17, started: 1, finished: 1, treatment: 0 },
    { date: '2026-04-29', spend: 181.96, impressions: 575, clicks: 58, submit: 6, started: 2, finished: 2, treatment: 0 },
    { date: '2026-04-30', spend: 198.25, impressions: 967, clicks: 52, submit: 9, started: 1, finished: 1, treatment: 0 },
    { date: '2026-05-01', spend: 143.50, impressions: 398, clicks: 35, submit: 5, started: 0, finished: 0, treatment: 0 },
    { date: '2026-05-02', spend: 157.56, impressions: 517, clicks: 39, submit: 6, started: 0, finished: 0, treatment: 0 },
    { date: '2026-05-03', spend: 337.32, impressions: 936, clicks: 85, submit: 9, started: 1, finished: 1, treatment: 0 },
    { date: '2026-05-04', spend: 283.19, impressions: 946, clicks: 76, submit: 10, started: 2, finished: 2, treatment: 1 },
    { date: '2026-05-05', spend: 239.77, impressions: 954, clicks: 65, submit: 6, started: 2, finished: 2, treatment: 0 },
    { date: '2026-05-06', spend: 231.78, impressions: 895, clicks: 77, submit: 9, started: 0, finished: 0, treatment: 0 },
    { date: '2026-05-07', spend: 230.43, impressions: 912, clicks: 69, submit: 13, started: 1, finished: 1, treatment: 0 },
    { date: '2026-05-08', spend: 225.62, impressions: 791, clicks: 78, submit: 13, started: 4, finished: 4, treatment: 0 },
    { date: '2026-05-09', spend: 194.82, impressions: 692, clicks: 71, submit: 15, started: 1, finished: 1, treatment: 0 },
    { date: '2026-05-10', spend: 191.66, impressions: 1170, clicks: 58, submit: 9, started: 1, finished: 1, treatment: 0 },
    { date: '2026-05-11', spend: 216.95, impressions: 1206, clicks: 89, submit: 13, started: 1, finished: 1, treatment: 0 },
    { date: '2026-05-12', spend: 254.73, impressions: 1571, clicks: 92, submit: 17, started: 0, finished: 0, treatment: 0 },
    { date: '2026-05-13', spend: 390.39, impressions: 2419, clicks: 117, submit: 11, started: 1, finished: 1, treatment: 0 },
    { date: '2026-05-14', spend: 317.17, impressions: 2024, clicks: 97, submit: 13, started: 0, finished: 0, treatment: 0 },
    { date: '2026-05-15', spend: 318.00, impressions: 1861, clicks: 103, submit: 16, started: 0, finished: 0, treatment: 0 },
    { date: '2026-05-16', spend: 315.27, impressions: 1514, clicks: 101, submit: 11, started: 0, finished: 0, treatment: 0 },
    { date: '2026-05-17', spend: 341.29, impressions: 1379, clicks: 106, submit: 15, started: 0, finished: 0, treatment: 0 },
    { date: '2026-05-18', spend: 366.49, impressions: 1987, clicks: 120, submit: 17, started: 0, finished: 0, treatment: 0 },
    { date: '2026-05-19', spend: 237.98, impressions: 1440, clicks: 72, submit: 8, started: 0, finished: 0, treatment: 0 },
    { date: '2026-05-20', spend: 351.23, impressions: 2391, clicks: 119, submit: 19, started: 1, finished: 1, treatment: 0 },
    { date: '2026-05-21', spend: 382.87, impressions: 2423, clicks: 118, submit: 10, started: 1, finished: 1, treatment: 0 },
    { date: '2026-05-22', spend: 366.45, impressions: 2288, clicks: 117, submit: 10, started: 0, finished: 0, treatment: 0 },
    { date: '2026-05-23', spend: 457.97, impressions: 2616, clicks: 142, submit: 16, started: 1, finished: 1, treatment: 0 },
    { date: '2026-05-24', spend: 452.07, impressions: 2124, clicks: 146, submit: 12, started: 0, finished: 0, treatment: 0 },
    { date: '2026-05-25', spend: 384.50, impressions: 2328, clicks: 127, submit: 16, started: 2, finished: 2, treatment: 0 },
    { date: '2026-05-26', spend: 465.76, impressions: 2475, clicks: 142, submit: 11, started: 1, finished: 1, treatment: 1 },
    { date: '2026-05-27', spend: 447.46, impressions: 2213, clicks: 141, submit: 19, started: 3, finished: 3, treatment: 0 },
    { date: '2026-05-28', spend: 409.38, impressions: 1835, clicks: 142, submit: 15, started: 1, finished: 1, treatment: 0 },
    { date: '2026-05-29', spend: 418.49, impressions: 2018, clicks: 132, submit: 20, started: 1, finished: 1, treatment: 0 },
    { date: '2026-05-30', spend: 370.66, impressions: 1714, clicks: 131, submit: 20, started: 2, finished: 2, treatment: 0 },
    { date: '2026-05-31', spend: 227.45, impressions: 1367, clicks: 88, submit: 20, started: 0, finished: 0, treatment: 0 },
    { date: '2026-06-01', spend: 504.80, impressions: 2273, clicks: 155, submit: 18, started: 7, finished: 7, treatment: 0 },
    { date: '2026-06-02', spend: 489.53, impressions: 2571, clicks: 137, submit: 23, started: 0, finished: 0, treatment: 0 },
    { date: '2026-06-03', spend: 448.76, impressions: 2074, clicks: 137, submit: 19, started: 2, finished: 2, treatment: 0 },
    { date: '2026-06-04', spend: 211.58, impressions: 1033, clicks: 63, submit: 0, started: 0, finished: 0, treatment: 0 },
    { date: '2026-06-05', spend: 433.85, impressions: 2121, clicks: 126, submit: 11, started: 0, finished: 0, treatment: 0 },
];

// ===================== MONTHLY SUMMARIES =====================

// Source: Salesforce "New Online Patients THIS YEAR", "Hybrid Screenings THIS YEAR",
// "Prime Screenings THIS YEAR" exports pulled June 4, 2026 07:21 PST
const monthlySummaries = [
    {
        year: 2026, month: 1, month_name: 'January',
        goal: 1455, total_submissions: 1419,
        online_submissions: 1054, hybrid_submissions: 345, prime_submissions: 20,
        total_income: 5270, total_visitors: 37320, usa_visitors: 33544,
        conversion_rate: 2.82, usa_conversion_rate: 3.14,
        days_tracked: 31, daily_avg: 45.8,
    },
    {
        year: 2026, month: 2, month_name: 'February',
        goal: 1600, total_submissions: 1521,
        online_submissions: 1208, hybrid_submissions: 295, prime_submissions: 18,
        total_income: 6040, total_visitors: 51480, usa_visitors: 44756,
        conversion_rate: 2.35, usa_conversion_rate: 2.70,
        days_tracked: 28, daily_avg: 54.3,
    },
    {
        year: 2026, month: 3, month_name: 'March',
        goal: 1760, total_submissions: 1609,
        online_submissions: 1288, hybrid_submissions: 299, prime_submissions: 22,
        total_income: 6440, total_visitors: 39218, usa_visitors: 33417,
        conversion_rate: 3.28, usa_conversion_rate: 3.85,
        days_tracked: 31, daily_avg: 51.9,
    },
    {
        year: 2026, month: 4, month_name: 'April',
        goal: 1800, total_submissions: 1230,
        online_submissions: 967, hybrid_submissions: 251, prime_submissions: 12,
        total_income: 4835, total_visitors: 30311, usa_visitors: 25521,
        conversion_rate: 3.19, usa_conversion_rate: 3.79,
        days_tracked: 30, daily_avg: 41.0,
    },
    {
        year: 2026, month: 5, month_name: 'May',
        goal: 1992, total_submissions: 1140,
        online_submissions: 936, hybrid_submissions: 191, prime_submissions: 13,
        total_income: 4680, total_visitors: 33108, usa_visitors: 28559,
        conversion_rate: 2.83, usa_conversion_rate: 3.28,
        days_tracked: 31, daily_avg: 36.8,
    },
    // June intentionally excluded from seed — current month is built from
    // daily_submissions + Save Visitors form on Annual tab. Seeding it here
    // would overwrite visitor data Sosh enters manually.
];

// ===================== SEED FUNCTIONS =====================

async function seedDailySubmissions() {
    console.log(`Seeding ${allDailySubmissions.length} daily submission rows...`);

    // Step 1: Insert new rows (with all data including visitors).
    // ignoreDuplicates: true means existing rows are untouched.
    for (let i = 0; i < allDailySubmissions.length; i += 50) {
        const batch = allDailySubmissions.slice(i, i + 50);
        const { error } = await supabase
            .from('daily_submissions')
            .upsert(batch, { onConflict: 'date', ignoreDuplicates: true });
        if (error) {
            console.error(`  Error inserting batch ${i}:`, error.message);
        }
    }
    console.log('  Inserted new rows (skipped existing)');

    // Step 2: Update ONLY submission columns on existing rows.
    // This corrects online/hybrid/prime/income from Salesforce without touching
    // visitor data the user entered via the Daily Tracker form.
    let updated = 0;
    for (const entry of allDailySubmissions) {
        const { error } = await supabase
            .from('daily_submissions')
            .update({
                online: entry.online,
                hybrid: entry.hybrid,
                prime: entry.prime,
                income: entry.income,
            })
            .eq('date', entry.date);
        if (!error) updated++;
    }
    console.log(`  Updated submission data for ${updated} rows (visitors preserved)`);
}

async function seedGoogleAds() {
    // Google Ads DOES overwrite — this is platform export data, not user-entered.
    console.log(`Seeding ${googleAdsDaily.length} Google Ads daily rows (upsert/overwrite)...`);
    const { error } = await supabase
        .from('google_ads_daily')
        .upsert(googleAdsDaily, { onConflict: 'date' });
    if (error) {
        console.error('  Error:', error.message);
    } else {
        console.log('  Done (upserted)');
    }
}

async function seedMonthlySummaries() {
    // Monthly summary DOES overwrite — this is finalized data from Salesforce exports,
    // not user-entered data. The seed is the source of truth for completed months.
    console.log(`Seeding ${monthlySummaries.length} monthly summary rows (upsert/overwrite)...`);
    const { error } = await supabase
        .from('monthly_summary')
        .upsert(monthlySummaries, { onConflict: 'year,month' });
    if (error) {
        console.error('  Error:', error.message);
    } else {
        console.log('  Done (upserted)');
    }
}

async function seedGoals() {
    console.log('Seeding monthly goals into settings...');
    const goals = {
        1: 1455, 2: 1600, 3: 1760, 4: 1800, 5: 1992, 6: 2203,
        7: 2415, 8: 2604, 9: 2812, 10: 3041, 11: 3292, 12: 3569,
    };
    const { error } = await supabase
        .from('settings')
        .upsert({ key: 'monthly_goals_2026', value: JSON.stringify(goals) }, { onConflict: 'key' });
    if (error) {
        console.error('  Error:', error.message);
    } else {
        console.log('  Done');
    }
}

async function main() {
    console.log('Starting Toothpillow dashboard data seed...\n');
    await seedDailySubmissions();
    await seedGoogleAds();
    await seedMonthlySummaries();
    await seedGoals();
    console.log('\nSeed complete.');
}

main().catch(console.error);
