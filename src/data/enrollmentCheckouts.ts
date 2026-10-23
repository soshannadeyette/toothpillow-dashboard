// Enrollment checkouts data — hardcoded from Salesforce exports.
// Checkout data: Checkouts Today export. Funnel/conversion data: SOSH | Enrollment Funnel export (Oct 22, 2026).

export type MonthRow = { month: string; checkouts: number; amountPaid: number; totalAmountPaid: number };
export type WeekRow = { weekStart: string; checkouts: number; amountPaid: number };
export type DayRow = { date: string; checkouts: number; amountPaid: number };
export type TCRow = { tc: string; checkouts: number; amountPaid: number; totalAmountPaid: number; avgDaysLinkSent: number };
export type SegRow = { segment: string; checkouts: number; amountPaid: number };

export const monthly: MonthRow[] = [{"month": "2026-01", "checkouts": 380, "amountPaid": 622668.0, "totalAmountPaid": 839149.0}, {"month": "2026-02", "checkouts": 383, "amountPaid": 614898.0, "totalAmountPaid": 826184.64}, {"month": "2026-03", "checkouts": 402, "amountPaid": 641857.0, "totalAmountPaid": 863880.0}, {"month": "2026-04", "checkouts": 352, "amountPaid": 580211.0, "totalAmountPaid": 822443.0}, {"month": "2026-05", "checkouts": 329, "amountPaid": 522076.5, "totalAmountPaid": 712239.5}, {"month": "2026-06", "checkouts": 480, "amountPaid": 734107.0, "totalAmountPaid": 960278.0}, {"month": "2026-07", "checkouts": 307, "amountPaid": 569489.0, "totalAmountPaid": 721106.0}, {"month": "2026-08", "checkouts": 381, "amountPaid": 734912.0, "totalAmountPaid": 933809.0}, {"month": "2026-09", "checkouts": 338, "amountPaid": 626445.0, "totalAmountPaid": 788901.0}, {"month": "2026-10", "checkouts": 66, "amountPaid": 119215.0, "totalAmountPaid": 142374.0}];

export const weekly: WeekRow[] = [{"weekStart": "2025-12-28", "checkouts": 8, "amountPaid": 13418.0}, {"weekStart": "2026-01-04", "checkouts": 64, "amountPaid": 110974.0}, {"weekStart": "2026-01-11", "checkouts": 142, "amountPaid": 233540.0}, {"weekStart": "2026-01-18", "checkouts": 60, "amountPaid": 94017.0}, {"weekStart": "2026-01-25", "checkouts": 106, "amountPaid": 170719.0}, {"weekStart": "2026-02-01", "checkouts": 58, "amountPaid": 98598.0}, {"weekStart": "2026-02-08", "checkouts": 89, "amountPaid": 141129.0}, {"weekStart": "2026-02-15", "checkouts": 37, "amountPaid": 60938.0}, {"weekStart": "2026-02-22", "checkouts": 199, "amountPaid": 314233.0}, {"weekStart": "2026-03-01", "checkouts": 51, "amountPaid": 81384.0}, {"weekStart": "2026-03-08", "checkouts": 60, "amountPaid": 101138.0}, {"weekStart": "2026-03-15", "checkouts": 100, "amountPaid": 162270.0}, {"weekStart": "2026-03-22", "checkouts": 130, "amountPaid": 200714.0}, {"weekStart": "2026-03-29", "checkouts": 87, "amountPaid": 138803.0}, {"weekStart": "2026-04-05", "checkouts": 61, "amountPaid": 99456.0}, {"weekStart": "2026-04-12", "checkouts": 88, "amountPaid": 156443.0}, {"weekStart": "2026-04-19", "checkouts": 114, "amountPaid": 186035.0}, {"weekStart": "2026-04-26", "checkouts": 77, "amountPaid": 117925.0}, {"weekStart": "2026-05-03", "checkouts": 55, "amountPaid": 91372.0}, {"weekStart": "2026-05-10", "checkouts": 79, "amountPaid": 129222.5}, {"weekStart": "2026-05-17", "checkouts": 48, "amountPaid": 75814.0}, {"weekStart": "2026-05-24", "checkouts": 132, "amountPaid": 202320.0}, {"weekStart": "2026-05-31", "checkouts": 43, "amountPaid": 65444.0}, {"weekStart": "2026-06-07", "checkouts": 66, "amountPaid": 104134.0}, {"weekStart": "2026-06-14", "checkouts": 83, "amountPaid": 132954.0}, {"weekStart": "2026-06-21", "checkouts": 146, "amountPaid": 225957.0}, {"weekStart": "2026-06-28", "checkouts": 164, "amountPaid": 239979.0}, {"weekStart": "2026-07-05", "checkouts": 45, "amountPaid": 82713.0}, {"weekStart": "2026-07-12", "checkouts": 67, "amountPaid": 132161.0}, {"weekStart": "2026-07-19", "checkouts": 70, "amountPaid": 131928.0}, {"weekStart": "2026-07-26", "checkouts": 109, "amountPaid": 198106.0}, {"weekStart": "2026-08-02", "checkouts": 54, "amountPaid": 109768.0}, {"weekStart": "2026-08-09", "checkouts": 101, "amountPaid": 195345.0}, {"weekStart": "2026-08-16", "checkouts": 78, "amountPaid": 153475.0}, {"weekStart": "2026-08-23", "checkouts": 113, "amountPaid": 214272.0}, {"weekStart": "2026-08-30", "checkouts": 86, "amountPaid": 157087.0}, {"weekStart": "2026-09-06", "checkouts": 59, "amountPaid": 108167.0}, {"weekStart": "2026-09-13", "checkouts": 86, "amountPaid": 162292.0}, {"weekStart": "2026-09-20", "checkouts": 94, "amountPaid": 177002.0}, {"weekStart": "2026-09-27", "checkouts": 79, "amountPaid": 140683.0}, {"weekStart": "2026-10-04", "checkouts": 8, "amountPaid": 5388.0}];

