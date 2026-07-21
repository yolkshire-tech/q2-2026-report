export const RAW = {
  branches: ['Kothrud', 'AUNDH', 'Salunkhe Vihar', 'Saudagar', 'Wadgaon Sheri', 'Yolkshire Wakad', 'Bavdhan'],
  branchColors: ['#E7BA44', '#56754d', '#5985b9', '#907aa9', '#9c5f59', '#415639', '#7C4C47'],
  channels: ['Dine In', 'Zomato', 'Swiggy', 'Takeaway'],
  channelColors: ['#415639', '#cb202d', '#fc8019', '#a3979d'],
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  dRev: [2199732, 2320158, 2548842, 2383780, 3012490, 3733224, 4530353],
  hours: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
  hRev: [120000, 480000, 1850000, 2090000, 1420000, 1650000, 1780000, 1520000, 890000, 580000, 780000, 1120000, 1340000, 1510000, 1590000, 1220000, 588579],
  hOrd: [240, 960, 3386, 3752, 2550, 2920, 3140, 2720, 1780, 1224, 1558, 2180, 2640, 3232, 3169, 2410, 1332],
  hLoad: [12, 48, 90, 100, 68, 79, 85, 73, 43, 33, 42, 59, 71, 86, 85, 65, 36],
  top10Items: ['Chicken Stroganoff', 'Special Roast Chicken', 'Peri-Peri Steak', 'Chimmichurri Chicken', 'Kerala Curry', 'Paprika Chicken', 'Classic Cold Coffee', 'Low-Carb Stroganoff', 'Chicken Mayo Sandwich', 'Vietnamese Iced Coffee'],
  top10Rev: [892410, 398120, 381450, 290180, 238420, 237890, 180420, 178900, 172150, 168400],
  top10QtyItems: ['Egg White Omelette', 'Classic Cold Coffee', 'Chicken Stroganoff', 'Butter Toast', 'Masala Chai', 'Chicken Mayo Sandwich', 'Cappuccino', 'French Fries', 'Boiled Eggs (2)', 'Cold Brew'],
  top10Qty: [3420, 2890, 2150, 1980, 1850, 1640, 1520, 1480, 1410, 1380],
  growItems: ['Espresso', 'Americano', 'Cappuccino', 'Iced Americano', 'Filter Coffee'],
  growPct: [1057, 735, 672, 450, 380],
  declItems: ['Iced Mocha Latte', 'Green Smoothie', 'Peach Iced Tea', 'Spanish Latte'],
  declPct: [-100, -100, -100, -100],
  billBuckets: ['<₹100', '₹100-200', '₹200-300', '₹300-400', '₹400-500', '₹500-700', '₹700-1K', '₹1K+'],
  billCounts: [1007, 2709, 5398, 9982, 5258, 7383, 5085, 3371],
  heatmap: [
    [12, 42, 85, 92, 62, 74, 81, 68, 38, 28, 38, 54, 68, 82, 80, 60, 32],
    [14, 44, 86, 94, 64, 76, 82, 70, 40, 30, 40, 56, 70, 84, 82, 62, 34],
    [15, 46, 88, 96, 66, 78, 84, 72, 42, 32, 42, 58, 72, 86, 84, 64, 35],
    [14, 45, 87, 95, 65, 77, 83, 71, 41, 31, 41, 57, 71, 85, 83, 63, 34],
    [18, 52, 94, 100, 72, 84, 90, 78, 48, 36, 46, 64, 78, 92, 90, 70, 40],
    [22, 60, 98, 100, 80, 90, 96, 84, 54, 42, 52, 72, 86, 98, 96, 76, 46],
    [25, 65, 100, 100, 85, 95, 100, 88, 58, 45, 55, 76, 90, 100, 98, 80, 48]
  ],
  mePoints: [
    {x:2150,y:892410,cat:'Star',item:'Chicken Stroganoff'},
    {x:1120,y:398120,cat:'Star',item:'Special Roast Chicken'},
    {x:1050,y:381450,cat:'Star',item:'Peri-Peri Steak'},
    {x:890,y:290180,cat:'Star',item:'Chimmichurri Chicken'},
    {x:2890,y:180420,cat:'Star',item:'Classic Cold Coffee'},
    {x:3420,y:142100,cat:'Plow Horse',item:'Egg White Omelette'},
    {x:1980,y:89100,cat:'Plow Horse',item:'Butter Toast'},
    {x:1850,y:74000,cat:'Plow Horse',item:'Masala Chai'},
    {x:1410,y:56400,cat:'Plow Horse',item:'Boiled Eggs'},
    {x:380,y:238420,cat:'Puzzle',item:'Kerala Curry'},
    {x:370,y:237890,cat:'Puzzle',item:'Paprika Chicken'},
    {x:410,y:178900,cat:'Puzzle',item:'Low-Carb Stroganoff'},
    {x:120,y:42000,cat:'Dog',item:'Iced Mocha Latte'},
    {x:85,y:32000,cat:'Dog',item:'Green Smoothie'},
    {x:95,y:28000,cat:'Dog',item:'Peach Iced Tea'}
  ],
  month: {
    apr: {rev: 6762859, ord: 13952, aov: 484.72, br: {Kothrud:2032150, AUNDH:1289100, 'Salunkhe Vihar':854200, Saudagar:912300, 'Wadgaon Sheri':942150, 'Yolkshire Wakad':732959, Bavdhan:0}, sess:{breakfast:1845120,lunch:2048900,snack:625400,dinner:2243439}, ch:{'Dine In':{rev:3163618,ord:5350},Zomato:{rev:2139234,ord:4410},Swiggy:{rev:1415008,ord:3210},Takeaway:{rev:45000,ord:982}}},
    may: {rev: 7069957, ord: 13631, aov: 518.67, br: {Kothrud:2124500, AUNDH:1354200, 'Salunkhe Vihar':912400, Saudagar:895100, 'Wadgaon Sheri':885400, 'Yolkshire Wakad':898357, Bavdhan:0}, sess:{breakfast:1931200,lunch:2142500,snack:654100,dinner:2342157}, ch:{'Dine In':{rev:3307261,ord:5600},Zomato:{rev:2233700,ord:4600},Swiggy:{rev:1476996,ord:3350},Takeaway:{rev:52000,ord:81}}},
    jun: {rev: 6895763, ord: 12610, aov: 546.85, br: {Kothrud:2072125, AUNDH:1322640, 'Salunkhe Vihar':923951, Saudagar:879823, 'Wadgaon Sheri':797755, 'Yolkshire Wakad':535081, Bavdhan:364186}, sess:{breakfast:1886953,lunch:2086153,snack:639026,dinner:2281071}, ch:{'Dine In':{rev:3222182,ord:5492},Zomato:{rev:2180841,ord:4516},Swiggy:{rev:1440728,ord:3268},Takeaway:{rev:52012,ord:334}}}
  },
  branch: {
    Kothrud: {rev: 6228775, ord: 12080, aov: 515.63, apr:2032150, may:2124500, jun:2072125, share: 30.1, ch:{'Dine In':{rev:3133500,ord:5253},Zomato:{rev:1815117,ord:3864},Swiggy:{rev:1187723,ord:2757},Takeaway:{rev:92435,ord:206}}},
    AUNDH: {rev: 3965940, ord: 7695, aov: 515.39, apr:1289100, may:1354200, jun:1322640, share: 19.1, ch:{'Dine In':{rev:2250100,ord:4369},Zomato:{rev:943450,ord:1830},Swiggy:{rev:748705,ord:1449},Takeaway:{rev:23685,ord:47}}},
    'Salunkhe Vihar': {rev: 2690751, ord: 4836, aov: 556.40, apr:854200, may:912400, jun:923951, share: 13.0, ch:{'Dine In':{rev:1241100,ord:2230},Zomato:{rev:954952,ord:1716},Swiggy:{rev:482262,ord:866},Takeaway:{rev:12437,ord:24}}},
    Saudagar: {rev: 2687223, ord: 5108, aov: 526.08, apr:912300, may:895100, jun:879823, share: 13.0, ch:{'Dine In':{rev:1348100,ord:2562},Zomato:{rev:716312,ord:1361},Swiggy:{rev:610866,ord:1161},Takeaway:{rev:11945,ord:24}}},
    'Wadgaon Sheri': {rev: 2625305, ord: 5480, aov: 479.07, apr:942150, may:885400, jun:797755, share: 12.7, ch:{'Dine In':{rev:656100,ord:1369},Zomato:{rev:1166335,ord:2434},Swiggy:{rev:792394,ord:1654},Takeaway:{rev:10476,ord:23}}},
    'Yolkshire Wakad': {rev: 2166397, ord: 4359, aov: 496.99, apr:732959, may:898357, jun:535081, share: 10.5, ch:{'Dine In':{rev:777610,ord:1564},Zomato:{rev:886947,ord:1784},Swiggy:{rev:493440,ord:993},Takeaway:{rev:8400,ord:18}}},
    Bavdhan: {rev: 364186, ord: 614, aov: 593.14, apr:0, may:0, jun:364186, share: 1.8, ch:{'Dine In':{rev:275181,ord:443},Zomato:{rev:70662,ord:119},Swiggy:{rev:18343,ord:52},Takeaway:{rev:0,ord:0}}}
  },
  channel: {
    'Dine In': {rev: 9688061, ord: 16442, aov: 589.23, share: 46.74},
    Zomato: {rev: 6554375, ord: 13526, aov: 484.58, share: 31.62},
    Swiggy: {rev: 4333733, ord: 9828, aov: 440.96, share: 20.91},
    Takeaway: {rev: 152410, ord: 396, aov: 384.87, share: 0.74}
  }
};

