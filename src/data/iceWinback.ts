// Ice / Win-back analysis data — source: ice-all-links-2026-10-12.html
// 8,851 checkout-linked leads, Jan–Oct 2026
// Updated: October 12, 2026

export const ICE_EVENTS = [
  {
    "x": 21.143,
    "label": "#626 shipped",
    "date": "2026-05-29"
  },
  {
    "x": 25.714,
    "label": "price increase (TP #649)",
    "date": "2026-06-30"
  },
  {
    "x": 27.571,
    "label": "automations to draft (per Sosh)",
    "date": "2026-07-13"
  }
];

// C1: Weekly cohort — links sent, checkouts, conversion %, Lava %, Ice %
export const WEEKLY_COHORT = {
  labels: ["W01 Jan 1", "W02 Jan 5", "W03 Jan 12", "W04 Jan 19", "W05 Jan 26", "W06 Feb 2", "W07 Feb 9", "W08 Feb 16", "W09 Feb 23", "W10 Mar 2", "W11 Mar 9", "W12 Mar 16", "W13 Mar 23", "W14 Mar 30", "W15 Apr 6", "W16 Apr 13", "W17 Apr 20", "W18 Apr 27", "W19 May 4", "W20 May 11", "W21 May 18", "W22 May 25", "W23 Jun 1", "W24 Jun 8", "W25 Jun 15", "W26 Jun 22", "W27 Jun 29", "W28 Jul 6", "W29 Jul 13", "W30 Jul 20", "W31 Jul 27", "W32 Aug 3", "W33 Aug 10", "W34 Aug 17", "W35 Aug 24", "W36 Aug 31", "W37 Sep 7", "W38 Sep 14", "W39 Sep 21", "W40 Sep 28", "W41 Oct 5"],
  links: [19, 201, 205, 166, 181, 164, 150, 191, 237, 277, 188, 181, 291, 117, 183, 560, 170, 239, 114, 172, 154, 235, 211, 210, 328, 303, 171, 189, 291, 280, 338, 315, 280, 221, 193, 225, 234, 214, 142, 181, 130],
  checkouts: [9, 68, 83, 51, 71, 69, 55, 71, 89, 104, 81, 66, 94, 38, 75, 68, 66, 74, 40, 51, 54, 64, 60, 64, 96, 83, 45, 53, 87, 71, 84, 67, 63, 66, 58, 53, 70, 57, 44, 32, 26],
  pct: [47.37, 33.83, 40.49, 30.72, 39.23, 42.07, 36.67, 37.17, 37.55, 37.55, 43.09, 36.46, 32.3, 32.48, 40.98, 12.14, 38.82, 30.96, 35.09, 29.65, 35.06, 27.23, 28.44, 30.48, 29.27, 27.39, 26.32, 28.04, 29.9, 25.36, 24.85, 21.27, 22.5, 29.86, 30.05, 23.56, 29.91, 26.64, 30.99, 17.68, 20.0],
  lava: [42.11, 23.88, 30.73, 25.3, 28.73, 30.49, 29.33, 25.65, 24.47, 22.38, 31.38, 27.62, 19.24, 18.8, 26.23, 7.68, 27.06, 12.97, 18.42, 25.0, 23.38, 17.02, 20.85, 27.62, 26.22, 22.77, 21.05, 23.28, 20.96, 19.29, 19.82, 17.14, 18.57, 23.98, 26.42, 21.33, 27.35, 24.77, 30.99, 17.68, 20.0],
  ice: [5.26, 9.95, 9.76, 5.42, 10.5, 11.59, 7.33, 11.52, 13.08, 15.16, 11.7, 8.84, 13.06, 13.68, 14.75, 4.46, 11.76, 17.99, 16.67, 4.65, 11.69, 10.21, 7.58, 2.86, 3.05, 4.62, 5.26, 4.76, 8.93, 6.07, 5.03, 4.13, 3.93, 5.88, 3.63, 2.22, 2.56, 1.87, 0.0, 0.0, 0.0],
  maturing: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true],
  lava_maturing: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true],
  ice_maturing: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true],
  ref: 32.55,
  ref_label: "Feb\u2013Apr avg ~33%",
};

// C4: Monthly win-back rate
export const MONTHLY_WINBACK = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
  rate: [12.41, 15.54, 16.29, 12.49, 13.05, 5.67, 8.09, 5.7, 1.52, 0.0],
  ice: [69, 83, 121, 120, 77, 50, 74, 49, 10, 0],
  open: [556, 534, 743, 961, 590, 882, 915, 860, 660, 137],
  partial: [false, false, false, false, false, false, false, true, true, true],
};