export const daily: DayRow[] = [{"date": "2026-01-01", "checkouts": 2, "amountPaid": 3142.0}, {"date": "2026-01-02", "checkouts": 4, "amountPaid": 6735.0}, {"date": "2026-01-03", "checkouts": 2, "amountPaid": 3541.0}, {"date": "2026-01-05", "checkouts": 16, "amountPaid": 27080.0}, {"date": "2026-01-06", "checkouts": 10, "amountPaid": 18654.0}, {"date": "2026-01-07", "checkouts": 10, "amountPaid": 16060.0}, {"date": "2026-01-08", "checkouts": 13, "amountPaid": 21495.0}, {"date": "2026-01-09", "checkouts": 13, "amountPaid": 23894.0}, {"date": "2026-01-10", "checkouts": 2, "amountPaid": 3791.0}, {"date": "2026-01-11", "checkouts": 2, "amountPaid": 3391.0}, {"date": "2026-01-12", "checkouts": 6, "amountPaid": 9972.0}, {"date": "2026-01-13", "checkouts": 13, "amountPaid": 21550.0}, {"date": "2026-01-14", "checkouts": 87, "amountPaid": 142768.0}, {"date": "2026-01-15", "checkouts": 22, "amountPaid": 35609.0}, {"date": "2026-01-16", "checkouts": 10, "amountPaid": 16858.0}, {"date": "2026-01-17", "checkouts": 2, "amountPaid": 3392.0}, {"date": "2026-01-19", "checkouts": 19, "amountPaid": 32469.0}, {"date": "2026-01-20", "checkouts": 8, "amountPaid": 13514.0}, {"date": "2026-01-21", "checkouts": 8, "amountPaid": 11818.0}, {"date": "2026-01-22", "checkouts": 6, "amountPaid": 10479.0}, {"date": "2026-01-23", "checkouts": 14, "amountPaid": 22940.0}, {"date": "2026-01-24", "checkouts": 5, "amountPaid": 2797.0}, {"date": "2026-01-25", "checkouts": 2, "amountPaid": 3591.0}, {"date": "2026-01-26", "checkouts": 18, "amountPaid": 30673.0}, {"date": "2026-01-27", "checkouts": 14, "amountPaid": 22095.0}, {"date": "2026-01-28", "checkouts": 40, "amountPaid": 64589.0}, {"date": "2026-01-29", "checkouts": 13, "amountPaid": 21994.0}, {"date": "2026-01-30", "checkouts": 17, "amountPaid": 24337.0}, {"date": "2026-01-31", "checkouts": 2, "amountPaid": 3440.0}, {"date": "2026-02-01", "checkouts": 3, "amountPaid": 4887.0}, {"date": "2026-02-02", "checkouts": 12, "amountPaid": 20449.0}, {"date": "2026-02-03", "checkouts": 13, "amountPaid": 21847.0}, {"date": "2026-02-04", "checkouts": 9, "amountPaid": 16209.0}, {"date": "2026-02-05", "checkouts": 11, "amountPaid": 19103.0}, {"date": "2026-02-06", "checkouts": 7, "amountPaid": 10967.0}, {"date": "2026-02-07", "checkouts": 3, "amountPaid": 5136.0}, {"date": "2026-02-08", "checkouts": 1, "amountPaid": 1796.0}, {"date": "2026-02-09", "checkouts": 9, "amountPaid": 12322.0}, {"date": "2026-02-10", "checkouts": 9, "amountPaid": 15563.0}, {"date": "2026-02-11", "checkouts": 11, "amountPaid": 17355.0}, {"date": "2026-02-12", "checkouts": 39, "amountPaid": 61583.0}, {"date": "2026-02-13", "checkouts": 19, "amountPaid": 30964.0}, {"date": "2026-02-14", "checkouts": 1, "amountPaid": 1546.0}, {"date": "2026-02-15", "checkouts": 1, "amountPaid": 1995.0}, {"date": "2026-02-16", "checkouts": 3, "amountPaid": 5036.0}, {"date": "2026-02-17", "checkouts": 8, "amountPaid": 14612.0}, {"date": "2026-02-18", "checkouts": 10, "amountPaid": 15306.0}, {"date": "2026-02-19", "checkouts": 6, "amountPaid": 8878.0}, {"date": "2026-02-20", "checkouts": 6, "amountPaid": 10223.0}, {"date": "2026-02-21", "checkouts": 3, "amountPaid": 4888.0}, {"date": "2026-02-22", "checkouts": 2, "amountPaid": 3592.0}, {"date": "2026-02-23", "checkouts": 18, "amountPaid": 28971.0}, {"date": "2026-02-24", "checkouts": 18, "amountPaid": 30868.0}, {"date": "2026-02-25", "checkouts": 84, "amountPaid": 130332.0}, {"date": "2026-02-26", "checkouts": 29, "amountPaid": 46273.0}, {"date": "2026-02-27", "checkouts": 39, "amountPaid": 60084.0}, {"date": "2026-02-28", "checkouts": 9, "amountPaid": 14113.0}, {"date": "2026-03-01", "checkouts": 2, "amountPaid": 2645.0}, {"date": "2026-03-02", "checkouts": 11, "amountPaid": 18802.0}, {"date": "2026-03-03", "checkouts": 8, "amountPaid": 10323.0}, {"date": "2026-03-04", "checkouts": 11, "amountPaid": 17255.0}, {"date": "2026-03-05", "checkouts": 10, "amountPaid": 16950.0}, {"date": "2026-03-06", "checkouts": 6, "amountPaid": 10073.0}, {"date": "2026-03-07", "checkouts": 3, "amountPaid": 5336.0}, {"date": "2026-03-09", "checkouts": 6, "amountPaid": 10622.0}, {"date": "2026-03-10", "checkouts": 15, "amountPaid": 26432.0}, {"date": "2026-03-11", "checkouts": 11, "amountPaid": 19053.0}, {"date": "2026-03-12", "checkouts": 11, "amountPaid": 16705.0}, {"date": "2026-03-13", "checkouts": 13, "amountPaid": 21643.0}, {"date": "2026-03-14", "checkouts": 4, "amountPaid": 6683.0}, {"date": "2026-03-15", "checkouts": 1, "amountPaid": 1795.0}, {"date": "2026-03-16", "checkouts": 11, "amountPaid": 19502.0}, {"date": "2026-03-17", "checkouts": 16, "amountPaid": 23889.0}, {"date": "2026-03-18", "checkouts": 12, "amountPaid": 20446.0}, {"date": "2026-03-19", "checkouts": 25, "amountPaid": 39645.0}, {"date": "2026-03-20", "checkouts": 32, "amountPaid": 51657.0}, {"date": "2026-03-21", "checkouts": 3, "amountPaid": 5336.0}, {"date": "2026-03-22", "checkouts": 3, "amountPaid": 5138.0}, {"date": "2026-03-23", "checkouts": 18, "amountPaid": 26629.0}, {"date": "2026-03-24", "checkouts": 13, "amountPaid": 21595.0}, {"date": "2026-03-25", "checkouts": 26, "amountPaid": 40046.0}, {"date": "2026-03-26", "checkouts": 49, "amountPaid": 74109.0}, {"date": "2026-03-27", "checkouts": 20, "amountPaid": 31401.0}, {"date": "2026-03-28", "checkouts": 1, "amountPaid": 1796.0}, {"date": "2026-03-29", "checkouts": 6, "amountPaid": 9277.0}, {"date": "2026-03-30", "checkouts": 18, "amountPaid": 27690.0}, {"date": "2026-03-31", "checkouts": 37, "amountPaid": 59384.0}, {"date": "2026-04-01", "checkouts": 13, "amountPaid": 20159.0}, {"date": "2026-04-02", "checkouts": 10, "amountPaid": 17406.0}, {"date": "2026-04-03", "checkouts": 3, "amountPaid": 4887.0}, {"date": "2026-04-06", "checkouts": 7, "amountPaid": 10073.0}, {"date": "2026-04-07", "checkouts": 14, "amountPaid": 25937.0}, {"date": "2026-04-08", "checkouts": 11, "amountPaid": 17456.0}, {"date": "2026-04-09", "checkouts": 11, "amountPaid": 17907.0}, {"date": "2026-04-10", "checkouts": 15, "amountPaid": 22698.0}, {"date": "2026-04-11", "checkouts": 3, "amountPaid": 5385.0}, {"date": "2026-04-12", "checkouts": 1, "amountPaid": 1796.0}, {"date": "2026-04-13", "checkouts": 17, "amountPaid": 28476.0}, {"date": "2026-04-14", "checkouts": 10, "amountPaid": 19605.0}, {"date": "2026-04-15", "checkouts": 21, "amountPaid": 36637.0}, {"date": "2026-04-16", "checkouts": 9, "amountPaid": 16163.0}, {"date": "2026-04-17", "checkouts": 26, "amountPaid": 46584.0}, {"date": "2026-04-18", "checkouts": 4, "amountPaid": 7182.0}, {"date": "2026-04-19", "checkouts": 1, "amountPaid": 1546.0}, {"date": "2026-04-20", "checkouts": 17, "amountPaid": 29328.0}, {"date": "2026-04-21", "checkouts": 15, "amountPaid": 24285.0}, {"date": "2026-04-22", "checkouts": 18, "amountPaid": 29276.0}, {"date": "2026-04-23", "checkouts": 35, "amountPaid": 56307.0}, {"date": "2026-04-24", "checkouts": 26, "amountPaid": 42101.0}, {"date": "2026-04-25", "checkouts": 2, "amountPaid": 3192.0}, {"date": "2026-04-26", "checkouts": 4, "amountPaid": 6538.0}, {"date": "2026-04-27", "checkouts": 12, "amountPaid": 17162.0}, {"date": "2026-04-28", "checkouts": 9, "amountPaid": 16065.0}, {"date": "2026-04-29", "checkouts": 18, "amountPaid": 28033.0}, {"date": "2026-04-30", "checkouts": 20, "amountPaid": 28027.0}, {"date": "2026-05-01", "checkouts": 9, "amountPaid": 15516.0}, {"date": "2026-05-02", "checkouts": 5, "amountPaid": 6584.0}, {"date": "2026-05-04", "checkouts": 13, "amountPaid": 21546.0}, {"date": "2026-05-05", "checkouts": 5, "amountPaid": 8181.0}, {"date": "2026-05-06", "checkouts": 16, "amountPaid": 28781.0}, {"date": "2026-05-07", "checkouts": 11, "amountPaid": 17655.0}, {"date": "2026-05-08", "checkouts": 9, "amountPaid": 13414.0}, {"date": "2026-05-09", "checkouts": 1, "amountPaid": 1795.0}, {"date": "2026-05-10", "checkouts": 6, "amountPaid": 10373.0}, {"date": "2026-05-11", "checkouts": 25, "amountPaid": 40797.25}, {"date": "2026-05-12", "checkouts": 11, "amountPaid": 18458.25}, {"date": "2026-05-13", "checkouts": 16, "amountPaid": 25179.0}, {"date": "2026-05-14", "checkouts": 12, "amountPaid": 20100.0}, {"date": "2026-05-15", "checkouts": 9, "amountPaid": 14315.0}, {"date": "2026-05-18", "checkouts": 12, "amountPaid": 20605.0}, {"date": "2026-05-19", "checkouts": 12, "amountPaid": 18251.0}, {"date": "2026-05-20", "checkouts": 8, "amountPaid": 14065.0}, {"date": "2026-05-21", "checkouts": 5, "amountPaid": 4889.0}, {"date": "2026-05-22", "checkouts": 9, "amountPaid": 14662.0}, {"date": "2026-05-23", "checkouts": 2, "amountPaid": 3342.0}, {"date": "2026-05-25", "checkouts": 1, "amountPaid": 1596.0}, {"date": "2026-05-26", "checkouts": 53, "amountPaid": 80341.0}, {"date": "2026-05-27", "checkouts": 49, "amountPaid": 77440.0}, {"date": "2026-05-28", "checkouts": 17, "amountPaid": 23488.0}, {"date": "2026-05-29", "checkouts": 8, "amountPaid": 12470.0}, {"date": "2026-05-30", "checkouts": 4, "amountPaid": 6985.0}, {"date": "2026-05-31", "checkouts": 1, "amountPaid": 1248.0}, {"date": "2026-06-01", "checkouts": 7, "amountPaid": 11821.0}, {"date": "2026-06-02", "checkouts": 4, "amountPaid": 5287.0}, {"date": "2026-06-03", "checkouts": 11, "amountPaid": 13374.0}, {"date": "2026-06-04", "checkouts": 5, "amountPaid": 8877.0}, {"date": "2026-06-05", "checkouts": 14, "amountPaid": 23042.0}, {"date": "2026-06-06", "checkouts": 1, "amountPaid": 1795.0}, {"date": "2026-06-07", "checkouts": 5, "amountPaid": 8378.0}, {"date": "2026-06-08", "checkouts": 18, "amountPaid": 26491.0}, {"date": "2026-06-09", "checkouts": 10, "amountPaid": 17109.0}, {"date": "2026-06-10", "checkouts": 6, "amountPaid": 10222.0}, {"date": "2026-06-11", "checkouts": 18, "amountPaid": 27324.0}, {"date": "2026-06-12", "checkouts": 7, "amountPaid": 11419.0}, {"date": "2026-06-13", "checkouts": 2, "amountPaid": 3191.0}, {"date": "2026-06-14", "checkouts": 2, "amountPaid": 3090.0}, {"date": "2026-06-15", "checkouts": 19, "amountPaid": 29921.0}, {"date": "2026-06-16", "checkouts": 8, "amountPaid": 11274.0}, {"date": "2026-06-17", "checkouts": 11, "amountPaid": 17855.0}, {"date": "2026-06-18", "checkouts": 20, "amountPaid": 33063.0}, {"date": "2026-06-19", "checkouts": 17, "amountPaid": 27977.0}, {"date": "2026-06-20", "checkouts": 6, "amountPaid": 9774.0}, {"date": "2026-06-21", "checkouts": 4, "amountPaid": 6732.0}, {"date": "2026-06-22", "checkouts": 18, "amountPaid": 28775.0}, {"date": "2026-06-23", "checkouts": 11, "amountPaid": 17805.0}, {"date": "2026-06-24", "checkouts": 12, "amountPaid": 18449.0}, {"date": "2026-06-25", "checkouts": 51, "amountPaid": 78511.0}, {"date": "2026-06-26", "checkouts": 45, "amountPaid": 67706.0}, {"date": "2026-06-27", "checkouts": 5, "amountPaid": 7979.0}, {"date": "2026-06-29", "checkouts": 36, "amountPaid": 52351.0}, {"date": "2026-06-30", "checkouts": 107, "amountPaid": 154515.0}, {"date": "2026-07-01", "checkouts": 12, "amountPaid": 17850.0}, {"date": "2026-07-02", "checkouts": 9, "amountPaid": 15263.0}, {"date": "2026-07-06", "checkouts": 11, "amountPaid": 16764.0}, {"date": "2026-07-07", "checkouts": 7, "amountPaid": 12917.0}, {"date": "2026-07-08", "checkouts": 9, "amountPaid": 17312.0}, {"date": "2026-07-09", "checkouts": 5, "amountPaid": 10477.0}, {"date": "2026-07-10", "checkouts": 8, "amountPaid": 15865.0}, {"date": "2026-07-11", "checkouts": 5, "amountPaid": 9378.0}, {"date": "2026-07-13", "checkouts": 18, "amountPaid": 35916.0}, {"date": "2026-07-14", "checkouts": 10, "amountPaid": 20458.0}, {"date": "2026-07-15", "checkouts": 10, "amountPaid": 18162.0}, {"date": "2026-07-16", "checkouts": 9, "amountPaid": 17911.0}, {"date": "2026-07-17", "checkouts": 15, "amountPaid": 29686.0}, {"date": "2026-07-18", "checkouts": 5, "amountPaid": 10028.0}, {"date": "2026-07-19", "checkouts": 1, "amountPaid": 2245.0}, {"date": "2026-07-20", "checkouts": 9, "amountPaid": 18360.0}, {"date": "2026-07-21", "checkouts": 12, "amountPaid": 16660.0}, {"date": "2026-07-22", "checkouts": 17, "amountPaid": 34256.0}, {"date": "2026-07-23", "checkouts": 9, "amountPaid": 18261.0}, {"date": "2026-07-24", "checkouts": 16, "amountPaid": 30474.0}, {"date": "2026-07-25", "checkouts": 6, "amountPaid": 11672.0}, {"date": "2026-07-26", "checkouts": 1, "amountPaid": 1996.0}, {"date": "2026-07-27", "checkouts": 9, "amountPaid": 17660.0}, {"date": "2026-07-28", "checkouts": 20, "amountPaid": 38466.0}, {"date": "2026-07-29", "checkouts": 34, "amountPaid": 57768.0}, {"date": "2026-07-30", "checkouts": 26, "amountPaid": 46494.0}, {"date": "2026-07-31", "checkouts": 14, "amountPaid": 27190.0}, {"date": "2026-08-01", "checkouts": 5, "amountPaid": 8532.0}, {"date": "2026-08-02", "checkouts": 1, "amountPaid": 2296.0}, {"date": "2026-08-03", "checkouts": 7, "amountPaid": 12574.0}, {"date": "2026-08-04", "checkouts": 9, "amountPaid": 19259.0}, {"date": "2026-08-05", "checkouts": 7, "amountPaid": 14869.0}, {"date": "2026-08-06", "checkouts": 14, "amountPaid": 27842.0}, {"date": "2026-08-07", "checkouts": 13, "amountPaid": 27240.0}, {"date": "2026-08-08", "checkouts": 3, "amountPaid": 5688.0}, {"date": "2026-08-09", "checkouts": 2, "amountPaid": 3991.0}, {"date": "2026-08-10", "checkouts": 13, "amountPaid": 26342.0}, {"date": "2026-08-11", "checkouts": 12, "amountPaid": 24651.0}, {"date": "2026-08-12", "checkouts": 9, "amountPaid": 18510.0}, {"date": "2026-08-13", "checkouts": 16, "amountPaid": 31165.0}, {"date": "2026-08-14", "checkouts": 29, "amountPaid": 53378.0}, {"date": "2026-08-15", "checkouts": 20, "amountPaid": 37308.0}, {"date": "2026-08-16", "checkouts": 7, "amountPaid": 13372.0}, {"date": "2026-08-17", "checkouts": 16, "amountPaid": 34931.0}, {"date": "2026-08-18", "checkouts": 8, "amountPaid": 14718.0}, {"date": "2026-08-19", "checkouts": 10, "amountPaid": 19707.0}, {"date": "2026-08-20", "checkouts": 14, "amountPaid": 26143.0}, {"date": "2026-08-21", "checkouts": 17, "amountPaid": 33926.0}, {"date": "2026-08-22", "checkouts": 6, "amountPaid": 10678.0}, {"date": "2026-08-23", "checkouts": 1, "amountPaid": 1746.0}, {"date": "2026-08-24", "checkouts": 6, "amountPaid": 10180.0}, {"date": "2026-08-25", "checkouts": 13, "amountPaid": 26612.0}, {"date": "2026-08-26", "checkouts": 10, "amountPaid": 17559.0}, {"date": "2026-08-27", "checkouts": 46, "amountPaid": 88895.0}, {"date": "2026-08-28", "checkouts": 26, "amountPaid": 50126.0}, {"date": "2026-08-29", "checkouts": 11, "amountPaid": 19154.0}, {"date": "2026-08-30", "checkouts": 3, "amountPaid": 5587.0}, {"date": "2026-08-31", "checkouts": 27, "amountPaid": 47933.0}, {"date": "2026-09-01", "checkouts": 7, "amountPaid": 11375.0}, {"date": "2026-09-02", "checkouts": 12, "amountPaid": 23347.0}, {"date": "2026-09-03", "checkouts": 12, "amountPaid": 22351.0}, {"date": "2026-09-04", "checkouts": 20, "amountPaid": 36416.0}, {"date": "2026-09-05", "checkouts": 5, "amountPaid": 10078.0}, {"date": "2026-09-06", "checkouts": 2, "amountPaid": 3896.0}, {"date": "2026-09-07", "checkouts": 2, "amountPaid": 3942.0}, {"date": "2026-09-08", "checkouts": 16, "amountPaid": 26295.0}, {"date": "2026-09-09", "checkouts": 7, "amountPaid": 11574.0}, {"date": "2026-09-10", "checkouts": 8, "amountPaid": 15565.0}, {"date": "2026-09-11", "checkouts": 17, "amountPaid": 33125.0}, {"date": "2026-09-12", "checkouts": 7, "amountPaid": 13770.0}, {"date": "2026-09-13", "checkouts": 4, "amountPaid": 7884.0}, {"date": "2026-09-14", "checkouts": 28, "amountPaid": 54877.0}, {"date": "2026-09-15", "checkouts": 17, "amountPaid": 31930.0}, {"date": "2026-09-16", "checkouts": 4, "amountPaid": 7683.0}, {"date": "2026-09-17", "checkouts": 19, "amountPaid": 33575.0}, {"date": "2026-09-18", "checkouts": 6, "amountPaid": 11675.0}, {"date": "2026-09-19", "checkouts": 8, "amountPaid": 14668.0}, {"date": "2026-09-20", "checkouts": 3, "amountPaid": 6386.0}, {"date": "2026-09-21", "checkouts": 9, "amountPaid": 17460.0}, {"date": "2026-09-22", "checkouts": 23, "amountPaid": 42908.0}, {"date": "2026-09-23", "checkouts": 9, "amountPaid": 18660.0}, {"date": "2026-09-24", "checkouts": 29, "amountPaid": 50782.0}, {"date": "2026-09-25", "checkouts": 14, "amountPaid": 26337.0}, {"date": "2026-09-26", "checkouts": 7, "amountPaid": 14469.0}, {"date": "2026-09-27", "checkouts": 3, "amountPaid": 5487.0}, {"date": "2026-09-28", "checkouts": 13, "amountPaid": 24297.0}, {"date": "2026-09-29", "checkouts": 14, "amountPaid": 25891.0}, {"date": "2026-09-30", "checkouts": 13, "amountPaid": 19742.0}, {"date": "2026-10-01", "checkouts": 9, "amountPaid": 16366.0}, {"date": "2026-10-02", "checkouts": 13, "amountPaid": 26354.0}, {"date": "2026-10-03", "checkouts": 14, "amountPaid": 22546.0}, {"date": "2026-10-04", "checkouts": 2, "amountPaid": 3592.0}, {"date": "2026-10-05", "checkouts": 6, "amountPaid": 1796.0}];

