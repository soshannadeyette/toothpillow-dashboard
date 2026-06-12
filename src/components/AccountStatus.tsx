'use client';

import { useState, useMemo } from 'react';

/* ════════════════════════════════════════════════════════════════════════════
   TP Kids Color Palette
   ════════════════════════════════════════════════════════════════════════ */
const TP = {
  navy: '#1B2A4A',
  teal: '#2A9D8F',
  gold: '#F4A261',
  coral: '#E76F51',
  lightBlue: '#89CFF0',
  text: '#333333',
  green: '#22c55e',
  red: '#ef4444',
};

/* ════════════════════════════════════════════════════════════════════════════
   DATA TYPES
   ════════════════════════════════════════════════════════════════════════ */
interface AmbassadorAccount {
  name: string;
  email: string;
  type: 'Amb' | 'Inf' | 'Pod';
  onboard: string;
  refCode: string;
  hasAffiliate: boolean;
  subdomain: string;
  w9: boolean;
  taggedHL: boolean;
  hasSlack: boolean;
}

interface OrphanAffiliate {
  name: string;
  email: string;
  subdomain: string;
}

interface InternalAccount {
  name: string;
  email: string;
  subdomain: string;
}

/* ════════════════════════════════════════════════════════════════════════════
   HARDCODED DATA — source of truth
   Source: affiliates.csv (affiliate platform) + Full List Airway Ambassadors (Salesforce) 2026-06-12
   ════════════════════════════════════════════════════════════════════════ */

