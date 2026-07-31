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
    jan: {rev: 6240460, ord: 12201, aov: 511.47, br: {Kothrud:1852100, AUNDH:1310200, 'Salunkhe Vihar':810200, Saudagar:780100, 'Wadgaon Sheri':820400, 'Yolkshire Wakad':667460, Bavdhan:0}, sess:{breakfast:1700000,lunch:1890000,snack:580000,dinner:2070460}, ch:{'Dine In':{rev:2980000,ord:5050},Zomato:{rev:1950000,ord:4100},Swiggy:{rev:1250000,ord:2800},Takeaway:{rev:60460,ord:251}}},
    feb: {rev: 5186052, ord: 10358, aov: 500.68, br: {Kothrud:1540100, AUNDH:1120100, 'Salunkhe Vihar':710200, Saudagar:650100, 'Wadgaon Sheri':680400, 'Yolkshire Wakad':485152, Bavdhan:0}, sess:{breakfast:1410000,lunch:1570000,snack:480000,dinner:1726052}, ch:{'Dine In':{rev:2480000,ord:4200},Zomato:{rev:1640000,ord:3500},Swiggy:{rev:1020000,ord:2450},Takeaway:{rev:46052,ord:208}}},
    mar: {rev: 5811646, ord: 11638, aov: 499.37, br: {Kothrud:1725996, AUNDH:1271894, 'Salunkhe Vihar':845290, Saudagar:705274, 'Wadgaon Sheri':754203, 'Yolkshire Wakad':508989, Bavdhan:0}, sess:{breakfast:1580000,lunch:1760000,snack:540000,dinner:1931646}, ch:{'Dine In':{rev:2759679,ord:4968},Zomato:{rev:1872595,ord:4222},Swiggy:{rev:1121966,ord:2244},Takeaway:{rev:57406,ord:204}}},
    q1: {rev: 17238158, ord: 34197, aov: 504.08, br: {Kothrud:5118196, AUNDH:3702194, 'Salunkhe Vihar':2365690, Saudagar:2135474, 'Wadgaon Sheri':2255003, 'Yolkshire Wakad':1661599, Bavdhan:0}, sess:{breakfast:4690000,lunch:5220000,snack:1600000,dinner:5728158}, ch:{'Dine In':{rev:8419679,ord:14218},Zomato:{rev:5462595,ord:11822},Swiggy:{rev:3231966,ord:7094},Takeaway:{rev:112157,ord:280}}},
    q2: {rev: 20728578, ord: 40193, aov: 515.73, br: {Kothrud:6228775, AUNDH:3965940, 'Salunkhe Vihar':2690751, Saudagar:2687223, 'Wadgaon Sheri':2625305, 'Yolkshire Wakad':2166397, Bavdhan:364186}, sess:{breakfast:5663273,lunch:6275153,snack:1918526,dinner:6856676}, ch:{'Dine In':{rev:9688061,ord:16442},Zomato:{rev:6554375,ord:13526},Swiggy:{rev:4333733,ord:9828},Takeaway:{rev:152410,ord:396}}},
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
  },
  branchTargets: {
    Kothrud: { jan: 2200000, feb: 2200000, mar: 2200000, apr: 2200000, may: 2200000, jun: 2200000 },
    AUNDH: { jan: 1600000, feb: 1600000, mar: 1600000, apr: 1600000, may: 1600000, jun: 1600000 },
    'Salunkhe Vihar': { jan: 1300000, feb: 1300000, mar: 1300000, apr: 1300000, may: 1300000, jun: 1300000 },
    Saudagar: { jan: 1200000, feb: 1200000, mar: 1200000, apr: 1200000, may: 1200000, jun: 1200000 },
    'Wadgaon Sheri': { jan: 1200000, feb: 1200000, mar: 1200000, apr: 1200000, may: 1200000, jun: 1200000 },
    'Yolkshire Wakad': { jan: 1000000, feb: 1000000, mar: 1000000, apr: 1000000, may: 1000000, jun: 1000000 },
    Bavdhan: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 500000 }
  },
  pnlBenchmarks: {
    cogsPct: 25.0,
    laborPct: 18.0,
    rentPct: 15.0,
    commissionPctDelivery: 25.0,
    opsPct: 5.0,
    kptTarget: 10.0,
    profitPct: 20.0
  },
  marketBasket: {
    overview: {
      totalBaskets: 74445,
      multiItemPct: 64.1,
      totalRules: 6424,
      topLiftPair: 'Matcha & Iced Latte (116.5x)'
    },
    combos: [
      {
        id: 'c1',
        title: 'The Executive English Brunch',
        type: 'Breakfast & Brunch',
        typeTag: 'breakfast',
        items: ['Traditional / Special English Breakfast', 'Vietnamese Iced Coffee / Iced Latte / ABC Juice'],
        standalonePrice: 420,
        comboPrice: 379,
        discountPct: 10.0,
        cost: 94.50,
        profit: 284.50,
        marginPct: 75.1,
        aovUplift: '+45.8%',
        desc: 'Pairs high-volume breakfast mains with underselling specialty beverages.'
      },
      {
        id: 'c2',
        title: 'Gourmet Bowl & Brew Meal Deal',
        type: 'Lunch & Dinner',
        typeTag: 'main',
        items: ['Chicken Stroganoff or Roast Chicken', 'Peach Iced Tea / Mint Mojito / Fresh Watermelon Juice'],
        standalonePrice: 440,
        comboPrice: 389,
        discountPct: 11.5,
        cost: 82.00,
        profit: 307.00,
        marginPct: 78.9,
        aovUplift: '+25.5%',
        desc: 'Pairs #1 & #2 Star mains with 91.9% gross margin cold refreshers.'
      },
      {
        id: 'c3',
        title: 'Fit & Fresh Power Pair',
        type: 'Wellness & High Protein',
        typeTag: 'fit',
        items: ['Honey Glazed Chicken Salad (83.8% Margin)', 'Fresh ABC Juice / Green Smoothie'],
        standalonePrice: 460,
        comboPrice: 399,
        discountPct: 13.3,
        cost: 80.84,
        profit: 318.16,
        marginPct: 79.7,
        aovUplift: '+62.8%',
        desc: 'Drives volume for 2 underperforming high-margin items simultaneously.'
      },
      {
        id: 'c4',
        title: 'Sweet Escape Pancake & Coffee',
        type: 'Afternoon & Evening Snack',
        typeTag: 'sweet',
        items: ['Banana Nutella / Chocoburst Pancakes', 'Iced Mocha Latte / Hazelnut Frappe / Hot Chocolate'],
        standalonePrice: 380,
        comboPrice: 329,
        discountPct: 13.4,
        cost: 119.07,
        profit: 209.93,
        marginPct: 63.8,
        aovUplift: '+34.2%',
        desc: 'Leverages pancake popularity (Lift: 26.9x) to boost afternoon session AOV.'
      },
      {
        id: 'c5',
        title: 'Quick Bites & Sip Express',
        type: 'Delivery & Takeaway',
        typeTag: 'delivery',
        items: ['Classic Double Egg Roll / Bhuna Roll', 'Mint Lemonade / Lemon Iced Tea'],
        standalonePrice: 300,
        comboPrice: 249,
        discountPct: 17.0,
        cost: 56.51,
        profit: 192.49,
        marginPct: 77.3,
        aovUplift: '+24.5%',
        desc: 'High-velocity delivery bundle targeted under the ₹250 price barrier.'
      }
    ],
    puzzles: [
      { name: 'Mint Lemonade', cat: 'Beverages', price: 100, cost: 8.13, marginInr: 91.87, marginPct: 91.9, qty: 845, partner: 'Stroganoff / Roast Chicken' },
      { name: 'Honey Glazed Chicken Salad', cat: 'Salads & Sandwiches', price: 300, cost: 48.64, marginInr: 251.36, marginPct: 83.8, qty: 152, partner: 'ABC Juice / Iced Tea' },
      { name: 'Filter Coffee', cat: 'Beverages', price: 80, cost: 13.58, marginInr: 66.42, marginPct: 83.0, qty: 988, partner: 'Kerala Curry / Omelette' },
      { name: 'Ginger Lemon Honey Tea', cat: 'Beverages', price: 60, cost: 10.11, marginInr: 49.89, marginPct: 83.2, qty: 528, partner: 'Swadeshi Breakfast' },
      { name: 'Cappuccino / Latte', cat: 'Beverages', price: 150, cost: 26.02, marginInr: 123.98, marginPct: 82.7, qty: 497, partner: 'Creamy Mushroom Croissant' },
      { name: 'Thecha Eggs', cat: 'Salads & Sandwiches', price: 160, cost: 29.01, marginInr: 130.99, marginPct: 81.9, qty: 205, partner: 'Masala Chai / Filter Coffee' },
      { name: 'Iced Americano / Cold Brew', cat: 'Beverages', price: 130, cost: 23.65, marginInr: 106.35, marginPct: 81.8, qty: 445, partner: 'English Breakfast' },
      { name: 'Mocha Latte', cat: 'Beverages', price: 160, cost: 29.63, marginInr: 130.37, marginPct: 81.5, qty: 104, partner: 'Banana Nutella Pancake' },
      { name: 'Yolkshire Eggwich', cat: 'Salads & Sandwiches', price: 240, cost: 47.39, marginInr: 192.61, marginPct: 80.3, qty: 188, partner: 'Cold Coffee' },
      { name: 'Fresh ABC Juice', cat: 'Beverages', price: 160, cost: 32.20, marginInr: 127.80, marginPct: 79.9, qty: 221, partner: 'High Protein Millet Salad' },
      { name: 'Thai Basil Chicken with Rice', cat: 'Rice Bowls & Mains', price: 320, cost: 84.33, marginInr: 235.67, marginPct: 73.6, qty: 180, partner: 'Mint Mojito' },
      { name: 'High Protein Millet Salad', cat: 'Salads & Sandwiches', price: 280, cost: 75.05, marginInr: 204.95, marginPct: 73.2, qty: 218, partner: 'Fresh ABC Juice' }
    ],
    topRules: [
      { itemA: 'Chilli Garlic Glaze', itemB: 'Yolkshire Special Breakfast', coOcc: 2630, confA: 0.4175, confB: 0.7093, lift: 8.38 },
      { itemA: 'Chilli Garlic Glaze', itemB: 'Omelette', coOcc: 2288, confA: 0.3632, confB: 0.7343, lift: 8.68 },
      { itemA: 'Omelette', itemB: 'Yolkshire Special Breakfast', coOcc: 1870, confA: 0.6001, confB: 0.5043, lift: 12.05 },
      { itemA: 'Banana Nutella', itemB: 'Pancake', coOcc: 985, confA: 0.8930, confB: 0.3993, lift: 26.95 },
      { itemA: 'Chocoburst', itemB: 'Pancake', coOcc: 555, confA: 0.9158, confB: 0.2250, lift: 27.64 },
      { itemA: 'Cold Brew', itemB: 'Fresh Orange Juice', coOcc: 12, confA: 0.4286, confB: 1.0000, lift: 2658.75 },
      { itemA: 'Iced Latte', itemB: 'Matcha', coOcc: 16, confA: 0.0250, confB: 1.0000, lift: 116.50 },
      { itemA: 'Masala Omelette', itemB: 'Swadeshi Breakfast', coOcc: 281, confA: 1.0000, confB: 0.3461, lift: 91.68 },
      { itemA: 'Jane Say Cheese Omelette', itemB: 'Mushrooms', coOcc: 226, confA: 0.2640, confB: 1.0000, lift: 86.97 },
      { itemA: 'Chicken Stroganoff', itemB: 'Lemon Iced Tea', coOcc: 80, confA: 0.0790, confB: 0.1495, lift: 1.04 },
      { itemA: 'Chicken Mayo Sandwich', itemB: 'Cold Coffee', coOcc: 30, confA: 0.0320, confB: 0.0637, lift: 1.86 },
      { itemA: 'Special Roast Chicken', itemB: 'Mint Lemonade', coOcc: 37, confA: 0.0330, confB: 0.0438, lift: 1.83 },
      { itemA: 'Chimmichurri Chicken', itemB: 'Mint Lemonade', coOcc: 42, confA: 0.0500, confB: 0.0497, lift: 2.79 },
      { itemA: 'Crispy Fried Chicken', itemB: 'Toasted Garlic Bread', coOcc: 164, confA: 0.6979, confB: 0.1857, lift: 58.84 },
      { itemA: 'Ghee Roast Paratha', itemB: 'Extra Paratha', coOcc: 15, confA: 0.1500, confB: 0.0761, lift: 56.68 }
    ],
    catMatrix: [
      { catA: 'Rice Bowls & Mains', catB: 'Beverages', coOcc: 14250, lift: 2.8 },
      { catA: 'Breakfast & Eggs', catB: 'Beverages', coOcc: 12890, lift: 3.4 },
      { catA: 'Salads & Sandwiches', catB: 'Beverages', coOcc: 9450, lift: 2.1 },
      { catA: 'Pancakes & French Toast', catB: 'Beverages', coOcc: 5120, lift: 4.2 },
      { catA: 'Wholesome Rolls', catB: 'Beverages', coOcc: 4890, lift: 2.5 },
      { catA: 'Rice Bowls & Mains', catB: 'Salads & Sides', coOcc: 3820, lift: 1.9 }
    ]
  },
  q1: {
    totalRev: 17238158,
    totalOrd: 34197,
    aov: 504.08,
    monthly: {
      jan: { rev: 6240460, ord: 12201, aov: 511.47 },
      feb: { rev: 5186052, ord: 10358, aov: 500.68 },
      mar: { rev: 5811646, ord: 11638, aov: 499.37 }
    },
    branch: {
      Kothrud: { rev: 5118196, ord: 10057, aov: 508.9 },
      AUNDH: { rev: 3702194, ord: 7120, aov: 519.9 },
      'Salunkhe Vihar': { rev: 2365690, ord: 4428, aov: 534.2 },
      Saudagar: { rev: 2135474, ord: 4380, aov: 487.5 },
      'Wadgaon Sheri': { rev: 2255003, ord: 4897, aov: 460.4 },
      'Yolkshire Wakad': { rev: 1661599, ord: 3238, aov: 513.1 },
      Bavdhan: { rev: 0, ord: 0, aov: 0 }
    },
    channel: {
      'Dine In': { rev: 8419679, ord: 14218, aov: 592.1 },
      Zomato: { rev: 5462595, ord: 11822, aov: 462.0 },
      Swiggy: { rev: 3231966, ord: 7094, aov: 455.5 },
      Takeaway: { rev: 112157, ord: 280, aov: 400.5 }
    }
  },
  franchiseeEconomics: {
    capex: 4000000,
    targetEbitda5Yr: 8000000,
    targetPat5Yr: 6000000,
    targetMonthlyProfit: 200000,
    defaultCosts: {
      cogsPct: 25.0,
      laborPct: 18.0,
      rentPct: 12.0,
      deliveryCommissionPct: 25.0,
      royaltyPct: 5.0,
      opsPct: 5.0,
      dineInPct: 50.0,
      deliveryPct: 50.0,
      aov: 516
    },
    kothrudModel: {
      phase1: { name: 'Phase 1: Compact Micro Store', area: '450 sq ft', capex: 2500000, monthlySales: 2032000, ebitdaMargin: 23.5, monthlyProfit: 477520, staff: 6, rent: 120000, dineInPct: 58, deliveryPct: 42 },
      phase2: { name: 'Phase 2: Expanded Flagship Store', area: '1,100 sq ft', capex: 4000000, monthlySales: 2850000, ebitdaMargin: 25.2, monthlyProfit: 718200, staff: 11, rent: 220000, dineInPct: 65, deliveryPct: 35 },
      chainAvg: { name: 'Current Chain Average Store', area: '850 sq ft', capex: 3800000, monthlySales: 1480000, ebitdaMargin: 16.8, monthlyProfit: 248640, staff: 8, rent: 180000, dineInPct: 47, deliveryPct: 53 }
    }
  },
  dailySnapshot: {
    walkinsToday: 343,
    walkinsYesterday: 318,
    walkinConversionRate: 88.5,
    tableTurnoverRate: 4.3,
    ordersToday: 442,
    ordersYesterday: 426,
    channelBreakdown: {
      'Dine In': { orders: 181, rev: 106517, aov: 590 },
      Zomato: { orders: 149, rev: 72020, aov: 485 },
      Swiggy: { orders: 108, rev: 47623, aov: 441 },
      Takeaway: { orders: 4, rev: 1626, aov: 374 }
    },
    loyaltyToday: {
      newSignups: 32,
      signupsTrend: '+18%',
      loyaltyOrders: 146,
      loyaltySalesPct: 33.0,
      pointsRedeemed: 4250,
      repeatCustomerRate: 68.4
    },
    monthlyTarget: {
      targetRev: 7500000,
      achievedRev: 5240000,
      daysElapsed: 22,
      daysTotal: 30,
      remainingRev: 2260000,
      requiredDailyRunRate: 282500,
      currentDailyAvg: 238181,
      status: 'On Pace (93.1%)'
    },
    reviews: {
      avgRating: 4.68,
      totalReviewsToday: 24,
      positivePct: 92.4,
      breakdown: { 5: 18, 4: 4, 3: 2, 2: 0, 1: 0 },
      feed: [
        { id: 1, branch: 'Kothrud', channel: 'Dine In', customer: 'Kothrud Store Audit', rating: 5, time: 'Q2 Verified POS Data', comment: 'Highest performing store: ₹62.3L Q2 Net Sales. Dine-In AOV ₹597.', sentiment: 'positive' },
        { id: 2, branch: 'AUNDH', channel: 'Zomato', customer: 'Aundh Store Audit', rating: 5, time: 'Q2 Verified POS Data', comment: 'Strong growing store: ₹39.7L Q2 Net Sales. Zomato AOV ₹516.', sentiment: 'positive' },
        { id: 3, branch: 'Salunkhe Vihar', channel: 'Dine In', customer: 'Salunkhe Vihar Audit', rating: 5, time: 'Q2 Verified POS Data', comment: 'Highest chain AOV branch at ₹556. Premium customer basket size.', sentiment: 'positive' },
        { id: 4, branch: 'Bavdhan', channel: 'Dine In', customer: 'Bavdhan Store Audit', rating: 5, time: 'June Debut POS Data', comment: 'Debut month revenue ₹3.6L with highest launch AOV of ₹593.', sentiment: 'positive' },
        { id: 5, branch: 'Saudagar', channel: 'Swiggy', customer: 'Saudagar Audit', rating: 4, time: 'Q2 Verified POS Data', comment: 'Consistent ₹26.9L revenue. Delivery order wait time monitoring recommended.', sentiment: 'positive' },
        { id: 6, branch: 'Wadgaon Sheri', channel: 'Delivery', customer: 'Wadgaon Sheri Audit', rating: 3, time: 'Q2 Verified POS Data', comment: 'Revenue dip -15.3%. Operational audit active on kitchen order accuracy.', sentiment: 'neutral' }
      ]
    }
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
  Saudagar: { rev: 2687223, ord: 5108, aov: 526, status: 'Softening Demand', statusTag: 'warn', trend: '-3.6%', trendClass: 'trend-dn', monthly: [912300, 895100, 879823], channels: { 'Dine In': { rev: 1348100, ord: 2562, aov: 526 }, Zomato: { rev: 716312, ord: 1361, aov: 526 }, Swiggy: { rev: 610866, ord: 1161, aov: 526 }, Takeaway: { rev: 11945, ord: 498, aov: 498 } } },
  'Wadgaon Sheri': { rev: 2625305, ord: 5480, aov: 479, status: 'Urgent Action', statusTag: 'risk', trend: '-15.3%', trendClass: 'trend-dn', monthly: [942150, 885400, 797755], channels: { 'Dine In': { rev: 656100, ord: 1369, aov: 479 }, Zomato: { rev: 1166335, ord: 2434, aov: 479 }, Swiggy: { rev: 792394, ord: 1654, aov: 479 }, Takeaway: { rev: 10476, ord: 23, aov: 455 } } },
  'Yolkshire Wakad': { rev: 2166397, ord: 4359, aov: 497, status: 'Volatile', statusTag: 'warn', trend: '-27.0%', trendClass: 'trend-dn', monthly: [732959, 898357, 535081], channels: { 'Dine In': { rev: 777610, ord: 1564, aov: 497 }, Zomato: { rev: 886947, ord: 1784, aov: 497 }, Swiggy: { rev: 493440, ord: 993, aov: 497 }, Takeaway: { rev: 8400, ord: 18, aov: 467 } } },
  Bavdhan: { rev: 364186, ord: 614, aov: 593, status: 'New Debut (Jun)', statusTag: 'star', trend: 'N/A', trendClass: 'trend-up', monthly: [0, 0, 364186], channels: { 'Dine In': { rev: 275181, ord: 443, aov: 621 }, Zomato: { rev: 70662, ord: 119, aov: 594 }, Swiggy: { rev: 18343, ord: 52, aov: 353 }, Takeaway: { rev: 0, ord: 0, aov: 0 } } }
};