export const byTC: TCRow[] = [{"tc": "Desirea Peraza", "checkouts": 1365, "amountPaid": 2271626.25, "totalAmountPaid": 3014578.89, "avgDaysLinkSent": 28.1}, {"tc": "Ashley Acuna", "checkouts": 922, "amountPaid": 1537580.25, "totalAmountPaid": 2042903.25, "avgDaysLinkSent": 23.0}, {"tc": "Jolee Thailing", "checkouts": 913, "amountPaid": 1533306.0, "totalAmountPaid": 2023364.0, "avgDaysLinkSent": 24.5}, {"tc": "Sam Rice", "checkouts": 112, "amountPaid": 213210.0, "totalAmountPaid": 274454.0, "avgDaysLinkSent": 10.6}, {"tc": "Irina Osuji", "checkouts": 50, "amountPaid": 97227.0, "totalAmountPaid": 119600.0, "avgDaysLinkSent": 12.4}, {"tc": "Ashley Holland", "checkouts": 24, "amountPaid": 49001.0, "totalAmountPaid": 59986.0, "avgDaysLinkSent": 8.2}];

export const bySegment: SegRow[] = [{"segment": "Ice", "checkouts": 866, "amountPaid": 1420523.25}, {"segment": "Lava", "checkouts": 2530, "amountPaid": 4296794.25}];

export const summary = {"checkouts": 3418, "amountPaid": 5765878.5, "totalAmountPaid": 7610364.14, "firstDate": "2026-01-01", "lastDate": "2026-10-08"};

// Dated enrollment events that plausibly moved conversion, for overlaying on the daily series.
// Source: Development/New-Build/projects/enrollment/enrollment-events-timeline.md
export type EventRow = {
  date: string;
  label: string;
  category: 'product' | 'process' | 'pricing' | 'marketing' | 'launch';
  impact: 'hurt' | 'helped' | 'neutral' | 'tbd';
  note: string;
  approx?: boolean;
};

export const eventCategoryColor: Record<EventRow['category'], string> = {
  product: '#8B5CF6',
  process: '#3A6EA4',
  pricing: '#FDBE67',
  marketing: '#8CD1C8',
  launch: '#1B2A4A',
};

// Lava & Ice = lead ORIGIN of the checkout. Lava = recently-arrived lead (fresh conversion).
// Ice = lead was previously CLOSED-LOST and came back (a win-back / reactivation). Confirmed by Sosh 10/5.
export type TCMonthlyRow = { tc: string; byMonth: number[]; total: number; firstMonth: string | null; activeMonths: number; perActiveMonth: number; avgDays: number };
// Cleaned per Sosh (10/5): Savannah Valadez removed (not a TC — misattribution); Amber Gill removed (only 2, noise);
// trivial first-month ramp counts zeroed so "start" + per-active-month read true (Sam Jul=1, Irina Jul=4, Holland Aug=2).
export const tcMonthly: TCMonthlyRow[] = [{"tc": "Desirea Peraza", "byMonth": [222, 185, 195, 152, 140, 162, 97, 115, 79, 18], "total": 1365, "firstMonth": "01", "activeMonths": 10, "perActiveMonth": 136.5, "avgDays": 28.1}, {"tc": "Ashley Acuna", "byMonth": [80, 100, 107, 88, 102, 157, 93, 99, 87, 9], "total": 922, "firstMonth": "01", "activeMonths": 10, "perActiveMonth": 92.2, "avgDays": 23.0}, {"tc": "Jolee Thailing", "byMonth": [78, 98, 100, 112, 86, 161, 112, 94, 67, 5], "total": 913, "firstMonth": "01", "activeMonths": 10, "perActiveMonth": 91.3, "avgDays": 24.5}, {"tc": "Sam Rice", "byMonth": [0, 0, 0, 0, 0, 0, 0, 40, 61, 11], "total": 112, "firstMonth": "08", "activeMonths": 3, "perActiveMonth": 37.3, "avgDays": 10.6}, {"tc": "Irina Osuji", "byMonth": [0, 0, 0, 0, 0, 0, 0, 31, 19, 0], "total": 50, "firstMonth": "08", "activeMonths": 2, "perActiveMonth": 25.0, "avgDays": 12.4}, {"tc": "Ashley Holland", "byMonth": [0, 0, 0, 0, 0, 0, 0, 0, 23, 1], "total": 24, "firstMonth": "09", "activeMonths": 2, "perActiveMonth": 12.0, "avgDays": 8.2}];

export type MonthMetricRow = { month: string; checkouts: number; avgDays: number; collectionRate: number; avgPlan: number; avgCollected: number };
export const monthlyMetrics: MonthMetricRow[] = [{"month": "2026-01", "checkouts": 380, "avgDays": 34.5, "collectionRate": 74.2, "avgPlan": 2208, "avgCollected": 1639}, {"month": "2026-02", "checkouts": 383, "avgDays": 32.6, "collectionRate": 74.4, "avgPlan": 2157, "avgCollected": 1605}, {"month": "2026-03", "checkouts": 402, "avgDays": 19.9, "collectionRate": 74.3, "avgPlan": 2149, "avgCollected": 1597}, {"month": "2026-04", "checkouts": 352, "avgDays": 29.6, "collectionRate": 70.5, "avgPlan": 2336, "avgCollected": 1648}, {"month": "2026-05", "checkouts": 329, "avgDays": 21.4, "collectionRate": 73.3, "avgPlan": 2165, "avgCollected": 1587}, {"month": "2026-06", "checkouts": 480, "avgDays": 25.7, "collectionRate": 76.4, "avgPlan": 2001, "avgCollected": 1529}, {"month": "2026-07", "checkouts": 307, "avgDays": 14.6, "collectionRate": 79.0, "avgPlan": 2349, "avgCollected": 1855}, {"month": "2026-08", "checkouts": 381, "avgDays": 20.2, "collectionRate": 78.7, "avgPlan": 2451, "avgCollected": 1929}, {"month": "2026-09", "checkouts": 338, "avgDays": 18.3, "collectionRate": 79.4, "avgPlan": 2334, "avgCollected": 1853}, {"month": "2026-10", "checkouts": 66, "avgDays": 48.5, "collectionRate": 83.7, "avgPlan": 2157, "avgCollected": 1806}];

export type SegMonthRow = { month: string; lava: number; ice: number };
export const segMonthly: SegMonthRow[] = [{"month": "2026-01", "lava": 259, "ice": 121}, {"month": "2026-02", "lava": 282, "ice": 101}, {"month": "2026-03", "lava": 309, "ice": 93}, {"month": "2026-04", "lava": 247, "ice": 105}, {"month": "2026-05", "lava": 224, "ice": 105}, {"month": "2026-06", "lava": 342, "ice": 138}, {"month": "2026-07", "lava": 271, "ice": 36}, {"month": "2026-08", "lava": 297, "ice": 84}, {"month": "2026-09", "lava": 267, "ice": 71}, {"month": "2026-10", "lava": 32, "ice": 12}];

export type CapacityRow = { month: string; activeTCs: number; checkouts: number };
export const capacity: CapacityRow[] = [{"month": "2026-01", "activeTCs": 3, "checkouts": 380}, {"month": "2026-02", "activeTCs": 3, "checkouts": 383}, {"month": "2026-03", "activeTCs": 3, "checkouts": 402}, {"month": "2026-04", "activeTCs": 3, "checkouts": 352}, {"month": "2026-05", "activeTCs": 3, "checkouts": 329}, {"month": "2026-06", "activeTCs": 3, "checkouts": 480}, {"month": "2026-07", "activeTCs": 3, "checkouts": 307}, {"month": "2026-08", "activeTCs": 5, "checkouts": 381}, {"month": "2026-09", "activeTCs": 6, "checkouts": 338}, {"month": "2026-10", "activeTCs": 5, "checkouts": 44}];

// ---- Conversion (from the "SOSH | Enrollment Funnel" report: one row per 2026-submitting lead) ----
// Submission->checkout and link-sent->checkout, cohorted by SUBMISSION month. Validated vs Erin's dashboard.
export type ConvMonthRow = { month: string; submissions: number; linkSent: number; checkouts: number; subToCO: number; linkToCO: number };
export const conversionMonthly: ConvMonthRow[] = [{"month": "2026-01", "submissions": 1415, "linkSent": 793, "checkouts": 378, "subToCO": 26.7, "linkToCO": 47.7}, {"month": "2026-02", "submissions": 1519, "linkSent": 1001, "checkouts": 381, "subToCO": 25.1, "linkToCO": 38.1}, {"month": "2026-03", "submissions": 1606, "linkSent": 1052, "checkouts": 472, "subToCO": 29.4, "linkToCO": 44.9}, {"month": "2026-04", "submissions": 1229, "linkSent": 768, "checkouts": 355, "subToCO": 28.9, "linkToCO": 46.2}, {"month": "2026-05", "submissions": 1131, "linkSent": 819, "checkouts": 271, "subToCO": 24.0, "linkToCO": 33.1}, {"month": "2026-06", "submissions": 1489, "linkSent": 1106, "checkouts": 372, "subToCO": 25.0, "linkToCO": 33.6}, {"month": "2026-07", "submissions": 1997, "linkSent": 1411, "checkouts": 445, "subToCO": 22.3, "linkToCO": 31.5}, {"month": "2026-08", "submissions": 1684, "linkSent": 1054, "checkouts": 332, "subToCO": 19.7, "linkToCO": 31.5}, {"month": "2026-09", "submissions": 1376, "linkSent": 714, "checkouts": 238, "subToCO": 17.3, "linkToCO": 33.3}, {"month": "2026-10", "submissions": 816, "linkSent": 178, "checkouts": 53, "subToCO": 6.5, "linkToCO": 29.8}];
// Months from Aug onward are still MATURING (recent submitters can still check out later) — treat as incomplete.
export const conversionMatureThrough = "2026-07";