const AMBASSADOR_ACCOUNTS: AmbassadorAccount[] = [
  {name:' Bodybybree',email:'bree.c@bodybybree.com',type:'Inf',onboard:'2024-10-28',refCode:'BODYBYBREE/ BREE',hasAffiliate:true,subdomain:'breecox',w9:false,taggedHL:true,hasSlack:false},
  {name:' Podcast',email:'',type:'Pod',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Abby Tastad',email:'abbyjtastad@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'ABBYJTASTAD',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Abigail Pena',email:'abbyapena@yahoo.com',type:'Amb',onboard:'2025-02-01',refCode:'ABBY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'adina natan',email:'adinanatan32@gmail.com',type:'Amb',onboard:'2026-04-21',refCode:'BREATHEORY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Adrian Schroeder',email:'adrian.schroeder@protonmail.com',type:'Amb',onboard:'2025-02-01',refCode:'ruralmama',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:true},
  {name:'Aimee / John Willis',email:'farmerjohnjwillis@gmail.com',type:'Amb',onboard:'2024-07-08',refCode:'WILLIS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Airwaymyos -Chantal Duhaime / Michelle Quinto',email:'airwaysmyo@outlook.com',type:'Inf',onboard:'2025-01-01',refCode:'AIRWAYSMYO',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:true},
  {name:'Alaynah Morrow',email:'morrowfamily47@gmail.com',type:'Amb',onboard:'2023-04-17',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Alex Clark Newsletter',email:'kamryn+alexclarknewsletter@toothpillow.com',type:'Pod',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Alex Clark Podcast',email:'',type:'Pod',onboard:'2025-01-14',refCode:'ALEXCLARK',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Alex Clark Stories',email:'kamryn+alexclarkstories@toothpillow.com',type:'Pod',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Alex McKeon',email:'alxmckeon@msn.com',type:'Amb',onboard:'2025-02-01',refCode:'AMCKEON',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Alex Pettingill',email:'alexrpettingill@yahoo.com',type:'Amb',onboard:'',refCode:'ALEX',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Alexa Valerian',email:'alexa.r.valerian@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'alexavalerian',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Alexi Parry',email:'alexipparry@gmail.com',type:'Inf',onboard:'2026-06-04',refCode:'ALEXI',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Alexis Eline',email:'boyd.alexis7@gmail.com',type:'Amb',onboard:'2026-06-03',refCode:'HEALINGWITHLEXIE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Alexis Martinez',email:'alexis@rivercitywellnessatx.com',type:'Amb',onboard:'2026-06-05',refCode:'RCW',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Alicia Farmer',email:'afarmer84@gmail.com',type:'Amb',onboard:'2026-03-02',refCode:'FARMERFAM',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Alisha Hanoian',email:'trianglemyooffice@gmail.com',type:'Inf',onboard:'2024-03-01',refCode:'TPMYO',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Alli White',email:'alliwhite11@gmail.com',type:'Amb',onboard:'2026-06-10',refCode:'AlliWhite',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Allie Buquet',email:'alliemorgancc@gmail.com',type:'Amb',onboard:'2024-04-29',refCode:'ALLIE200',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:true},
  {name:'Allison Fajardo',email:'allisonalaska@gmail.com',type:'Inf',onboard:'2026-02-10',refCode:'FAJARDOFAM',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Allison Ososkie',email:'allison.ososkie1@gmail.com',type:'Amb',onboard:'2024-01-03',refCode:'ALLIE',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:true},
  {name:'Allison Shaughnessy',email:'ashaugh28@gmail.com',type:'Amb',onboard:'2026-04-03',refCode:'WILLIAM',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Alyssa Ball',email:'belsolewellness@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'ALYSSAB',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:true},
  {name:'Alyssa Corpstein',email:'acarman@proton.me',type:'Amb',onboard:'2024-10-29',refCode:'CORPSTEIN',hasAffiliate:false,subdomain:'',w9:true,taggedHL:false,hasSlack:false},
  {name:'Alyssa Welch',email:'agwelchdpt@gmail.com',type:'Amb',onboard:'2026-03-25',refCode:'AWELCH',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Amanda Boyles',email:'aboyles022@gmail.com',type:'Amb',onboard:'2025-08-08',refCode:'BreatheWELL',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Amanda Cruz (closequartersmom)',email:'affiliate@closequartersmom.com',type:'Amb',onboard:'2024-02-01',refCode:'CLOSEQUARTERSMOM',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Amanda Johnson',email:'amanda.johnson7211@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'Amanda.Johnson',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Amanda Knox',email:'aknox@rsu39.org',type:'Amb',onboard:'2026-04-02',refCode:'KNOXFAM',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Amanda Penney',email:'dolanpenney@protonmail.com',type:'Amb',onboard:'2025-02-01',refCode:'PENNEY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:true},
  {name:'Amanda Serov',email:'amandaserov@gmail.com',type:'Amb',onboard:'2026-06-08',refCode:'SEROV',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Amaris Ridenour',email:'amaris.ridenour@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Amber Thompson',email:'abthompson14@gmail.com',type:'Amb',onboard:'2026-02-25',refCode:'AMBERTHOMPSON6',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Amelia Mason',email:'amelia_mason@hotmail.com',type:'Amb',onboard:'2025-02-01',refCode:'airwayamy',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:true},
  {name:'Amory Scott',email:'amorycox@gmail.com',type:'Amb',onboard:'2026-04-03',refCode:'AMORY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Amy Bernhard',email:'amy@amybernhard.com',type:'Inf',onboard:'2025-08-25',refCode:'AMYB, AMY20',hasAffiliate:true,subdomain:'amyb',w9:true,taggedHL:false,hasSlack:true},
  {name:'Amy Eck',email:'feelinggreat@e.email',type:'Amb',onboard:'2026-01-20',refCode:'feelinggreat',hasAffiliate:true,subdomain:'feelinggreat',w9:false,taggedHL:false,hasSlack:false},
  {name:'Amy Erickson',email:'amynerickson@gmail.com',type:'Inf',onboard:'2024-10-01',refCode:'ORGANICALLYAMY',hasAffiliate:true,subdomain:'organicallyamy',w9:true,taggedHL:true,hasSlack:true},
  {name:'Amy Migdalia Williams',email:'gonzalez.amy.m@gmail.com',type:'Inf',onboard:'2024-02-01',refCode:'AMYMIGDALIA',hasAffiliate:true,subdomain:'amymigdalia',w9:true,taggedHL:true,hasSlack:false},
  {name:'Amy Rutt',email:'amyrutt@icloud.com',type:'Amb',onboard:'2026-02-26',refCode:'THERUTTS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Amy Swanson',email:'',type:'Amb',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'An Chih "Angela" Do',email:'anchihdo@gmail.com',type:'Amb',onboard:'2024-12-08',refCode:'ANGELARDH',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Andrea Jones',email:'motherofadarling@gmail.com',type:'Amb',onboard:'2026-05-27',refCode:'ABUNDANTWELLNESS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Angela Ribeiro',email:'angiesue2@yahoo.com',type:'Inf',onboard:'2024-10-14',refCode:'RIBEIRO',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Anisha Mauldin',email:'anishamauldin@gmail.com',type:'Amb',onboard:'2025-03-04',refCode:'PILLOW200',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Anna Brayton riseandclimb',email:'annarbrayton@gmail.com',type:'Amb',onboard:'2025-04-07',refCode:'RISEANDCLIMB',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Anna Hipp',email:'hippannae@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'HIPPMAMA',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Anna McAfee',email:'annamcafee@yahoo.com',type:'Amb',onboard:'2025-02-01',refCode:'ANNAM',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Anna Stoltzfus',email:'daleandanna@gmail.com',type:'Amb',onboard:'2024-04-30',refCode:'ANNAS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'AnnaMaria Temple',email:'ana@familywellnesstips.com',type:'Inf',onboard:'2024-09-18',refCode:'DRTEMPLE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Anne Barker',email:'anbarker4@gmail.com',type:'Amb',onboard:'2026-03-26',refCode:'ANNE5',hasAffiliate:true,subdomain:'anne5',w9:false,taggedHL:false,hasSlack:false},
  {name:'Antonella Jarrin Ramsay',email:'antonellajarrin@gmail.com',type:'Amb',onboard:'2024-11-16',refCode:'antonellaj86',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'April DelaFuente',email:'aspanatex@gmail.com',type:'Amb',onboard:'2025-08-05',refCode:'DELAFUENTE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:true},
  {name:'April Rodriguez',email:'april.paul.rod@icloud.com',type:'Amb',onboard:'2026-03-05',refCode:'AprilRod',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Ashlee Boyson',email:'themomentswestand@gmail.com',type:'Amb',onboard:'2026-02-11',refCode:'STAND',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Ashlee Wells*',email:'ashleerwells@gmail.com',type:'Amb',onboard:'2026-03-10',refCode:'ASHLEE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Ashley (Newton) Holland',email:'',type:'Amb',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Ashley Acuna',email:'ashleyacuna17@yahoo.com',type:'Amb',onboard:'',refCode:'ACUNA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Ashley Hall',email:'ashley.cheshier.hall@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'HEALTHYAIRWAYNOW',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Ashley Norville',email:'anorville88@gmail.com',type:'Inf',onboard:'2024-02-12',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Ashley Palin (@thetonguetherapist)',email:'ashley@thetonguetherapist.com',type:'Inf',onboard:'2024-03-11',refCode:'TPMYO',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Ashley Simoneaux',email:'simoneaux73@gmail.com',type:'Amb',onboard:'2023-06-17',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Ashley Turner',email:'ashturnerfarm@gmail.com',type:'Inf',onboard:'2024-05-01',refCode:'TURNERFARM',hasAffiliate:true,subdomain:'turnerfarm',w9:true,taggedHL:true,hasSlack:false},
  {name:'Ashley Vogt',email:'ashleynicolevogt@gmail.com',type:'Amb',onboard:'',refCode:'AshleyV',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Ashley Wian',email:'ashleywian@gmail.com',type:'Inf',onboard:'2024-09-09',refCode:'KOBE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Ashley Wood',email:'joelandashleywood@gmail.com',type:'Amb',onboard:'2024-05-15',refCode:'LOVEESSENTIALLY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Ashney Patoka',email:'ashneypatoka@protonmail.com',type:'Amb',onboard:'2026-04-16',refCode:'PATOKA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Bailey King',email:'doterrarockstars@gmail.com',type:'Amb',onboard:'',refCode:'BaileyKing',hasAffiliate:true,subdomain:'baileyking',w9:false,taggedHL:false,hasSlack:true},
  {name:'Barbara Happacher',email:'barbara.happacher@yahoo.com',type:'Amb',onboard:'2025-02-01',refCode:'theMMLife',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Beth Leon',email:'bethleon1991@gmail.com',type:'Inf',onboard:'2024-11-01',refCode:'HOMESCHOOLBETH',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Bethany Micek',email:'bethanylmicek@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'midwestmicek',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:true},
  {name:'Betsey Caldwell',email:'betsey.caldwell@gmail.com',type:'Inf',onboard:'2026-05-12',refCode:'DRBETSYPT',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Bianca Chung',email:'bianca_chung@outlook.com',type:'Amb',onboard:'2025-01-23',refCode:'BIANCACHUNG',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Blake Guichet',email:'blake@thegirlnamedblake.com',type:'Inf',onboard:'2026-03-17',refCode:'BLAKE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Brandi Rondinelli',email:'brandi.brony@yahoo.com',type:'Inf',onboard:'2025-01-03',refCode:'MOTHERHEN',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Brianna Reiser',email:'briannaashleigh92@gmail.com',type:'Amb',onboard:'2024-09-01',refCode:'BREE24',hasAffiliate:true,subdomain:'bree',w9:true,taggedHL:true,hasSlack:true},
  {name:'Brianna Weimar',email:'theweimars@gmail.com',type:'Inf',onboard:'2024-11-23',refCode:'BRIANNAW',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Brianne Durrant',email:'durrant.brianne@gmail.com',type:'Amb',onboard:'2024-06-17',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Brighton Wahlen',email:'brightonwah@gmail.com',type:'Amb',onboard:'2024-12-03',refCode:'BRIGHTON',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Britney O’Connell',email:'candboconnell@live.com',type:'Amb',onboard:'2024-03-11',refCode:'OCONNELL',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Brittany Chadwick',email:'tanychadwick@gmail.com',type:'Amb',onboard:'2025-09-02',refCode:'Brittanychadwick',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Brittany Davidson',email:'essentiallybee@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'BEE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Brittany Greenfield',email:'greenfieldbrittany@gmail.com',type:'Amb',onboard:'2026-01-21',refCode:'BRITTANYGREENFIELD',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:true},
  {name:'Brittany Lockie',email:'brittanymlockie@gmail.com',type:'Amb',onboard:'2024-09-23',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Brittany Svitak',email:'brittanysvitak@gmail.com',type:'Amb',onboard:'',refCode:'Svitak',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Brook Merkel',email:'brookmerkel@gmail.com',type:'Amb',onboard:'2025-06-30',refCode:'MERKEL',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Brooke Curb',email:'brookecurb@gmail.com',type:'Amb',onboard:'2025-08-25',refCode:'rootedmotherhood',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Brooke Quinn*',email:'brooke.quinn9891@gmail.com',type:'Amb',onboard:'2026-02-19',refCode:'SLEEP',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Brooke Winter',email:'bwinter618@gmail.com',type:'Amb',onboard:'2026-06-02',refCode:'WINTERFAM',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Bryan Martin',email:'sealionbryan@gmail.com',type:'Inf',onboard:'2025-01-10',refCode:'SMILE',hasAffiliate:true,subdomain:'smile',w9:true,taggedHL:false,hasSlack:false},
  {name:'Caitlin Garrett',email:'contact@mostaveragemama.com',type:'Amb',onboard:'2024-07-01',refCode:'MOSTAVERAGEMAMA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Caitlin Gibson',email:'caitermelon@gmail.com',type:'Amb',onboard:'2026-04-20',refCode:'CAITLINGIBSON',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Caitlyn Brown',email:'caitlyn.marcus@gmail.com',type:'Amb',onboard:'2025-05-23',refCode:'CleanLife',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Camellia reyes',email:'cmreyes88@gmail.com',type:'Amb',onboard:'2025-04-08',refCode:'bougiemom',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Cami Andersen',email:'cami.andersen14@gmail.com',type:'Amb',onboard:'2026-01-26',refCode:'CamiA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Capri Galaska *justtheinserts*',email:'capri2012@gmail.com',type:'Inf',onboard:'2024-02-28',refCode:'JUSTTHEINSERTS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Cara Gallardo',email:'caragallardo@gmail.com',type:'Amb',onboard:'2026-05-11',refCode:'CG200',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Cara henry',email:'c.henry1934@yahoo.com',type:'Amb',onboard:'2025-02-01',refCode:'CARA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Carly Brown',email:'carlyhealthcoach@gmail.com',type:'Inf',onboard:'2026-04-21',refCode:'CARLYBROWN',hasAffiliate:true,subdomain:'carlybrown',w9:false,taggedHL:false,hasSlack:false},
  {name:'Carly Hartwig',email:'carly.hartwig@gmail.com',type:'Inf',onboard:'2026-04-06',refCode:'CLWCARLY',hasAffiliate:true,subdomain:'clwcarly',w9:false,taggedHL:false,hasSlack:false},
  {name:'Carly Patterson',email:'carlypatterson211@gmail.com',type:'Amb',onboard:'2024-04-01',refCode:'NYN',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Carol Sartell',email:'carolsartell@gmail.com',type:'Inf',onboard:'2024-12-31',refCode:'CAROLANN',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Carol Yeh-Garner',email:'carolyehgarner@gmail.com',type:'Inf',onboard:'2026-04-02',refCode:'CYG',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Caroline Reynolds',email:'carolinelreynolds@yahoo.com',type:'Amb',onboard:'',refCode:'CAROLINE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Carolyn Cacal',email:'carolyn.cacal@icloud.com',type:'Amb',onboard:'2026-01-19',refCode:'CAROL',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Carter Brown',email:'carterjohnsonbrown@gmail.com',type:'Amb',onboard:'2024-11-15',refCode:'CARTER',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'CeCe Beldon',email:'cbeldon7@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'CECE',hasAffiliate:false,subdomain:'',w9:true,taggedHL:false,hasSlack:false},
  {name:'Celia Bulgarelli',email:'spillitgirlpod@gmail.com',type:'Amb',onboard:'2026-05-01',refCode:'SPILLITGIRL',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Chad Rasmussen',email:'chad@toothpillow.com',type:'Amb',onboard:'',refCode:'TPVIP',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:true},
  {name:'Chelsea Barbine',email:'chelseabrauning@gmail.com',type:'Amb',onboard:'2025-11-14',refCode:'PPB',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Chelsea George Watkins',email:'chelseageorgewatkins@gmail.com',type:'Amb',onboard:'2026-04-02',refCode:'WATKINS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Chelsea Staton',email:'chelsea_staton@yahoo.com',type:'Inf',onboard:'2025-02-05',refCode:'TACOS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Chic Execs',email:'',type:'Pod',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Chip/ Cindy Paul',email:'cindy@neighborlywellness.com',type:'Inf',onboard:'',refCode:'',hasAffiliate:true,subdomain:'chiptalks',w9:false,taggedHL:false,hasSlack:false},
  {name:'Chip/Cindy Paul',email:'cindy@neighborlywellness.com',type:'Pod',onboard:'',refCode:'',hasAffiliate:true,subdomain:'chiptalks',w9:false,taggedHL:false,hasSlack:false},
  {name:'Chloe Brennan',email:'info@chloebeephoto.com',type:'Inf',onboard:'2024-11-11',refCode:'CHLOEBEE200',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Christa Jooste',email:'christacjooste@gmail.com',type:'Amb',onboard:'2024-07-10',refCode:'CHRISTAJOOSTE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Christiane Schwecke',email:'cjberdan@gmail.com',type:'Amb',onboard:'2025-06-04',refCode:'SCHWECKE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Christina Cooper-Gomm',email:'ccg.nuskin@gmail.com',type:'Amb',onboard:'2025-01-05',refCode:'CCG',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Christina Franco',email:'rootedhomeschoollife@gmail.com',type:'Inf',onboard:'2026-05-27',refCode:'ROOTED',hasAffiliate:true,subdomain:'rooted',w9:false,taggedHL:false,hasSlack:false},
  {name:'Christina Furnival',email:'christinamfurnival@gmail.com',type:'Amb',onboard:'2025-11-17',refCode:'Christie',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Christina Jaloway',email:'cdehan@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'JALOWAY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Cierra Lloyd',email:'cierralloyd@yahoo.com',type:'Amb',onboard:'',refCode:'WYATT',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Codi Backman',email:'codiannbackman@gmail.com',type:'Amb',onboard:'2024-06-01',refCode:'CODIBACKMANN',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Courtland Nall',email:'courtlandharrell10@gmail.com',type:'Amb',onboard:'2024-08-04',refCode:'COURTLAND',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Courtney Tyson',email:'courtneyctyson@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'COURTNEY',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Craig Clayton *Restoration Dentistry*',email:'restorationedmedia@gmail.com',type:'Inf',onboard:'2025-01-25',refCode:'DRCLAYTON',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Cristal Ortiz',email:'cristalmariexo@gmail.com',type:'Amb',onboard:'2025-06-04',refCode:'CRISTALMARIE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Cy Tidwell',email:'cy@toothpillow.com',type:'Amb',onboard:'',refCode:'CY',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:true},
  {name:'Dana Lenahan',email:'danarze@gmail.com',type:'Amb',onboard:'2026-03-04',refCode:'DANA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Daniela Beck',email:'danibeck13@gmail.com',type:'Inf',onboard:'2024-12-06',refCode:'DANIBECK',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Dawn Winkelmann',email:'dawn@msdawnslp.com',type:'Inf',onboard:'',refCode:'MSDAWN',hasAffiliate:true,subdomain:'msdawn',w9:false,taggedHL:false,hasSlack:false},
  {name:'Dawnita Stoltzfus',email:'diamartin38@gmail.com',type:'Amb',onboard:'2026-04-02',refCode:'DIA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Deborah Cullen',email:'cullendeborahk@gmail.com',type:'Amb',onboard:'2024-07-20',refCode:'DEBORAH',hasAffiliate:false,subdomain:'',w9:true,taggedHL:false,hasSlack:false},
  {name:'Debra Williams',email:'williamsdro@gmail.com',type:'Inf',onboard:'2024-05-01',refCode:'MBB',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:true},
  {name:'Del Bigtree',email:'hillary@thehighwire.com',type:'Inf',onboard:'2026-05-08',refCode:'BIGTREE',hasAffiliate:true,subdomain:'bigtree',w9:false,taggedHL:false,hasSlack:false},
  {name:'Demi Engemann',email:'demijkee@gmail.com',type:'Inf',onboard:'2025-02-28',refCode:'DEMI',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Desirea Peraza',email:'desireaperaza@gmail.com',type:'Amb',onboard:'2025-05-01',refCode:'DESIREA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Devon Kuntzman *Transforming Toddlerhood*',email:'devon@transformingtoddlerhood.com',type:'Inf',onboard:'2024-07-01',refCode:'TODDLER',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Discover Ag',email:'',type:'Pod',onboard:'',refCode:'DISCOVER',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Doctor Mom Podcast',email:'',type:'Inf',onboard:'2025-08-18',refCode:'DOCTORMOM',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Dorothy Booth',email:'dtcbooth09@gmail.com',type:'Amb',onboard:'2024-11-27',refCode:'DorothyB',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Dr Craig Clayton',email:'',type:'Inf',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Dr Kara Hanks',email:'',type:'Amb',onboard:'2026-05-22',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Dr. Ameet Trivedi truthdds',email:'truthdds@gmail.com',type:'Inf',onboard:'2025-04-01',refCode:'TRUTHDDS',hasAffiliate:true,subdomain:'truthdds',w9:true,taggedHL:false,hasSlack:false},
  {name:'Dr. Nicole Huffman',email:'dr.nicole.huffman@gmail.com',type:'Inf',onboard:'2024-12-03',refCode:'drnicolemd',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Dr. Rushing @truehealth_pharmgirl',email:'leigh@leighrushingwellness.com',type:'Amb',onboard:'2026-04-15',refCode:'PHARMGIRL',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Eden Lee loverlees',email:'edenmarie22@gmail.com',type:'Inf',onboard:'2024-12-01',refCode:'LOVERLEES',hasAffiliate:true,subdomain:'loverlees',w9:false,taggedHL:true,hasSlack:true},
  {name:'Elise Hylden',email:'jarrodandelise@gmail.com',type:'Amb',onboard:'2024-06-08',refCode:'GOFORIT',hasAffiliate:true,subdomain:'goforit',w9:true,taggedHL:false,hasSlack:true},
  {name:'Elisha Gorup MRSFIREWIFE',email:'mrsfirewife07@gmail.com',type:'Inf',onboard:'2024-07-02',refCode:'MRSFIREWIFE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Elizabeth Bagwell',email:'elizabethbagwell1@gmail.com',type:'Inf',onboard:'2025-01-28',refCode:'REWIRE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Elizabeth Faye',email:'info@heyelizabethfaye.com',type:'Amb',onboard:'2026-05-01',refCode:'FAYE',hasAffiliate:true,subdomain:'faye',w9:false,taggedHL:false,hasSlack:false},
  {name:'Elizabeth Tonneson',email:'liz.tonneson@gmail.com',type:'Amb',onboard:'2026-03-25',refCode:'LizTonneson',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Ellen Fisher',email:'ellen.fisher44@gmail.com',type:'Inf',onboard:'2024-10-28',refCode:'ELLEN200/ELLEN',hasAffiliate:true,subdomain:'ellen',w9:true,taggedHL:true,hasSlack:false},
  {name:'Ellie Gilbert',email:'stimpsonel@hotmail.com',type:'Amb',onboard:'2024-09-09',refCode:'ELLIE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Emilee Southwick',email:'tonguesmartmyo@gmail.com',type:'Amb',onboard:'2026-05-13',refCode:'EMILEE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Emily Bentow/buckingham',email:'emilybentow@gmail.com',type:'Amb',onboard:'2026-06-10',refCode:'EMILY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Emily Boazman',email:'emilyboazman@sodasippinsister.com',type:'Inf',onboard:'2026-04-02',refCode:'EMILYB',hasAffiliate:true,subdomain:'emilyb',w9:false,taggedHL:false,hasSlack:false},
  {name:'Emily Devenney',email:'emnikky.07@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'edevenney',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Emily Esselburn',email:'emfry23@yahoo.com',type:'Amb',onboard:'2026-02-04',refCode:'EESSELBURN',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Emily Morrow',email:'reallyverycrunchy@gmail.com',type:'Inf',onboard:'2024-07-01',refCode:'REALLYVERYCRUNCHY',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Emmalee Thompson',email:'emmaleecthompson@gmail.com',type:'Amb',onboard:'2024-10-12',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Erica Grenci',email:'hello@drericagrenci.com',type:'Amb',onboard:'2025-03-30',refCode:'DRERICA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Erika Sheffer Auckland',email:'auckland.erika@gmail.com',type:'Inf',onboard:'2025-03-05',refCode:'ERIKA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Erika Xavier',email:'erikaparks00@gmail.com',type:'Amb',onboard:'2024-02-17',refCode:'ejxavier',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Erin Blatchford',email:'erinblatch@gmail.com',type:'Amb',onboard:'2024-02-01',refCode:'RUTI / THEHIPPIENURSE',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Erin Collins',email:'erincollins.ms@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'SpecificChatt',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Erin Doyle',email:'erin.stec@gmail.com',type:'Amb',onboard:'2026-05-11',refCode:'ERIND',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Erin Rice',email:'elemchristensen@gmail.com',type:'Amb',onboard:'2024-07-01',refCode:'Erinrice',hasAffiliate:true,subdomain:'erinrice',w9:true,taggedHL:true,hasSlack:true},
  {name:'Erin Stanczyk',email:'erin@eatmoverest.com',type:'Inf',onboard:'2025-06-06',refCode:'EATMOVEREST',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Erin Wakeman',email:'erinfwakeman@gmail.com',type:'Amb',onboard:'2025-04-23',refCode:'WAKEMAN',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Erin Wilkins essentiallyerin',email:'erinessentially@gmail.com',type:'Inf',onboard:'2024-05-15',refCode:'ERIN',hasAffiliate:true,subdomain:'essentiallyerin',w9:true,taggedHL:true,hasSlack:true},
  {name:'Erin Wolfe Tadich',email:'wolfee329@gmail.com',type:'Amb',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Eryka Spera',email:'eryka@busylittleizzy.com',type:'Inf',onboard:'2024-12-01',refCode:'BUSY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Eryn Carroll NMM',email:'eryn@naturalmindedmomma.com',type:'Inf',onboard:'2024-07-01',refCode:'ERYN',hasAffiliate:true,subdomain:'greypark6',w9:true,taggedHL:true,hasSlack:false},
  {name:'Eva Abrams',email:'evaabrams3@gmail.com',type:'Inf',onboard:'2025-01-24',refCode:'BEAUTIFULHOLISTIC',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Evergreen myo habits',email:'team@evergreenmyohabits.com',type:'Amb',onboard:'2026-06-03',refCode:'EMHexpand',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Felicia Trager',email:'feliciarowe@gmail.com',type:'Amb',onboard:'2026-04-23',refCode:'FeliciaTrager',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Flora Gorman',email:'cmflgorman@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'LIVINGSIMPLY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Francesca Neari',email:'francesca.neari@gmail.com',type:'Amb',onboard:'2024-10-01',refCode:'frankiesfriends',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Gabriela Portilla',email:'gabyportilla@familysensitive.com',type:'Inf',onboard:'2025-03-24',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Gianna Christofalos',email:'giannaclarkpellegrino@gmail.com',type:'Amb',onboard:'',refCode:'MRSPUDIE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Gina Johnson',email:'g.m.johnson@att.net',type:'Amb',onboard:'2025-02-01',refCode:'GINA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Gina Primavera',email:'primaveragina2@gmail.com',type:'Amb',onboard:'2026-04-22',refCode:'GINAPRIMA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Ginny Yurich',email:'josh@1000hoursoutside.com',type:'Inf',onboard:'2024-06-01',refCode:'1000HOURS',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Govinda Jones',email:'govindapriya@gmail.com',type:'Amb',onboard:'2025-08-08',refCode:'GOVINDA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Hannah Garvin',email:'hannahgarvin@me.com',type:'Amb',onboard:'2024-07-23',refCode:'HANNAHG',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Hannah Langness',email:'hlangnesslifehelp@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'SLEEPEASY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Hannah McNeely',email:'hannahjanemcneely@gmail.com',type:'Inf',onboard:'2024-12-02',refCode:'HANNAH',hasAffiliate:true,subdomain:'hannah',w9:true,taggedHL:true,hasSlack:false},
  {name:'Hannah Murphy',email:'hannygirl1@yahoo.com',type:'Amb',onboard:'2025-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Hannah Smotherman',email:'lifeofhanandmais@gmail.com',type:'Amb',onboard:'2025-02-07',refCode:'HANNUHSMO',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Hayley Lombard',email:'hayley@hayleyelysefit.com',type:'Inf',onboard:'2026-05-19',refCode:'HAYLEY',hasAffiliate:true,subdomain:'hayley',w9:false,taggedHL:false,hasSlack:false},
  {name:'Heather Arthur',email:'harthur@gmail.com',type:'Amb',onboard:'2024-10-04',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Heather Hendricks',email:'hkhendricks@protonmail.com',type:'Amb',onboard:'2025-05-29',refCode:'HEATHERHEN',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Heather Hood',email:'hnforbis@gmail.com',type:'Amb',onboard:'2025-05-29',refCode:'HEATHER',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Heather Koch',email:'cleanerlivingheatherk@gmail.com',type:'Amb',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Heather lundgren',email:'mills.heather2011@yahoo.com',type:'Amb',onboard:'2025-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Heather Reed',email:'heathermreed19@gmail.com',type:'Amb',onboard:'2024-04-01',refCode:'REED',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Heather Slack',email:'slackdh@yahoo.com',type:'Amb',onboard:'2026-04-23',refCode:'AIRWAYHELP',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Heidi Petrusaitis',email:'heidi.petrusaitis@gmail.com',type:'Amb',onboard:'2025-08-05',refCode:'HOLISTICHEIDI',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Hilary Fritsch*',email:'fritsch.hilary@gmail.com',type:'Inf',onboard:'2026-05-08',refCode:'DRHILARY',hasAffiliate:true,subdomain:'drhilary',w9:false,taggedHL:false,hasSlack:false},
  {name:'Hillary Ha',email:'hillaryha@gmail.com',type:'Amb',onboard:'2025-08-05',refCode:'HILLARY',hasAffiliate:true,subdomain:'hillary',w9:false,taggedHL:false,hasSlack:false},
  {name:'Hope Butel',email:'hopepoindexter@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'India Lee',email:'leefamilyadventures@gmail.com',type:'Amb',onboard:'2026-02-26',refCode:'LEEFAMILY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Ivy Pruss',email:'hello@epigenetichealth.org',type:'Amb',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jackie Parliament',email:'jvparliament@gmail.com',type:'Amb',onboard:'2026-01-27',refCode:'AIRWAYEVAL',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jacquelynn Arnold',email:'decible20@yahoo.com',type:'Amb',onboard:'2024-01-02',refCode:'JArnoldCFT',hasAffiliate:false,subdomain:'',w9:true,taggedHL:false,hasSlack:false},
  {name:'Jade Roper',email:'jadelizabeth06@gmail.com',type:'Inf',onboard:'2024-11-01',refCode:'JADE',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Jaimeé Arroyo Hopewell Family',email:'jaimee@hopewellfamilycare.com',type:'Amb',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jaimie Parisi',email:'jaimie.parisi611@gmail.com',type:'Amb',onboard:'2026-04-29',refCode:'ReclaimingWellness',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jami Balmet',email:'balmetfamily@gmail.com',type:'Amb',onboard:'2024-03-19',refCode:'FINDINGJOY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jamie Ericksen',email:'ericksenjamie@gmail.com',type:'Inf',onboard:'2024-07-01',refCode:'JAMIEE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Jamie Frees Miller',email:'jskylarf@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'ANP',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jamie Hunter',email:'jamielarene@gmail.com',type:'Amb',onboard:'2024-07-01',refCode:'Jamie',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Jamie Sewell',email:'jamers9329@gmail.com',type:'Amb',onboard:'2025-03-03',refCode:'JAMIELEE/LEE/JAIME',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Jamie Wilson',email:'jkowilson15@gmail.com',type:'Amb',onboard:'2025-08-19',refCode:'WHITBIT',hasAffiliate:false,subdomain:'',w9:true,taggedHL:false,hasSlack:false},
  {name:'Jana Iankova',email:'oneloveourloveblog@gmail.com',type:'Inf',onboard:'2024-02-24',refCode:'JANA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Janell Hampton',email:'jnellehampton@gmail.com',type:'Amb',onboard:'2024-12-24',refCode:'JANELL',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Janis Trout',email:'singingfish_jt@protonmail.com',type:'Amb',onboard:'2025-02-01',refCode:'JANISAIRWAY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jasyra Santiago-Hines',email:'jasyrasantiago@gmail.com',type:'Inf',onboard:'2024-02-01',refCode:'JASYRA',hasAffiliate:true,subdomain:'jasyra',w9:true,taggedHL:true,hasSlack:true},
  {name:'Jeanne Reilly',email:'msjeanne84@gmail.com',type:'Amb',onboard:'2026-05-11',refCode:'JeanneReilly',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jeff Cruz Talia_likeitis',email:'jefflcruz81@gmail.com',type:'Inf',onboard:'2024-08-01',refCode:'TALIA',hasAffiliate:true,subdomain:'talia',w9:true,taggedHL:true,hasSlack:false},
  {name:'Jennee Guerrero',email:'jennlynn.w@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'THEMOTHERSHOOD',hasAffiliate:true,subdomain:'jennee',w9:false,taggedHL:true,hasSlack:true},
  {name:'Jennie Hoglund',email:'jennie@hoglundhomeopathy.com',type:'Inf',onboard:'',refCode:'',hasAffiliate:true,subdomain:'jennie',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jennifer Jones',email:'jones.jenniferanne@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'rootcause',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Jennifer Levitt',email:'healingyourbodywithjen@gmail.com',type:'Amb',onboard:'2026-05-08',refCode:'JENNIFER',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jennifer Taylor',email:'jentaylor8509@yahoo.com',type:'Amb',onboard:'2024-11-20',refCode:'TAYLORLDH',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jenny Robinson (Clark)',email:'jennyrobinson022@mac.com',type:'Inf',onboard:'2024-02-01',refCode:'JENNY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Jessi Meeks',email:'jessimeeks13@gmail.com',type:'Amb',onboard:'2026-04-22',refCode:'JESSI',hasAffiliate:true,subdomain:'jessi',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jessica Beachy',email:'bjessicadawn@gmail.com',type:'Amb',onboard:'2026-05-07',refCode:'JESSBEACHY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jessica Fay',email:'jessicalynnfay@gmail.com',type:'Inf',onboard:'2024-05-01',refCode:'JESSFAY',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Jessica Klick',email:'jessklick@gmail.com',type:'Amb',onboard:'2024-03-01',refCode:'THEKLICKLIFE',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:true},
  {name:'Jessica Sansom',email:'jessicaannesansom@gmail.com',type:'Amb',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jessica Shuler',email:'jessica.autumn@gmail.com',type:'Amb',onboard:'2026-05-01',refCode:'CLEMSON',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jessica Shvets',email:'jessicavasilkov@yahoo.com',type:'Amb',onboard:'2025-12-01',refCode:'JessicaShvets',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jessica Smith',email:'jessicapaintersmith@gmail.com',type:'Amb',onboard:'',refCode:'SMITH10',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jessie Carlson',email:'jessie.a.carlson@gmail.com',type:'Amb',onboard:'2026-06-03',refCode:'JessieCarlson',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Joey Castellanos',email:'joeyberniece@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'Joey18',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jordan Johnsen',email:'jordanmjohnsen@gmail.com',type:'Amb',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Jordan Kauffman',email:'jordankauffman523@gmail.com',type:'Amb',onboard:'2025-01-16',refCode:'Jordankauffman',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Jordan Schoen',email:'jrschoen815@gmail.com',type:'Amb',onboard:'2024-04-09',refCode:'SCHOEN',hasAffiliate:false,subdomain:'',w9:true,taggedHL:false,hasSlack:false},
  {name:'Jordan Zavala',email:'jpalley05@yahoo.com',type:'Amb',onboard:'2025-02-01',refCode:'JORDAN',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Julia Lee',email:'juliagail.lee@gmail.com',type:'Amb',onboard:'2026-04-23',refCode:'JLeeFam',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Julie Mercadante (juniperspeechtherapy)',email:'juniperspeechtherapy@gmail.com',type:'Amb',onboard:'2024-03-27',refCode:'TPSLP',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Julie Smale',email:'jsmale88@gmail.com',type:'Amb',onboard:'2024-07-22',refCode:'JULIES',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Justin Fletcher',email:'pchsjfletcher@gmail.com',type:'Inf',onboard:'2026-06-10',refCode:'WAYLON',hasAffiliate:true,subdomain:'waylon',w9:false,taggedHL:false,hasSlack:false},
  {name:'Kaitlin Harris',email:'kaitlinharris@me.com',type:'Inf',onboard:'2024-10-24',refCode:'KHARRIS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Kale Blossom',email:'hello@kaleblossom.com',type:'Inf',onboard:'2025-03-10',refCode:'BLOSSOM',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Kalee Bachmann holisti_klee',email:'paperbillsjk@gmail.com',type:'Amb',onboard:'2024-05-01',refCode:'',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Kami Pascucci',email:'kamipascucci@gmail.com',type:'Amb',onboard:'2025-03-01',refCode:'KAMI',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Kara Barber',email:'karabarber31@gmail.com',type:'Amb',onboard:'2026-04-22',refCode:'KBARBER7',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Kara Garcia',email:'karaochsenbein@yahoo.com',type:'Inf',onboard:'2026-01-16',refCode:'JstKara',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Karalynne Call *Just Ingredients*',email:'halee@justingredients.com',type:'Pod',onboard:'2024-08-01',refCode:'JUSTINGREDIENTS',hasAffiliate:true,subdomain:'justingredients',w9:true,taggedHL:true,hasSlack:false},
  {name:'Karen Takacs',email:'kjtakacs716@gmail.com',type:'Amb',onboard:'',refCode:'KARENT',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:true},
  {name:'Karissa Backus',email:'hello@karissaglynn.com',type:'Amb',onboard:'2024-10-09',refCode:'KARISSAGLYNN',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Karyna Cast Korotkykh',email:'karynacast@hotmail.com',type:'Amb',onboard:'2024-06-01',refCode:'KARYNA',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Katelyn Alsop (James)',email:'katelyn@katelynjames.com',type:'Inf',onboard:'2026-01-19',refCode:'JAMES',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Katherine Cassidy',email:'kprisant@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'Toothpillow25',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Katherine Long',email:'katherinelongmorgan@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Katie Baehring',email:'organic.chaoss@gmail.com',type:'Inf',onboard:'2026-06-03',refCode:'HEYBABE',hasAffiliate:true,subdomain:'heybabe',w9:false,taggedHL:false,hasSlack:false},
  {name:'Katie Brooks',email:'katie@okcmyo.com',type:'Amb',onboard:'2026-02-06',refCode:'OKCMK',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Katie Dudley',email:'kgd2427@gmail.com',type:'Amb',onboard:'2026-04-14',refCode:'WELLNESS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Katie Eagle',email:'katie@jimmyeagle.com',type:'Amb',onboard:'2024-11-12',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Katie Jewell',email:'kmlupnorth@gmail.com',type:'Amb',onboard:'2024-07-22',refCode:'JEWELL',hasAffiliate:false,subdomain:'',w9:true,taggedHL:false,hasSlack:true},
  {name:'Katie Nagel',email:'katienagel1218@gmail.com',type:'Amb',onboard:'2026-04-20',refCode:'NAGEL200',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Katie Saalfeld',email:'katiesaalfeld@gmail.com',type:'Inf',onboard:'2025-03-13',refCode:'TRIPLETS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Kayla Curtis',email:'kdescant98@gmail.com',type:'Amb',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:true,taggedHL:false,hasSlack:false},
  {name:'Kayla Lochte',email:'kaylalochte@gmail.com',type:'Inf',onboard:'2025-01-01',refCode:'LOCHTE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Kayla Mehlert',email:'kayla.mehlert@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Kayla Monson',email:'kaylamonson@live.com',type:'Inf',onboard:'2024-05-01',refCode:'KAYLA',hasAffiliate:true,subdomain:'kayla',w9:false,taggedHL:true,hasSlack:true},
  {name:'Kelley Vinnola',email:'kelleyvinnola@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'GRIER',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Kelly Hebert',email:'kjgross78@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'KellyHebert',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Kelsey Sem (holisticmumma)',email:'kelsey_sem@outlook.com',type:'Inf',onboard:'2024-05-01',refCode:'HOLISTICMUMMA',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:true},
  {name:'Kelsey Tweeton',email:'kmtweeton@gmail.com',type:'Amb',onboard:'2024-12-15',refCode:'TWEETON',hasAffiliate:false,subdomain:'',w9:true,taggedHL:false,hasSlack:false},
  {name:'Kelsey Wall',email:'kelseykaywall@gmail.com',type:'Inf',onboard:'2025-04-07',refCode:'WALLS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Kelsey Wells',email:'kelseywells33@gmail.com',type:'Inf',onboard:'2024-05-22',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Kelsi Fullmer',email:'kfullms@gmail.com',type:'Inf',onboard:'2024-11-30',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Kendra Needham',email:'mrskneedham@gmail.com',type:'Inf',onboard:'2023-11-01',refCode:'HOLISTICMOTHER',hasAffiliate:true,subdomain:'kendra',w9:true,taggedHL:true,hasSlack:true},
  {name:'Kiersten Thompson',email:'kierstent2024@gmail.com',type:'Amb',onboard:'2025-11-28',refCode:'KIDSMILE200',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Kim Huberty',email:'lifewiththehubertys@gmail.com',type:'Amb',onboard:'2025-08-05',refCode:'HUBERTY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:true},
  {name:'Kim Nelson',email:'kimnelsonhair@gmail.com',type:'Amb',onboard:'2026-04-22',refCode:'KIMNELSON5',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Kinlee Topp',email:'kinlee25@icloud.com',type:'Amb',onboard:'2026-02-10',refCode:'KINLEE',hasAffiliate:true,subdomain:'kinlee',w9:true,taggedHL:false,hasSlack:false},
  {name:'Krisia Smith',email:'krisrosa11@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'KRISIA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Krista Happ',email:'kristacarlson08@gmail.com',type:'Amb',onboard:'2024-10-19',refCode:'HAPP',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:true},
  {name:'Kristen Badillo',email:'kat.webster22@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'KAT128',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Kristen Knecht',email:'kristen@happymouthmyo.com',type:'Amb',onboard:'2026-05-12',refCode:'HAPPYMOUTH',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Kristen Malabayabas',email:'malabayabasfamily@gmail.com',type:'Amb',onboard:'2024-10-04',refCode:'KM10',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Kristin Hefley',email:'kristinhefley@gmail.com',type:'Amb',onboard:'2026-05-07',refCode:'KH200',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Kristin Tigges',email:'ktigs3@gmail.com',type:'Amb',onboard:'2024-02-09',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Kristina Williams',email:'kristina.williams88@gmail.com',type:'Inf',onboard:'2024-06-01',refCode:'KRISTINA',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Krystal Bickford',email:'krsarceno@yahoo.com',type:'Amb',onboard:'2025-02-01',refCode:'KrystalSarceno5',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Krystina Ham',email:'krystinaham@gmail.com',type:'Amb',onboard:'2026-05-07',refCode:'KRYSTINA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Kylie Acheson',email:'kylieacheson@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Lacey Honeycutt',email:'lacey856@gmail.com',type:'Amb',onboard:'2026-05-07',refCode:'HoneycuttAlamosa',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Lacy Lindsey',email:'lacydlindsey@gmail.com',type:'Amb',onboard:'2024-09-19',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Laura Bruner',email:'laura@myradicalroots.com',type:'Amb',onboard:'2025-02-01',refCode:'RADICALROOTS',hasAffiliate:false,subdomain:'',w9:true,taggedHL:false,hasSlack:false},
  {name:'Laura Jacobs',email:'livewellwithlaura@gmail.com',type:'Amb',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Laura Manns',email:'lauraemanns@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'LAURAMANNS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Laurel Arnold',email:'laurel1422@gmail.com',type:'Amb',onboard:'2025-05-23',refCode:'beyondbreathingmyo',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Lauren Delmare',email:'laurendelmare@gmail.com',type:'Amb',onboard:'2026-03-10',refCode:'LAUREND',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Lauren Johnson NNM',email:'naturalnursemomma@gmail.com',type:'Inf',onboard:'2024-05-01',refCode:'NATURALNURSEMOMMA',hasAffiliate:true,subdomain:'naturalnursemomma',w9:true,taggedHL:true,hasSlack:true},
  {name:'Lauren Kidd',email:'lnyoung04@gmail.com',type:'Amb',onboard:'2026-02-24',refCode:'UnperfectlyLiving',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Lauren Peter',email:'laurencbarry@gmail.com',type:'Amb',onboard:'2024-12-24',refCode:'TST',hasAffiliate:true,subdomain:'tst',w9:false,taggedHL:true,hasSlack:true},
  {name:'Lauren Stadler',email:'laurenstadler15@gmail.com',type:'Inf',onboard:'2025-03-13',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'leila masterson',email:'leila.goldkuhl@gmail.com',type:'Inf',onboard:'2025-02-26',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Lexi Fitzgerald',email:'fitzpartyofsix@gmail.com',type:'Inf',onboard:'2024-12-10',refCode:'FITZ',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Lexie Thiery',email:'lexlifts@outlook.com',type:'Inf',onboard:'2024-01-01',refCode:'THIERY',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Libby Perritt',email:'libby@freedpeople.com',type:'Amb',onboard:'2024-11-12',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Lindsay Cardwell',email:'cardwell.lindsay@gmail.com',type:'Amb',onboard:'2024-12-23',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Lindsey Cromie',email:'lindseycromie1@gmail.com',type:'Amb',onboard:'2025-11-24',refCode:'FUNCTIONALMAMA',hasAffiliate:false,subdomain:'',w9:true,taggedHL:false,hasSlack:false},
  {name:'Lindsey Price',email:'lindsey.price7117@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'HATTIE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Liz Haselmayer',email:'liz@homegrowneducation.org',type:'Inf',onboard:'2025-11-17',refCode:'HOMEGROWN',hasAffiliate:true,subdomain:'homegrown',w9:false,taggedHL:false,hasSlack:false},
  {name:'Logan Randazzo',email:'loganrenard@gmail.com',type:'Inf',onboard:'2026-03-19',refCode:'LOGAN',hasAffiliate:true,subdomain:'logan',w9:false,taggedHL:false,hasSlack:false},
  {name:'Lori Beth Auldridge',email:'lbhuck@yahoo.com',type:'Amb',onboard:'2025-03-12',refCode:'LORIBETH',hasAffiliate:false,subdomain:'',w9:true,taggedHL:false,hasSlack:false},
  {name:'Lorin Smith',email:'lorinethompson28@gmail.com',type:'Inf',onboard:'2024-09-30',refCode:'GFGRUB',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Madeena Khan',email:'madeenakhan930@gmail.com',type:'Amb',onboard:'2026-05-14',refCode:'MADEENA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Maggie Lynch',email:'lynchfam888@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'LINK200',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Maggie Yorio',email:'maggiemaex313@hotmail.com',type:'Amb',onboard:'2025-02-01',refCode:'MAGGIE2025',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Mallory Reyes / Miller',email:'h0m3sch00lwithl0v3@gmail.com',type:'Inf',onboard:'2024-07-24',refCode:'MALLORYREYES',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Mallory Roberts *thefeedingmom*',email:'mallory.labarre@gmail.com',type:'Inf',onboard:'2024-09-01',refCode:'THEFEEDINGMOM',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Manon Salvi',email:'salvi.manon02@gmail.com',type:'Amb',onboard:'2026-06-03',refCode:'MANONKALO',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Marci Platt',email:'marcilinplatt@gmail.com',type:'Amb',onboard:'2023-02-01',refCode:'MARCI',hasAffiliate:true,subdomain:'27673',w9:false,taggedHL:false,hasSlack:true},
  {name:'Marianne Moen',email:'mjm5315@icloud.com',type:'Amb',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Marissa Mason',email:'minton.marissa@gmail.com',type:'Amb',onboard:'2026-03-10',refCode:'MASON',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Marlo Bontempo',email:'marlo.bontempo@gmail.com',type:'Amb',onboard:'',refCode:'MARLO',hasAffiliate:true,subdomain:'marlo',w9:false,taggedHL:false,hasSlack:false},
  {name:'Mary Catherine Oechslin momnp',email:'the.mom.np@gmail.com',type:'Inf',onboard:'2025-01-14',refCode:'THEMOMNP',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Mary Connolly',email:'mary.lasonder@gmail.com',type:'Amb',onboard:'2025-08-19',refCode:'MARY200',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Maurissa Ashby-Faulkner',email:'maurissa_ashby@yahoo.com',type:'Amb',onboard:'2024-03-07',refCode:'MAURISSA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'McKenzie Frank',email:'mckenzieffrank@gmail.com',type:'Amb',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Meaghan Williamson',email:'meaghanjablonski@gmail.com',type:'Inf',onboard:'2024-10-18',refCode:'MeaghanW',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Megan Cotten',email:'megan.h.cotten@gmail.com',type:'Amb',onboard:'2024-06-25',refCode:'megSLP',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Megan Crivelli',email:'meganthaug@gmail.com',type:'Amb',onboard:'2025-08-13',refCode:'MEGAN',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Megan Norgaard',email:'msunde3996@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Megan Wilson homestead',email:'megan@wilsonhomestead.com',type:'Inf',onboard:'2025-06-30',refCode:'WILSONHOMESTEAD',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Meghan Hampton',email:'cmsohampton@gmail.com',type:'Amb',onboard:'2025-03-11',refCode:'BREATHE1',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Meghan Joy Yancy',email:'meghanjoy.yancy@gmail.com',type:'Inf',onboard:'2026-01-20',refCode:'MEGHANJOY',hasAffiliate:true,subdomain:'meghanjoy',w9:false,taggedHL:false,hasSlack:false},
  {name:'Melanie Westmoreland',email:'mewestmo@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'melaniewestmoreland',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Melina Moses',email:'',type:'Amb',onboard:'2024-03-01',refCode:'SLEEPWISE',hasAffiliate:true,subdomain:'root',w9:true,taggedHL:true,hasSlack:true},
  {name:'Melina Moses',email:'melina.moses@yahoo.com',type:'Amb',onboard:'',refCode:'ROOT',hasAffiliate:true,subdomain:'root',w9:false,taggedHL:false,hasSlack:false},
  {name:'Melissa Donahue',email:'mdonahue.ibclc@gmail.com',type:'Amb',onboard:'2025-04-16',refCode:'DONAHUE',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Melissa Kipe',email:'herbsinthewoods@gmail.com',type:'Amb',onboard:'2025-11-14',refCode:'toothjoy',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Melissa Long',email:'melissa@naturalmindedmama.net',type:'Inf',onboard:'2026-05-11',refCode:'NATURALMINDEDMAMA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'MELISSA MARSHALL',email:'msmarshall.tn@yahoo.com',type:'Amb',onboard:'2025-02-01',refCode:'MELISSA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Melissa Sherrod',email:'melissasherrod@gmail.com',type:'Amb',onboard:'',refCode:'SherrodConsulting',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Melissa Speck',email:'melissaespeck@gmail.com',type:'Amb',onboard:'2025-11-13',refCode:'mspeck',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Melissa Vrabic',email:'melissa.vrabic@yahoo.com',type:'Amb',onboard:'2025-06-03',refCode:'MELISSAV',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Melody Brandon',email:'obsessedwithessentials@gmail.com',type:'Inf',onboard:'2024-04-01',refCode:'MELODYBRANDON',hasAffiliate:true,subdomain:'melodybrandon',w9:true,taggedHL:true,hasSlack:true},
  {name:'Melody Koch',email:'melodyjkoch@gmail.com',type:'Amb',onboard:'2025-08-11',refCode:'melodykoch',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Michael Knowles',email:'kamryn+knowles@toothpillow.com',type:'Pod',onboard:'2026-03-02',refCode:'KNOWLES',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Michele Chlopek-Grasmick',email:'michele@toothpillow.com',type:'Amb',onboard:'',refCode:'MICHELE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:true},
  {name:'Michelle Keijner',email:'casperkeijner@hotmail.com',type:'Amb',onboard:'2024-03-25',refCode:'HEALBETTERMAMA',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Michelle Melerine',email:'michellemelerinedesigns@gmail.com',type:'Amb',onboard:'2024-02-06',refCode:'MICHELLEMELERINE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Michelle Nelson*',email:'michelle.m.nelson01@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'BESTTHREE',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Michelle Rowley',email:'michelle.rowley1@gmail.com',type:'Amb',onboard:'2026-04-09',refCode:'MICHELLE50',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Milena ViVenzio',email:'milenavivenzio@gmail.com',type:'Amb',onboard:'',refCode:'WISEMAMAWELLNESS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Milli Twitchell mywholehomestead',email:'mywholehomestead.com@gmail.com',type:'Inf',onboard:'2024-03-01',refCode:'MYWHOLEHOMESTEAD',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:true},
  {name:'Miranda Shell',email:'miranda.k.golden@gmail.com',type:'Amb',onboard:'2025-04-07',refCode:'SHELLHOME',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Mirranda Salinas',email:'mirrandasalinas@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'WHOSMIRRANDA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Mitch Duckworth DDS',email:'',type:'Amb',onboard:'2026-05-22',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Molly Peterson',email:'mollymcdonaldpeterson@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'MOMSENSE',hasAffiliate:false,subdomain:'',w9:true,taggedHL:false,hasSlack:false},
  {name:'monique coleman',email:'moniquewahh@gmail.com',type:'Amb',onboard:'2025-06-17',refCode:'sweetlittlearrows',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:true},
  {name:'Monique Nadeau',email:'mncrowley2@gmail.com',type:'Amb',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Morgan Baumchen',email:'tm.baumchen@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'homespunbymb',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Morgan Hams',email:'yutymeglo@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'HAMS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Natalie Assell',email:'natalie.assell14@gmail.com',type:'Amb',onboard:'2026-04-15',refCode:'LOVELYFARMS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Natalie Kennedy',email:'natkennedy13@gmail.com',type:'Inf',onboard:'2025-11-17',refCode:'NATALIE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Natalie Stahl',email:'natalie.gordon84@gmail.com',type:'Amb',onboard:'2026-04-07',refCode:'NSTAHL',hasAffiliate:true,subdomain:'nstahl',w9:false,taggedHL:false,hasSlack:false},
  {name:'Nathan Wuertz',email:'nathanielwuertz@gmail.com',type:'Amb',onboard:'2025-01-24',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Nathaniel Eisenman',email:'nathanaeleisenman6@gmail.com',type:'Inf',onboard:'2024-12-11',refCode:'Nate and Sutton',hasAffiliate:true,subdomain:'nathanealeisenman',w9:false,taggedHL:true,hasSlack:false},
  {name:'Nicola Baldwin',email:'nmbaldwin1@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Nicole Davis',email:'nicole@bcrg.co',type:'Amb',onboard:'2025-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Nicole Mastin',email:'nicolefinamore@ymail.com',type:'Amb',onboard:'2025-02-01',refCode:'NICOLEMASTIN',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Nicole Rowan',email:'nicolelynnrowan@gmail.com',type:'Amb',onboard:'2025-01-22',refCode:'ROWANTOOTH200',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Nicole Still',email:'officialstillfamily@gmail.com',type:'Inf',onboard:'2026-04-14',refCode:'STILLFAMILY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Nicole Stoltenberg STOLI',email:'nicolestoltenberg1@gmail.com',type:'Amb',onboard:'2026-05-14',refCode:'STOLI',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Nikki Geib "Making Millistones"',email:'nikkirae333@gmail.com',type:'Inf',onboard:'2025-01-14',refCode:'MILLIE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'No One Told Us Podcast',email:'',type:'Inf',onboard:'',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Olesya Driga',email:'olesyadriga@gmail.com',type:'Amb',onboard:'2026-04-14',refCode:'DRIGA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Olivia Berry',email:'livihope321@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'LUKE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:true},
  {name:'Olivia Caraccio',email:'olivialynnelee@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Phylicia Borden',email:'phyliciaborden@gmail.com',type:'Amb',onboard:'2026-04-14',refCode:'PHYLICIA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Rachel Honshell',email:'rkhonshell@gmail.com',type:'Amb',onboard:'2026-02-12',refCode:'RACHEL',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Rachel Jayroe',email:'thevirtualpediatrics@gmail.com',type:'Amb',onboard:'2026-02-06',refCode:'RJAYROE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Rachel Sanderson',email:'rachelrsanderson@yahoo.com',type:'Amb',onboard:'2025-08-05',refCode:'SUMMERTOOTHPILLOW',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Raychel Bozich',email:'raychelirene@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Rebecca Tomas',email:'beccat5@pm.me',type:'Amb',onboard:'2025-02-01',refCode:'BECCA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Ronda Holman (theairwaychampion)',email:'rondaholman433@gmail.com',type:'Inf',onboard:'2023-10-15',refCode:'airwaychampion',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Rose Stoltzfus',email:'waitonthelord08@yahoo.com',type:'Amb',onboard:'2025-02-04',refCode:'AnnaS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Roya Eakin',email:'royaeakin@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'ROYA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Ruby Morris',email:'theoilydesi@gmail.com',type:'Amb',onboard:'2024-06-01',refCode:'RUBY',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Sam Johnson',email:'saalderks90@gmail.com',type:'Amb',onboard:'2026-02-06',refCode:'SAMJ',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Samantha Baker',email:'sammi@baker-collective.com',type:'Inf',onboard:'2026-06-11',refCode:'3amMama',hasAffiliate:true,subdomain:'3ammama',w9:false,taggedHL:false,hasSlack:false},
  {name:'Samantha Buresh',email:'samantha.buresh@gmail.com',type:'Inf',onboard:'2024-11-11',refCode:'SAMANTHABURESH',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Samantha Edwards',email:'sedwards9216@gmail.com',type:'Amb',onboard:'2025-08-15',refCode:'SAMANTHA92',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:true},
  {name:'Samantha Ferree',email:'samantha.free@yahoo.com',type:'Amb',onboard:'2026-04-07',refCode:'ANS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Samantha Kyek',email:'samanthakyek@gmail.com',type:'Amb',onboard:'2025-01-15',refCode:'HALFCRUNCHYMOM',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Samantha Mauermann \'Acresandaprons\'',email:'acresandaprons@gmail.com',type:'Inf',onboard:'2024-12-01',refCode:'ACRESANDAPRONS',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Samantha Moore Northland KC moms',email:'samanthaemoore08@gmail.com',type:'Amb',onboard:'2024-09-11',refCode:'NORTHLANDKCMOMS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Samantha Smith',email:'smithsduomail@gmail.com',type:'Inf',onboard:'2024-12-20',refCode:'UNGOV, SAMNP',hasAffiliate:true,subdomain:'samnp',w9:false,taggedHL:true,hasSlack:false},
  {name:'Sandra Dowd',email:'sbonacci3@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'SANDI33',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:true},
  {name:'Sandy Caminata',email:'clause7788@gmail.com',type:'Amb',onboard:'2026-04-06',refCode:'SewingGS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Sara Clifton',email:'scottyandsara@gmail.com',type:'Amb',onboard:'2026-05-19',refCode:'Northandshoresara',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Sara Cooper',email:'saramcooper3@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Sara Lininger',email:'saralininger2211@gmail.com',type:'Inf',onboard:'2025-12-15',refCode:'Lininger',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Sara Thiele',email:'sarasuz80@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'SMILETHIELE',hasAffiliate:false,subdomain:'',w9:true,taggedHL:false,hasSlack:false},
  {name:'Sara Worth (Sara Joy oil_ohana)',email:'love.doterra@hotmail.com',type:'Inf',onboard:'2024-02-01',refCode:'SARAJOY',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Sarah Cronin',email:'sarah.cronin02@gmail.com',type:'Amb',onboard:'2025-08-05',refCode:'CRONIN',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Sarah Fuller',email:'sarahfrey.fuller@gmail.com',type:'Amb',onboard:'2026-04-29',refCode:'LATCHED',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Sarah Murlick OG',email:'sarahmurlick@feedeatbabble.com',type:'Amb',onboard:'2025-01-09',refCode:'BABBLE',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Sarah St.Laurent',email:'sassystlaurent83@yahoo.com',type:'Amb',onboard:'2025-02-01',refCode:'SARAH',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Sarah Van Kleeck',email:'sarah.r.vk88@gmail.com',type:'Amb',onboard:'2023-11-08',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Sascha Schlossberg',email:'theschlossbergfamily@gmail.com',type:'Amb',onboard:'',refCode:'SASCHADOESTHINGS, DOINGDADTHINGS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Savannah Richardson',email:'savvyfilms36@gmail.com',type:'Amb',onboard:'',refCode:'SAVVY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Savannah Valadez',email:'sbvaladez@gmail.com',type:'Amb',onboard:'2024-09-22',refCode:'Savannah',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Shannon Missimer',email:'shannon@themofg.com',type:'Amb',onboard:'2025-03-04',refCode:'GRATOSIS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Shannon Slaughter',email:'shannonamcbride@gmail.com',type:'Amb',onboard:'2025-07-15',refCode:'JoinLogan',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Shannon Tripp',email:'shan.tripp11@gmail.com',type:'Inf',onboard:'2025-06-27',refCode:'TRIPP',hasAffiliate:true,subdomain:'shannon',w9:false,taggedHL:true,hasSlack:false},
  {name:'Shari Stamps',email:'shari@navigatingparenthood.com',type:'Amb',onboard:'2024-02-01',refCode:'SHARI',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Sherilyn Nicole Lavisky',email:'snlavisky@yahoo.com',type:'Amb',onboard:'2024-05-20',refCode:'LAVISKY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Skye Hitchcock',email:'hitchcockskye@gmail.com',type:'Amb',onboard:'2025-10-13',refCode:'SKYE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Soshanna Salsman',email:'soshannad@gmail.com',type:'Inf',onboard:'2024-04-30',refCode:'SOSH/TAB',hasAffiliate:true,subdomain:'sosh',w9:true,taggedHL:true,hasSlack:true},
  {name:'Staci Smith',email:'staciann.smith@yahoo.com',type:'Amb',onboard:'2025-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Stephanee DellaCruz',email:'stephanee.dellacruz@gmail.com',type:'Amb',onboard:'2025-04-21',refCode:'GOODENOUGH',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Stephanie Fehrmann',email:'stephnicole86@yahoo.com',type:'Amb',onboard:'2025-02-01',refCode:'Steph200',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Stephanie Gaines',email:'sgaines368@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'StephanieG',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Stephanie Lehs',email:'stephanielehs@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'STEPHANIELEHSAIRWAYRDH',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Stephanie O’Neill',email:'stephanieloneill@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'STEPHANIERDH',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:true},
  {name:'Stephanie Smith',email:'szinszer@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Suzanne Dill',email:'bensuzydill@gmail.com',type:'Amb',onboard:'2024-01-20',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Suzanne Pitkin',email:'suzannepitkinslp@gmail.com',type:'Amb',onboard:'2024-04-17',refCode:'ROOTSSPEECH',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Tania O’Donnell',email:'tfe.photography@gmail.com',type:'Amb',onboard:'',refCode:'TANIA',hasAffiliate:true,subdomain:'tania',w9:false,taggedHL:false,hasSlack:false},
  {name:'Tanya Camps',email:'hello@tanyacamps.com',type:'Amb',onboard:'2025-06-27',refCode:'TANYACAMPS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Tanya Marquez',email:'tanyavera92@gmail.com',type:'Amb',onboard:'2026-06-01',refCode:'NOSEBEST',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Tanya Tenessen',email:'tanyatennessen@gmail.com',type:'Amb',onboard:'2024-11-03',refCode:'TANYA',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Tara Woodland',email:'tkwoodland@hotmail.com',type:'Amb',onboard:'2024-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Tasha Davis',email:'lstopsto@yahoo.com',type:'Amb',onboard:'2025-02-01',refCode:'TASHA',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Tatiana Grant',email:'tatiana@ctgessentials.com',type:'Amb',onboard:'2026-02-24',refCode:'CTGE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Taylor Babich',email:'growingwhole1@gmail.com',type:'Amb',onboard:'2026-04-09',refCode:'Growingwhole',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Taylor Calmus dudedad',email:'taylor@dudedad.com',type:'Inf',onboard:'',refCode:'DUDEDAD',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Taylor Chastain',email:'taylor.m.chastain@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'TAYLOR',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Taylor Dukes',email:'taylor@taylordukeswellness.com',type:'Inf',onboard:'2025-01-31',refCode:'TAYLORDUKES',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Taylor Kulik',email:'taypetito@gmail.com',type:'Inf',onboard:'2024-02-01',refCode:'KULIK',hasAffiliate:true,subdomain:'kulik',w9:true,taggedHL:true,hasSlack:true},
  {name:'Taylor Moran',email:'taylor@leafandlearn.co',type:'Inf',onboard:'2024-04-01',refCode:'LEAFANDLEARN',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Taylor Weimar',email:'taylorlweimar@gmail.com',type:'Inf',onboard:'2024-05-01',refCode:'EMMALINE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Tera Clemons',email:'teralyncharles@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Terah Belle Jones',email:'helloterahbelle@gmail.com',type:'Inf',onboard:'2025-06-30',refCode:'TERAHBELLE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Terry Ryan',email:'nashedt@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'CHILDAIRWAY',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Thuy Improta *ministry*',email:'tranthuy984@gmail.com',type:'Inf',onboard:'2024-07-01',refCode:'MINISTRY',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:true},
  {name:'Tiffany Hubbard',email:'tjhu3s@gmail.com',type:'Amb',onboard:'2024-07-01',refCode:'HUBBKIDS',hasAffiliate:true,subdomain:'hubbkids',w9:true,taggedHL:true,hasSlack:true},
  {name:'Tiffany Newton',email:'tdnewton11@yahoo.com',type:'Amb',onboard:'2025-02-01',refCode:'adoptingherbs',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Tiffany Thomas',email:'tranes_81@yahoo.com',type:'Amb',onboard:'2025-02-01',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Tracy Gillet*',email:'tracy@raisedgood.com',type:'Amb',onboard:'2025-09-02',refCode:'RAISEDGOOD',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Travis Jones',email:'travisjones1980@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'TEXAS',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Trevor Haugen',email:'',type:'Amb',onboard:'2026-03-12',refCode:'TREVOR',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Tricia Ross',email:'tross79@gmail.com',type:'Amb',onboard:'2025-02-01',refCode:'NATURENURTURE',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Tyler Hanks',email:'',type:'Amb',onboard:'2026-05-22',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Valerie Petersen',email:'valerie.m.petersen@gmail.com',type:'Amb',onboard:'',refCode:'ValerieP',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Vicki LaBarthe',email:'vicki.labarthe@gmail.com',type:'Amb',onboard:'2026-06-08',refCode:'VickiL',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Victoria McKinney Tribe',email:'vbriz9855@gmail.com',type:'Amb',onboard:'2024-01-24',refCode:'TRIBE',hasAffiliate:false,subdomain:'',w9:true,taggedHL:true,hasSlack:false},
  {name:'Vienna Pharaon',email:'vienna@mindfulnessmft.com',type:'Inf',onboard:'2025-03-16',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Wendy Ostapuk toxinfreeish',email:'contact@wendykathryn.com',type:'Inf',onboard:'2025-01-01',refCode:'WENDY',hasAffiliate:true,subdomain:'wendy',w9:true,taggedHL:false,hasSlack:true},
  {name:'Wendy Vasquez',email:'mswvasquez@yahoo.com',type:'Amb',onboard:'2024-06-26',refCode:'WENDYV',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:false},
  {name:'Whitney Tidwell',email:'whitneyk4@gmail.com',type:'Amb',onboard:'2024-08-15',refCode:'',hasAffiliate:false,subdomain:'',w9:false,taggedHL:true,hasSlack:false},
  {name:'Yvonne Tebbe',email:'ykh0975@gmail.com',type:'Amb',onboard:'2025-08-08',refCode:'TebbeTeeth',hasAffiliate:false,subdomain:'',w9:false,taggedHL:false,hasSlack:true},
];

const ORPHAN_AFFILIATES: OrphanAffiliate[] = [
  {name:'Toby Blais',email:'toby@thenaturaldad.org',subdomain:'orangechurchkey14'},
  {name:'Zebra Brands',email:'jenn@yayzebra.com',subdomain:'zebra'},
  {name:'Jake Poulsen',email:'jakepoulsen5@gmail.com',subdomain:'five'},
];

const INTERNAL_ACCOUNTS: InternalAccount[] = [
  {name:'Alex Clark - Newsletter',email:'kamryn+alexclarknewsletter@toothpillow.com',subdomain:'acnews'},
  {name:'Alex Clark - Stories',email:'kamryn+alexclarkstories@toothpillow.com',subdomain:'acstories'},
  {name:'codydeleteme codydeleteme',email:'cody+delete@toothpillow.com',subdomain:'codyambassador'},
  {name:'Michael Knowles',email:'kamryn+knowles@toothpillow.com',subdomain:'knowles'},
  {name:'Webinar Page',email:'kamryn+webinar@toothpillow.com',subdomain:'webinarpage'},
  {name:'Toothpillow Pinterest',email:'kamryn+pinterest@toothpillow.com',subdomain:'Pinterest'},
  {name:'Marci Platt',email:'marci@toothpillow.com',subdomain:'marci'},
  {name:'Alex Clark Podcast',email:'kamryn+alexclark@toothpillow.com',subdomain:'alexclarkpodcast'},
  {name:'hana test',email:'hana@asaasin.ai',subdomain:'peardreamcatcher58'},
  {name:'Cy Tidwell',email:'cy@toothpillow.com',subdomain:'cy'},
  {name:'ewebinar toothpillow',email:'sosh+ewebinar@toothpillow.com',subdomain:'peachwolf33'},
];

/* ════════════════════════════════════════════════════════════════════════════
   SORT TYPES & HELPERS
   ════════════════════════════════════════════════════════════════════════ */
type SortKey = 'name' | 'type' | 'onboard' | 'refCode' | 'hasAffiliate' | 'subdomain' | 'w9' | 'hasSlack' | 'taggedHL';
type SortDir = 'asc' | 'desc';
type FilterMode = 'all' | 'hasDashboard' | 'noDashboard' | 'orphans' | 'internal';
type TypeFilter = 'All' | 'Amb' | 'Inf' | 'Pod';

const Check = () => (
  <span style={{ color: TP.green, fontWeight: 'bold', fontSize: 16 }}>&#10003;</span>
);
const Cross = () => (
  <span style={{ color: TP.red, fontWeight: 'bold', fontSize: 16 }}>&#10007;</span>
);

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════════════════ */
export default function AccountStatus() {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [internalOpen, setInternalOpen] = useState(false);

  // ── Summary stats ──
  const totalAmbassadors = AMBASSADOR_ACCOUNTS.length;
  const withAffiliate = AMBASSADOR_ACCOUNTS.filter(a => a.hasAffiliate).length;
  const withoutAffiliate = totalAmbassadors - withAffiliate;
  const orphanCount = ORPHAN_AFFILIATES.length;

  // ── Filtered + sorted data ──
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();

    let list = AMBASSADOR_ACCOUNTS;

    // Filter by mode
    if (filterMode === 'hasDashboard') {
      list = list.filter(a => a.hasAffiliate);
    } else if (filterMode === 'noDashboard') {
      list = list.filter(a => !a.hasAffiliate);
    }
    // orphans and internal are handled separately

    // Filter by type
    if (typeFilter !== 'All') {
      list = list.filter(a => a.type === typeFilter);
    }

    // Search (trim names for matching since some have leading spaces)
    if (q) {
      list = list.filter(a =>
        a.name.trim().toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.refCode.toLowerCase().includes(q) ||
        a.subdomain.toLowerCase().includes(q)
      );
    }

    // Sort
    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.name.trim().localeCompare(b.name.trim());
          break;
        case 'type':
          cmp = a.type.localeCompare(b.type);
          break;
        case 'onboard':
          cmp = (a.onboard || '0000').localeCompare(b.onboard || '0000');
          break;
        case 'refCode':
          cmp = a.refCode.localeCompare(b.refCode);
          break;
        case 'hasAffiliate':
          cmp = (a.hasAffiliate ? 1 : 0) - (b.hasAffiliate ? 1 : 0);
          break;
        case 'subdomain':
          cmp = a.subdomain.localeCompare(b.subdomain);
          break;
        case 'w9':
          cmp = (a.w9 ? 1 : 0) - (b.w9 ? 1 : 0);
          break;
        case 'hasSlack':
          cmp = (a.hasSlack ? 1 : 0) - (b.hasSlack ? 1 : 0);
          break;
        case 'taggedHL':
          cmp = (a.taggedHL ? 1 : 0) - (b.taggedHL ? 1 : 0);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [search, filterMode, typeFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortArrow = (key: SortKey) => {
    if (sortKey !== key) return ' ↕';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  // ── Styles ──
  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    flex: '1 1 0',
    minWidth: 180,
  };

  const thStyle: React.CSSProperties = {
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: `2px solid ${TP.navy}`,
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    background: '#f9fafb',
  };

  const tdStyle: React.CSSProperties = {
    padding: '8px 12px',
    fontSize: 13,
    color: TP.text,
    borderBottom: '1px solid #f0f0f0',
    whiteSpace: 'nowrap',
  };

  const filterBtnBase: React.CSSProperties = {
    padding: '6px 14px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    border: '1px solid #d1d5db',
    transition: 'all 0.15s',
  };

  const pillBase: React.CSSProperties = {
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid #d1d5db',
    transition: 'all 0.15s',
  };

  return (
    <div>
      {/* ── Title ── */}
      <h2 style={{ fontSize: 20, fontWeight: 700, color: TP.navy, marginBottom: 20 }}>
        Account Status &mdash; Ambassador Affiliate Dashboards
      </h2>

      {/* ── Summary cards ── */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={{ ...cardStyle, borderLeft: `4px solid ${TP.navy}` }}>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 4 }}>Total Ambassadors</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: TP.navy }}>{totalAmbassadors}</div>
        </div>
        <div style={{ ...cardStyle, borderLeft: `4px solid ${TP.teal}` }}>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 4 }}>Have Affiliate Dashboard</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: TP.teal }}>{withAffiliate}</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>{((withAffiliate / totalAmbassadors) * 100).toFixed(1)}% coverage</div>
        </div>
        <div style={{ ...cardStyle, borderLeft: `4px solid ${TP.coral}` }}>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 4 }}>Missing Dashboard</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: TP.coral }}>{withoutAffiliate}</div>
        </div>
        <div style={{ ...cardStyle, borderLeft: `4px solid ${TP.gold}` }}>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 4 }}>Orphan Accounts</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: TP.gold }}>{orphanCount}</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>In affiliate platform, not in SF</div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 16,
        padding: '12px 16px',
        background: '#f9fafb',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
      }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search name, email, ref code, subdomain..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #d1d5db',
            fontSize: 13,
            width: 300,
            outline: 'none',
          }}
        />

        {/* Filter dropdown */}
        <select
          value={filterMode}
          onChange={e => setFilterMode(e.target.value as FilterMode)}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #d1d5db',
            fontSize: 13,
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Ambassadors</option>
          <option value="hasDashboard">Has Dashboard</option>
          <option value="noDashboard">No Dashboard</option>
          <option value="orphans">Orphans</option>
          <option value="internal">Internal</option>
        </select>

        {/* Type pills */}
        <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
          {(['All', 'Amb', 'Inf', 'Pod'] as TypeFilter[]).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                ...pillBase,
                background: typeFilter === t ? TP.navy : '#fff',
                color: typeFilter === t ? '#fff' : TP.text,
                borderColor: typeFilter === t ? TP.navy : '#d1d5db',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main table (ambassadors) ── */}
      {filterMode !== 'orphans' && filterMode !== 'internal' && (
        <div style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle} onClick={() => handleSort('name')}>Name{sortArrow('name')}</th>
                  <th style={thStyle} onClick={() => handleSort('type')}>Type{sortArrow('type')}</th>
                  <th style={thStyle} onClick={() => handleSort('onboard')}>Onboard Date{sortArrow('onboard')}</th>
                  <th style={thStyle} onClick={() => handleSort('refCode')}>Ref Code{sortArrow('refCode')}</th>
                  <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => handleSort('hasAffiliate')}>Dashboard{sortArrow('hasAffiliate')}</th>
                  <th style={thStyle} onClick={() => handleSort('subdomain')}>Subdomain{sortArrow('subdomain')}</th>
                  <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => handleSort('w9')}>W9{sortArrow('w9')}</th>
                  <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => handleSort('hasSlack')}>Slack{sortArrow('hasSlack')}</th>
                  <th style={{ ...thStyle, textAlign: 'center' }} onClick={() => handleSort('taggedHL')}>HL Tagged{sortArrow('taggedHL')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((a, i) => (
                  <tr
                    key={`${a.email}-${i}`}
                    style={{
                      borderLeft: a.hasAffiliate ? `3px solid ${TP.teal}44` : '3px solid transparent',
                      background: i % 2 === 0 ? '#fff' : '#fafbfc',
                    }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{a.name.trim()}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 600,
                        background: a.type === 'Amb' ? '#dbeafe' : a.type === 'Inf' ? '#fef3c7' : '#e0e7ff',
                        color: a.type === 'Amb' ? '#1d4ed8' : a.type === 'Inf' ? '#92400e' : '#4338ca',
                      }}>
                        {a.type}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 12, color: a.onboard ? TP.text : '#ccc' }}>
                      {a.onboard || '—'}
                    </td>
                    <td style={{ ...tdStyle, fontSize: 12, fontFamily: 'monospace' }}>{a.refCode || '—'}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{a.hasAffiliate ? <Check /> : <Cross />}</td>
                    <td style={{ ...tdStyle, fontSize: 12, fontFamily: 'monospace', color: a.subdomain ? TP.teal : '#ccc' }}>
                      {a.subdomain || '—'}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{a.w9 ? <Check /> : <Cross />}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{a.hasSlack ? <Check /> : <Cross />}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{a.taggedHL ? <Check /> : <Cross />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{
            padding: '10px 16px',
            fontSize: 13,
            color: '#6b7280',
            borderTop: '1px solid #e5e7eb',
            background: '#f9fafb',
          }}>
            Showing {filteredData.length} of {totalAmbassadors}
          </div>
        </div>
      )}

      {/* ── Orphan accounts table ── */}
      {filterMode === 'orphans' && (
        <div style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            background: '#fffbeb',
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: TP.gold, margin: 0 }}>
              Orphan Accounts &mdash; In affiliate platform but NOT in Salesforce
            </h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Subdomain</th>
              </tr>
            </thead>
            <tbody>
              {ORPHAN_AFFILIATES.map((o, i) => (
                <tr key={o.email} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{o.name}</td>
                  <td style={{ ...tdStyle, fontSize: 12 }}>{o.email}</td>
                  <td style={{ ...tdStyle, fontSize: 12, fontFamily: 'monospace' }}>{o.subdomain}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{
            padding: '10px 16px',
            fontSize: 13,
            color: '#6b7280',
            borderTop: '1px solid #e5e7eb',
            background: '#f9fafb',
          }}>
            {ORPHAN_AFFILIATES.length} orphan account{ORPHAN_AFFILIATES.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* ── Internal accounts table ── */}
      {filterMode === 'internal' && (
        <div style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            background: '#f0f9ff',
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: TP.lightBlue, margin: 0 }}>
              Internal / Test Accounts
            </h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Subdomain</th>
              </tr>
            </thead>
            <tbody>
              {INTERNAL_ACCOUNTS.map((a, i) => (
                <tr key={a.email} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{a.name}</td>
                  <td style={{ ...tdStyle, fontSize: 12 }}>{a.email}</td>
                  <td style={{ ...tdStyle, fontSize: 12, fontFamily: 'monospace' }}>{a.subdomain}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{
            padding: '10px 16px',
            fontSize: 13,
            color: '#6b7280',
            borderTop: '1px solid #e5e7eb',
            background: '#f9fafb',
          }}>
            {INTERNAL_ACCOUNTS.length} internal account{INTERNAL_ACCOUNTS.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* ── Bottom: Orphan accounts (always visible when not filtered to orphans/internal) ── */}
      {filterMode !== 'orphans' && filterMode !== 'internal' && (
        <>
          <div style={{
            background: '#fff',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            marginBottom: 16,
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              background: '#fffbeb',
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#92400e', margin: 0 }}>
                Orphan Accounts ({ORPHAN_AFFILIATES.length}) &mdash; In affiliate platform but NOT in Salesforce
              </h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Subdomain</th>
                </tr>
              </thead>
              <tbody>
                {ORPHAN_AFFILIATES.map((o, i) => (
                  <tr key={o.email} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{o.name}</td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>{o.email}</td>
                    <td style={{ ...tdStyle, fontSize: 12, fontFamily: 'monospace' }}>{o.subdomain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Internal/Test Accounts (collapsible) ── */}
          <div style={{
            background: '#fff',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            marginBottom: 24,
          }}>
            <button
              onClick={() => setInternalOpen(o => !o)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#f0f9ff',
                border: 'none',
                borderBottom: internalOpen ? '1px solid #e5e7eb' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left',
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 600, color: TP.navy, margin: 0 }}>
                Internal / Test Accounts ({INTERNAL_ACCOUNTS.length})
              </h3>
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                {internalOpen ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>
            {internalOpen && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Subdomain</th>
                  </tr>
                </thead>
                <tbody>
                  {INTERNAL_ACCOUNTS.map((a, i) => (
                    <tr key={a.email} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>{a.name}</td>
                      <td style={{ ...tdStyle, fontSize: 12 }}>{a.email}</td>
                      <td style={{ ...tdStyle, fontSize: 12, fontFamily: 'monospace' }}>{a.subdomain}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