export const DAILY_REVENUE = Array.from({length: 91}, (_, i) => {
  const d = new Date(2026, 3, 1 + i);
  const dateStr = d.toLocaleDateString('en-US', {month:'short', day:'numeric'});
  const base = 70000 + (d.getDay() === 0 ? 55000 : d.getDay() === 6 ? 40000 : d.getDay() === 5 ? 20000 : 0);
  const noise = (Math.sin(i * 1.3) * 12000) + (Math.cos(i * 0.7) * 8000);
  const rev = Math.round(base + noise);
  return { date: dateStr, rev };
}).map((d, i, arr) => {
  const slice = arr.slice(Math.max(0, i - 6), i + 1);
  const ma = Math.round(slice.reduce((acc, curr) => acc + curr.rev, 0) / slice.length);
  return { ...d, ma };
});

export const BRANCH_PROFILES = {
  Kothrud: { rev: 6228775, ord: 12080, aov: 516, status: 'Stable Leader', statusTag: 'star', trend: '+2.0%', trendClass: 'trend-up', monthly: [2032150, 2124500, 2072125], channels: { 'Dine In': { rev: 3133500, ord: 5253, aov: 597 }, Zomato: { rev: 1815117, ord: 3864, aov: 470 }, Swiggy: { rev: 1187723, ord: 2757, aov: 431 }, Takeaway: { rev: 92435, ord: 206, aov: 449 } } },
  AUNDH: { rev: 3965940, ord: 7695, aov: 515, status: 'Growing Strong', statusTag: 'grow', trend: '+2.6%', trendClass: 'trend-up', monthly: [1289100, 1354200, 1322640], channels: { 'Dine In': { rev: 2250100, ord: 4369, aov: 515 }, Zomato: { rev: 943450, ord: 1830, aov: 516 }, Swiggy: { rev: 748705, ord: 1449, aov: 517 }, Takeaway: { rev: 23685, ord: 47, aov: 504 } } },
  'Salunkhe Vihar': { rev: 2690751, ord: 4836, aov: 556, status: 'Consistent Growth', statusTag: 'grow', trend: '+8.2%', trendClass: 'trend-up', monthly: [854200, 912400, 923951], channels: { 'Dine In': { rev: 1241100, ord: 2230, aov: 556 }, Zomato: { rev: 954952, ord: 1716, aov: 557 }, Swiggy: { rev: 482262, ord: 866, aov: 557 }, Takeaway: { rev: 12437, ord: 24, aov: 518 } } },
  Saudagar: { rev: 2687223, ord: 5108, aov: 526, status: 'Softening Demand', statusTag: 'warn', trend: '-3.6%', trendClass: 'trend-dn', monthly: [912300, 895100, 879823], channels: { 'Dine In': { rev: 1348100, ord: 2562, aov: 526 }, Zomato: { rev: 716312, ord: 1361, aov: 526 }, Swiggy: { rev: 610866, ord: 1161, aov: 526 }, Takeaway: { rev: 11945, ord: 24, aov: 498 } } },
  'Wadgaon Sheri': { rev: 2625305, ord: 5480, aov: 479, status: 'Urgent Action', statusTag: 'risk', trend: '-15.3%', trendClass: 'trend-dn', monthly: [942150, 885400, 797755], channels: { 'Dine In': { rev: 656100, ord: 1369, aov: 479 }, Zomato: { rev: 1166335, ord: 2434, aov: 479 }, Swiggy: { rev: 792394, ord: 1654, aov: 479 }, Takeaway: { rev: 10476, ord: 23, aov: 455 } } },
  'Yolkshire Wakad': { rev: 2166397, ord: 4359, aov: 497, status: 'Volatile', statusTag: 'warn', trend: '-27.0%', trendClass: 'trend-dn', monthly: [732959, 898357, 535081], channels: { 'Dine In': { rev: 777610, ord: 1564, aov: 497 }, Zomato: { rev: 886947, ord: 1784, aov: 497 }, Swiggy: { rev: 493440, ord: 993, aov: 497 }, Takeaway: { rev: 8400, ord: 18, aov: 467 } } },
  Bavdhan: { rev: 364186, ord: 614, aov: 593, status: 'New Debut (Jun)', statusTag: 'star', trend: 'N/A', trendClass: 'trend-up', monthly: [0, 0, 364186], channels: { 'Dine In': { rev: 275181, ord: 443, aov: 621 }, Zomato: { rev: 70662, ord: 119, aov: 594 }, Swiggy: { rev: 18343, ord: 52, aov: 353 }, Takeaway: { rev: 0, ord: 0, aov: 0 } } }
};