export type ConvRefRow = { referrer: string; submissions: number; checkouts: number; rate: number };
export const conversionByReferrer: ConvRefRow[] = [{"referrer": "Influencer", "submissions": 3562, "checkouts": 952, "rate": 26.7}, {"referrer": "Dental Office", "submissions": 2924, "checkouts": 478, "rate": 16.3}, {"referrer": "Online Search", "submissions": 2810, "checkouts": 621, "rate": 22.1}, {"referrer": "Podcast", "submissions": 1650, "checkouts": 444, "rate": 26.9}, {"referrer": "Parent", "submissions": 691, "checkouts": 203, "rate": 29.4}, {"referrer": "Instagram", "submissions": 572, "checkouts": 108, "rate": 18.9}, {"referrer": "Airway Ambassador", "submissions": 550, "checkouts": 202, "rate": 36.7}, {"referrer": "Unknown Referral", "submissions": 529, "checkouts": 111, "rate": 21.0}, {"referrer": "Google Ad", "submissions": 388, "checkouts": 52, "rate": 13.4}, {"referrer": "(blank)", "submissions": 172, "checkouts": 34, "rate": 19.8}, {"referrer": "Unknown Professional Referral", "submissions": 168, "checkouts": 51, "rate": 30.4}, {"referrer": "Facebook", "submissions": 119, "checkouts": 15, "rate": 12.6}];

export type FunnelStageRow = { stage: string; count: number };
export const funnelStages: FunnelStageRow[] = [{"stage": "Closed Lost", "count": 3848}, {"stage": "CHECKED OUT", "count": 3207}, {"stage": "Sent Checkout Link", "count": 2805}, {"stage": "Referred Out", "count": 1320}, {"stage": "Screening Received", "count": 604}, {"stage": "Non Responsive - 2 or less responses", "count": 422}, {"stage": "Denied", "count": 323}, {"stage": "Assessment On Hold - Non Responsive", "count": 307}, {"stage": "Closed Lost - Do Not Contact", "count": 297}, {"stage": "Sent to TxP", "count": 261}, {"stage": "ON HOLD - No Doctor in State", "count": 152}, {"stage": "Consult Complete", "count": 150}, {"stage": "Treatment Consult Scheduled", "count": 133}, {"stage": "TxP Approved", "count": 116}, {"stage": "Temp Hold", "count": 86}];

export const convSummary = { submissions: 14262, linkSent: 8896, checkouts: 3297 };

// Diagnosis of the May break (from the funnel report w/ "Results of Exam" recommendation).
// stdConv = conversion of STANDARD approvals (non-expander); expConv = expander recs; rejectShare = referred/denied share.
// Key: the STANDARD pool also fell ~40%->31% in May => broad checkout cause, not just expanders. Jan-Mar expConv is tiny-N noise.
export type DiagnosisRow = { month: string; submissions: number; convRate: number; stdConv: number; expConv: number; expShare: number; rejectShare: number };
export const diagnosisMonthly: DiagnosisRow[] = [{"month": "2026-01", "submissions": 1415, "convRate": 26.7, "stdConv": 41.3, "expConv": 100.0, "expShare": 1.2, "rejectShare": 17.1}, {"month": "2026-02", "submissions": 1519, "convRate": 25.1, "stdConv": 37.9, "expConv": 100.0, "expShare": 0.4, "rejectShare": 21.0}, {"month": "2026-03", "submissions": 1606, "convRate": 29.4, "stdConv": 38.2, "expConv": 100.0, "expShare": 3.9, "rejectShare": 18.1}, {"month": "2026-04", "submissions": 1229, "convRate": 28.9, "stdConv": 38.6, "expConv": 52.9, "expShare": 3.8, "rejectShare": 15.3}, {"month": "2026-05", "submissions": 1131, "convRate": 24.0, "stdConv": 29.3, "expConv": 23.0, "expShare": 8.2, "rejectShare": 8.0}, {"month": "2026-06", "submissions": 1489, "convRate": 25.0, "stdConv": 30.1, "expConv": 18.4, "expShare": 13.5, "rejectShare": 8.7}, {"month": "2026-07", "submissions": 1997, "convRate": 22.3, "stdConv": 27.6, "expConv": 23.5, "expShare": 14.7, "rejectShare": 7.1}, {"month": "2026-08", "submissions": 1684, "convRate": 19.7, "stdConv": 28.6, "expConv": 17.2, "expShare": 16.7, "rejectShare": 6.3}, {"month": "2026-09", "submissions": 1376, "convRate": 17.3, "stdConv": 31.0, "expConv": 18.3, "expShare": 15.4, "rejectShare": 7.1}, {"month": "2026-10", "submissions": 816, "convRate": 6.5, "stdConv": 27.5, "expConv": 8.1, "expShare": 16.8, "rejectShare": 3.9}];
export const priceIncreaseMonth = "2026-07";

// Fresh vs stale link->checkout. Fresh = link sent <=14 days after submission (brand-new lead).
// Stale = re-sent to a 30+ day-old lead (promo blasts). freshConv = fresh link->checkout %; staleN = # stale re-sends.
// Proves the May decline is REAL (fresh leads broke 38->30), not just blasting old leads. April's dip was the stale blast (328 re-sends).
export type FreshStaleRow = { month: string; freshConv: number; staleN: number; staleConv: number | null };
export const linkFreshStale: FreshStaleRow[] = [
  { month: '2026-01', freshConv: 39.3, staleN: 48, staleConv: 16.7 },
  { month: '2026-02', freshConv: 37.8, staleN: 174, staleConv: 3.4 },
  { month: '2026-03', freshConv: 37.6, staleN: 161, staleConv: 20.5 },
  { month: '2026-04', freshConv: 37.6, staleN: 46, staleConv: 37.0 },
  { month: '2026-05', freshConv: 28.2, staleN: 29, staleConv: 34.5 },
  { month: '2026-06', freshConv: 29.5, staleN: 21, staleConv: 19.0 },
  { month: '2026-07', freshConv: 26.8, staleN: 64, staleConv: 32.8 },
  { month: '2026-08', freshConv: 26.9, staleN: 56, staleConv: 10.7 },
  { month: '2026-09', freshConv: 35.6, staleN: 54, staleConv: 9.3 },
  { month: '2026-10', freshConv: 24.0, staleN: 0, staleConv: null },
];

// Expanders-First simulation: per submission month, total enrollments (checkouts), expander recs & checkouts, standard conv.
// Counterfactual "no EF": EF kids revert to what they'd have been — a fraction f would've been standard-approved
// (convert at that month's stdConv), the rest would've been denied (0). Data says f is near 0 (standard share held).
export type SimRow = { month: string; enroll: number; efRec: number; efCo: number; stdConv: number };
export const simMonthly: SimRow[] = [
  { month: '2026-01', enroll: 378, efRec: 8, efCo: 8, stdConv: 41.3 },
  { month: '2026-02', enroll: 381, efRec: 3, efCo: 3, stdConv: 37.9 },
  { month: '2026-03', enroll: 472, efRec: 35, efCo: 34, stdConv: 38.2 },
  { month: '2026-04', enroll: 355, efRec: 27, efCo: 19, stdConv: 38.6 },
  { month: '2026-05', enroll: 271, efRec: 62, efCo: 15, stdConv: 29.3 },
  { month: '2026-06', enroll: 372, efRec: 142, efCo: 27, stdConv: 30.1 },
  { month: '2026-07', enroll: 445, efRec: 214, efCo: 50, stdConv: 27.6 },
  { month: '2026-08', enroll: 332, efRec: 205, efCo: 34, stdConv: 28.6 },
  { month: '2026-09', enroll: 238, efRec: 144, efCo: 23, stdConv: 31.0 },
  { month: '2026-10', enroll: 53, efRec: 69, efCo: 3, stdConv: 27.5 },
];

// Submissions + checkouts by submission month × lead source (for mix-over-time + conversion-by-source-by-month).
export const sourceOrder = ['Influencer', 'Dental Office', 'Online Search', 'Podcast', 'Airway Ambassador', 'Parent', 'Google Ad', 'Other'];
export type SourceMonthRow = { month: string; subs: Record<string, number>; cos: Record<string, number> };
export const sourceMonthly: SourceMonthRow[] = [{"month": "2026-01", "subs": {"Influencer": 309, "Dental Office": 367, "Online Search": 232, "Podcast": 150, "Airway Ambassador": 53, "Parent": 77, "Google Ad": 0, "Other": 227}, "cos": {"Influencer": 103, "Dental Office": 56, "Online Search": 61, "Podcast": 43, "Airway Ambassador": 22, "Parent": 32, "Google Ad": 0, "Other": 61}}, {"month": "2026-02", "subs": {"Influencer": 511, "Dental Office": 314, "Online Search": 284, "Podcast": 96, "Airway Ambassador": 62, "Parent": 63, "Google Ad": 0, "Other": 189}, "cos": {"Influencer": 145, "Dental Office": 54, "Online Search": 74, "Podcast": 28, "Airway Ambassador": 20, "Parent": 22, "Google Ad": 0, "Other": 38}}, {"month": "2026-03", "subs": {"Influencer": 462, "Dental Office": 316, "Online Search": 338, "Podcast": 165, "Airway Ambassador": 70, "Parent": 72, "Google Ad": 0, "Other": 183}, "cos": {"Influencer": 139, "Dental Office": 71, "Online Search": 93, "Podcast": 61, "Airway Ambassador": 33, "Parent": 24, "Google Ad": 0, "Other": 51}}, {"month": "2026-04", "subs": {"Influencer": 234, "Dental Office": 255, "Online Search": 298, "Podcast": 129, "Airway Ambassador": 68, "Parent": 73, "Google Ad": 20, "Other": 152}, "cos": {"Influencer": 76, "Dental Office": 57, "Online Search": 93, "Podcast": 47, "Airway Ambassador": 26, "Parent": 14, "Google Ad": 2, "Other": 40}}, {"month": "2026-05", "subs": {"Influencer": 269, "Dental Office": 212, "Online Search": 251, "Podcast": 127, "Airway Ambassador": 53, "Parent": 49, "Google Ad": 28, "Other": 142}, "cos": {"Influencer": 74, "Dental Office": 40, "Online Search": 61, "Podcast": 35, "Airway Ambassador": 23, "Parent": 12, "Google Ad": 5, "Other": 21}}, {"month": "2026-06", "subs": {"Influencer": 306, "Dental Office": 228, "Online Search": 326, "Podcast": 279, "Airway Ambassador": 47, "Parent": 84, "Google Ad": 81, "Other": 138}, "cos": {"Influencer": 95, "Dental Office": 52, "Online Search": 59, "Podcast": 69, "Airway Ambassador": 22, "Parent": 33, "Google Ad": 14, "Other": 28}}, {"month": "2026-07", "subs": {"Influencer": 602, "Dental Office": 389, "Online Search": 331, "Podcast": 161, "Airway Ambassador": 92, "Parent": 108, "Google Ad": 93, "Other": 221}, "cos": {"Influencer": 146, "Dental Office": 57, "Online Search": 79, "Podcast": 42, "Airway Ambassador": 36, "Parent": 25, "Google Ad": 12, "Other": 48}}, {"month": "2026-08", "subs": {"Influencer": 523, "Dental Office": 362, "Online Search": 274, "Podcast": 168, "Airway Ambassador": 51, "Parent": 62, "Google Ad": 89, "Other": 155}, "cos": {"Influencer": 104, "Dental Office": 49, "Online Search": 57, "Podcast": 52, "Airway Ambassador": 12, "Parent": 22, "Google Ad": 11, "Other": 25}}, {"month": "2026-09", "subs": {"Influencer": 228, "Dental Office": 291, "Online Search": 267, "Podcast": 284, "Airway Ambassador": 30, "Parent": 72, "Google Ad": 55, "Other": 149}, "cos": {"Influencer": 55, "Dental Office": 29, "Online Search": 39, "Podcast": 55, "Airway Ambassador": 5, "Parent": 19, "Google Ad": 8, "Other": 28}}, {"month": "2026-10", "subs": {"Influencer": 118, "Dental Office": 190, "Online Search": 209, "Podcast": 91, "Airway Ambassador": 24, "Parent": 31, "Google Ad": 22, "Other": 131}, "cos": {"Influencer": 15, "Dental Office": 13, "Online Search": 5, "Podcast": 12, "Airway Ambassador": 3, "Parent": 0, "Google Ad": 0, "Other": 5}}];
export const sourceColors: Record<string, string> = { Influencer: '#3A6EA4', 'Dental Office': '#e06666', 'Online Search': '#8CD1C8', Podcast: '#1B2A4A', 'Airway Ambassador': '#6AA84F', Parent: '#FDBE67', 'Google Ad': '#B6CAE3', Other: '#d1d5db' };

export type DowRow = { day: string; checkouts: number };
export const dow: DowRow[] = [{"day": "Mon", "checkouts": 505}, {"day": "Tue", "checkouts": 603}, {"day": "Wed", "checkouts": 629}, {"day": "Thu", "checkouts": 685}, {"day": "Fri", "checkouts": 607}, {"day": "Sat", "checkouts": 185}, {"day": "Sun", "checkouts": 83}];