// C3: Weekly Ice checkouts by plan
export const ICE_BY_PLAN = {
  labels: ["W01 Jan 1", "W02 Jan 5", "W03 Jan 12", "W04 Jan 19", "W05 Jan 26", "W06 Feb 2", "W07 Feb 9", "W08 Feb 16", "W09 Feb 23", "W10 Mar 2", "W11 Mar 9", "W12 Mar 16", "W13 Mar 23", "W14 Mar 30", "W15 Apr 6", "W16 Apr 13", "W17 Apr 20", "W18 Apr 27", "W19 May 4", "W20 May 11", "W21 May 18", "W22 May 25", "W23 Jun 1", "W24 Jun 8", "W25 Jun 15", "W26 Jun 22", "W27 Jun 29", "W28 Jul 6", "W29 Jul 13", "W30 Jul 20", "W31 Jul 27", "W32 Aug 3", "W33 Aug 10", "W34 Aug 17", "W35 Aug 24", "W36 Aug 31", "W37 Sep 7", "W38 Sep 14", "W39 Sep 21", "W40 Sep 28", "W41 Oct 5"],
  rec: [0, 8, 15, 5, 13, 6, 10, 2, 22, 1, 10, 10, 9, 6, 9, 6, 14, 3, 7, 8, 4, 26, 1, 2, 10, 19, 15, 2, 2, 3, 6, 2, 7, 4, 6, 8, 1, 5, 8, 4, 3],
  ess: [3, 18, 23, 10, 16, 6, 7, 4, 38, 3, 3, 9, 24, 6, 6, 11, 15, 12, 6, 11, 2, 32, 6, 15, 13, 16, 30, 1, 4, 4, 3, 5, 14, 7, 12, 7, 7, 5, 21, 11, 12],
  other: [1, 4, 2, 3, 1, 1, 5, 0, 5, 0, 0, 2, 3, 25, 1, 0, 10, 11, 1, 1, 1, 4, 1, 4, 2, 11, 7, 2, 0, 3, 5, 2, 4, 5, 9, 6, 2, 2, 1, 4, 3],
};

// C5: GHL contact coverage
export const GHL_COVERAGE = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
  coverage: [77.47, 80.29, 79.94, 78.73, 82.08, 78.54, 79.15, 79.17, 75.26, 75.72],
  dnd: [3.7, 2.17, 3.93, 3.09, 4.93, 2.08, 1.53, 1.16, 0.45, 0.0],
  leads: [768, 746, 987, 1152, 742, 1165, 1156, 1085, 877, 173],
  matched: [595, 599, 789, 907, 609, 915, 915, 859, 660, 131],
};

// C6: Last touch timing — when the last GHL touch was, by link month
export const LAST_TOUCH_TIMING = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
  series: [
  {
    "name": "Jan links",
    "data": [
      17,
      2,
      55,
      247,
      1,
      0,
      2,
      0,
      1,
      0
    ]
  },
  {
    "name": "Feb links",
    "data": [
      2,
      13,
      70,
      242,
      0,
      0,
      2,
      1,
      2,
      0
    ]
  },
  {
    "name": "Mar links",
    "data": [
      0,
      1,
      101,
      347,
      4,
      3,
      13,
      0,
      1,
      0
    ]
  },
  {
    "name": "Apr links",
    "data": [
      0,
      10,
      37,
      60,
      10,
      2,
      262,
      11,
      8,
      0
    ]
  },
  {
    "name": "May links",
    "data": [
      0,
      0,
      1,
      1,
      8,
      7,
      15,
      320,
      3,
      0
    ]
  },
  {
    "name": "Jun links",
    "data": [
      0,
      2,
      1,
      2,
      1,
      15,
      34,
      361,
      3,
      0
    ]
  },
  {
    "name": "Jul links",
    "data": [
      0,
      3,
      1,
      0,
      0,
      0,
      41,
      158,
      63,
      0
    ]
  },
  {
    "name": "Aug links",
    "data": [
      0,
      1,
      0,
      0,
      0,
      0,
      4,
      135,
      164,
      11
    ]
  },
  {
    "name": "Sep links",
    "data": [
      0,
      2,
      0,
      1,
      0,
      0,
      1,
      6,
      242,
      17
    ]
  },
  {
    "name": "Oct links",
    "data": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      9,
      61
    ]
  }
],
};