// Ordered by date. The `n` number matches the numbered marker on the chart.
export const events: EventRow[] = [
  { date: '2026-02-15', label: 'Airway Virtual (patient app) launched', category: 'product', impact: 'neutral', approx: true, note: 'New patient/assessment app. (An earlier note here blamed an April conversion tank — later shown to be the April "refer only" artifact, not a real drop. Removed.)' },
  { date: '2026-04-10', label: 'CAB change: TXP-first review, CA bypassed', category: 'process', impact: 'tbd', note: 'Assessment flow rewired — treating providers review first, clinical advisor bypassed; ta_status drives the SF stage. Review throughput (sub→PEF) jumps 62% → 82% Mar→May. Leading structural suspect for the May decline; under review.' },
  { date: '2026-04-24', label: '"Schedule 15-Minute Call" CTA added (PR #497/#498)', category: 'process', impact: 'tbd', note: 'Added to the post-submission consultant page (the waiting view, before results) — links to the coordinator meeting link. Under review: lands as plain-approved conversion starts easing. Removed Jul 9.' },
  { date: '2026-05-15', label: 'Expanders-First track begins', category: 'process', impact: 'tbd', note: 'approve-with-expanders dispositions (AV #513, May 15) + results reroute to a consult link (TP #556, May 19). Absorbs borderline cases that would previously be declined; message refined Jun 1 (#629).' },
  { date: '2026-05-29', label: 'Checkout button copy → "Review Treatment Plans" (PR #626)', category: 'process', impact: 'tbd', note: '"Enroll Now" / "Select Treatment Plan" → "Review Treatment Plans" for every approved family; same checkout page. The durable plain-approved drop (never recovers) begins the week it shipped. Lead candidate — confirm by reverting the copy.' },
  { date: '2026-07-09', label: '"Schedule a call" step REMOVED (PR #652)', category: 'process', impact: 'hurt', note: "Replaced with a video (gabe-replace-cta-with-video). Erin's #1 reinstate fix. The July cliff + win-back collapse (138 → 36) land here." },
  { date: '2026-08-21', label: 'Post-submission "view assessment" msg failing', category: 'process', impact: 'hurt', note: 'Some parents not notified after submit.' },
  { date: '2026-08-31', label: 'SF "Hold Assessment — Non Responsive" stage', category: 'process', impact: 'neutral', note: 'Measurement only.' },
  { date: '2026-09-02', label: 'SF "Treatment Consult Scheduled" stage', category: 'process', impact: 'neutral', note: 'Measurement only.' },
  { date: '2026-09-14', label: 'Closed Lost stages added to SF', category: 'process', impact: 'neutral', note: 'Measurement only.' },
  { date: '2026-09-19', label: 'New payment processor (iCore) rolled out', category: 'pricing', impact: 'tbd', note: 'CC/Affirm/Klarna/Cherry in one form; no Slack notification on use. Possible driver of the H2 collection-rate rise.' },
  { date: '2026-09-21', label: 'SF "Pre-expanders" plan types added', category: 'pricing', impact: 'tbd', note: 'Enables the pre-expanders offer.' },
  { date: '2026-09-30', label: 'Ambassador code $200 → $300 off', category: 'marketing', impact: 'helped', note: 'Stronger discount lever.' },
  { date: '2026-10-01', label: 'Pre-expanders program goes live', category: 'launch', impact: 'tbd', note: 'Pre-expanders results + checkout live (full iCore flow).' },
  { date: '2026-10-01', label: 'New-home / patient-app beta launches', category: 'launch', impact: 'tbd', note: '~20 testers on the rebuilt patient app.' },
  { date: '2026-10-01', label: 'Graduation V2 goes live', category: 'launch', impact: 'tbd', note: 'New "Graduation Operations" board; all patients from Oct 1.' },
];

// --- Link-sent cohorts (from the SOSH Enrollment Funnel export) ---
// Each row = links sent that month, and how those families converted.
// ever = % that ever checked out (mature Jan–Aug only). d14/d21 = % within 14/21 days of the
// link (same window each month, so recent months are comparable). mature=false → still filling in.
export type CohortRow = { month: string; links: number; checkouts: number; ever: number; d14: number | null; d21: number | null; mature: boolean; outlier?: boolean };
export const linkCohort: CohortRow[] = [
  // 2025 (from the 2025-submitter funnel export)
  { month: '2025-01', links: 578,  checkouts: 241, ever: 41.7, d14: 18.9, d21: 23.5, mature: true },
  { month: '2025-02', links: 937,  checkouts: 329, ever: 35.1, d14: 15.0, d21: 19.0, mature: true },
  { month: '2025-03', links: 1108, checkouts: 387, ever: 34.9, d14: 19.7, d21: 22.7, mature: true },
  { month: '2025-04', links: 962,  checkouts: 393, ever: 40.9, d14: 20.8, d21: 26.5, mature: true },
  { month: '2025-05', links: 758,  checkouts: 315, ever: 41.6, d14: 23.5, d21: 28.0, mature: true },
  { month: '2025-06', links: 654,  checkouts: 256, ever: 39.1, d14: 20.0, d21: 23.4, mature: true },
  { month: '2025-07', links: 1062, checkouts: 412, ever: 38.8, d14: 20.3, d21: 24.7, mature: true },
  { month: '2025-08', links: 1605, checkouts: 633, ever: 39.4, d14: 21.5, d21: 24.1, mature: true },
  { month: '2025-09', links: 1427, checkouts: 515, ever: 36.1, d14: 16.0, d21: 20.8, mature: true },
  { month: '2025-10', links: 860,  checkouts: 355, ever: 41.3, d14: 21.3, d21: 24.3, mature: true },
  { month: '2025-11', links: 638,  checkouts: 221, ever: 34.6, d14: 22.6, d21: 26.2, mature: true },
  { month: '2025-12', links: 702,  checkouts: 286, ever: 40.7, d14: 23.2, d21: 29.1, mature: true },
  // 2026 (from the 2026-submitter funnel export)
  { month: '2026-01', links: 584,  checkouts: 219, ever: 37.5, d14: 25.9, d21: 28.6, mature: true },
  { month: '2026-02', links: 717,  checkouts: 285, ever: 39.7, d14: 26.1, d21: 28.9, mature: true },
  { month: '2026-03', links: 976,  checkouts: 362, ever: 37.1, d14: 20.9, d21: 25.1, mature: true },
  { month: '2026-04', links: 1114, checkouts: 308, ever: 27.6, d14: 13.7, d21: 17.1, mature: true },
  { month: '2026-05', links: 741,  checkouts: 228, ever: 30.8, d14: 17.7, d21: 20.8, mature: true },
  { month: '2026-06', links: 1164, checkouts: 335, ever: 28.8, d14: 20.5, d21: 24.4, mature: true, outlier: true }, // last-day pricing push before Jul 1 increase
  { month: '2026-07', links: 1157, checkouts: 322, ever: 27.8, d14: 17.6, d21: 21.2, mature: true, outlier: true }, // first month at the new (higher) price — pricing-distorted
  { month: '2026-08', links: 1081, checkouts: 289, ever: 26.7, d14: 18.3, d21: 21.0, mature: true },
  { month: '2026-09', links: 867,  checkouts: 250, ever: 28.8, d14: 24.1, d21: 26.0, mature: false },
  { month: '2026-10', links: 476,  checkouts: 107, ever: 22.5, d14: 22.1, d21: 22.5, mature: false },
];
// Pre-drop baseline rate (Jan–Mar) used for the "expected at old rate" / lost-enrollment math.
export const checkoutBaselineRate = 37.96;

// Checkout-system changes, dated from production commit history (toothpillow + airway-virtual).
export type CheckoutEvent = { month: string; date: string; label: string; kind: 'trigger' | 'break' | 'fix' | 'note' };
// Corrected Oct 7 2026 against the Checkout Error Reports: the cart-500 / webhook /
// blank-page events were ruled out as causes (all far too small). Only the CAB approval-mix
// change and the expander reroute remain; the Aug redesign did not move the rate.
export const checkoutEvents: CheckoutEvent[] = [
  { month: '2026-04', date: 'Apr 10',   label: 'CAB change (approval mix)',      kind: 'trigger' },
  { month: '2026-05', date: 'May 15–19', label: 'expanders routed off checkout', kind: 'break' },
  { month: '2026-06', date: 'Jun 30',   label: 'price increase (outlier)',       kind: 'note' },
  { month: '2026-08', date: 'Aug 28',   label: 'results redesign (no rate effect)', kind: 'fix' },
];

// --- May-break proof (computed Oct 7 2026 directly from the Salesforce funnel export, not the error report) ---
// Link->checkout by the month the link was sent. "overall" is the blended rate; "plain" excludes
// expanders and refer-only. referOnlyLinks = count of "refer only" cases sent a link that month.
export const breakProofMonthly = [
  { m: 'Feb', overall: 39.7, plain: 39.5, referOnlyLinks: 0 },
  { m: 'Mar', overall: 36.9, plain: 38.4, referOnlyLinks: 0 },
  { m: 'Apr', overall: 27.6, plain: 39.1, referOnlyLinks: 360 },
  { m: 'May', overall: 30.8, plain: 32.2, referOnlyLinks: 1 },
  { m: 'Jun', overall: 28.5, plain: 30.3, referOnlyLinks: 0 },
  { m: 'Jul', overall: 27.2, plain: 27.3, referOnlyLinks: 0 },
  { m: 'Aug', overall: 26.1, plain: 26.2, referOnlyLinks: 0 },
];
// Plain-approved link->checkout by lead source, before (Feb-Apr) vs after (May-Jul). The drop is systemic.
// Plain-approved link→checkout by source. before = Feb–Apr avg, after = May–Aug avg
// (extended through Aug — now mature — from the 2026-10-08 funnel export; Sep–Oct links
// excluded as not-yet-mature). Every source fell; ALL 39→29.
export const breakBySource = [
  { src: 'Influencer', before: 41, after: 31 },
  { src: 'Online Search', before: 36, after: 24 },
  { src: 'Podcast', before: 40, after: 32 },
  { src: 'Parent', before: 44, after: 36 },
  { src: 'Instagram', before: 28, after: 18 },
  { src: 'Dental Office', before: 50, after: 34 },
  { src: 'Unknown Referral', before: 35, after: 21 },
  { src: 'ALL plain approved', before: 39, after: 29 },
];
// What the data rules OUT as the cause (each line is proven from the funnel export unless noted).
export const ruledOutScoreboard = [
  { k: 'April itself', v: 'Artifact. 360 "refer only" cases were sent checkout links in April (zero in any other month) and converted at 1%. Strip them out and approved families converted at 41% — the year’s best.' },
  { k: 'Lead volume', v: 'July had 1,997 submissions (the most of any month) and still only ~27% converted. More leads did not lift the rate.' },
  { k: 'Expanders / the reroute', v: 'Plain approvals fall just as hard with expanders removed entirely. Expanders are a small, separate, low-converting bucket.' },
  { k: 'Pricing / plan', v: 'No May move. Average amount paid is flat and the drift toward the cheaper plan started in January. Pricing did not change until July.' },
  { k: 'Checkout errors', v: 'The blank-cart crash fired 117 times in 14 months and stopped May 7 (Honeybadger, from the error report).' },
];
// Plain-approved link->checkout by week, Feb–mid-Jul. A ~38% band (Feb–Apr, noisy) eroding to a
// ~30% band (Jun–Jul). No single-week cliff — a gradual decline through May. Trigger still open.
export const breakWeekly = [
  { w: 'Feb 2', r: 43 }, { w: 'Feb 9', r: 37 }, { w: 'Feb 16', r: 38 }, { w: 'Feb 23', r: 39 },
  { w: 'Mar 2', r: 43 }, { w: 'Mar 9', r: 45 }, { w: 'Mar 16', r: 38 }, { w: 'Mar 23', r: 34 }, { w: 'Mar 30', r: 35 },
  { w: 'Apr 6', r: 41 }, { w: 'Apr 13', r: 36 }, { w: 'Apr 20', r: 41 }, { w: 'Apr 27', r: 32 },
  { w: 'May 4', r: 38 }, { w: 'May 11', r: 34 }, { w: 'May 18', r: 38 }, { w: 'May 25', r: 28 },
  { w: 'Jun 1', r: 30 }, { w: 'Jun 8', r: 32 }, { w: 'Jun 15', r: 32 }, { w: 'Jun 22', r: 31 }, { w: 'Jun 29', r: 27 },
  { w: 'Jul 6', r: 29 }, { w: 'Jul 13', r: 30 }, { w: 'Jul 20', r: 24 }, { w: 'Jul 27', r: 28 },
  { w: 'Aug 3', r: 22 }, { w: 'Aug 10', r: 25 }, { w: 'Aug 17', r: 33 }, { w: 'Aug 24', r: 34 }, { w: 'Aug 31', r: 31 },
  { w: 'Sep 7', r: 34, imm: true }, { w: 'Sep 14', r: 34, imm: true }, { w: 'Sep 21', r: 36, imm: true }, { w: 'Sep 28', r: 24, imm: true },
  { w: 'Oct 5', r: 30, imm: true }, { w: 'Oct 12', r: 26, imm: true }, { w: 'Oct 19', r: 16, imm: true },
];
// Recomputed from the SOSH | Enrollment Funnel export (2026-10-07): plain-approved
// (Functional Appliance / approve / Approve for Treatment / APPROVED-for-virtual; expanders,
// refer-only, denied, need-info, blank, pre-expanders all excluded), by the week the checkout
// link was sent. Feb–Aug 24 are mature; `imm` weeks (links sent within ~6 wks of the pull) are
// still converting (checkout lags the link a median ~8d, tail to ~6wk) and read artificially low.
export const breakWeeklyBaseline = 38; // Feb–Apr average

// Lava vs Ice conversion-RATE decomposition, by the month the checkout link was sent
// (plain-approved only, from the 2026-10-08 funnel export). Lava = checked out within 21 days
// of the link (fast close); Ice = after 21 days (win-back). lava + ice = total link→checkout %.
// The finding: total falls after April, and it's the ICE (win-back) slice that collapses
// (~12%→4%) while Lava only drifts (~27%→23%). Sep–Oct Ice is immature (win-back window not
// matured yet), so those bars understate.
export const lavaIceCohort = [
  { m: 'Jan', links: 492, lava: 30, ice: 9 },
  { m: 'Feb', links: 641, lava: 28, ice: 11 },
  { m: 'Mar', links: 857, lava: 26, ice: 13 },
  { m: 'Apr', links: 662, lava: 23, ice: 16 },
  { m: 'May', links: 594, lava: 22, ice: 10 },
  { m: 'Jun', links: 926, lava: 27, ice: 4 },
  { m: 'Jul', links: 965, lava: 22, ice: 6 },
  { m: 'Aug', links: 886, lava: 22, ice: 6 },
  { m: 'Sep', links: 706, lava: 29, ice: 3, iceImm: true },
  { m: 'Oct', links: 401, lava: 25, ice: 0, imm: true },
];

// The breakWeekly total (Lava+Ice) split into its two parts, by link-sent week
// (plain-approved only, from the 2026-10-08 funnel export). lava = checked out within
// 21 days of the link (fast close); ice = after 21 days (win-back). The test of the
// May cliff: Lava walks flat through the #626 ship date (May 29) — only Ice collapses.
// A checkout-page change would have hit Lava too; it didn't, so #626 is cleared. imm
// weeks (Aug 31+) are still maturing and understate — Ice especially (its window runs
// to ~6 weeks, so recent cohorts haven't finished converting).
export const lavaIceWeekly = [
  { w: 'Feb 2', lava: 32, ice: 12 }, { w: 'Feb 9', lava: 29, ice: 8 }, { w: 'Feb 16', lava: 27, ice: 11 }, { w: 'Feb 23', lava: 25, ice: 14 },
  { w: 'Mar 2', lava: 27, ice: 16 }, { w: 'Mar 9', lava: 34, ice: 12 }, { w: 'Mar 16', lava: 28, ice: 10 }, { w: 'Mar 23', lava: 20, ice: 14 }, { w: 'Mar 30', lava: 21, ice: 15 },
  { w: 'Apr 6', lava: 25, ice: 16 }, { w: 'Apr 13', lava: 26, ice: 10 }, { w: 'Apr 20', lava: 29, ice: 13 }, { w: 'Apr 27', lava: 14, ice: 18 },
  { w: 'May 4', lava: 21, ice: 16 }, { w: 'May 11', lava: 29, ice: 5 }, { w: 'May 18', lava: 25, ice: 13 }, { w: 'May 25', lava: 18, ice: 10 },
  { w: 'Jun 1', lava: 24, ice: 5 }, { w: 'Jun 8', lava: 29, ice: 3 }, { w: 'Jun 15', lava: 29, ice: 3 }, { w: 'Jun 22', lava: 25, ice: 6 }, { w: 'Jun 29', lava: 23, ice: 4 },
  { w: 'Jul 6', lava: 25, ice: 4 }, { w: 'Jul 13', lava: 22, ice: 8 }, { w: 'Jul 20', lava: 19, ice: 5 }, { w: 'Jul 27', lava: 22, ice: 5 },
  { w: 'Aug 3', lava: 17, ice: 5 }, { w: 'Aug 10', lava: 20, ice: 6 }, { w: 'Aug 17', lava: 26, ice: 7 }, { w: 'Aug 24', lava: 29, ice: 5 }, { w: 'Aug 31', lava: 24, ice: 7, imm: true },
  { w: 'Sep 7', lava: 30, ice: 4, imm: true }, { w: 'Sep 14', lava: 30, ice: 4, imm: true }, { w: 'Sep 21', lava: 35, ice: 2, imm: true }, { w: 'Sep 28', lava: 23, ice: 1, imm: true },
  { w: 'Oct 5', lava: 30, ice: 0, imm: true }, { w: 'Oct 12', lava: 26, ice: 0, imm: true }, { w: 'Oct 19', lava: 16, ice: 0, imm: true },
];

// ---- Daily Funnel Trends (last 3 months: Jul 14 – Oct 22, 2026) ----
// Source: Enrollment Funnel export, Oct 22 2026. Submissions by submission date, checkout links by
// checkout-link-sent date, checkouts by checkout date — all records, not just Google Ads.
export type DailyFunnelRow = { date: string; submissions: number; checkoutLinks: number; checkouts: number; revenue: number };
export const dailyFunnel: DailyFunnelRow[] = [
  { date: '2026-07-14', submissions: 114, checkoutLinks: 30, checkouts: 10, revenue: 20458 },
  { date: '2026-07-15', submissions: 120, checkoutLinks: 40, checkouts: 12, revenue: 19162 },
  { date: '2026-07-16', submissions: 100, checkoutLinks: 61, checkouts: 10, revenue: 18911 },
  { date: '2026-07-17', submissions: 80, checkoutLinks: 43, checkouts: 15, revenue: 29686 },
  { date: '2026-07-18', submissions: 34, checkoutLinks: 28, checkouts: 5, revenue: 10028 },
  { date: '2026-07-19', submissions: 34, checkoutLinks: 0, checkouts: 1, revenue: 2245 },
  { date: '2026-07-20', submissions: 154, checkoutLinks: 106, checkouts: 9, revenue: 18360 },
  { date: '2026-07-21', submissions: 112, checkoutLinks: 39, checkouts: 12, revenue: 16660 },
  { date: '2026-07-22', submissions: 79, checkoutLinks: 31, checkouts: 18, revenue: 35256 },
  { date: '2026-07-23', submissions: 86, checkoutLinks: 74, checkouts: 12, revenue: 21261 },
  { date: '2026-07-24', submissions: 61, checkoutLinks: 28, checkouts: 16, revenue: 30474 },
  { date: '2026-07-25', submissions: 25, checkoutLinks: 1, checkouts: 6, revenue: 11672 },
  { date: '2026-07-26', submissions: 35, checkoutLinks: 0, checkouts: 1, revenue: 1996 },
  { date: '2026-07-27', submissions: 95, checkoutLinks: 150, checkouts: 9, revenue: 17660 },
  { date: '2026-07-28', submissions: 51, checkoutLinks: 29, checkouts: 20, revenue: 38466 },
  { date: '2026-07-29', submissions: 66, checkoutLinks: 66, checkouts: 34, revenue: 57768 },
  { date: '2026-07-30', submissions: 98, checkoutLinks: 59, checkouts: 26, revenue: 46494 },
  { date: '2026-07-31', submissions: 103, checkoutLinks: 35, checkouts: 16, revenue: 30830 },
  { date: '2026-08-01', submissions: 30, checkoutLinks: 0, checkouts: 5, revenue: 8532 },
  { date: '2026-08-02', submissions: 25, checkoutLinks: 0, checkouts: 1, revenue: 2296 },
  { date: '2026-08-03', submissions: 88, checkoutLinks: 59, checkouts: 7, revenue: 12574 },
  { date: '2026-08-04', submissions: 64, checkoutLinks: 62, checkouts: 9, revenue: 19259 },
  { date: '2026-08-05', submissions: 79, checkoutLinks: 96, checkouts: 7, revenue: 14869 },
  { date: '2026-08-06', submissions: 53, checkoutLinks: 57, checkouts: 14, revenue: 27842 },
  { date: '2026-08-07', submissions: 32, checkoutLinks: 38, checkouts: 14, revenue: 27240 },
  { date: '2026-08-08', submissions: 27, checkoutLinks: 0, checkouts: 3, revenue: 5688 },
  { date: '2026-08-09', submissions: 12, checkoutLinks: 2, checkouts: 2, revenue: 3991 },
  { date: '2026-08-10', submissions: 54, checkoutLinks: 101, checkouts: 13, revenue: 26342 },
  { date: '2026-08-11', submissions: 71, checkoutLinks: 56, checkouts: 12, revenue: 24651 },
  { date: '2026-08-12', submissions: 54, checkoutLinks: 29, checkouts: 9, revenue: 18510 },
  { date: '2026-08-13', submissions: 45, checkoutLinks: 39, checkouts: 16, revenue: 31165 },
  { date: '2026-08-14', submissions: 46, checkoutLinks: 51, checkouts: 29, revenue: 53378 },
  { date: '2026-08-15', submissions: 39, checkoutLinks: 0, checkouts: 20, revenue: 37308 },
  { date: '2026-08-16', submissions: 23, checkoutLinks: 2, checkouts: 7, revenue: 13372 },
  { date: '2026-08-17', submissions: 39, checkoutLinks: 85, checkouts: 16, revenue: 34931 },
  { date: '2026-08-18', submissions: 61, checkoutLinks: 14, checkouts: 8, revenue: 14718 },
  { date: '2026-08-19', submissions: 67, checkoutLinks: 54, checkouts: 10, revenue: 19707 },
  { date: '2026-08-20', submissions: 42, checkoutLinks: 32, checkouts: 14, revenue: 26143 },
  { date: '2026-08-21', submissions: 41, checkoutLinks: 34, checkouts: 19, revenue: 35926 },
  { date: '2026-08-22', submissions: 15, checkoutLinks: 0, checkouts: 6, revenue: 10678 },
  { date: '2026-08-23', submissions: 21, checkoutLinks: 1, checkouts: 1, revenue: 1746 },
  { date: '2026-08-24', submissions: 60, checkoutLinks: 30, checkouts: 6, revenue: 10180 },
  { date: '2026-08-25', submissions: 54, checkoutLinks: 50, checkouts: 15, revenue: 29508 },
  { date: '2026-08-26', submissions: 91, checkoutLinks: 34, checkouts: 10, revenue: 17559 },
  { date: '2026-08-27', submissions: 59, checkoutLinks: 43, checkouts: 46, revenue: 87900 },
  { date: '2026-08-28', submissions: 36, checkoutLinks: 16, checkouts: 25, revenue: 48230 },
  { date: '2026-08-29', submissions: 55, checkoutLinks: 19, checkouts: 11, revenue: 20649 },
  { date: '2026-08-30', submissions: 172, checkoutLinks: 1, checkouts: 3, revenue: 5587 },
  { date: '2026-08-31', submissions: 130, checkoutLinks: 76, checkouts: 27, revenue: 47933 },
  { date: '2026-09-01', submissions: 71, checkoutLinks: 19, checkouts: 7, revenue: 11375 },
  { date: '2026-09-02', submissions: 101, checkoutLinks: 50, checkouts: 11, revenue: 21551 },
  { date: '2026-09-03', submissions: 75, checkoutLinks: 24, checkouts: 14, revenue: 25146 },
  { date: '2026-09-04', submissions: 54, checkoutLinks: 32, checkouts: 20, revenue: 36416 },
  { date: '2026-09-05', submissions: 37, checkoutLinks: 14, checkouts: 5, revenue: 10078 },
  { date: '2026-09-06', submissions: 30, checkoutLinks: 8, checkouts: 2, revenue: 3896 },
  { date: '2026-09-07', submissions: 58, checkoutLinks: 4, checkouts: 2, revenue: 3942 },
  { date: '2026-09-08', submissions: 49, checkoutLinks: 60, checkouts: 14, revenue: 22703 },
  { date: '2026-09-09', submissions: 57, checkoutLinks: 45, checkouts: 7, revenue: 11574 },
  { date: '2026-09-10', submissions: 47, checkoutLinks: 42, checkouts: 9, revenue: 16565 },
  { date: '2026-09-11', submissions: 38, checkoutLinks: 61, checkouts: 17, revenue: 33125 },
  { date: '2026-09-12', submissions: 31, checkoutLinks: 14, checkouts: 7, revenue: 13770 },
  { date: '2026-09-13', submissions: 28, checkoutLinks: 6, checkouts: 4, revenue: 7884 },
  { date: '2026-09-14', submissions: 39, checkoutLinks: 59, checkouts: 28, revenue: 54877 },
  { date: '2026-09-15', submissions: 68, checkoutLinks: 47, checkouts: 17, revenue: 31930 },
  { date: '2026-09-16', submissions: 65, checkoutLinks: 18, checkouts: 4, revenue: 7683 },
  { date: '2026-09-17', submissions: 26, checkoutLinks: 52, checkouts: 18, revenue: 34574 },
  { date: '2026-09-18', submissions: 25, checkoutLinks: 37, checkouts: 6, revenue: 11675 },
  { date: '2026-09-19', submissions: 17, checkoutLinks: 1, checkouts: 8, revenue: 14668 },
  { date: '2026-09-20', submissions: 21, checkoutLinks: 0, checkouts: 3, revenue: 6386 },
  { date: '2026-09-21', submissions: 49, checkoutLinks: 30, checkouts: 8, revenue: 15564 },
  { date: '2026-09-22', submissions: 47, checkoutLinks: 29, checkouts: 22, revenue: 42908 },
  { date: '2026-09-23', submissions: 41, checkoutLinks: 31, checkouts: 9, revenue: 18660 },
  { date: '2026-09-24', submissions: 53, checkoutLinks: 31, checkouts: 27, revenue: 47190 },
  { date: '2026-09-25', submissions: 22, checkoutLinks: 16, checkouts: 14, revenue: 25641 },
  { date: '2026-09-26', submissions: 20, checkoutLinks: 2, checkouts: 7, revenue: 14469 },
  { date: '2026-09-27', submissions: 30, checkoutLinks: 0, checkouts: 3, revenue: 5487 },
  { date: '2026-09-28', submissions: 47, checkoutLinks: 39, checkouts: 13, revenue: 24297 },
  { date: '2026-09-29', submissions: 58, checkoutLinks: 59, checkouts: 16, revenue: 30883 },
  { date: '2026-09-30', submissions: 72, checkoutLinks: 36, checkouts: 14, revenue: 22307 },
  { date: '2026-10-01', submissions: 49, checkoutLinks: 17, checkouts: 9, revenue: 16366 },
  { date: '2026-10-02', submissions: 42, checkoutLinks: 24, checkouts: 10, revenue: 20068 },
  { date: '2026-10-03', submissions: 26, checkoutLinks: 2, checkouts: 14, revenue: 22546 },
  { date: '2026-10-04', submissions: 13, checkoutLinks: 0, checkouts: 2, revenue: 3592 },
  { date: '2026-10-05', submissions: 44, checkoutLinks: 41, checkouts: 8, revenue: 13274 },
  { date: '2026-10-06', submissions: 36, checkoutLinks: 30, checkouts: 8, revenue: 14768 },
  { date: '2026-10-07', submissions: 32, checkoutLinks: 22, checkouts: 6, revenue: 10228 },
  { date: '2026-10-08', submissions: 52, checkoutLinks: 19, checkouts: 13, revenue: 26151 },
  { date: '2026-10-09', submissions: 35, checkoutLinks: 17, checkouts: 13, revenue: 24945 },
  { date: '2026-10-10', submissions: 22, checkoutLinks: 0, checkouts: 6, revenue: 11974 },
  { date: '2026-10-11', submissions: 15, checkoutLinks: 1, checkouts: 7, revenue: 14069 },
  { date: '2026-10-12', submissions: 45, checkoutLinks: 31, checkouts: 9, revenue: 18012 },
  { date: '2026-10-13', submissions: 41, checkoutLinks: 42, checkouts: 14, revenue: 27439 },
  { date: '2026-10-14', submissions: 41, checkoutLinks: 43, checkouts: 18, revenue: 30979 },
  { date: '2026-10-15', submissions: 76, checkoutLinks: 20, checkouts: 9, revenue: 18558 },
  { date: '2026-10-16', submissions: 42, checkoutLinks: 19, checkouts: 11, revenue: 18255 },
  { date: '2026-10-17', submissions: 26, checkoutLinks: 1, checkouts: 16, revenue: 30827 },
  { date: '2026-10-18', submissions: 22, checkoutLinks: 1, checkouts: 3, revenue: 5886 },
  { date: '2026-10-19', submissions: 67, checkoutLinks: 18, checkouts: 7, revenue: 12572 },
  { date: '2026-10-20', submissions: 36, checkoutLinks: 33, checkouts: 5, revenue: 12478 },
  { date: '2026-10-21', submissions: 35, checkoutLinks: 58, checkouts: 20, revenue: 40415 },
  { date: '2026-10-22', submissions: 20, checkoutLinks: 40, checkouts: 31, revenue: 50278 },
];