// C7: SF logged activity share
export const SF_ACTIVITY = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
  share: [5.13, 2.66, 1.61, 1.31, 1.36, 0.24, 0.24, 0.12, 0.92, null],
  n: [25, 12, 10, 11, 7, 2, 2, 1, 4, 0],
  den: [487, 451, 622, 841, 513, 832, 841, 811, 436, 0],
  partial: [false, false, false, false, false, false, false, true, true, true],
};

// C8: Where last touch falls (% of leads by timing bucket)
export const TOUCH_WINDOW = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
  before21: [24.07, 8.97, 24.8, 43.13, 31.85, 44.72, 33.74, 27.91, 56.73, 98.08],
  d21_72: [27.25, 19.57, 26.8, 20.6, 35.36, 34.61, 55.78, 71.32, 42.03, 0.0],
  after72: [37.04, 65.49, 30.4, 23.73, 18.97, 14.09, 10.03, 0.0, 0.0, 0.0],
  none: [11.64, 5.98, 18.0, 12.54, 13.82, 6.58, 0.46, 0.78, 1.24, 1.92],
  den: [378, 368, 500, 670, 427, 653, 658, 645, 483, 104],
  partial: [false, false, false, false, false, false, false, true, true, true],
};

// C9: Coordinator mix by month
export const COORDINATOR_MIX = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
  coord: [
  {
    "name": "Desirea Peraza",
    "data": [
      52.86,
      48.26,
      46.2,
      38.63,
      43.4,
      33.65,
      31.06,
      24.24,
      24.52,
      22.54
    ]
  },
  {
    "name": "Jolee Thailing",
    "data": [
      25.39,
      30.43,
      29.79,
      39.41,
      31.4,
      34.25,
      31.83,
      32.81,
      23.15,
      36.42
    ]
  },
  {
    "name": "Ashley Acuna",
    "data": [
      21.48,
      21.31,
      23.91,
      21.61,
      24.53,
      31.76,
      34.08,
      22.49,
      26.8,
      24.86
    ]
  },
  {
    "name": "Sam Rice",
    "data": [
      0.0,
      0.0,
      0.0,
      0.09,
      0.4,
      0.09,
      1.82,
      16.87,
      23.6,
      16.18
    ]
  },
  {
    "name": "Other",
    "data": [
      0.26,
      0.0,
      0.1,
      0.26,
      0.27,
      0.26,
      1.21,
      3.59,
      1.94,
      0.0
    ]
  }
],
  owner: [
  {
    "name": "Desirea Peraza",
    "data": [
      30.92,
      29.38,
      31.05,
      25.25,
      31.2,
      24.48,
      25.68,
      20.61,
      20.0,
      18.32
    ]
  },
  {
    "name": "Jolee Thailing",
    "data": [
      18.15,
      20.2,
      20.28,
      17.53,
      20.69,
      24.92,
      23.72,
      27.82,
      17.73,
      31.3
    ]
  },
  {
    "name": "Ashley Acuna",
    "data": [
      14.12,
      11.85,
      12.93,
      10.14,
      15.76,
      21.86,
      23.83,
      16.41,
      20.91,
      23.66
    ]
  },
  {
    "name": "Morgan Hams",
    "data": [
      8.4,
      10.02,
      9.13,
      10.69,
      7.22,
      6.56,
      8.42,
      4.31,
      6.36,
      3.05
    ]
  },
  {
    "name": "Carly Patterson",
    "data": [
      8.24,
      10.35,
      9.38,
      6.62,
      8.37,
      7.32,
      5.25,
      5.82,
      4.55,
      2.29
    ]
  },
  {
    "name": "Shannon Frontz",
    "data": [
      7.39,
      10.52,
      9.13,
      6.06,
      8.21,
      6.67,
      5.57,
      5.12,
      4.7,
      2.29
    ]
  },
  {
    "name": "Niki Minter",
    "data": [
      10.76,
      6.01,
      6.46,
      5.29,
      5.91,
      6.23,
      4.48,
      5.47,
      5.45,
      0.76
    ]
  },
  {
    "name": "Sam Rice",
    "data": [
      0.0,
      0.0,
      0.0,
      0.0,
      1.15,
      0.87,
      2.4,
      13.5,
      18.79,
      17.56
    ]
  },
  {
    "name": "Irina Osuji",
    "data": [
      1.34,
      1.17,
      1.01,
      17.09,
      0.82,
      0.87,
      0.11,
      0.0,
      0.0,
      0.0
    ]
  },
  {
    "name": "Other",
    "data": [
      0.67,
      0.5,
      0.63,
      1.32,
      0.66,
      0.22,
      0.55,
      0.93,
      1.52,
      0.76
    ]
  }
],
};