// Weekly time-to-checkout-link: median and mean days from submission to checkout-link-sent,
// grouped by submission week. Source: Enrollment Funnel export, Oct 22 2026. Only records with
// both a submission date and a checkout-link date >= Jul 14 are included.
export type WeeklyTTCLRow = { week: string; median: number; mean: number; count: number };
export const weeklyTTCL: WeeklyTTCLRow[] = [
  { week: '2026-07-13', median: 6, mean: 9.5, count: 344 },
  { week: '2026-07-20', median: 7, mean: 10.0, count: 405 },
  { week: '2026-07-27', median: 8, mean: 10.3, count: 334 },
  { week: '2026-08-03', median: 7, mean: 9.4, count: 194 },
  { week: '2026-08-10', median: 9, mean: 10.9, count: 230 },
  { week: '2026-08-17', median: 9, mean: 11.7, count: 179 },
  { week: '2026-08-24', median: 11, mean: 14, count: 313 },
  { week: '2026-08-31', median: 13, mean: 15.2, count: 297 },
  { week: '2026-09-07', median: 13, mean: 15.2, count: 188 },
  { week: '2026-09-14', median: 13, mean: 13.4, count: 132 },
  { week: '2026-09-21', median: 13, mean: 13.7, count: 114 },
  { week: '2026-09-28', median: 13, mean: 12.1, count: 121 },
  { week: '2026-10-05', median: 10, mean: 9.8, count: 73 },
  { week: '2026-10-12', median: 6, mean: 5.8, count: 40 },
  { week: '2026-10-19', median: 2, mean: 2, count: 3 },
];

// Weekly Lava vs Ice checkouts (by checkout date), Jan 2025 – Oct 2026.
// Lava = checked out <=21 days after checkout link sent (fast payer).
// Ice = checked out >21 days after checkout link sent (win-back).
// Source: Enrollment Funnel exports (Oct 19 2026). 2025 data from prior combined exports;
// 2026 data refreshed from Oct 19 export. All records with a checkout date.
export type WeeklyLavaIceRow = { week: string; lava: number; ice: number; unclass: number; total: number; icePct: number; lavaRev: number; iceRev: number; unclassRev: number };
export const weeklyLavaIce: WeeklyLavaIceRow[] = [
  // --- 2025 ---
  { week: '2025-01-06', lava: 8, ice: 0, unclass: 5, total: 13, icePct: 0.0, lavaRev: 11322, iceRev: 0, unclassRev: 9706 },
  { week: '2025-01-13', lava: 12, ice: 0, unclass: 12, total: 24, icePct: 0.0, lavaRev: 19948, iceRev: 0, unclassRev: 15440 },
  { week: '2025-01-20', lava: 38, ice: 0, unclass: 6, total: 44, icePct: 0.0, lavaRev: 61443, iceRev: 0, unclassRev: 8888 },
  { week: '2025-01-27', lava: 41, ice: 3, unclass: 9, total: 53, icePct: 6.8, lavaRev: 66125, iceRev: 4937, unclassRev: 14898 },
  { week: '2025-02-03', lava: 42, ice: 11, unclass: 6, total: 59, icePct: 20.8, lavaRev: 68874, iceRev: 17654, unclassRev: 5957 },
  { week: '2025-02-10', lava: 43, ice: 21, unclass: 5, total: 69, icePct: 32.8, lavaRev: 70160, iceRev: 34249, unclassRev: 7952 },
  { week: '2025-02-17', lava: 52, ice: 19, unclass: 11, total: 82, icePct: 26.8, lavaRev: 86025, iceRev: 30968, unclassRev: 15261 },
  { week: '2025-02-24', lava: 43, ice: 20, unclass: 14, total: 77, icePct: 31.7, lavaRev: 71215, iceRev: 31820, unclassRev: 25683 },
  { week: '2025-03-03', lava: 46, ice: 16, unclass: 10, total: 72, icePct: 25.8, lavaRev: 72562, iceRev: 26431, unclassRev: 17743 },
  { week: '2025-03-10', lava: 49, ice: 35, unclass: 6, total: 90, icePct: 41.7, lavaRev: 77862, iceRev: 57598, unclassRev: 9663 },
  { week: '2025-03-17', lava: 79, ice: 22, unclass: 16, total: 117, icePct: 21.8, lavaRev: 128350, iceRev: 34654, unclassRev: 27159 },
  { week: '2025-03-24', lava: 49, ice: 22, unclass: 10, total: 81, icePct: 31.0, lavaRev: 73004, iceRev: 35802, unclassRev: 18033 },
  { week: '2025-03-31', lava: 50, ice: 13, unclass: 5, total: 68, icePct: 20.6, lavaRev: 79201, iceRev: 17853, unclassRev: 8866 },
  { week: '2025-04-07', lava: 35, ice: 15, unclass: 14, total: 64, icePct: 30.0, lavaRev: 56900, iceRev: 23488, unclassRev: 22086 },
  { week: '2025-04-14', lava: 77, ice: 18, unclass: 14, total: 109, icePct: 18.9, lavaRev: 123612, iceRev: 29021, unclassRev: 33933 },
  { week: '2025-04-21', lava: 63, ice: 19, unclass: 20, total: 102, icePct: 23.2, lavaRev: 102329, iceRev: 30671, unclassRev: 32488 },
  { week: '2025-04-28', lava: 63, ice: 51, unclass: 19, total: 133, icePct: 44.7, lavaRev: 100587, iceRev: 82788, unclassRev: 28636 },
  { week: '2025-05-05', lava: 43, ice: 21, unclass: 7, total: 71, icePct: 32.8, lavaRev: 69213, iceRev: 33765, unclassRev: 12291 },
  { week: '2025-05-12', lava: 42, ice: 20, unclass: 11, total: 73, icePct: 32.3, lavaRev: 66423, iceRev: 31734, unclassRev: 14060 },
  { week: '2025-05-19', lava: 55, ice: 22, unclass: 13, total: 90, icePct: 28.6, lavaRev: 89118, iceRev: 33912, unclassRev: 24134 },
  { week: '2025-05-26', lava: 78, ice: 45, unclass: 21, total: 144, icePct: 36.6, lavaRev: 120791, iceRev: 74409, unclassRev: 36494 },
  { week: '2025-06-02', lava: 35, ice: 33, unclass: 14, total: 82, icePct: 48.5, lavaRev: 59046, iceRev: 54864, unclassRev: 19581 },
  { week: '2025-06-09', lava: 38, ice: 23, unclass: 6, total: 67, icePct: 37.7, lavaRev: 57847, iceRev: 38298, unclassRev: 8274 },
  { week: '2025-06-16', lava: 24, ice: 19, unclass: 17, total: 60, icePct: 44.2, lavaRev: 39997, iceRev: 29728, unclassRev: 36912 },
  { week: '2025-06-23', lava: 56, ice: 25, unclass: 29, total: 110, icePct: 30.9, lavaRev: 90354, iceRev: 40146, unclassRev: 48628 },
  { week: '2025-06-30', lava: 25, ice: 25, unclass: 17, total: 67, icePct: 50.0, lavaRev: 39942, iceRev: 40342, unclassRev: 25674 },
  { week: '2025-07-07', lava: 43, ice: 21, unclass: 9, total: 73, icePct: 32.8, lavaRev: 71215, iceRev: 34113, unclassRev: 15078 },
  { week: '2025-07-14', lava: 47, ice: 32, unclass: 8, total: 87, icePct: 40.5, lavaRev: 74907, iceRev: 50581, unclassRev: 14664 },
  { week: '2025-07-21', lava: 65, ice: 22, unclass: 7, total: 94, icePct: 25.3, lavaRev: 106285, iceRev: 36604, unclassRev: 12781 },
  { week: '2025-07-28', lava: 79, ice: 36, unclass: 10, total: 125, icePct: 31.3, lavaRev: 128615, iceRev: 58494, unclassRev: 19722 },
  { week: '2025-08-04', lava: 52, ice: 18, unclass: 5, total: 75, icePct: 25.7, lavaRev: 84188, iceRev: 29124, unclassRev: 10167 },
  { week: '2025-08-11', lava: 87, ice: 29, unclass: 7, total: 123, icePct: 25.0, lavaRev: 145022, iceRev: 45488, unclassRev: 9919 },
  { week: '2025-08-18', lava: 103, ice: 21, unclass: 10, total: 134, icePct: 16.9, lavaRev: 168755, iceRev: 35007, unclassRev: 11571 },
  { week: '2025-08-25', lava: 129, ice: 39, unclass: 18, total: 186, icePct: 23.2, lavaRev: 212526, iceRev: 62531, unclassRev: 31834 },
  { week: '2025-09-01', lava: 68, ice: 20, unclass: 8, total: 96, icePct: 22.7, lavaRev: 111816, iceRev: 32967, unclassRev: 10347 },
  { week: '2025-09-08', lava: 52, ice: 25, unclass: 10, total: 87, icePct: 32.5, lavaRev: 87324, iceRev: 40799, unclassRev: 19035 },
  { week: '2025-09-15', lava: 70, ice: 34, unclass: 8, total: 112, icePct: 32.7, lavaRev: 114802, iceRev: 57753, unclassRev: 14485 },
  { week: '2025-09-22', lava: 81, ice: 56, unclass: 12, total: 149, icePct: 40.9, lavaRev: 132058, iceRev: 90715, unclassRev: 23626 },
  { week: '2025-09-29', lava: 53, ice: 45, unclass: 9, total: 107, icePct: 45.9, lavaRev: 87770, iceRev: 74111, unclassRev: 13741 },
  { week: '2025-10-06', lava: 47, ice: 33, unclass: 7, total: 87, icePct: 41.2, lavaRev: 74193, iceRev: 55408, unclassRev: 10870 },
  { week: '2025-10-13', lava: 104, ice: 63, unclass: 16, total: 183, icePct: 37.7, lavaRev: 166952, iceRev: 100438, unclassRev: 22380 },
  { week: '2025-10-20', lava: 29, ice: 20, unclass: 14, total: 63, icePct: 40.8, lavaRev: 39903, iceRev: 33811, unclassRev: 25165 },
  { week: '2025-10-27', lava: 29, ice: 44, unclass: 27, total: 100, icePct: 60.3, lavaRev: 47922, iceRev: 72083, unclassRev: 34786 },
  { week: '2025-11-03', lava: 38, ice: 30, unclass: 7, total: 75, icePct: 44.1, lavaRev: 64288, iceRev: 45490, unclassRev: 11022 },
  { week: '2025-11-10', lava: 30, ice: 23, unclass: 16, total: 69, icePct: 43.4, lavaRev: 48380, iceRev: 39609, unclassRev: 29257 },
  { week: '2025-11-17', lava: 86, ice: 102, unclass: 25, total: 213, icePct: 54.3, lavaRev: 136482, iceRev: 161720, unclassRev: 39157 },
  { week: '2025-11-24', lava: 37, ice: 45, unclass: 11, total: 93, icePct: 54.9, lavaRev: 57300, iceRev: 70766, unclassRev: 15612 },
  { week: '2025-12-01', lava: 31, ice: 14, unclass: 12, total: 57, icePct: 31.1, lavaRev: 51120, iceRev: 23140, unclassRev: 25966 },
  { week: '2025-12-08', lava: 51, ice: 13, unclass: 21, total: 85, icePct: 20.3, lavaRev: 88212, iceRev: 21692, unclassRev: 35695 },
  { week: '2025-12-15', lava: 76, ice: 35, unclass: 11, total: 122, icePct: 31.5, lavaRev: 122969, iceRev: 54506, unclassRev: 17380 },
  { week: '2025-12-22', lava: 12, ice: 4, unclass: 7, total: 23, icePct: 25.0, lavaRev: 18750, iceRev: 6336, unclassRev: 7607 },
  { week: '2025-12-29', lava: 29, ice: 16, unclass: 10, total: 55, icePct: 35.6, lavaRev: 50623, iceRev: 25440, unclassRev: 12468 },
  // --- 2026 ---
  { week: '2026-01-05', lava: 8, ice: 0, unclass: 6, total: 14, icePct: 0.0, lavaRev: 15063, iceRev: 0, unclassRev: 7687 },
  { week: '2026-01-12', lava: 51, ice: 0, unclass: 8, total: 59, icePct: 0.0, lavaRev: 84925, iceRev: 0, unclassRev: 18796 },
  { week: '2026-01-19', lava: 25, ice: 1, unclass: 22, total: 48, icePct: 3.8, lavaRev: 42291, iceRev: 1995, unclassRev: 37147 },
  { week: '2026-01-26', lava: 54, ice: 1, unclass: 13, total: 68, icePct: 1.8, lavaRev: 86678, iceRev: 1596, unclassRev: 23298 },
  { week: '2026-02-02', lava: 32, ice: 3, unclass: 9, total: 44, icePct: 8.6, lavaRev: 56655, iceRev: 5037, unclassRev: 17713 },
  { week: '2026-02-09', lava: 53, ice: 3, unclass: 10, total: 66, icePct: 5.4, lavaRev: 87866, iceRev: 3442, unclassRev: 17586 },
  { week: '2026-02-16', lava: 25, ice: 2, unclass: 11, total: 38, icePct: 7.4, lavaRev: 42487, iceRev: 2592, unclassRev: 21502 },
  { week: '2026-02-23', lava: 110, ice: 22, unclass: 22, total: 154, icePct: 16.7, lavaRev: 174510, iceRev: 33108, unclassRev: 37142 },
  { week: '2026-03-02', lava: 34, ice: 4, unclass: 18, total: 56, icePct: 10.5, lavaRev: 57943, iceRev: 6783, unclassRev: 47537 },
  { week: '2026-03-09', lava: 39, ice: 5, unclass: 11, total: 55, icePct: 11.4, lavaRev: 66781, iceRev: 8626, unclassRev: 20581 },
  { week: '2026-03-16', lava: 69, ice: 15, unclass: 16, total: 100, icePct: 17.9, lavaRev: 111753, iceRev: 24934, unclassRev: 27106 },
  { week: '2026-03-23', lava: 74, ice: 23, unclass: 26, total: 123, icePct: 23.7, lavaRev: 116991, iceRev: 35914, unclassRev: 35595 },
  { week: '2026-03-30', lava: 31, ice: 25, unclass: 16, total: 72, icePct: 44.6, lavaRev: 50819, iceRev: 39027, unclassRev: 26658 },
  { week: '2026-04-06', lava: 31, ice: 14, unclass: 14, total: 59, icePct: 31.1, lavaRev: 51078, iceRev: 24136, unclassRev: 20256 },
  { week: '2026-04-13', lava: 52, ice: 11, unclass: 21, total: 84, icePct: 17.5, lavaRev: 92393, iceRev: 18055, unclassRev: 36571 },
  { week: '2026-04-20', lava: 60, ice: 31, unclass: 22, total: 113, icePct: 34.1, lavaRev: 98150, iceRev: 49725, unclassRev: 33587 },
  { week: '2026-04-27', lava: 28, ice: 22, unclass: 24, total: 74, icePct: 44.0, lavaRev: 42890, iceRev: 36015, unclassRev: 34552 },
  { week: '2026-05-04', lava: 34, ice: 9, unclass: 21, total: 64, icePct: 20.9, lavaRev: 56504, iceRev: 14959, unclassRev: 37586 },
  { week: '2026-05-11', lava: 32, ice: 19, unclass: 20, total: 71, icePct: 37.3, lavaRev: 52416, iceRev: 30670, unclassRev: 32271 },
  { week: '2026-05-18', lava: 29, ice: 5, unclass: 12, total: 46, icePct: 14.7, lavaRev: 41942, iceRev: 8628, unclassRev: 21504 },
  { week: '2026-05-25', lava: 56, ice: 60, unclass: 16, total: 132, icePct: 51.7, lavaRev: 81991, iceRev: 97686, unclassRev: 27104 },
  { week: '2026-06-01', lava: 37, ice: 6, unclass: 3, total: 46, icePct: 14.0, lavaRev: 57655, iceRev: 9725, unclassRev: 2797 },
  { week: '2026-06-08', lava: 33, ice: 18, unclass: 13, total: 64, icePct: 35.3, lavaRev: 50465, iceRev: 26487, unclassRev: 20502 },
  { week: '2026-06-15', lava: 57, ice: 20, unclass: 10, total: 87, icePct: 26.0, lavaRev: 92556, iceRev: 32863, unclassRev: 9494 },
  { week: '2026-06-22', lava: 86, ice: 44, unclass: 13, total: 143, icePct: 33.8, lavaRev: 134321, iceRev: 66711, unclassRev: 18846 },
  { week: '2026-06-29', lava: 90, ice: 48, unclass: 22, total: 160, icePct: 34.8, lavaRev: 134822, iceRev: 68606, unclassRev: 29321 },
  { week: '2026-07-06', lava: 35, ice: 5, unclass: 8, total: 48, icePct: 12.5, lavaRev: 64208, iceRev: 7232, unclassRev: 13273 },
  { week: '2026-07-13', lava: 50, ice: 2, unclass: 15, total: 67, icePct: 3.8, lavaRev: 101084, iceRev: 3587, unclassRev: 23559 },
  { week: '2026-07-20', lava: 48, ice: 10, unclass: 16, total: 74, icePct: 17.2, lavaRev: 96062, iceRev: 18655, unclassRev: 20962 },
  { week: '2026-07-27', lava: 84, ice: 12, unclass: 15, total: 111, icePct: 12.5, lavaRev: 153354, iceRev: 21650, unclassRev: 27042 },
  { week: '2026-08-03', lava: 41, ice: 8, unclass: 7, total: 56, icePct: 16.3, lavaRev: 86317, iceRev: 13969, unclassRev: 11177 },
  { week: '2026-08-10', lava: 68, ice: 25, unclass: 13, total: 106, icePct: 26.9, lavaRev: 132748, iceRev: 48430, unclassRev: 23548 },
  { week: '2026-08-17', lava: 52, ice: 14, unclass: 8, total: 74, icePct: 21.2, lavaRev: 105430, iceRev: 24846, unclassRev: 13573 },
  { week: '2026-08-24', lava: 64, ice: 25, unclass: 27, total: 116, icePct: 28.1, lavaRev: 123585, iceRev: 43640, unclassRev: 52388 },
  { week: '2026-08-31', lava: 53, ice: 20, unclass: 13, total: 86, icePct: 27.4, lavaRev: 100479, iceRev: 32069, unclassRev: 23847 },
  { week: '2026-09-07', lava: 45, ice: 8, unclass: 7, total: 60, icePct: 15.1, lavaRev: 86062, iceRev: 14217, unclassRev: 9284 },
  { week: '2026-09-14', lava: 65, ice: 10, unclass: 9, total: 84, icePct: 13.3, lavaRev: 128262, iceRev: 20356, unclassRev: 13175 },
  { week: '2026-09-21', lava: 53, ice: 29, unclass: 8, total: 90, icePct: 35.4, lavaRev: 103270, iceRev: 51380, unclassRev: 15269 },
  { week: '2026-09-28', lava: 52, ice: 14, unclass: 12, total: 78, icePct: 21.2, lavaRev: 96940, iceRev: 23847, unclassRev: 19272 },
  { week: '2026-10-05', lava: 34, ice: 16, unclass: 11, total: 61, icePct: 32.0, lavaRev: 67052, iceRev: 26242, unclassRev: 22115 },
  { week: '2026-10-12', lava: 38, ice: 34, unclass: 8, total: 80, icePct: 47.2, lavaRev: 76830, iceRev: 58507, unclassRev: 14619 },
  { week: '2026-10-19', lava: 38, ice: 13, unclass: 12, total: 63, icePct: 25.5, lavaRev: 66948, iceRev: 24941, unclassRev: 23854 },
];

// Monthly win-back rates by checkout-link month (from Oct 22 Enrollment Funnel export)
// links = total leads that received a checkout link that month
// winbackRate = Ice / links (what % of linked leads became win-backs)
// iceShareCO = Ice / (Ice + Lava) (what % of actual checkouts were win-backs)
export type MonthlyWinbackRow = { month: string; links: number; lava: number; ice: number; noCO: number; winbackRate: number; iceShareCO: number };
export const monthlyWinback: MonthlyWinbackRow[] = [
  { month: '2026-01', links: 584, lava: 167, ice: 52, noCO: 365, winbackRate: 8.9, iceShareCO: 23.7 },
  { month: '2026-02', links: 717, lava: 207, ice: 78, noCO: 432, winbackRate: 10.9, iceShareCO: 27.4 },
  { month: '2026-03', links: 976, lava: 245, ice: 117, noCO: 614, winbackRate: 12.0, iceShareCO: 32.3 },
  { month: '2026-04', links: 1114, lava: 191, ice: 117, noCO: 806, winbackRate: 10.5, iceShareCO: 38.0 },
  { month: '2026-05', links: 741, lava: 154, ice: 74, noCO: 513, winbackRate: 10.0, iceShareCO: 32.5 },
  { month: '2026-06', links: 1164, lava: 284, ice: 51, noCO: 829, winbackRate: 4.4, iceShareCO: 15.2 },
  { month: '2026-07', links: 1157, lava: 245, ice: 77, noCO: 835, winbackRate: 6.7, iceShareCO: 23.9 },
  { month: '2026-08', links: 1081, lava: 227, ice: 62, noCO: 792, winbackRate: 5.7, iceShareCO: 21.5 },
  { month: '2026-09', links: 867, lava: 225, ice: 25, noCO: 617, winbackRate: 2.9, iceShareCO: 10.0 },
  { month: '2026-10', links: 476, lava: 107, ice: 0, noCO: 369, winbackRate: 0.0, iceShareCO: 0.0 },
];
