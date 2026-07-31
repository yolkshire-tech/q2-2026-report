import './styles/main.css';
import Chart from 'chart.js/auto';
import { RAW, DAILY_REVENUE, BRANCH_PROFILES } from './data/dashboardData.js';
import { CHARTS, fmt, fmtN, hexToRgb, mkChart, updateChart, updateChartTheme } from './charts/chartManager.js';

let F = { branch: 'all', month: 'all', channel: 'all', session: 'all' };
let currentBranchProfile = 'Kothrud';
let bpCharts = {};
let modalChart = null;
let excludeNonMenu = false;
let activeCategorySelection = null;


const MENU_CATEGORIES = {
  'Beverages': [
    'Espresso', 'Americano', 'Cappuccino', 'Hazelnut Cappucino', 'Caramel Cappucino', 'Cinnamon Cappucino',
    'Latte', 'Hazelnut Latte', 'Caramel Latte', 'Cinnamon Latte', 'Filter Coffee', 'Mocha Latte',
    'Hot Chocolate', 'Chocolate Shake', 'Cold Coffee', 'Iced Americano', 'Iced Latte', 'Hazelnut Iced Latte',
    'Caramel Iced Latte', 'Cinnamon Iced Latte', 'Iced Mocha Latte', 'Vietnamese Cold Coffee', 'Hazelnut Frappe',
    'Caramel Frappe', 'Cinnamon Frappe', 'Masala Chai', 'Ginger Lemon Honey Tea', 'Green Tea', 'Lemon Ice Tea',
    'Peach Ice Tea', 'Berry Smoothie', 'Tropical Smoothie', 'Green Smoothie', 'Choco-Banana Smoothie',
    'Mint Lemonade', 'Mint Lemon Slush', 'Mint Mojito', 'Pineapple Juice', 'Watermelon Juice', 'ABC Juice'
  ],
  'Eggs': [
    'Devilled Eggs', 'Fried Eggs', 'Poached Eggs', 'French Omelette', 'Creamy Scramble',
    'Potpourri Paneer Omelette', 'Potpourri Chicken Omelette', 'Italian Reve Chicken Omelette', 'Italian Reve Prawns Omelette',
    'Classic Masala Omelette', 'Omelette Florentine', 'Creamy Mushroom Omelette', 'Goan Ros Omelette',
    'Loaded Veggie Farmhouse Feast', 'Peri-Peri Paneer Omelette', 'Peri-Peri Chicken Omelette', 'Peri-Peri Prawns Omelette',
    'Pesto Paneer Omelette', 'Pesto Chicken Omelette', 'Mexican Fajita Scramble', 'Parsi Akuri', 'Egg Bhurji',
    'Paneer Bhurji', 'Cheesy Bacon Scramble', 'BBQ Chicken Scramble', 'Piperade Scramble', 'Masala Baked Beans & Eggs',
    'Eggs Benedict', 'Shakshuka', 'Turkish Eggs'
  ],
  'Signature Breakfast': [
    'Yolkshire English Breakfast Half-Fried', 'Yolkshire English Breakfast Scramble', 'Yolkshire English Breakfast Omelette',
    'Swadeshi Breakfast Egg Bhurji', 'Swadeshi Breakfast Parsi Akuri', 'Classic Bacon Breakfast Scramble',
    'Classic Bacon Breakfast Cheese Omelette', 'Veggie Brekky'
  ],
  'Desserts': [
    'Butter & Syrup French Toast', 'Chocoburst French Toast', 'Banana Nutella French Toast',
    'Butter & Syrup Pancakes', 'Chocoburst Pancakes', 'Banana Nutella Pancakes',
    'Caramel Pudding', 'Basque Cheesecake'
  ],
  'Salads & Sandwiches': [
    'High Protein Millet Salad with Grilled Paneer', 'Low-Cal Grilled Chicken & Zuccini Salad',
    'Caesar Salad - Chicken', 'Caesar Salad - Paneer', 'Orange & Chicken Salad', 'Honey Glazed Chicken Salad',
    'BBQ Chicken Croissant', 'Creamy Mushroom Croissant', 'Chicken Avalanche Croissant',
    'Bhurji Mayo Sandiwch', 'Chicken Mayo Sandwich', 'Bombay Masala Sandwich', 'Yolkshire Eggwich',
    'OG Omelette Pav', 'Thecha Eggs'
  ],
  'Wholesome Rolls': [
    'Classic Double Egg Roll', 'Bhuna Roll - Chicken', 'Bhuna Roll - Paneer',
    'Malai Roll - Chicken', 'Malai Roll - Paneer', 'Hakuna Matata Roll'
  ],
  'Pastas': [
    'Signature Mac & Cheese Pasta', 'Veg Alfredo Pasta', 'Chicken Alfredo Pasta',
    'Veg Arrabiatta Pasta', 'Chicken Arrabiatta Pasta', 'Pink Primavera Pasta', 'Basil Pesto Pasta'
  ],
  'Rice Bowls & Mains': [
    'Chicken Stroganoff', 'Low-Carb Chicken Stroganoff', 'Thai Basil Chicken with Rice',
    'Yolkshire Special Roast Chicken', 'Anda Masala with Paratha', 'Anda Masala with Rice',
    'Peri-Peri Paneer Steak', 'Peri-Peri Chicken Steak', 'Egg Fried Rice',
    'Kerala Paneer Curry with Rice', 'Kerala Chicken Curry with Rice', 'Paprika Chicken with Rice',
    'Paneer Ghee Roast with Paratha', 'Egg Ghee Roast with Paratha', 'Chicken Ghee Roast with Paratha',
    'Prawns Ghee Roast with Paratha', 'Spicy Butter Garlic Prawns', 'Chimmichurri Grilled Chicken', 'Kheema Wow'
  ],
  'Small Plates': [
    'Chicken Sausages', 'Crispy Bacon Strips', 'Mashed Potatoes', 'Baked Beans on Toast',
    'Creamy Mushroom on Toast', 'Crispy Hash Browns (3 pcs)', 'Grilled Chicken Breast',
    'Boiled Egg Chaat', 'French Fries (Salted/Peri-Peri)', 'Cheese Chilli Toast', 'Garlic Bread',
    'Tossed Veggies & Roasted Mushrooms', 'Spicy Grilled Prawns (4 pcs)'
  ],
  'Addons': [
    'Add Egg', 'Boiled Eggs', 'Add Veggies', 'Add Paneer', 'Add Chicken', 'Add Cheese', 'Add Bacon', 'Add Prawns',
    'Add Protein Powder Scoop', 'Extra Wheat Toast', 'Extra Sourdough Toast', 'Extra Pav', 'Extra Paratha',
    'Extra Rice', 'Make it Egg White', 'Cook in Olive Oil', 'Cook in Butter', 'Butter Croissant', 'Chocolate Croissant'
  ],
  'Kids Menu': [
    'Mini Mac & Cheese', 'French Toast Sticks', 'Kids French Fries', 'Cheesy Mashed Potato',
    'Cheese Omelette', 'Kids Hot Chocolate', 'Kids Chocolate Shake'
  ],
  'Delivery Combos': [
    'OG Omelette Pav + Masala Chai', 'Egg Bhurji Pav + Masala Chai', 'Peri-Peri Chicken Omelette + Cold Coffee',
    'Egg Fried Rice + Lemon Iced Tea', 'Chicken Bhuna Roll + Cold Coffee', 'Chicken Stroganoff + Garlic Bread'
  ],
  'Non-Menu / Misc': [
    'Packaged Water Bottle', 'Carry Bag / Packaging Fee', 'Restaurant Packaging Charges', 'Cutlery Set'
  ]
};


function getAllMenuItems() {
  const all = [];
  Object.values(MENU_CATEGORIES).forEach(items => all.push(...items));
  return all;
}

function getNonMenuItems() {
  return ['Packaged Water Bottle', 'Carry Bag / Packaging Fee', 'Restaurant Packaging Charges', 'Cutlery Set'];
}



function initCategorySelection() {
  if (!activeCategorySelection) {
    activeCategorySelection = new Set(getAllMenuItems());
  }
}

// Modal Functions
export function openModal(title, chartId) {
  document.getElementById('modal-title').textContent = title;
  const overlay = document.getElementById('modal-overlay');
  const chartWrap = document.getElementById('modal-chart-wrap');
  const tableWrap = document.getElementById('modal-table-wrap');
  tableWrap.innerHTML = '';
  chartWrap.style.display = 'none';

  if (modalChart) {
    modalChart.destroy();
    modalChart = null;
  }

  if (chartId && CHARTS[chartId]) {
    chartWrap.style.display = 'block';
    const origChart = CHARTS[chartId];
    modalChart = new Chart(document.getElementById('modal-canvas'), {
      type: origChart.config.type,
      data: JSON.parse(JSON.stringify(origChart.data)),
      options: {
        ...JSON.parse(JSON.stringify(origChart.options)),
        responsive: true,
        maintainAspectRatio: false
      }
    });
    tableWrap.innerHTML = buildChartTable(origChart, chartId);
  }
  overlay.classList.add('open');
}

export function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  if (modalChart) {
    modalChart.destroy();
    modalChart = null;
  }
}

export function showInfoModal(title, hintText) {
  document.getElementById('modal-title').textContent = '💡 How to Read: ' + title;
  const overlay = document.getElementById('modal-overlay');
  const chartWrap = document.getElementById('modal-chart-wrap');
  const tableWrap = document.getElementById('modal-table-wrap');
  chartWrap.style.display = 'none';

  if (modalChart) {
    modalChart.destroy();
    modalChart = null;
  }

  tableWrap.innerHTML = `
    <div style="background:var(--bg3);padding:18px;border-radius:12px;border-left:4px solid var(--primary);line-height:1.6">
      <h4 style="font-size:14px;color:var(--primary);margin-bottom:8px">Executive Insights & Layman's Guide</h4>
      <p style="font-size:13px;color:var(--text);margin-bottom:12px">${hintText}</p>
      <div style="font-size:11px;color:var(--muted);border-top:1px solid var(--border);padding-top:8px">
        <strong>💡 Key Takeaway for Decision Making:</strong> Use this metric to determine whether sales growth is coming from higher volume, menu pricing power, or specific operational channels.
      </div>
    </div>
  `;
  overlay.classList.add('open');
}

export function toggleNonMenuFilter() {
  excludeNonMenu = !excludeNonMenu;
  const btn = document.getElementById('btn-exclude-nonmenu');
  if (btn) {
    btn.textContent = excludeNonMenu ? '💧 Exclude Water/Misc (ON)' : '💧 Exclude Water/Misc (OFF)';
    btn.style.background = excludeNonMenu ? 'var(--primary)' : 'var(--bg2)';
    btn.style.color = excludeNonMenu ? 'var(--bg)' : 'var(--text)';
    btn.style.borderColor = excludeNonMenu ? 'var(--primary)' : 'var(--border)';
  }
  refresh();
}

function buildChartTable(chart, chartId) {
  if (chartId && (chartId.startsWith('c-top') || chartId.startsWith('c-me') || chartId.startsWith('c-grow') || chartId.startsWith('c-decl') || chartId.startsWith('c-menu'))) {
    return buildMenuCatalogModalHtml();
  }

  if (!chart || !chart.data) return '';
  const labels = chart.data.labels || [];
  const datasets = chart.data.datasets || [];
  let html = '<table class="tbl"><tr><th>Label</th>';
  datasets.forEach(ds => { html += `<th>${ds.label || 'Value'}</th>`; });
  html += '</tr>';
  labels.forEach((lbl, ri) => {
    html += `<tr><td>${lbl}</td>`;
    datasets.forEach(ds => {
      const v = ds.data[ri];
      const numV = typeof v === 'object' && v !== null ? (v.y || v.x || 0) : v;
      html += `<td>${typeof numV === 'number' && numV > 999 ? fmt(numV) : numV}</td>`;
    });
    html += '</tr>';
  });
  return html + '</table>';
}

export function toggleTheme() {
  const isLight = document.body.classList.toggle('light-mode');
  document.getElementById('theme-icon').textContent = isLight ? '🌙' : '☀️';
  document.getElementById('theme-text').textContent = isLight ? 'Dark Mode' : 'Light Mode';
  const tc = isLight ? '#665c61' : '#a3979d';
  const gc = isLight ? 'rgba(43,36,40,.08)' : 'rgba(252,240,208,.06)';
  const tb = isLight ? '#F5E9C9' : '#362E33';
  const tbd = isLight ? '#DFD0AA' : '#43393F';
  const tt = isLight ? '#2B2428' : '#FCF0D0';

  updateChartTheme(isLight);

  Object.values(CHARTS).forEach(chart => {
    if (chart.options.scales) {
      ['x', 'y', 'y2'].forEach(ax => {
        if (chart.options.scales[ax]) {
          if (chart.options.scales[ax].ticks) chart.options.scales[ax].ticks.color = tc;
          if (chart.options.scales[ax].grid) chart.options.scales[ax].grid.color = gc;
        }
      });
    }
    if (chart.options.plugins?.tooltip) {
      chart.options.plugins.tooltip.backgroundColor = tb;
      chart.options.plugins.tooltip.borderColor = tbd;
      chart.options.plugins.tooltip.titleColor = tt;
      chart.options.plugins.tooltip.bodyColor = tc;
    }
    if (chart.options.plugins?.legend?.labels) chart.options.plugins.legend.labels.color = tt;
    chart.update('none');
  });
  drawHeatmap();
}


function getFilteredData() {
  initCategorySelection();
  const { branch, month, channel, session } = F;
  const result = {};
  let rev = 20728578, ord = 40193, aov = 515.73;

  // 1. Month Filter Calculation
  if (month !== 'all') {
    const md = RAW.month[month];
    if (md) {
      rev = md.rev;
      ord = md.ord;
      aov = md.aov;
    }
  }

  // 2. Branch Filter Calculation
  if (branch !== 'all') {
    const bd = RAW.branch[branch];
    if (bd) {
      if (month !== 'all' && RAW.month[month]?.br?.[branch] !== undefined) {
        rev = RAW.month[month].br[branch];
        ord = Math.round(bd.ord * (rev / (bd.rev || 1)));
      } else {
        rev = bd.rev;
        ord = bd.ord;
      }
      aov = bd.aov;
    }
  }

  // 3. Channel Filter Calculation
  if (channel !== 'all') {
    if (channel === 'Delivery') {
      const zRev = RAW.channel.Zomato.rev;
      const sRev = RAW.channel.Swiggy.rev;
      const delShare = (RAW.channel.Zomato.share + RAW.channel.Swiggy.share) / 100;
      rev = Math.round(rev * delShare);
      ord = Math.round(ord * delShare);
      aov = Math.round((RAW.channel.Zomato.aov + RAW.channel.Swiggy.aov) / 2);
    } else {
      const chData = RAW.channel[channel];
      if (chData) {
        if (branch !== 'all' && RAW.branch[branch]?.ch?.[channel]) {
          rev = RAW.branch[branch].ch[channel].rev;
          ord = RAW.branch[branch].ch[channel].ord;
        } else {
          rev = Math.round(rev * (chData.share / 100));
          ord = Math.round(ord * (chData.share / 100));
        }
        aov = chData.aov;
      }
    }
  }

  // 4. Session Filter Calculation
  const sessionShares = {
    all: 1.0,
    breakfast: 0.273, // 27.3%
    lunch: 0.303,     // 30.3%
    snack: 0.093,     // 9.3%
    dinner: 0.331     // 33.1%
  };
  const sessionFactor = sessionShares[session] || 1.0;
  rev = Math.round(rev * sessionFactor);
  ord = Math.round(ord * sessionFactor);

  // 5. Non-Menu & Category Filters
  const nonMenuFactor = excludeNonMenu ? 0.978 : 1.0;
  const totalItemsCount = getAllMenuItems().length;
  const selectedCount = activeCategorySelection ? activeCategorySelection.size : totalItemsCount;
  const categoryFactor = totalItemsCount > 0 ? (selectedCount / totalItemsCount) : 1;

  rev = Math.round(rev * nonMenuFactor * categoryFactor);
  ord = Math.round(ord * nonMenuFactor * categoryFactor);

  const overallBaseRev = 20728578;
  const scale = rev / overallBaseRev;

  result.rev = rev; result.ord = ord; result.aov = Math.round(aov);
  result.daily = Math.round(rev / (month === 'jan' || month === 'mar' || month === 'may' ? 31 : month === 'feb' ? 28 : month === 'apr' || month === 'jun' ? 30 : 91));

  // Branch Revenues
  result.branchRevs = RAW.branches.map(b => {
    let bRev = RAW.branch[b].rev;
    if (month !== 'all' && RAW.month[month]?.br?.[b] !== undefined) bRev = RAW.month[month].br[b];
    if (channel === 'Delivery') bRev = Math.round(bRev * 0.525);
    else if (channel !== 'all' && RAW.branch[b]?.ch?.[channel]) bRev = RAW.branch[b].ch[channel].rev;
    return Math.round(bRev * sessionFactor * nonMenuFactor * categoryFactor);
  });

  result.branchColors = RAW.branches.map((b, i) => {
    if (branch !== 'all') return b === branch ? RAW.branchColors[i] : `rgba(${hexToRgb(RAW.branchColors[i])},0.25)`;
    return RAW.branchColors[i];
  });

  // Channel Revenues
  result.chRevs = RAW.channels.map((c, i) => {
    let cRev = RAW.channel[c].rev;
    if (branch !== 'all' && RAW.branch[branch]?.ch?.[c]) cRev = RAW.branch[branch].ch[c].rev;
    if (channel !== 'all') {
      if (channel === 'Delivery') cRev = (c === 'Zomato' || c === 'Swiggy') ? cRev : 0;
      else cRev = (c === channel) ? cRev : 0;
    }
    return Math.round(cRev * (month !== 'all' ? (RAW.month[month]?.rev || 20728578) / 20728578 : 1) * sessionFactor * nonMenuFactor * categoryFactor);
  });

  result.chColors = RAW.channels.map((c, i) => {
    if (channel === 'Delivery') return (c === 'Zomato' || c === 'Swiggy') ? RAW.channelColors[i] : `rgba(${hexToRgb(RAW.channelColors[i])},0.2)`;
    if (channel !== 'all') return c === channel ? RAW.channelColors[i] : `rgba(${hexToRgb(RAW.channelColors[i])},0.2)`;
    return RAW.channelColors[i];
  });

  // Monthly Trend Revenues
  if (branch !== 'all') {
    const bd = RAW.branch[branch];
    result.monthlyRevs = [bd.apr, bd.may, bd.jun].map(v => Math.round(v * sessionFactor * nonMenuFactor * categoryFactor));
  } else {
    result.monthlyRevs = [RAW.month.apr.rev, RAW.month.may.rev, RAW.month.jun.rev].map(v => Math.round(v * sessionFactor * nonMenuFactor * categoryFactor));
  }

  result.monthColors = ['apr', 'may', 'jun'].map((m, i) => {
    if (month !== 'all') return m === month ? ['#E7BA44', '#56754d', '#9c5f59'][i] : 'rgba(163,151,157,0.3)';
    return ['#E7BA44', '#56754d', '#9c5f59'][i];
  });

  // Sessions
  const sessMap = { breakfast: 5663273, lunch: 6275153, snack: 1918526, dinner: 6856676 };
  result.sessRevs = ['breakfast', 'lunch', 'snack', 'dinner'].map(s => {
    let r = sessMap[s];
    if (session !== 'all' && s !== session) r = 0;
    return Math.round(r * (rev / (20728578 * sessionFactor)));
  });

  result.sessOrds = result.sessRevs.map((r, i) => Math.round(r / (fd_aov(i) || 480)));
  function fd_aov(i) { return [510, 530, 470, 540][i]; }

  const sessColors = ['#E7BA44', '#5985b9', '#907aa9', '#56754d'];
  result.sessColors = ['breakfast', 'lunch', 'snack', 'dinner'].map((s, i) => {
    if (session !== 'all') return s === session ? sessColors[i] : `rgba(${hexToRgb(sessColors[i])},0.2)`;
    return sessColors[i];
  });

  const sessionHours = { all: null, breakfast: [7, 8, 9, 10], lunch: [11, 12, 13, 14], snack: [15, 16, 17], dinner: [18, 19, 20, 21, 22, 23] };
  result.activeHours = sessionHours[session];
  result.branchAOVs = RAW.branches.map(b => RAW.branch[b].aov);
  result.branchAOVColors = RAW.branches.map((b, i) => {
    if (branch !== 'all') return b === branch ? RAW.branchColors[i] : `rgba(${hexToRgb(RAW.branchColors[i])},0.25)`;
    return RAW.branchColors[i];
  });
  result.chAOVs = RAW.channels.map(c => RAW.channel[c].aov);
  result.chAOVColors = RAW.channels.map((c, i) => {
    if (channel === 'Delivery') return (c === 'Zomato' || c === 'Swiggy') ? RAW.channelColors[i] : `rgba(${hexToRgb(RAW.channelColors[i])},0.25)`;
    if (channel !== 'all') return c === channel ? RAW.channelColors[i] : `rgba(${hexToRgb(RAW.channelColors[i])},0.25)`;
    return RAW.channelColors[i];
  });

  // Day of week distribution
  result.dRev = RAW.dRev.map(v => Math.round(v * scale));

  // Filter Daily Revenue Trend by selected Month
  let rawDailySlice = DAILY_REVENUE;
  let periodBase = overallBaseRev;
  if (month === 'apr') { rawDailySlice = DAILY_REVENUE.slice(0, 30); periodBase = RAW.month.apr.rev; }
  else if (month === 'may') { rawDailySlice = DAILY_REVENUE.slice(30, 61); periodBase = RAW.month.may.rev; }
  else if (month === 'jun') { rawDailySlice = DAILY_REVENUE.slice(61, 91); periodBase = RAW.month.jun.rev; }
  else if (month === 'q1') { periodBase = RAW.q1.totalRev; }
  const periodScale = rev / (periodBase || 1);

  result.dailyTrend = rawDailySlice.map(d => ({ date: d.date, rev: Math.round(d.rev * periodScale), ma: Math.round(d.ma * periodScale) }));


  // Hourly arrays
  result.hRev = RAW.hRev.map((v, h) => {
    const isHourActive = !result.activeHours || result.activeHours.includes(RAW.hours[h]);
    return isHourActive ? Math.round(v * scale) : 0;
  });
  result.hOrd = RAW.hOrd.map((v, h) => {
    const isHourActive = !result.activeHours || result.activeHours.includes(RAW.hours[h]);
    return isHourActive ? Math.round(v * scale) : 0;
  });

  // Menu items filtering
  const nonMenuItemsSet = new Set(getNonMenuItems());
  result.top10rItems = [];
  result.top10rRevs = [];
  RAW.top10Items.forEach((item, i) => {
    const isNon = nonMenuItemsSet.has(item);
    if ((!excludeNonMenu || !isNon) && activeCategorySelection.has(item)) {
      result.top10rItems.push(item);
      result.top10rRevs.push(Math.round(RAW.top10Rev[i] * scale));
    }
  });

  result.top10qItems = [];
  result.top10qQtys = [];
  RAW.top10QtyItems.forEach((item, i) => {
    const isNon = nonMenuItemsSet.has(item);
    if ((!excludeNonMenu || !isNon) && activeCategorySelection.has(item)) {
      result.top10qItems.push(item);
      result.top10qQtys.push(Math.round(RAW.top10Qty[i] * scale));
    }
  });

  result.mePoints = RAW.mePoints.filter(p => {
    const isNon = nonMenuItemsSet.has(p.item);
    return (!excludeNonMenu || !isNon) && activeCategorySelection.has(p.item);
  }).map(p => ({ ...p, x: Math.round(p.x * scale), y: Math.round(p.y * scale) }));

  // Category Revenue Share Calculation
  const catRevs = {};
  Object.keys(MENU_CATEGORIES).forEach(cat => {
    let cRev = 0;
    MENU_CATEGORIES[cat].forEach(item => {
      if (excludeNonMenu && nonMenuItemsSet.has(item)) return;
      if (activeCategorySelection && !activeCategorySelection.has(item)) return;
      const mePoint = RAW.mePoints.find(p => p.item === item);
      cRev += mePoint ? mePoint.y : 65000;
    });
    if (cRev > 0) catRevs[cat] = Math.round(cRev * scale);
  });
  result.catLabels = Object.keys(catRevs);
  result.catRevs = Object.values(catRevs);

  // Price Tier Bucket Calculation
  const priceTiers = { '<₹150': 0, '₹150-250': 0, '₹250-350': 0, '₹350-500': 0, '₹500+': 0 };
  RAW.mePoints.forEach(p => {
    if (excludeNonMenu && nonMenuItemsSet.has(p.item)) return;
    if (activeCategorySelection && !activeCategorySelection.has(p.item)) return;
    const price = p.y / (p.x || 1);
    if (price < 150) priceTiers['<₹150'] += Math.round(p.x * scale);
    else if (price < 250) priceTiers['₹150-250'] += Math.round(p.x * scale);
    else if (price < 350) priceTiers['₹250-350'] += Math.round(p.x * scale);
    else if (price < 500) priceTiers['₹350-500'] += Math.round(p.x * scale);
    else priceTiers['₹500+'] += Math.round(p.x * scale);
  });
  result.priceTierLabels = Object.keys(priceTiers);
  result.priceTierQtys = Object.values(priceTiers);


  // Target & PnL
  let targetRev = 0;
  RAW.branches.forEach(b => {
    if (branch !== 'all' && b !== branch) return;
    const bTargets = RAW.branchTargets[b] || { apr: 0, may: 0, jun: 0 };
    if (month === 'apr' || month === 'may' || month === 'jun') targetRev += (bTargets[month] || 0);
    else targetRev += (bTargets.apr + bTargets.may + bTargets.jun);
  });
  if (channel === 'Delivery') targetRev = Math.round(targetRev * 0.525);
  else if (channel !== 'all') targetRev = Math.round(targetRev * (RAW.channel[channel].share / 100));
  targetRev = Math.round(targetRev * sessionFactor);

  result.targetRev = targetRev;
  result.actualRev = rev;
  result.variancePct = targetRev > 0 ? ((rev / targetRev) * 100).toFixed(1) : '100.0';
  result.varianceVal = rev - targetRev;

  // PnL Expenses
  result.cogs = Math.round(rev * 0.30);
  result.labor = Math.round(rev * 0.18);
  result.rent = Math.round(rev * 0.15);
  const deliveryShare = channel === 'Delivery' ? 1.0 : channel === 'Zomato' || channel === 'Swiggy' ? 1.0 : channel === 'Dine In' || channel === 'Takeaway' ? 0.0 : 0.5253;
  result.commissions = Math.round(rev * deliveryShare * 0.25);
  result.ops = Math.round(rev * 0.05);

  result.totalOpEx = result.cogs + result.labor + result.rent + result.commissions + result.ops;
  result.netProfit = rev - result.totalOpEx;
  result.ebitdaMargin = rev > 0 ? ((result.netProfit / rev) * 100).toFixed(1) : '0.0';

  return result;
}

function buildContextLabel() {
  const parts = [];
  if (F.branch !== 'all') parts.push(F.branch);
  if (F.month !== 'all') {
    const monthLabels = { jan: 'January 2026', feb: 'February 2026', mar: 'March 2026', q1: 'Q1 2026 (Jan-Mar)', q2: 'Q2 2026 (Apr-Jun)', apr: 'April 2026', may: 'May 2026', jun: 'June 2026' };
    parts.push(monthLabels[F.month] || F.month);
  }
  if (F.channel !== 'all') parts.push(F.channel === 'Delivery' ? 'Delivery Only (Zomato+Swiggy)' : F.channel);
  if (F.session !== 'all') parts.push({ breakfast: 'Breakfast (7-10)', lunch: 'Lunch (11-14)', snack: 'Snack (15-17)', dinner: 'Dinner (18-23)' }[F.session]);
  if (excludeNonMenu) parts.push('Food & Drink Only');
  const selCount = activeCategorySelection ? activeCategorySelection.size : getAllMenuItems().length;
  if (selCount < getAllMenuItems().length) parts.push(`${selCount} Menu Items Selected`);

  return parts.length ? 'Filtered: ' + parts.join(' · ') : 'Showing: All Q1 + Q2 2026 Data · 40,193 orders';
}

function updateFilterStyles() {
  ['f-branch', 'f-month', 'f-channel', 'f-session'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('filter-active', el.value !== 'all');
  });
}

function updateKPIs(fd) {
  const setEl = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

  // Page 0
  setEl('k-rev', fmt(fd.rev));
  setEl('k-rev-sub', fmtN(fd.ord) + ' orders');
  setEl('k-ord', fmtN(fd.ord));
  setEl('k-ord-sub', (fd.ord / (F.month === 'all' ? 91 : 30)).toFixed(0) + '/day avg');
  setEl('k-aov', '₹' + fd.aov);
  setEl('k-daily', fmt(fd.daily));

  if (F.branch !== 'all') {
    const bd = RAW.branch[F.branch];
    setEl('k-branch', F.branch);
    setEl('k-branch-sub', fmt(bd.rev) + ' · ' + bd.share + '%');
  } else {
    setEl('k-branch', 'Kothrud');
    setEl('k-branch-sub', '₹62.3L · 30.1%');
  }

  // Page 3
  setEl('k-bill-max', fmt(Math.round(28800 * (fd.rev / 20728578))));
  setEl('k-bill-med', '₹' + Math.round(420 * (fd.aov / 516)));
  setEl('k-bill-mean', '₹' + fd.aov);
  setEl('k-bill-75', '₹' + Math.round(651 * (fd.aov / 516)));

  // Page 5
  setEl('k-ch-off-rev', fmt(fd.chRevs[0] + fd.chRevs[3]));
  setEl('k-ch-on-rev', fmt(fd.chRevs[1] + fd.chRevs[2]));
  setEl('k-ch-aov-comp', `₹${fd.chAOVs[0]} vs ₹${Math.round((fd.chAOVs[1] + fd.chAOVs[2]) / 2)}`);
  setEl('k-ch-zs-comp', `${fmt(fd.chRevs[1])} vs ${fmt(fd.chRevs[2])}`);

  // Page 7 (Kothrud Playbook)
  setEl('k-kothrud-rev', fmt(Math.round(RAW.branch.Kothrud.rev * (fd.rev / 20728578))));

  // Page 8
  setEl('k-q1q2-rev', '+' + ((fd.rev / (RAW.q1.totalRev * (fd.rev / 20728578)) - 1) * 100).toFixed(1) + '%');
  setEl('k-q1q2-vol', fmtN(fd.ord));
  setEl('k-q1q2-aov', '₹' + fd.aov);

  // Page 12 (PnL)
  setEl('k-pnl-target', fmt(fd.targetRev));
  setEl('k-pnl-actual', fmt(fd.actualRev));
  setEl('k-pnl-var', fd.variancePct + '%');
  setEl('k-pnl-var-sub', (fd.varianceVal >= 0 ? '+' : '') + fmt(fd.varianceVal) + ' vs target');
  setEl('k-pnl-opex', fmt(fd.totalOpEx));
  setEl('k-pnl-opex-sub', (fd.actualRev > 0 ? ((fd.totalOpEx / fd.actualRev) * 100).toFixed(1) : '0') + '% of revenue');
  setEl('k-pnl-profit', fmt(fd.netProfit));
  setEl('k-pnl-margin', fd.ebitdaMargin + '% EBITDA Margin');
}

function renderTables(fd) {
  // Page 4: Staffing Guide Table
  const staffingTbl = document.getElementById('tbl-staffing');
  if (staffingTbl) {
    const scale = fd.rev / 20728578;
    staffingTbl.innerHTML = `
      <tr><th>Hour</th><th>Daily Orders</th><th>Load</th><th>Min Staff</th></tr>
      <tr style="${F.session === 'breakfast' ? 'background:rgba(231,186,68,0.15);font-weight:700' : ''}"><td>7 AM</td><td>${Math.round(12 * scale)}</td><td><div class="load-cell"><div class="load-bar-wrap"><div class="load-bar-fill" style="width:29%;background:var(--green)"></div></div>29%</div></td><td style="font-weight:700">3</td></tr>
      <tr style="${F.session === 'breakfast' ? 'background:rgba(231,186,68,0.15);font-weight:700' : ''}"><td>8 AM</td><td>${Math.round(26 * scale)}</td><td><div class="load-cell"><div class="load-bar-wrap"><div class="load-bar-fill" style="width:64%;background:var(--amber)"></div></div>64%</div></td><td style="font-weight:700">5-6</td></tr>
      <tr style="${F.session === 'breakfast' ? 'background:rgba(231,186,68,0.15);font-weight:700' : ''}"><td>9 AM</td><td>${Math.round(37 * scale)}</td><td><div class="load-cell"><div class="load-bar-wrap"><div class="load-bar-fill" style="width:90%;background:var(--red)"></div></div>90%</div></td><td style="font-weight:700">7-8</td></tr>
      <tr style="${F.session === 'breakfast' ? 'background:rgba(231,186,68,0.15);font-weight:700' : ''}"><td>10 AM</td><td>${Math.round(41 * scale)}</td><td><div class="load-cell"><div class="load-bar-wrap"><div class="load-bar-fill" style="width:100%;background:var(--red)"></div></div>100%</div></td><td style="font-weight:700">8</td></tr>
      <tr style="${F.session === 'snack' ? 'background:rgba(144,122,169,0.15);font-weight:700' : ''}"><td>3-5 PM</td><td>${Math.round(12 * scale)}</td><td><div class="load-cell"><div class="load-bar-wrap"><div class="load-bar-fill" style="width:32%;background:var(--green)"></div></div>32%</div></td><td style="font-weight:700">3</td></tr>
      <tr style="${F.session === 'dinner' ? 'background:rgba(86,117,77,0.15);font-weight:700' : ''}"><td>9 PM</td><td>${Math.round(34 * scale)}</td><td><div class="load-cell"><div class="load-bar-wrap"><div class="load-bar-fill" style="width:83%;background:var(--red)"></div></div>83%</div></td><td style="font-weight:700">6-7</td></tr>
    `;
  }

  // Page 4: Branch Scorecard Table
  const scorecardTbl = document.getElementById('tbl-scorecard');
  if (scorecardTbl) {
    let html = `<tr><th onclick="sortTable('tbl-scorecard',0)">Branch</th><th onclick="sortTable('tbl-scorecard',1)">Revenue</th><th onclick="sortTable('tbl-scorecard',2)">AOV</th><th onclick="sortTable('tbl-scorecard',3)">Trend</th><th onclick="sortTable('tbl-scorecard',4)">Status</th></tr>`;
    RAW.branches.forEach(b => {
      if (F.branch !== 'all' && b !== F.branch) return;
      const bp = BRANCH_PROFILES[b];
      const bRev = Math.round(RAW.branch[b].rev * (fd.rev / 20728578));
      const tc = bp.trendClass === 'trend-up' ? 'trend-up' : 'trend-dn';
      html += `<tr><td><strong>${b}</strong></td><td>${fmt(bRev)}</td><td>₹${bp.aov}</td><td class="${tc}">${bp.trend}</td><td><span class="tag ${bp.statusTag}">${bp.status}</span></td></tr>`;
    });
    scorecardTbl.innerHTML = html;
  }

  // Page 5: Branch Channel Comparison Matrix
  const matrixTbl = document.getElementById('ch-matrix-tbl');
  if (matrixTbl) {
    let html = `
      <tr>
        <th onclick="sortTable('ch-matrix-tbl',0)">Branch</th><th onclick="sortTable('ch-matrix-tbl',1)">Total Rev</th><th onclick="sortTable('ch-matrix-tbl',2)">Offline Rev</th><th onclick="sortTable('ch-matrix-tbl',3)">Online Rev</th><th onclick="sortTable('ch-matrix-tbl',4)">Offline%</th><th onclick="sortTable('ch-matrix-tbl',5)">Zomato Rev</th><th onclick="sortTable('ch-matrix-tbl',6)">Swiggy Rev</th><th onclick="sortTable('ch-matrix-tbl',7)">Z-AOV</th><th onclick="sortTable('ch-matrix-tbl',8)">S-AOV</th><th onclick="sortTable('ch-matrix-tbl',9)">DineIn AOV</th><th onclick="sortTable('ch-matrix-tbl',10)">Winner</th>
      </tr>
    `;

    RAW.branches.forEach(b => {
      if (F.branch !== 'all' && b !== F.branch) return;
      const bd = RAW.branch[b];
      const scale = fd.rev / 20728578;
      const dineInRev = Math.round((bd.ch['Dine In']?.rev || 0) * scale);
      const takeawayRev = Math.round((bd.ch['Takeaway']?.rev || 0) * scale);
      const zomatoRev = Math.round((bd.ch['Zomato']?.rev || 0) * scale);
      const swiggyRev = Math.round((bd.ch['Swiggy']?.rev || 0) * scale);
      const offRev = dineInRev + takeawayRev;
      const onRev = zomatoRev + swiggyRev;
      const totRev = offRev + onRev;
      const offPct = totRev > 0 ? ((offRev / totRev) * 100).toFixed(1) : '0.0';
      const winner = parseFloat(offPct) >= 50 ? 'Offline' : 'Online';
      const winTag = parseFloat(offPct) >= 50 ? 'offline' : 'online';

      html += `
        <tr>
          <td><strong>${b}</strong></td>
          <td>${fmt(totRev)}</td>
          <td>${fmt(offRev)}</td>
          <td>${fmt(onRev)}</td>
          <td>${offPct}%</td>
          <td>${fmt(zomatoRev)}</td>
          <td>${fmt(swiggyRev)}</td>
          <td>${bd.ch['Zomato'] && bd.ch['Zomato'].aov ? '₹' + Math.round(bd.ch['Zomato'].aov) : 'N/A'}</td>
          <td>${bd.ch['Swiggy'] && bd.ch['Swiggy'].aov ? '₹' + Math.round(bd.ch['Swiggy'].aov) : 'N/A'}</td>
          <td>${bd.ch['Dine In'] && bd.ch['Dine In'].aov ? '₹' + Math.round(bd.ch['Dine In'].aov) : 'N/A'}</td>

          <td><span class="tag ${winTag}">${winner}</span></td>
        </tr>
      `;
    });
    matrixTbl.innerHTML = html;
  }

  // Page 5: Platform Commission Impact Table
  const commTbl = document.getElementById('tbl-commission-impact');
  if (commTbl) {
    const scale = fd.rev / 20728578;
    const zomatoDrain = Math.round(1640000 * scale);
    const swiggyDrain = Math.round(1080000 * scale);
    const totalDrain = zomatoDrain + swiggyDrain;
    const zomatoNet = Math.round(4920000 * scale);
    const swiggyNet = Math.round(3250000 * scale);
    const dineNet = Math.round(9690000 * scale);

    commTbl.innerHTML = `
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Zomato commission drain</td><td style="color:#e68c85;font-weight:700">~${fmt(zomatoDrain)}/quarter</td></tr>
      <tr><td>Swiggy commission drain</td><td style="color:#e68c85;font-weight:700">~${fmt(swiggyDrain)}/quarter</td></tr>
      <tr><td>Total delivery commission</td><td style="color:#e68c85;font-weight:700">~${fmt(totalDrain)}/quarter</td></tr>
      <tr><td>True net from Zomato</td><td style="color:#9fc794;font-weight:700">~${fmt(zomatoNet)}</td></tr>
      <tr><td>True net from Swiggy</td><td style="color:#9fc794;font-weight:700">~${fmt(swiggyNet)}</td></tr>
      <tr><td>Dine In true net (0% commission)</td><td style="color:#9fc794;font-weight:700">${fmt(dineNet)}</td></tr>
    `;
  }

  // Page 7: Kothrud Benchmark Matrix Table
  const kothrudTbl = document.getElementById('tbl-kothrud-playbook-matrix');
  if (kothrudTbl) {
    let html = `
      <tr>
        <th>Metric / Standard</th><th>Kothrud Flagship</th><th>AUNDH</th><th>Salunkhe Vihar</th><th>Wadgaon Sheri</th><th>Yolkshire Wakad</th><th>Kothrud Playbook Standard</th>
      </tr>
      <tr>
        <td><strong>Dine-In Rev Share</strong></td>
        <td style="font-weight:700;color:var(--green)">50.3%</td>
        <td>56.7%</td>
        <td>46.1%</td>
        <td style="color:#e68c85">25.0%</td>
        <td style="color:#e68c85">35.9%</td>
        <td><span class="tag star">Target 50%+</span></td>
      </tr>
      <tr>
        <td><strong>Beverage Attach %</strong></td>
        <td style="font-weight:700;color:var(--green)">54%</td>
        <td>48%</td>
        <td>51%</td>
        <td style="color:#e68c85">29%</td>
        <td style="color:#e68c85">31%</td>
        <td><span class="tag star">Target 50%+</span></td>
      </tr>
      <tr>
        <td><strong>Dine-In AOV</strong></td>
        <td style="font-weight:700;color:var(--green)">₹597</td>
        <td>₹515</td>
        <td>₹556</td>
        <td>₹479</td>
        <td>₹497</td>
        <td><span class="tag star">Target ₹550+</span></td>
      </tr>
      <tr>
        <td><strong>Order Cancellation Rate</strong></td>
        <td style="font-weight:700;color:var(--green)">0.05%</td>
        <td>0.08%</td>
        <td>0.07%</td>
        <td style="color:#e68c85">0.42%</td>
        <td style="color:#e68c85">0.31%</td>
        <td><span class="tag star">&lt; 0.10%</span></td>
      </tr>
    `;
    kothrudTbl.innerHTML = html;
  }

  // Page 8: Q1 vs Q2 Scorecard Table
  const q1q2Tbl = document.getElementById('tbl-q1q2-scorecard');
  if (q1q2Tbl) {
    let html = `<tr><th>Metric / Branch</th><th>Q1 Revenue</th><th>Q2 Revenue</th><th>QoQ Change</th><th>Q1 AOV</th><th>Q2 AOV</th><th>Status</th></tr>`;
    RAW.branches.forEach(b => {
      if (F.branch !== 'all' && b !== F.branch) return;
      const q1Rev = Math.round((RAW.q1.branch[b]?.rev || 0) * (fd.rev / 20728578));
      const q2Rev = Math.round((RAW.branch[b]?.rev || 0) * (fd.rev / 20728578));
      const qoq = q1Rev > 0 ? (((q2Rev - q1Rev) / q1Rev) * 100).toFixed(1) : 'New';
      const q1Aov = RAW.q1.branch[b]?.aov || 0;
      const q2Aov = RAW.branch[b]?.aov || 0;
      const tc = typeof qoq === 'string' && qoq.startsWith('-') ? 'trend-dn' : 'trend-up';

      html += `
        <tr>
          <td><strong>${b}</strong></td>
          <td>${fmt(q1Rev)}</td>
          <td>${fmt(q2Rev)}</td>
          <td class="${tc}">${typeof qoq === 'number' || !isNaN(qoq) ? '+' + qoq + '%' : qoq}</td>
          <td>${q1Aov ? '₹' + Math.round(q1Aov) : '—'}</td>
          <td>₹${Math.round(q2Aov)}</td>
          <td><span class="tag star">${RAW.branchProfiles?.[b]?.status || 'Active'}</span></td>
        </tr>
      `;
    });
    q1q2Tbl.innerHTML = html;
  }

  // Page 9: Forecast Summary Table
  const fcTbl = document.getElementById('tbl-forecast-summary');
  if (fcTbl) {
    const scale = fd.rev / 20728578;
    fcTbl.innerHTML = `
      <tr><th>Month</th><th>Revenue</th><th>Orders</th><th>AOV</th><th>MoM</th><th>Type</th></tr>
      <tr><td>April 2026</td><td>${fmt(Math.round(6762859 * scale))}</td><td>${fmtN(Math.round(13952 * scale))}</td><td>₹485</td><td>&mdash;</td><td><span class="tag star">Actual</span></td></tr>
      <tr><td>May 2026</td><td>${fmt(Math.round(7069957 * scale))}</td><td>${fmtN(Math.round(13631 * scale))}</td><td>₹519</td><td class="trend-up">+4.5%</td><td><span class="tag star">Actual</span></td></tr>
      <tr><td>June 2026</td><td>${fmt(Math.round(6895763 * scale))}</td><td>${fmtN(Math.round(12610 * scale))}</td><td>₹547</td><td class="trend-dn">-2.5%</td><td><span class="tag star">Actual</span></td></tr>
      <tr style="opacity:.8"><td>July 2026</td><td>${fmt(Math.round(7042431 * scale))}</td><td>${fmtN(Math.round(12056 * scale))}</td><td>₹584</td><td class="trend-up">+2.1%</td><td><span class="tag puzzle">Forecast</span></td></tr>
      <tr style="opacity:.7"><td>August 2026</td><td>${fmt(Math.round(7108883 * scale))}</td><td>${fmtN(Math.round(11385 * scale))}</td><td>₹624</td><td class="trend-up">+0.9%</td><td><span class="tag puzzle">Forecast</span></td></tr>
      <tr style="opacity:.6"><td>September 2026</td><td>${fmt(Math.round(7175336 * scale))}</td><td>${fmtN(Math.round(10714 * scale))}</td><td>₹670</td><td class="trend-up">+0.9%</td><td><span class="tag puzzle">Forecast</span></td></tr>
    `;
  }

  // Page 12: PnL Branch Statement Table
  const pnlTbl = document.getElementById('tbl-pnl-statement');
  if (pnlTbl) {
    let html = `
      <tr>
        <th onclick="sortTable('tbl-pnl-statement',0)">Branch</th><th onclick="sortTable('tbl-pnl-statement',1)">Target</th><th onclick="sortTable('tbl-pnl-statement',2)">Actual Rev</th><th onclick="sortTable('tbl-pnl-statement',3)">Variance</th><th onclick="sortTable('tbl-pnl-statement',4)">COGS (30%)</th><th onclick="sortTable('tbl-pnl-statement',5)">Labor (18%)</th><th onclick="sortTable('tbl-pnl-statement',6)">Rent (15%)</th><th onclick="sortTable('tbl-pnl-statement',7)">Commissions</th><th onclick="sortTable('tbl-pnl-statement',8)">Ops (5%)</th><th onclick="sortTable('tbl-pnl-statement',9)">Net EBITDA Profit</th><th onclick="sortTable('tbl-pnl-statement',10)">EBITDA Margin</th>
      </tr>
    `;

    RAW.branches.forEach(b => {
      if (F.branch !== 'all' && b !== F.branch) return;
      const bTargets = RAW.branchTargets[b] || { apr: 0, may: 0, jun: 0 };
      let bTarget = F.month !== 'all' ? bTargets[F.month] : (bTargets.apr + bTargets.may + bTargets.jun);
      if (F.channel === 'Delivery') bTarget = Math.round(bTarget * 0.525);
      else if (F.channel !== 'all') bTarget = Math.round(bTarget * (RAW.channel[F.channel].share / 100));

      const bActual = Math.round(RAW.branch[b].rev * (fd.rev / 20728578));
      const bVarPct = bTarget > 0 ? ((bActual / bTarget) * 100).toFixed(1) : '100.0';
      const bCogs = Math.round(bActual * 0.30);
      const bLabor = Math.round(bActual * 0.18);
      const bRent = Math.round(bActual * 0.15);
      const bDelRev = Math.round(bActual * 0.5253);
      const bComm = Math.round(bDelRev * 0.25);
      const bOps = Math.round(bActual * 0.05);
      const bProfit = bActual - (bCogs + bLabor + bRent + bComm + bOps);
      const bMargin = bActual > 0 ? ((bProfit / bActual) * 100).toFixed(1) : '0.0';
      const varClass = parseFloat(bVarPct) >= 100 ? 'trend-up' : 'trend-dn';

      html += `
        <tr>
          <td><strong>${b}</strong></td>
          <td>${fmt(bTarget)}</td>
          <td>${fmt(bActual)}</td>
          <td class="${varClass}">${bVarPct}%</td>
          <td>${fmt(bCogs)}</td>
          <td>${fmt(bLabor)}</td>
          <td>${fmt(bRent)}</td>
          <td style="color:#e68c85">${fmt(bComm)}</td>
          <td>${fmt(bOps)}</td>
          <td style="font-weight:700;color:var(--green)">${fmt(bProfit)}</td>
          <td><span class="tag star">${bMargin}%</span></td>
        </tr>
      `;
    });
    pnlTbl.innerHTML = html;
  }

  // Page 12: PnL Channel Matrix Table
  const pnlChTbl = document.getElementById('tbl-pnl-channel');
  if (pnlChTbl) {
    let html = `
      <tr><th onclick="sortTable('tbl-pnl-channel',0)">Channel Mode</th><th onclick="sortTable('tbl-pnl-channel',1)">Gross Sales</th><th onclick="sortTable('tbl-pnl-channel',2)">Sales Share</th><th onclick="sortTable('tbl-pnl-channel',3)">COGS (30%)</th><th onclick="sortTable('tbl-pnl-channel',4)">Platform Fee</th><th onclick="sortTable('tbl-pnl-channel',5)">Net Operating Revenue</th><th onclick="sortTable('tbl-pnl-channel',6)">Net Margin %</th></tr>
    `;

    RAW.channels.forEach((c, i) => {
      if (F.channel === 'Delivery' && c !== 'Zomato' && c !== 'Swiggy') return;
      if (F.channel !== 'all' && F.channel !== 'Delivery' && c !== F.channel) return;
      const cRev = fd.chRevs[i];
      const cShare = fd.rev > 0 ? ((cRev / fd.rev) * 100).toFixed(1) : '0.0';
      const cCogs = Math.round(cRev * 0.30);
      const cComm = (c === 'Zomato' || c === 'Swiggy') ? Math.round(cRev * 0.25) : 0;
      const cNet = cRev - cCogs - cComm;
      const cMargin = cRev > 0 ? ((cNet / cRev) * 100).toFixed(1) : '0.0';
      html += `
        <tr>
          <td><strong>${c}</strong></td>
          <td>${fmt(cRev)}</td>
          <td>${cShare}%</td>
          <td>${fmt(cCogs)}</td>
          <td style="color:#e68c85">${cComm > 0 ? fmt(cComm) + ' (25%)' : '₹0 (0%)'}</td>
          <td style="font-weight:700;color:var(--green)">${fmt(cNet)}</td>
          <td><span class="tag ${cMargin > 50 ? 'star' : 'horse'}">${cMargin}%</span></td>
        </tr>
      `;
    });
    pnlChTbl.innerHTML = html;
  }

  // Page 12: Outlet Sales Target Roadmap Table
  const pnlSalesRoadmapTbl = document.getElementById('tbl-pnl-outlet-sales-roadmap');
  if (pnlSalesRoadmapTbl) {
    const salesData = [
      { outlet: 'Kothrud', cur: 2000000, t1: 2250000, t2: 2500000, t3: 2750000 },
      { outlet: 'PYC (Incl Cart)', cur: 700000, t1: 1000000, t2: 1250000, t3: 1500000 },
      { outlet: 'Aundh', cur: 1350000, t1: 1500000, t2: 1750000, t3: 2000000 },
      { outlet: 'Salunkhe Vihar', cur: 1000000, t1: 1250000, t2: 1500000, t3: 1750000 },
      { outlet: 'Wadgaon Sheri', cur: 850000, t1: 1000000, t2: 1250000, t3: 1500000 },
      { outlet: 'Pimple Saudagar', cur: 850000, t1: 1000000, t2: 1250000, t3: 1500000 },
      { outlet: 'Wakad', cur: 600000, t1: 1000000, t2: 1250000, t3: 1500000 }
    ];

    let html = `
      <thead>
        <tr>
          <th onclick="sortTable('tbl-pnl-outlet-sales-roadmap',0)">Outlet</th>
          <th onclick="sortTable('tbl-pnl-outlet-sales-roadmap',1)">Current Avg Sale / mo</th>
          <th onclick="sortTable('tbl-pnl-outlet-sales-roadmap',2)">Tier 1 (Base Target)</th>
          <th onclick="sortTable('tbl-pnl-outlet-sales-roadmap',3)">Tier 2 (Stretch Target)</th>
          <th onclick="sortTable('tbl-pnl-outlet-sales-roadmap',4)">Tier 3 (Super-Achiever)</th>
          <th onclick="sortTable('tbl-pnl-outlet-sales-roadmap',5)">Incentive Multiplier</th>
        </tr>
      </thead>
      <tbody>
    `;

    let totCur = 0, totT1 = 0, totT2 = 0, totT3 = 0;
    salesData.forEach(row => {
      totCur += row.cur; totT1 += row.t1; totT2 += row.t2; totT3 += row.t3;
      html += `
        <tr>
          <td><strong>${row.outlet}</strong></td>
          <td style="font-weight:700;color:var(--primary)">${fmt(row.cur)}</td>
          <td><span class="tag star">${fmt(row.t1)}</span></td>
          <td><span class="tag horse">${fmt(row.t2)}</span></td>
          <td style="font-weight:700;color:var(--green)"><span class="tag puzzle">${fmt(row.t3)}</span></td>
          <td>Up to 1.5x Staff Bonus</td>
        </tr>
      `;
    });

    html += `
      <tr style="background:var(--bg3);font-weight:800;border-top:2px solid var(--primary)">
        <td>TOTAL CHAIN SALES / MO</td>
        <td style="color:var(--primary)">${fmt(totCur)}</td>
        <td style="color:var(--primary)">${fmt(totT1)}</td>
        <td>${fmt(totT2)}</td>
        <td style="color:var(--green)">${fmt(totT3)}</td>
        <td><span class="tag star">+70.1% Max Capacity</span></td>
      </tr>
      </tbody>
    `;
    pnlSalesRoadmapTbl.innerHTML = html;
  }

  // Page 12: Outlet Profit & Turnaround Target Roadmap Table
  const pnlProfitRoadmapTbl = document.getElementById('tbl-pnl-outlet-profit-roadmap');
  if (pnlProfitRoadmapTbl) {
    const profitData = [
      { outlet: 'Kothrud', cur: 420000, t1: 450000, t2: 525000, t3: 605000 },
      { outlet: 'PYC (Incl Cart)', cur: -180000, t1: 100000, t2: 137500, t3: 180000 },
      { outlet: 'Aundh', cur: 178000, t1: 300000, t2: 350000, t3: 400000 },
      { outlet: 'Salunkhe Vihar', cur: 116000, t1: 250000, t2: 300000, t3: 350000 },
      { outlet: 'Wadgaon Sheri', cur: -5000, t1: 200000, t2: 250000, t3: 300000 },
      { outlet: 'Pimple Saudagar', cur: 20000, t1: 200000, t2: 250000, t3: 300000 },
      { outlet: 'Wakad', cur: -79000, t1: 200000, t2: 250000, t3: 300000 }
    ];

    let html = `
      <thead>
        <tr>
          <th onclick="sortTable('tbl-pnl-outlet-profit-roadmap',0)">Outlet</th>
          <th onclick="sortTable('tbl-pnl-outlet-profit-roadmap',1)">Current Avg Profit / mo</th>
          <th onclick="sortTable('tbl-pnl-outlet-profit-roadmap',2)">Tier 1 (Base Target)</th>
          <th onclick="sortTable('tbl-pnl-outlet-profit-roadmap',3)">Tier 2 (Stretch Target)</th>
          <th onclick="sortTable('tbl-pnl-outlet-profit-roadmap',4)">Tier 3 (Super-Achiever)</th>
          <th onclick="sortTable('tbl-pnl-outlet-profit-roadmap',5)">Profit Status</th>
        </tr>
      </thead>
      <tbody>
    `;

    let totCur = 0, totT1 = 0, totT2 = 0, totT3 = 0;
    profitData.forEach(row => {
      totCur += row.cur; totT1 += row.t1; totT2 += row.t2; totT3 += row.t3;
      const isTurnaround = row.cur < 0;
      const tagClass = isTurnaround ? 'risk' : row.cur > 200000 ? 'star' : 'horse';
      const tagText = isTurnaround ? 'Loss Turnaround' : row.cur > 200000 ? 'High Profit' : 'Moderate Profit';
      html += `
        <tr>
          <td><strong>${row.outlet}</strong></td>
          <td style="font-weight:700;color:${row.cur >= 0 ? 'var(--green)' : '#e68c85'}">${row.cur < 0 ? '-' : ''}${fmt(Math.abs(row.cur))}</td>
          <td>${fmt(row.t1)}</td>
          <td>${fmt(row.t2)}</td>
          <td style="font-weight:700;color:var(--green)">${fmt(row.t3)}</td>
          <td><span class="tag ${tagClass}">${tagText}</span></td>
        </tr>
      `;
    });

    html += `
      <tr style="background:var(--bg3);font-weight:800;border-top:2px solid var(--primary)">
        <td>TOTAL CHAIN NET PROFIT / MO</td>
        <td style="color:var(--green)">${fmt(totCur)}</td>
        <td style="color:var(--green)">${fmt(totT1)}</td>
        <td>${fmt(totT2)}</td>
        <td style="color:var(--green)">${fmt(totT3)}</td>
        <td><span class="tag star">+418% Max Uplift</span></td>
      </tr>
      </tbody>
    `;
    pnlProfitRoadmapTbl.innerHTML = html;
  }
}

function refresh() {
  const fd = getFilteredData();
  updateKPIs(fd);
  document.getElementById('filter-ctx').textContent = buildContextLabel();
  updateFilterStyles();

  const monthLabels = ['Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026'];
  const allRevs = [...fd.monthlyRevs, Math.round(7042431 * (fd.rev / 20728578)), Math.round(7108883 * (fd.rev / 20728578)), Math.round(7175336 * (fd.rev / 20728578))];
  const monthColors = [...fd.monthColors, 'rgba(144,122,169,.5)', 'rgba(144,122,169,.4)', 'rgba(144,122,169,.3)'];

  updateChart('c-monthly', monthLabels, [{ data: allRevs, backgroundColor: monthColors, borderRadius: 6, borderSkipped: false, label: 'Revenue' }]);
  updateChart('c-ch-donut', RAW.channels, [{ data: fd.chRevs, backgroundColor: fd.chColors, borderWidth: 0, hoverOffset: 8 }]);
  updateChart('c-br-bar', RAW.branches, [{ data: fd.branchRevs, backgroundColor: fd.branchColors, borderRadius: 5, borderSkipped: false }]);
  updateChart('c-dow', RAW.days, [{ data: fd.dRev, backgroundColor: fd.dRev.map(v => v > Math.max(...fd.dRev) * 0.7 ? '#56754d' : '#E7BA44'), borderRadius: 5, borderSkipped: false, label: 'Revenue' }]);
  updateChart('c-session-donut', ['Breakfast', 'Lunch', 'Snack', 'Dinner'], [{ data: fd.sessRevs, backgroundColor: fd.sessColors, borderWidth: 0, hoverOffset: 8 }]);

  updateChart('c-top10r', fd.top10rItems, [{ data: fd.top10rRevs, backgroundColor: 'rgba(144,122,169,.75)', borderRadius: 4, borderSkipped: false }]);
  updateChart('c-top10r2', fd.top10rItems, [{ data: fd.top10rRevs, backgroundColor: 'rgba(65,86,57,.75)', borderRadius: 4, borderSkipped: false }]);
  updateChart('c-top10q', fd.top10qItems, [{ data: fd.top10qQtys, backgroundColor: 'rgba(231,186,68,.75)', borderRadius: 4, borderSkipped: false }]);

  updateChart('c-daily-rev', fd.dailyTrend.map(d => d.date), [
    { label: 'Daily Revenue', data: fd.dailyTrend.map(d => d.rev), borderColor: '#E7BA44', backgroundColor: 'rgba(231,186,68,.08)', fill: true, tension: .3, borderWidth: 2, pointRadius: 0, pointHoverRadius: 5 },
    { label: '7-Day Moving Avg', data: fd.dailyTrend.map(d => d.ma), borderColor: '#907aa9', backgroundColor: 'transparent', fill: false, tension: .4, borderWidth: 2, borderDash: [6, 3], pointRadius: 0, pointHoverRadius: 4 }
  ]);

  const hrRevColors = RAW.hours.map(h => (!fd.activeHours ? 'rgba(231,186,68,.7)' : fd.activeHours.includes(h) ? '#E7BA44' : 'rgba(231,186,68,.15)'));
  updateChart('c-hr-rev', RAW.hours.map(h => h + ':00'), [{ data: fd.hRev, borderColor: '#E7BA44', backgroundColor: 'rgba(231,186,68,.08)', fill: true, tension: .4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: hrRevColors, label: 'Revenue' }]);

  const hrOrdColors = RAW.hours.map((h, i) => {
    const dim = fd.activeHours && !fd.activeHours.includes(h) ? 0.15 : 1;
    const load = RAW.hLoad[i];
    const base = load >= 80 ? '124,76,71' : load >= 50 ? '231,186,68' : '65,86,57';
    return `rgba(${base},${dim * 0.8})`;
  });
  updateChart('c-hr-ord', RAW.hours.map(h => h + ':00'), [{ data: fd.hOrd, backgroundColor: hrOrdColors, borderRadius: 4, borderSkipped: false }]);

  const branchKeys = F.branch !== 'all' ? [F.branch] : Object.keys(RAW.branch).filter(b => b !== 'Bavdhan');
  const brTrendDs = branchKeys.map(b => {
    const bd = RAW.branch[b];
    const ci = RAW.branches.indexOf(b);
    const mult = fd.rev / 20728578;
    return { label: b, data: [Math.round(bd.apr * mult), Math.round(bd.may * mult), Math.round(bd.jun * mult)], borderColor: RAW.branchColors[ci], backgroundColor: 'transparent', tension: .3, borderWidth: F.branch !== 'all' ? 2 : 1.5, pointRadius: 4 };
  });
  updateChart('c-br-trend', ['Apr', 'May', 'Jun'], brTrendDs);

  updateChart('c-sess-bar', ['Breakfast', 'Lunch', 'Snack', 'Dinner'], [
    { label: 'Revenue', data: fd.sessRevs, backgroundColor: fd.sessColors, borderRadius: 5, borderSkipped: false, yAxisID: 'y' },
    { label: 'Orders', data: fd.sessOrds, backgroundColor: fd.sessColors.map(c => c.replace('.8', '.3').replace('0.2', '0.08')), borderRadius: 5, borderSkipped: false, yAxisID: 'y2', type: 'line', borderColor: fd.sessColors, borderWidth: 2, pointRadius: 4, fill: false }
  ]);

  const meCats = ['Star', 'Plow Horse', 'Puzzle', 'Dog'];
  const meCols = ['rgba(159,199,148,.8)', 'rgba(148,184,227,.8)', 'rgba(231,186,68,.85)', 'rgba(230,140,133,.85)'];
  updateChart('c-me-scatter', [], meCats.map((cat, ci) => ({ label: cat, data: fd.mePoints.filter(p => p.cat === cat).map(p => ({ x: p.x, y: p.y, item: p.item })), backgroundColor: meCols[ci], pointRadius: 7, pointHoverRadius: 10 })));

  updateChart('c-grow', RAW.growItems, [{ data: RAW.growPct, backgroundColor: 'rgba(65,86,57,.75)', borderRadius: 6, borderSkipped: false, label: 'Growth%' }]);
  updateChart('c-decl', RAW.declItems, [{ data: RAW.declPct, backgroundColor: 'rgba(124,76,71,.75)', borderRadius: 6, borderSkipped: false, label: 'Change%' }]);

  updateChart('c-menu-cat-pie', fd.catLabels, [{ data: fd.catRevs, backgroundColor: ['#E7BA44', '#56754d', '#5985b9', '#907aa9', '#9c5f59', '#7C4C47'], borderWidth: 0 }]);
  updateChart('c-menu-price-tier', fd.priceTierLabels, [{ data: fd.priceTierQtys, backgroundColor: ['#56754d', '#E7BA44', '#5985b9', '#907aa9', '#9c5f59'], borderRadius: 5, label: 'Units Sold' }]);

  updateChart('c-bill', RAW.billBuckets, [{ data: RAW.billCounts.map(v => Math.round(v * (fd.ord / 40193))), backgroundColor: RAW.billCounts.map(v => v === Math.max(...RAW.billCounts) ? '#E7BA44' : 'rgba(231,186,68,.45)'), borderRadius: 5, borderSkipped: false }]);

  updateChart('c-aov-ch', RAW.channels, [{ data: fd.chAOVs, backgroundColor: fd.chAOVColors, borderRadius: 6, borderSkipped: false }]);
  updateChart('c-aov-br', RAW.branches, [{ data: fd.branchAOVs, backgroundColor: fd.branchAOVColors, borderRadius: 5, borderSkipped: false }]);

  const loadColors = RAW.hLoad.map((l, i) => {
    const dim = fd.activeHours && !fd.activeHours.includes(RAW.hours[i]) ? 0.2 : 0.85;
    return l >= 80 ? `rgba(124,76,71,${dim})` : l >= 50 ? `rgba(231,186,68,${dim})` : `rgba(65,86,57,${dim})`;
  });
  updateChart('c-load', RAW.hours.map(h => h + ':00'), [{ data: RAW.hLoad, backgroundColor: loadColors, borderRadius: 5, borderSkipped: false }]);

  // Channel Intelligence Charts
  updateChart('c-ch-split', RAW.branches, [
    { label: 'Offline (Dine In+Takeaway)', data: fd.branchRevs.map(r => Math.round(r * 0.52)), backgroundColor: '#415639', borderRadius: 4, borderSkipped: false },
    { label: 'Online (Zomato+Swiggy)', data: fd.branchRevs.map(r => Math.round(r * 0.48)), backgroundColor: '#E7BA44', borderRadius: 4, borderSkipped: false }
  ]);
  updateChart('c-zs-bar', RAW.branches, [
    { label: 'Zomato', data: fd.branchRevs.map(r => Math.round(r * 0.32)), backgroundColor: '#cb202d', borderRadius: 4, borderSkipped: false },
    { label: 'Swiggy', data: fd.branchRevs.map(r => Math.round(r * 0.20)), backgroundColor: '#fc8019', borderRadius: 4, borderSkipped: false }
  ]);
  updateChart('c-ch-trend', ['April', 'May', 'June'], [
    { label: 'Dine In', data: [Math.round(3163618 * (fd.rev / 20728578)), Math.round(3307261 * (fd.rev / 20728578)), Math.round(3222182 * (fd.rev / 20728578))], borderColor: '#415639', backgroundColor: 'rgba(65,86,57,.08)', fill: true, tension: .3, borderWidth: 2.5, pointRadius: 5 },
    { label: 'Zomato', data: [Math.round(2139234 * (fd.rev / 20728578)), Math.round(2233700 * (fd.rev / 20728578)), Math.round(2180841 * (fd.rev / 20728578))], borderColor: '#cb202d', backgroundColor: 'rgba(203,32,45,.06)', fill: true, tension: .3, borderWidth: 2, pointRadius: 4 },
    { label: 'Swiggy', data: [Math.round(1415008 * (fd.rev / 20728578)), Math.round(1476996 * (fd.rev / 20728578)), Math.round(1440728 * (fd.rev / 20728578))], borderColor: '#fc8019', backgroundColor: 'rgba(252,128,25,.06)', fill: true, tension: .3, borderWidth: 2, pointRadius: 4 }
  ]);

  // Page 7: Kothrud Playbook Charts
  const kShare = Math.round(RAW.branch.Kothrud.rev * (fd.rev / 20728578));
  const restShare = fd.rev - kShare;
  updateChart('c-kothrud-share', ['Kothrud (' + fmt(kShare) + ')', 'Rest of Chain (' + fmt(restShare) + ')'], [
    { data: [kShare, restShare], backgroundColor: ['#56754d', '#E7BA44'], borderWidth: 0 }
  ]);
  updateChart('c-kothrud-channel-comp', ['Kothrud', 'Aundh', 'Wadgaon Sheri', 'Wakad'], [
    { label: 'Dine-In %', data: [50.3, 56.7, 25.0, 35.9], backgroundColor: '#56754d', borderRadius: 4 },
    { label: 'Delivery %', data: [48.2, 42.7, 74.6, 63.7], backgroundColor: '#E7BA44', borderRadius: 4 }
  ]);
  updateChart('c-kothrud-hourly', RAW.hours.map(h => h + ':00'), [
    { label: 'Kothrud Hourly Rev', data: RAW.hRev.map(v => Math.round(v * 0.301 * (fd.rev / 20728578))), borderColor: '#56754d', backgroundColor: 'rgba(86,117,77,0.1)', fill: true, tension: 0.4 },
    { label: 'Chain Average', data: RAW.hRev.map(v => Math.round(v * 0.142 * (fd.rev / 20728578))), borderColor: '#E7BA44', borderDash: [5, 4], fill: false, tension: 0.4 }
  ]);
  updateChart('c-kothrud-bev-breakdown', ['Gourmet Coffee', 'Cold Brews & Iced', 'Masala Chai', 'Juices & Smoothies', 'Teas & Extras'], [
    { data: [42, 28, 15, 10, 5], backgroundColor: ['#56754d', '#E7BA44', '#907aa9', '#5985b9', '#9c5f59'], borderWidth: 0 }
  ]);
  updateChart('c-kothrud-menu-mix', ['Chicken Stroganoff', 'Roast Chicken', 'English Breakfast', 'Cold Coffee', 'Eggwich'], [
    { data: [22, 16, 14, 12, 10], backgroundColor: ['#E7BA44', '#56754d', '#5985b9', '#907aa9', '#9c5f59'], borderRadius: 4 }
  ]);

  // PnL Charts
  updateChart('c-pnl-waterfall', ['Target Sales', 'Actual Sales', 'COGS (30%)', 'Labor (18%)', 'Rent (15%)', 'Delivery Fee', 'Ops (5%)', 'Net Profit'], [
    { data: [fd.targetRev, fd.actualRev, -fd.cogs, -fd.labor, -fd.rent, -fd.commissions, -fd.ops, fd.netProfit], backgroundColor: ['#5985b9', '#E7BA44', '#9c5f59', '#9c5f59', '#9c5f59', '#cb202d', '#9c5f59', '#56754d'], borderRadius: 5, borderSkipped: false }
  ]);
  updateChart('c-pnl-breakdown', ['COGS (30%)', 'Labor Costs (18%)', 'Rent & CAM (15%)', 'Platform Fee', 'General Ops (5%)', 'Net Profit Margin'], [
    { data: [fd.cogs, fd.labor, fd.rent, fd.commissions, fd.ops, fd.netProfit], backgroundColor: ['#9c5f59', '#907aa9', '#5985b9', '#cb202d', '#a3979d', '#56754d'], borderWidth: 0, hoverOffset: 8 }
  ]);

  drawHeatmap();
  renderBranchProfile(currentBranchProfile);
  renderMarketBasketTab();
  renderTables(fd);
  renderRecommendations(fd);
  buildExecutiveReport();
  renderWhatIfSimulator();
  renderDualStoreComparison();
  renderDailySnapshot();
  recalcFranchiseeModel();
}


export function applyFilters() {
  F.branch = document.getElementById('f-branch').value;
  F.month = document.getElementById('f-month').value;
  F.channel = document.getElementById('f-channel').value;
  F.session = document.getElementById('f-session').value;
  refresh();
}

export function resetFilters() {
  F = { branch: 'all', month: 'all', channel: 'all', session: 'all' };
  ['f-branch', 'f-month', 'f-channel', 'f-session'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = 'all';
  });
  excludeNonMenu = false;
  const btn = document.getElementById('btn-exclude-nonmenu');
  if (btn) {
    btn.textContent = '💧 Exclude Water/Misc (OFF)';
    btn.style.background = 'var(--bg2)';
    btn.style.color = 'var(--text)';
    btn.style.borderColor = 'var(--border)';
  }
  activeCategorySelection = new Set(getAllMenuItems());
  refresh();
}

export function showPage(param) {
  try {
    const pages = Array.from(document.querySelectorAll('.page'));
    const tabs = Array.from(document.querySelectorAll('.tab'));

    let targetIndex = -1;
    if (typeof param === 'number') {
      targetIndex = param;
    } else if (typeof param === 'string') {
      targetIndex = pages.findIndex(p => p.id === param);
    }

    if (targetIndex < 0 || targetIndex >= pages.length) {
      targetIndex = 0;
    }

    pages.forEach((p, i) => p.classList.toggle('active', i === targetIndex));
    tabs.forEach((t, i) => t.classList.toggle('active', i === targetIndex));

    refresh();

    const activePage = pages[targetIndex];
    const activeId = activePage ? activePage.id : '';

    requestAnimationFrame(() => {
      Object.values(CHARTS).forEach(c => {
        try {
          if (c && typeof c.resize === 'function') c.resize();
        } catch (e) {}
      });

      if (activeId === 'pg-daily') renderDailySnapshot();
      if (activeId === 'pg-franchisee') recalcFranchiseeModel();
      if (activeId === 'pg-branches' || activeId === 'pg7') drawHeatmap();
      if (activeId === 'pg-operations' || activeId === 'pg4') renderMarketBasketTab();
      if (activeId === 'pg-comparison') renderDualStoreComparison();
    });
  } catch (err) {
    console.error('Error in showPage navigation:', err);
  }
}


function drawHeatmap() {
  const canvas = document.getElementById('c-heatmap');
  if (!canvas) return;
  window._hmDrawn = true;
  const W = canvas.offsetWidth || 960, H = 220;

  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hrs = RAW.hours; const data = RAW.heatmap;
  const padL = 44, padT = 24, padR = 10, padB = 28;
  const cellW = (W - padL - padR) / hrs.length, cellH = (H - padT - padB) / days.length;
  const maxV = Math.max(...data.flat());
  const isLight = document.body.classList.contains('light-mode');

  function heatColor(v) {
    const t = v / maxV;
    if (isLight) {
      if (t < .25) return `rgba(65,86,57,${.15 + t * 1.5})`;
      if (t < .55) return `rgba(196,150,37,${.25 + t * 0.5})`;
      return `rgba(124,76,71,${.35 + t * 0.5})`;
    } else {
      if (t < .25) return `rgba(65,86,57,${.35 + t * 1.8})`;
      if (t < .55) return `rgba(231,186,68,${.45 + t * .5})`;
      return `rgba(124,76,71,${.65 + t * .35})`;
    }
  }

  ctx.fillStyle = isLight ? '#F5E9C9' : '#362E33';
  ctx.fillRect(0, 0, W, H);
  data.forEach((row, di) => {
    row.forEach((val, hi) => {
      const x = padL + hi * cellW, y = padT + di * cellH;
      ctx.fillStyle = heatColor(val);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x + 1, y + 1, cellW - 2, cellH - 2, 2);
      else ctx.rect(x + 1, y + 1, cellW - 2, cellH - 2);
      ctx.fill();
    });
  });

  ctx.fillStyle = isLight ? '#2B2428' : '#a3979d';
  ctx.font = '10px Raleway,sans-serif';
  ctx.textAlign = 'center';
  hrs.forEach((h, i) => ctx.fillText(h, (padL + (i + .5) * cellW), H - padB + 14));
  ctx.textAlign = 'right';
  days.forEach((d, i) => ctx.fillText(d, padL - 6, padT + (i + .5) * cellH + 4));
}

function renderBranchProfile(branch) {
  const bp = BRANCH_PROFILES[branch];
  if (!bp) return;
  const container = document.getElementById('branch-profile-content');
  if (!container) return;
  const offlineRev = (bp.channels['Dine In']?.rev || 0) + (bp.channels['Takeaway']?.rev || 0);
  const onlineRev = (bp.channels['Zomato']?.rev || 0) + (bp.channels['Swiggy']?.rev || 0);
  const totalRev = offlineRev + onlineRev;
  const offPct = totalRev > 0 ? (offlineRev / totalRev * 100).toFixed(1) : 0;
  const onPct = totalRev > 0 ? (onlineRev / totalRev * 100).toFixed(1) : 0;
  const tc = bp.trendClass === 'trend-up' ? 'c-green' : bp.trendClass === 'trend-dn' ? 'c-red' : 'c-purple';

  container.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card c-blue"><div class="kpi-label">Revenue</div><div class="kpi-val c-blue">${fmt(bp.rev)}</div><div class="kpi-sub">Q2 2026 total</div></div>
      <div class="kpi-card c-green"><div class="kpi-label">Total Orders</div><div class="kpi-val c-green">${fmtN(bp.ord)}</div><div class="kpi-sub">${(bp.ord / 91).toFixed(0)}/day avg</div></div>
      <div class="kpi-card c-amber"><div class="kpi-label">AOV</div><div class="kpi-val c-amber">₹${bp.aov}</div><div class="kpi-sub">avg order value</div></div>
      <div class="kpi-card ${tc}"><div class="kpi-label">Trend / Status</div><div class="kpi-val ${tc}" style="font-size:16px">${bp.trend}</div><div class="kpi-sub"><span class="tag ${bp.statusTag}">${bp.status}</span></div></div>
    </div>
    <div class="grid g2">
      <div class="chart-card"><h3>Monthly Revenue Trend</h3><div class="sub">Apr → May → Jun 2026</div><div class="cw" style="height:200px"><canvas id="bp-monthly"></canvas></div></div>
      <div class="chart-card"><h3>Offline vs Online Split</h3><div class="sub">Offline ${offPct}% · Online ${onPct}%</div><div class="cw" style="height:200px"><canvas id="bp-donut"></canvas></div></div>
    </div>
  `;

  ['bp-monthly', 'bp-donut'].forEach(id => { if (bpCharts[id]) { bpCharts[id].destroy(); } });
  const xB = { ticks: { color: '#a3979d', font: { size: 10, family: 'Raleway' } }, grid: { color: 'rgba(252,240,208,.06)' } };

  const canvasM = document.getElementById('bp-monthly');
  if (canvasM) {
    bpCharts['bp-monthly'] = new Chart(canvasM, {
      type: 'bar',
      data: { labels: ['April', 'May', 'June'], datasets: [{ data: bp.monthly, backgroundColor: ['#E7BA44', '#56754d', '#9c5f59'], borderRadius: 6, borderSkipped: false }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: xB, y: { ticks: { color: '#a3979d', callback: v => fmt(v) }, grid: { color: 'rgba(252,240,208,.06)' } } } }
    });
  }

  const canvasD = document.getElementById('bp-donut');
  if (canvasD) {
    bpCharts['bp-donut'] = new Chart(canvasD, {
      type: 'doughnut',
      data: { labels: ['Offline', 'Online'], datasets: [{ data: [offlineRev, onlineRev], backgroundColor: ['#415639', '#E7BA44'], borderWidth: 0, hoverOffset: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: true, position: 'right', labels: { color: '#FCF0D0', font: { size: 11 } } } } }
    });
  }
}

function renderRecommendations(fd) {
  const container = document.getElementById('rec-grid-container');
  if (!container) return;

  const branchStr = F.branch !== 'all' ? F.branch : 'All Branches';
  const channelStr = F.channel !== 'all' ? (F.channel === 'Delivery' ? 'Delivery Only' : F.channel) : 'All Channels';

  container.innerHTML = `
    <div class="rec-card" style="border-color:rgba(124,76,71,.4)">
      <h3>Quick Wins (${branchStr})</h3><div class="rec-period">Low Effort / Immediate</div>
      <div class="rec-item"><div class="rec-num" style="background:var(--accent);color:var(--text)">1</div><div class="rec-text">Google Reviews Drive: Focus on collecting customer reviews to convert local search intent in ${branchStr}</div></div>
      <div class="rec-item"><div class="rec-num" style="background:var(--accent);color:var(--text)">2</div><div class="rec-text">Brief staff on beverage upselling (coffee and tea pairings for ${F.session !== 'all' ? F.session : 'breakfast/afternoon'})</div></div>
      <div class="rec-item"><div class="rec-num" style="background:var(--accent);color:var(--text)">3</div><div class="rec-text">Add 3 combo bundles to ${channelStr} to boost AOV beyond ₹${fd.aov}</div></div>
      <div class="rec-item"><div class="rec-num" style="background:var(--accent);color:var(--text)">4</div><div class="rec-text">Remove 20 Dog menu items to reduce kitchen complexity and speed up table turn</div></div>
    </div>
    <div class="rec-card" style="border-color:rgba(231,186,68,.3)">
      <h3>High Impact Initiatives</h3><div class="rec-period">Medium Effort / 30 Days</div>
      <div class="rec-item"><div class="rec-num" style="background:var(--primary);color:var(--bg)">1</div><div class="rec-text">Roll out Mon–Wed Weekday Campaigns (Monday Breakfast Club) targeting ₹${fmt(Math.round(fd.rev * 1.15))} monthly target</div></div>
      <div class="rec-item"><div class="rec-num" style="background:var(--primary);color:var(--bg)">2</div><div class="rec-text">Launch Wednesday Work From Yolkshire workspace packages during low-utilization 3–5 PM snack slot</div></div>
      <div class="rec-item"><div class="rec-num" style="background:var(--primary);color:var(--bg)">3</div><div class="rec-text">Delivery Commission Cushion: Reprice high-demand Zomato & Swiggy items by 5–8% to save ~${fmt(fd.commissions)} in commissions</div></div>
      <div class="rec-item"><div class="rec-num" style="background:var(--primary);color:var(--bg)">4</div><div class="rec-text">Customer loyalty program: design stamps/points to improve retention across ${branchStr}</div></div>
    </div>
    <div class="rec-card" style="border-color:rgba(65,86,57,.4)">
      <h3>Strategic Priorities</h3><div class="rec-period">High Effort / 90 Days</div>
      <div class="rec-item"><div class="rec-num" style="background:var(--secondary);color:var(--text)">1</div><div class="rec-text">Scale Transition: Build repeatable operational systems copying Kothrud's 50.3% Dine-In playbook</div></div>
      <div class="rec-item"><div class="rec-num" style="background:var(--secondary);color:var(--text)">2</div><div class="rec-text">Initiate direct WhatsApp & Web ordering channel to convert delivery customers with 0% platform drain</div></div>
      <div class="rec-item"><div class="rec-num" style="background:var(--secondary);color:var(--text)">3</div><div class="rec-text">Scout 8th branch location (evaluate Hinjewadi / Viman Nagar / Koregaon Park) based on Bavdhan debut model</div></div>
    </div>
  `;
}

function initCharts() {
  const yRev = { ticks: { color: '#a3979d', font: { size: 10, family: 'Raleway' }, callback: v => fmt(v) }, grid: { color: 'rgba(252,240,208,.06)' } };
  const yOrd = { ticks: { color: '#a3979d', font: { size: 10, family: 'Raleway' } }, grid: { color: 'rgba(252,240,208,.06)' } };
  const xBase = { ticks: { color: '#a3979d', font: { size: 10, family: 'Raleway' } }, grid: { color: 'rgba(252,240,208,.06)' } };
  const xNoGrid = { ticks: { color: '#a3979d', font: { size: 10, family: 'Raleway' } }, grid: { display: false } };

  mkChart('c-monthly', 'bar', [], [{ data: [], label: 'Revenue' }], { scales: { x: xBase, y: yRev } });
  mkChart('c-ch-donut', 'doughnut', [], [{ data: [] }], { plugins: { legend: { display: true, position: 'right', labels: { color: '#FCF0D0', font: { size: 10, family: 'Raleway' }, boxWidth: 10 } } }, extra: { cutout: '66%' } });
  mkChart('c-br-bar', 'bar', [], [{ data: [] }], { indexAxis: 'y', scales: { x: { ...xBase, ticks: { ...xBase.ticks, callback: v => fmt(v) } }, y: xNoGrid } });
  mkChart('c-dow', 'bar', [], [{ data: [] }], { scales: { x: xBase, y: yRev } });
  mkChart('c-session-donut', 'doughnut', [], [{ data: [] }], { plugins: { legend: { display: true, position: 'right', labels: { color: '#FCF0D0', font: { size: 10, family: 'Raleway' }, boxWidth: 10 } } }, extra: { cutout: '64%' } });
  mkChart('c-top10r', 'bar', [], [{ data: [] }], { indexAxis: 'y', scales: { x: { ...xBase, ticks: { ...xBase.ticks, callback: v => fmt(v) } }, y: xNoGrid } });

  mkChart('c-daily-rev', 'line', [], [], { scales: { x: { ticks: { color: '#a3979d', font: { size: 9, family: 'Raleway' }, maxTicksLimit: 13 }, grid: { color: 'rgba(252,240,208,.06)' } }, y: yRev } });
  mkChart('c-hr-rev', 'line', [], [{ data: [] }], { scales: { x: xBase, y: yRev } });
  mkChart('c-hr-ord', 'bar', [], [{ data: [] }], { scales: { x: xBase, y: yOrd } });
  mkChart('c-br-trend', 'line', [], [], { scales: { x: xBase, y: yRev } });
  mkChart('c-sess-bar', 'bar', ['Breakfast', 'Lunch', 'Snack', 'Dinner'], [], { scales: { x: xBase, y: { ...yRev }, y2: { position: 'right', ticks: { color: '#a3979d' }, grid: { display: false } } } });

  mkChart('c-top10r2', 'bar', [], [{ data: [] }], { indexAxis: 'y', scales: { x: { ...xBase, ticks: { ...xBase.ticks, callback: v => fmt(v) } }, y: xNoGrid } });
  mkChart('c-top10q', 'bar', [], [{ data: [] }], { indexAxis: 'y', scales: { x: xBase, y: xNoGrid } });

  mkChart('c-me-scatter', 'scatter', [], [], { scales: { x: { title: { display: true, text: 'Qty Sold', color: '#a3979d' }, ticks: { color: '#a3979d' }, grid: { color: 'rgba(252,240,208,.06)' } }, y: { title: { display: true, text: 'Net Revenue', color: '#a3979d' }, ticks: { color: '#a3979d', callback: v => fmt(v) }, grid: { color: 'rgba(252,240,208,.06)' } } } });

  mkChart('c-grow', 'bar', [], [{ data: [] }], { scales: { x: xBase, y: { ticks: { color: '#a3979d', callback: v => '+' + v + '%' }, grid: { color: 'rgba(252,240,208,.06)' } } } });
  mkChart('c-decl', 'bar', [], [{ data: [] }], { scales: { x: xBase, y: { ticks: { color: '#a3979d', callback: v => v + '%' }, grid: { color: 'rgba(252,240,208,.06)' } } } });
  mkChart('c-bill', 'bar', [], [{ data: [] }], { scales: { x: { ticks: { color: '#a3979d' }, grid: { color: 'rgba(252,240,208,.06)' } }, y: yOrd } });
  mkChart('c-aov-ch', 'bar', [], [{ data: [] }], { scales: { x: xBase, y: { ticks: { color: '#a3979d', callback: v => '₹' + v }, grid: { color: 'rgba(252,240,208,.06)' }, min: 320 } } });
  mkChart('c-aov-br', 'bar', [], [{ data: [] }], { indexAxis: 'y', scales: { x: { ticks: { color: '#a3979d', callback: v => '₹' + v }, grid: { color: 'rgba(252,240,208,.06)' }, min: 380 }, y: xNoGrid } });
  mkChart('c-load', 'bar', [], [{ data: [] }], { scales: { x: xBase, y: { ticks: { color: '#a3979d', callback: v => v + '%' }, grid: { color: 'rgba(252,240,208,.06)' }, max: 110 } } });

  mkChart('c-ch-split', 'bar', [], [], { indexAxis: 'y', scales: { x: { ticks: { color: '#a3979d', callback: v => fmt(v) }, grid: { color: 'rgba(252,240,208,.06)' }, stacked: true }, y: { ticks: { color: '#a3979d' }, grid: { display: false }, stacked: true } } });
  mkChart('c-zs-bar', 'bar', [], [], { scales: { x: { ticks: { color: '#a3979d' }, grid: { color: 'rgba(252,240,208,.06)' } }, y: { ticks: { color: '#a3979d', callback: v => fmt(v) }, grid: { color: 'rgba(252,240,208,.06)' } } } });
  mkChart('c-ch-trend', 'line', [], [], { scales: { x: { ticks: { color: '#a3979d' }, grid: { color: 'rgba(252,240,208,.06)' } }, y: { ticks: { color: '#a3979d', callback: v => fmt(v) }, grid: { color: 'rgba(252,240,208,.06)' } } } });

  mkChart('c-kothrud-share', 'doughnut', [], [], { plugins: { legend: { display: true, position: 'right', labels: { color: '#FCF0D0', font: { size: 10 } } } } });
  mkChart('c-kothrud-channel-comp', 'bar', [], [], { scales: { x: xBase, y: { ticks: { color: '#a3979d', callback: v => v + '%' }, grid: { color: 'rgba(252,240,208,.06)' } } } });
  mkChart('c-kothrud-hourly', 'line', [], [], { scales: { x: xBase, y: yRev } });
  mkChart('c-kothrud-bev-breakdown', 'doughnut', [], [], { plugins: { legend: { display: true, position: 'right', labels: { color: '#FCF0D0', font: { size: 10 } } } } });
  mkChart('c-kothrud-menu-mix', 'bar', [], [], { scales: { x: xBase, y: { ticks: { color: '#a3979d', callback: v => v + '%' }, grid: { color: 'rgba(252,240,208,.06)' } } } });

  mkChart('c-q1q2-monthly', 'bar', ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], [{ label: 'Monthly Net Revenue', data: [6240460, 5186052, 5811646, 6762859, 7069957, 6895763], backgroundColor: ['#907aa9', '#907aa9', '#907aa9', '#E7BA44', '#56754d', '#9c5f59'], borderRadius: 5 }], { scales: { x: xBase, y: yRev } });
  mkChart('c-q1q2-branch', 'bar', RAW.branches.filter(b => b !== 'Bavdhan'), [{ label: 'Q1 Net Revenue', data: [5118196, 3702194, 2365690, 2135474, 2255003, 1661599], backgroundColor: 'rgba(144,122,169,.75)', borderRadius: 4 }, { label: 'Q2 Net Revenue', data: [6228775, 3965940, 2690751, 2687223, 2625305, 2166397], backgroundColor: '#E7BA44', borderRadius: 4 }], { scales: { x: xBase, y: yRev } });

  mkChart('c-fc-rev', 'line', ['Apr', 'May', 'Jun', 'Jul (FC)', 'Aug (FC)', 'Sep (FC)'], [{ label: 'Actual Revenue', data: [6762859, 7069957, 6895763, null, null, null], borderColor: '#E7BA44', backgroundColor: 'rgba(231,186,68,.1)', borderWidth: 3 }, { label: 'Linear Forecast', data: [null, null, 6895763, 7042431, 7108883, 7175336], borderColor: '#907aa9', borderDash: [6, 4], borderWidth: 2 }], { scales: { x: xBase, y: yRev } });
  mkChart('c-fc-ord', 'line', ['Apr', 'May', 'Jun', 'Jul (FC)', 'Aug (FC)', 'Sep (FC)'], [{ label: 'Actual Orders', data: [13952, 13631, 12610, null, null, null], borderColor: '#56754d', borderWidth: 3 }, { label: 'Linear Forecast', data: [null, null, 12610, 12056, 11385, 10714], borderColor: '#9c5f59', borderDash: [6, 4], borderWidth: 2 }], { scales: { x: xBase, y: yOrd } });

  // PnL Charts
  mkChart('c-pnl-waterfall', 'bar', [], [], { scales: { x: xBase, y: yRev } });
  mkChart('c-pnl-breakdown', 'doughnut', [], [], { plugins: { legend: { display: true, position: 'right', labels: { color: '#FCF0D0', font: { size: 10 } } } }, extra: { cutout: '65%' } });

  // Page 2 Menu Performance Charts
  mkChart('c-menu-cat-pie', 'doughnut', [], [], { plugins: { legend: { display: true, position: 'right', labels: { color: '#FCF0D0', font: { size: 10 } } } }, extra: { cutout: '62%' } });
  mkChart('c-menu-price-tier', 'bar', [], [], { scales: { x: xBase, y: yOrd } });

  // Page 13 Comparative Store-to-Store Charts
  mkChart('c-comp-monthly', 'bar', ['April', 'May', 'June'], [], { scales: { x: xBase, y: yRev } });
  mkChart('c-comp-channels', 'bar', ['Dine In', 'Zomato', 'Swiggy', 'Takeaway'], [], { scales: { x: xBase, y: yRev } });
  mkChart('c-comp-hourly', 'line', RAW.hours.map(h => h + ':00'), [], { scales: { x: xBase, y: yRev } });
  mkChart('c-comp-session', 'bar', ['Breakfast', 'Lunch', 'Snack', 'Dinner'], [], { scales: { x: xBase, y: yRev } });
  mkChart('c-comp-cat', 'bar', ['Rice Bowls', 'Omelettes', 'Coffee', 'Sandwiches'], [], { scales: { x: xBase, y: yRev } });
}


export function buildExecutiveReport() {
  const el = document.getElementById('report-content');
  if (!el) return;
  const fd = getFilteredData();
  el.innerHTML = `
    <div style="border-bottom:2px solid var(--primary);padding-bottom:14px;margin-bottom:20px">
      <h1 style="font-size:22px;color:var(--primary);margin-bottom:6px">YOLKSHIRE — Comprehensive Business, PnL & Performance Audit</h1>
      <p style="font-size:12px;color:var(--muted)">Prepared for Executive Leadership & Operations Team · Active Context: ${buildContextLabel()}</p>
    </div>

    <h2 style="font-size:16px;color:var(--primary);margin-top:20px;margin-bottom:10px">1. Executive Summary & Revenue Performance</h2>
    <p style="line-height:1.6;margin-bottom:12px">Under active filter selection (<strong>${buildContextLabel()}</strong>), Yolkshire generated <strong>${fmt(fd.rev)}</strong> in net sales across <strong>${fmtN(fd.ord)} orders</strong> with an Average Order Value (AOV) of <strong>₹${fd.aov}</strong>. Target achievement is <strong>${fd.variancePct}%</strong> against a set sales target of ${fmt(fd.targetRev)}.</p>

    <h2 style="font-size:16px;color:var(--primary);margin-top:20px;margin-bottom:10px">2. Profit & Loss (PnL) Overview</h2>
    <p style="line-height:1.6;margin-bottom:12px">Total operating expenses are estimated at <strong>${fmt(fd.totalOpEx)}</strong> (${((fd.totalOpEx / (fd.rev || 1)) * 100).toFixed(1)}% of revenue), delivering a Net EBITDA Profit of <strong>${fmt(fd.netProfit)}</strong> (${fd.ebitdaMargin}% margin). Expense breakdown: COGS (${fmt(fd.cogs)}), Labor (${fmt(fd.labor)}), Rent (${fmt(fd.rent)}), Delivery Platform Commissions (${fmt(fd.commissions)}), and General Ops (${fmt(fd.ops)}).</p>

    <h2 style="font-size:16px;color:var(--primary);margin-top:20px;margin-bottom:10px">3. Operational & Channel Intelligence Summary</h2>
    <p style="line-height:1.6;margin-bottom:12px">Offline Dine-In & Takeaway generated <strong>${fmt(fd.chRevs[0] + fd.chRevs[3])}</strong> at 0% platform drain, whereas Zomato & Swiggy contributed <strong>${fmt(fd.chRevs[1] + fd.chRevs[2])}</strong> online while absorbing ~${fmt(fd.commissions)} in commissions.</p>

    <h2 style="font-size:16px;color:var(--primary);margin-top:20px;margin-bottom:10px">4. Strategic Action Recommendations</h2>
    <ul style="margin-left:20px;line-height:1.8">
      <li><strong>Standardize Kothrud Playbook:</strong> Copy Kothrud's 50.3% Dine-In model and 54% beverage attach scripts to Wadgaon Sheri and Wakad.</li>
      <li><strong>Cushion Commission Drain:</strong> Reprice delivery-exclusive combos on Zomato & Swiggy by 5–8% to regain ~${fmt(Math.round(fd.commissions * 0.2))} in margin.</li>
      <li><strong>Monetize Afternoon Slack:</strong> Launch 3–5 PM workspace packages to utilize idle kitchen capacity across all active branches.</li>
    </ul>
  `;
}

// Target Modal Functions
export function openTargetModal() {
  const overlay = document.getElementById('target-modal-overlay');
  if (overlay) overlay.classList.add('open');
}

export function closeTargetModal() {
  const overlay = document.getElementById('target-modal-overlay');
  if (overlay) overlay.classList.remove('open');
}

export function saveSalesTargets() {
  const branches = RAW.branches;
  const months = ['apr', 'may', 'jun'];
  RAW.branchTargets = {};

  let totalChainTarget = 0;
  branches.forEach(b => {
    RAW.branchTargets[b] = {};
    months.forEach(m => {
      const inputEl = document.getElementById(`t-${b}-${m}`);
      const val = inputEl ? parseFloat(inputEl.value) || 0 : 0;
      RAW.branchTargets[b][m] = val;
      totalChainTarget += val;
    });
  });

  const fd = getFilteredData();
  const totalPct = ((fd.actualRev / (totalChainTarget || 1)) * 100).toFixed(1);

  alert(`🎯 Branch-Wise Targets Updated Live!\n\nOverall Chain Q2 Target: ${fmt(totalChainTarget)}\nActual Q2 Revenue: ${fmt(fd.actualRev)}\nChain Achievement: ${totalPct}% of target!`);

  closeTargetModal();
  refresh();
}

// Category & Item Filter Functions
export function openCategoryModal() {
  initCategorySelection();
  const overlay = document.getElementById('category-modal-overlay');
  const container = document.getElementById('category-modal-list');
  if (!container) return;

  container.innerHTML = '';
  Object.keys(MENU_CATEGORIES).forEach(cat => {
    let catHtml = `
      <div style="background:var(--bg3);padding:12px 16px;border-radius:8px;border:1px solid var(--border)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <label style="font-weight:700;font-size:13px;color:var(--primary);cursor:pointer">
            <input type="checkbox" checked onchange="toggleCategoryGroup('${cat}', this.checked)" /> 📂 ${cat}
          </label>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:6px;padding-left:18px">
    `;
    MENU_CATEGORIES[cat].forEach(item => {
      const isChecked = activeCategorySelection.has(item);
      catHtml += `
        <label style="font-size:11px;color:var(--text);cursor:pointer;display:flex;align-items:center;gap:6px">
          <input type="checkbox" class="cat-item-cb" data-cat="${cat}" data-item="${item}" ${isChecked ? 'checked' : ''} /> ${item}
        </label>
      `;
    });
    catHtml += `</div></div>`;
    container.innerHTML += catHtml;
  });

  if (overlay) overlay.classList.add('open');
}

export function closeCategoryModal() {
  const overlay = document.getElementById('category-modal-overlay');
  if (overlay) overlay.classList.remove('open');
}

export function toggleCategoryGroup(cat, isChecked) {
  document.querySelectorAll(`.cat-item-cb[data-cat="${cat}"]`).forEach(cb => { cb.checked = isChecked; });
}

export function selectAllCategories(isChecked) {
  document.querySelectorAll('.cat-item-cb').forEach(cb => { cb.checked = isChecked; });
}

export function applyCategoryFilter() {
  const selected = new Set();
  document.querySelectorAll('.cat-item-cb:checked').forEach(cb => selected.add(cb.getAttribute('data-item')));
  activeCategorySelection = selected;
  alert(`🍕 Category & Item Filter Applied!\n\n${selected.size} items active for analysis across all tabs.`);
  closeCategoryModal();
  refresh();
}

export function buildMenuCatalogModalHtml() {
  const fd = getFilteredData();
  const scale = fd.rev / 20728578;
  const nonMenuItemsSet = new Set(getNonMenuItems());

  const catalog = [];
  Object.keys(MENU_CATEGORIES).forEach(cat => {
    MENU_CATEGORIES[cat].forEach((item, idx) => {
      const isNon = nonMenuItemsSet.has(item);
      if (excludeNonMenu && isNon) return;
      if (activeCategorySelection && !activeCategorySelection.has(item)) return;

      let baseRev = 0, baseQty = 0;
      const mePoint = RAW.mePoints.find(p => p.item === item);
      if (mePoint) {
        baseRev = mePoint.y;
        baseQty = mePoint.x;
      } else {
        const seed = (item.length * 137 + idx * 43) % 100;
        baseQty = Math.round(300 + seed * 25);
        baseRev = Math.round(baseQty * (120 + (seed % 350)));
      }

      const rev = Math.round(baseRev * scale);
      const qty = Math.round(baseQty * scale);
      const aovContrib = fd.rev > 0 ? ((rev / fd.rev) * 100).toFixed(2) + '%' : '0.0%';

      let quadrant = 'Star ⭐';
      let tagClass = 'star';
      if (qty >= 1200 && rev >= 150000) { quadrant = 'Star ⭐'; tagClass = 'star'; }
      else if (qty >= 1200 && rev < 150000) { quadrant = 'Plow Horse 🐴'; tagClass = 'horse'; }
      else if (qty < 1200 && rev >= 150000) { quadrant = 'Puzzle 🧩'; tagClass = 'puzzle'; }
      else { quadrant = 'Dog 🐕'; tagClass = 'risk'; }

      catalog.push({ name: item, cat, qty, rev, aovContrib, quadrant, tagClass });
    });
  });

  catalog.sort((a, b) => b.rev - a.rev);
  catalog.forEach((item, index) => { item.rank = index + 1; });

  let html = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
      <div style="font-weight:700;font-size:13px;color:var(--primary)">
        🍕 Full Menu Catalog Performance Matrix (${catalog.length} Items Displayed)
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <input type="text" id="modal-menu-search" placeholder="🔍 Search item or category..." onkeyup="filterModalMenuTable(this.value)" style="padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:11px;width:220px" />
        <button class="btn-csv-export" onclick="exportTableToCSV('tbl-modal-menu-catalog', 'yolkshire_full_menu_catalog.csv')">📥 Export CSV</button>
      </div>
    </div>
    <div style="max-height:420px;overflow-y:auto">
      <table class="tbl" id="tbl-modal-menu-catalog">
        <thead>
          <tr>
            <th onclick="sortTable('tbl-modal-menu-catalog',0)">Rank</th>
            <th onclick="sortTable('tbl-modal-menu-catalog',1)">Item Name</th>
            <th onclick="sortTable('tbl-modal-menu-catalog',2)">Category</th>
            <th onclick="sortTable('tbl-modal-menu-catalog',3)">Qty Sold</th>
            <th onclick="sortTable('tbl-modal-menu-catalog',4)">Net Revenue</th>
            <th onclick="sortTable('tbl-modal-menu-catalog',5)">Share %</th>
            <th onclick="sortTable('tbl-modal-menu-catalog',6)">Quadrant Status</th>
          </tr>
        </thead>
        <tbody>
  `;

  catalog.forEach(item => {
    html += `
      <tr class="modal-menu-row" data-name="${item.name.toLowerCase()}" data-cat="${item.cat.toLowerCase()}">
        <td>#${item.rank}</td>
        <td><strong>${item.name}</strong></td>
        <td>${item.cat}</td>
        <td>${item.qty.toLocaleString()}</td>
        <td style="font-weight:700">${fmt(item.rev)}</td>
        <td>${item.aovContrib}</td>
        <td><span class="tag ${item.tagClass}">${item.quadrant}</span></td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  return html;
}

export function filterModalMenuTable(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('.modal-menu-row').forEach(row => {
    const name = row.getAttribute('data-name') || '';
    const cat = row.getAttribute('data-cat') || '';
    row.style.display = (name.includes(q) || cat.includes(q)) ? '' : 'none';
  });
}

// Table Sorting Engine

export function sortTable(tableId, colIndex) {
  const tbl = document.getElementById(tableId);
  if (!tbl) return;
  const tbody = tbl.querySelector('tbody') || tbl;
  const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => r.querySelectorAll('th').length === 0);
  if (rows.length === 0) return;

  const ths = tbl.querySelectorAll('th');
  const th = ths[colIndex];
  if (!th) return;

  const currentDir = th.getAttribute('data-sort-dir') === 'asc' ? 'desc' : 'asc';
  ths.forEach(t => {
    t.removeAttribute('data-sort-dir');
    t.classList.remove('sort-asc', 'sort-desc');
  });
  th.setAttribute('data-sort-dir', currentDir);
  th.classList.add(currentDir === 'asc' ? 'sort-asc' : 'sort-desc');

  const parseVal = (str) => {
    if (!str) return 0;
    let s = str.trim();
    if (s === '—' || s === 'N/A' || s === 'New') return -Infinity;
    let numStr = s.replace(/[₹,%\s]/g, '');
    if (numStr.endsWith('Cr')) return parseFloat(numStr.replace('Cr', '')) * 1e7;
    if (numStr.endsWith('L')) return parseFloat(numStr.replace('L', '')) * 1e5;
    if (numStr.endsWith('k')) return parseFloat(numStr.replace('k', '')) * 1e3;
    const n = parseFloat(numStr);
    return isNaN(n) ? s.toLowerCase() : n;
  };

  rows.sort((a, b) => {
    const cellA = a.children[colIndex] ? a.children[colIndex].textContent : '';
    const cellB = b.children[colIndex] ? b.children[colIndex].textContent : '';
    const valA = parseVal(cellA);
    const valB = parseVal(cellB);
    if (typeof valA === 'number' && typeof valB === 'number') {
      return currentDir === 'asc' ? valA - valB : valB - valA;
    }
    return currentDir === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  rows.forEach(r => tbody.appendChild(r));
}

// CSV Data Export Engine
export function exportTableToCSV(tableId, filename = 'yolkshire_analytics_export.csv') {
  const tbl = document.getElementById(tableId);
  if (!tbl) return;
  const rows = Array.from(tbl.querySelectorAll('tr'));
  const csvLines = rows.map(row => {
    const cols = Array.from(row.querySelectorAll('th, td'));
    return cols.map(c => {
      let text = c.textContent.trim().replace(/"/g, '""');
      return `"${text}"`;
    }).join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvLines.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// What-If Profitability Simulator
export let simState = {
  cogsPct: 30.0,
  bevAttachUplift: 0,
  commRate: 25.0,
  priceAdj: 0
};

export function updateSim(key, val) {
  simState[key] = parseFloat(val);
  renderWhatIfSimulator();
}

export function renderWhatIfSimulator() {
  const fd = getFilteredData();
  const baseRev = fd.rev;
  const priceMult = 1 + (simState.priceAdj / 100);
  const bevUpliftVal = Math.round(baseRev * (simState.bevAttachUplift / 100) * 0.15);
  const simRev = Math.round((baseRev + bevUpliftVal) * priceMult);

  const simCogs = Math.round(simRev * (simState.cogsPct / 100));
  const simLabor = Math.round(simRev * 0.18);
  const simRent = Math.round(simRev * 0.15);
  const delShare = F.channel === 'Delivery' ? 1.0 : (F.channel === 'Zomato' || F.channel === 'Swiggy' ? 1.0 : (F.channel === 'Dine In' || F.channel === 'Takeaway' ? 0.0 : 0.5253));
  const simComm = Math.round(simRev * delShare * (simState.commRate / 100));
  const simOps = Math.round(simRev * 0.05);

  const simTotalOpEx = simCogs + simLabor + simRent + simComm + simOps;
  const simNetProfit = simRev - simTotalOpEx;
  const simMargin = simRev > 0 ? ((simNetProfit / simRev) * 100).toFixed(1) : '0.0';
  const profitDiff = simNetProfit - fd.netProfit;

  const setEl = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  setEl('sim-val-cogs', simState.cogsPct.toFixed(1) + '%');
  setEl('sim-val-bev', '+' + simState.bevAttachUplift + '%');
  setEl('sim-val-comm', simState.commRate.toFixed(1) + '%');
  setEl('sim-val-price', (simState.priceAdj >= 0 ? '+' : '') + simState.priceAdj + '%');

  setEl('sim-res-rev', fmt(simRev));
  setEl('sim-res-opex', fmt(simTotalOpEx));
  setEl('sim-res-profit', fmt(simNetProfit));
  setEl('sim-res-margin', simMargin + '%');
  setEl('sim-res-diff', (profitDiff >= 0 ? '+' : '') + fmt(profitDiff) + ' vs baseline');
}

export let dualStoreA = 'Kothrud';
export let dualStoreB = 'Wadgaon Sheri';

export function setDualStoreA(b) {
  dualStoreA = b;
  renderDualStoreComparison();
}

export function setDualStoreB(b) {
  dualStoreB = b;
  renderDualStoreComparison();
}

export function swapDualStores() {
  const temp = dualStoreA;
  dualStoreA = dualStoreB;
  dualStoreB = temp;
  renderDualStoreComparison();
}


export function renderDualStoreComparison() {
  const pA = BRANCH_PROFILES[dualStoreA] || RAW.branch[dualStoreA];
  const pB = BRANCH_PROFILES[dualStoreB] || RAW.branch[dualStoreB];
  const bdA = RAW.branch[dualStoreA];
  const bdB = RAW.branch[dualStoreB];

  if (!bdA || !bdB) return;

  const fd = getFilteredData();
  const scale = fd.rev / 20728578;

  const revA = Math.round(bdA.rev * scale);
  const revB = Math.round(bdB.rev * scale);
  const ordA = Math.round(bdA.ord * scale);
  const ordB = Math.round(bdB.ord * scale);

  const offA = Math.round(((bdA.ch['Dine In']?.rev || 0) + (bdA.ch['Takeaway']?.rev || 0)) * scale);
  const onA = Math.round(((bdA.ch['Zomato']?.rev || 0) + (bdA.ch['Swiggy']?.rev || 0)) * scale);
  const dineA = Math.round((bdA.ch['Dine In']?.rev || 0) * scale);
  const dinePctA = revA > 0 ? ((dineA / revA) * 100).toFixed(1) : '0';

  const offB = Math.round(((bdB.ch['Dine In']?.rev || 0) + (bdB.ch['Takeaway']?.rev || 0)) * scale);
  const onB = Math.round(((bdB.ch['Zomato']?.rev || 0) + (bdB.ch['Swiggy']?.rev || 0)) * scale);
  const dineB = Math.round((bdB.ch['Dine In']?.rev || 0) * scale);
  const dinePctB = revB > 0 ? ((dineB / revB) * 100).toFixed(1) : '0';

  const bevAttachA = dualStoreA === 'Kothrud' ? 54 : dualStoreA === 'Salunkhe Vihar' ? 51 : dualStoreA === 'AUNDH' ? 48 : 31;
  const bevAttachB = dualStoreB === 'Kothrud' ? 54 : dualStoreB === 'Salunkhe Vihar' ? 51 : dualStoreB === 'AUNDH' ? 48 : 29;

  const revDiff = revA - revB;
  const aovDiff = bdA.aov - bdB.aov;

  const selA = document.getElementById('sel-dual-store-a');
  const selB = document.getElementById('sel-dual-store-b');
  if (selA) selA.value = dualStoreA;
  if (selB) selB.value = dualStoreB;

  const setEl = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  setEl('kpi-comp-revdiff', (revDiff >= 0 ? '+' : '') + fmt(revDiff));
  setEl('kpi-comp-storesub', `${dualStoreA} vs ${dualStoreB}`);
  setEl('kpi-comp-dinegap', `${dinePctA}% vs ${dinePctB}%`);
  setEl('kpi-comp-bevgap', `${bevAttachA}% vs ${bevAttachB}%`);
  setEl('kpi-comp-aovgap', `₹${bdA.aov} vs ₹${bdB.aov}`);
  setEl('kpi-comp-aovsub', `${aovDiff >= 0 ? '+' : ''}₹${aovDiff} ticket size gap`);
  setEl('kpi-comp-statusval', `${pA.status || 'Active'} vs ${pB.status || 'Active'}`);

  const tbl = document.getElementById('tbl-comp-diagnostic');
  if (tbl) {
    tbl.innerHTML = `
      <thead>
        <tr>
          <th onclick="sortTable('tbl-comp-diagnostic',0)">Root Cause Metric</th>
          <th onclick="sortTable('tbl-comp-diagnostic',1)">${dualStoreA} (Store A)</th>
          <th onclick="sortTable('tbl-comp-diagnostic',2)">${dualStoreB} (Store B)</th>
          <th onclick="sortTable('tbl-comp-diagnostic',3)">Performance Variance</th>
          <th onclick="sortTable('tbl-comp-diagnostic',4)">Executive Diagnostic Takeaway</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Net Revenue Contribution</strong></td>
          <td style="font-weight:700;color:var(--primary)">${fmt(revA)}</td>
          <td>${fmt(revB)}</td>
          <td class="${revDiff >= 0 ? 'trend-up' : 'trend-dn'}">${revDiff >= 0 ? '+' : ''}${fmt(revDiff)}</td>
          <td>${revA > revB ? `${dualStoreA} leads chain sales by ${((revA/(revB||1)-1)*100).toFixed(1)}%` : `${dualStoreB} outperforms ${dualStoreA}`}</td>
        </tr>
        <tr>
          <td><strong>Dine-In Preference %</strong></td>
          <td style="font-weight:700;color:var(--green)">${dinePctA}%</td>
          <td>${dinePctB}%</td>
          <td class="${parseFloat(dinePctA) >= parseFloat(dinePctB) ? 'trend-up' : 'trend-dn'}">${(parseFloat(dinePctA) - parseFloat(dinePctB)).toFixed(1)}% gap</td>
          <td>${parseFloat(dinePctA) > parseFloat(dinePctB) ? `${dualStoreA} retains more non-commissioned revenue` : `${dualStoreB} has higher Dine-In foot traffic`}</td>
        </tr>
        <tr>
          <td><strong>Beverage Attach Rate %</strong></td>
          <td style="font-weight:700;color:var(--amber)">${bevAttachA}%</td>
          <td>${bevAttachB}%</td>
          <td class="${bevAttachA >= bevAttachB ? 'trend-up' : 'trend-dn'}">${bevAttachA - bevAttachB}% gap</td>
          <td>${bevAttachA > bevAttachB ? `${dualStoreA} upselling coffee scripts working` : `${dualStoreB} staff needs beverage upselling training`}</td>
        </tr>
        <tr>
          <td><strong>Dine-In AOV</strong></td>
          <td style="font-weight:700">₹${bdA.aov}</td>
          <td>₹${bdB.aov}</td>
          <td class="${bdA.aov >= bdB.aov ? 'trend-up' : 'trend-dn'}">₹${aovDiff} gap</td>
          <td>${bdA.aov >= bdB.aov ? `${dualStoreA} captures higher spend per table` : `${dualStoreB} higher ticket size per table`}</td>
        </tr>
        <tr>
          <td><strong>Delivery Platform Fee Drain</strong></td>
          <td style="color:#e68c85">~${fmt(Math.round(onA * 0.25))}</td>
          <td style="color:#e68c85">~${fmt(Math.round(onB * 0.25))}</td>
          <td>&mdash;</td>
          <td>${onA > onB ? `${dualStoreA} loses more revenue to commissions` : `${dualStoreB} heavily delivery dependent`}</td>
        </tr>
      </tbody>
    `;
  }

  updateChart('c-comp-monthly', ['April', 'May', 'June'], [
    { label: dualStoreA, data: [Math.round((bdA.apr || 0) * scale), Math.round((bdA.may || 0) * scale), Math.round((bdA.jun || 0) * scale)], backgroundColor: '#E7BA44', borderRadius: 4 },
    { label: dualStoreB, data: [Math.round((bdB.apr || 0) * scale), Math.round((bdB.may || 0) * scale), Math.round((bdB.jun || 0) * scale)], backgroundColor: '#5985b9', borderRadius: 4 }
  ]);

  updateChart('c-comp-channels', ['Dine In', 'Zomato', 'Swiggy', 'Takeaway'], [
    { label: dualStoreA, data: ['Dine In', 'Zomato', 'Swiggy', 'Takeaway'].map(c => Math.round((bdA.ch[c]?.rev || 0) * scale)), backgroundColor: '#415639', borderRadius: 4 },
    { label: dualStoreB, data: ['Dine In', 'Zomato', 'Swiggy', 'Takeaway'].map(c => Math.round((bdB.ch[c]?.rev || 0) * scale)), backgroundColor: '#907aa9', borderRadius: 4 }
  ]);

  updateChart('c-comp-hourly', RAW.hours.map(h => h + ':00'), [
    { label: dualStoreA, data: RAW.hRev.map(v => Math.round(v * (revA / 20728578))), borderColor: '#E7BA44', backgroundColor: 'transparent', borderWidth: 2, tension: 0.3 },
    { label: dualStoreB, data: RAW.hRev.map(v => Math.round(v * (revB / 20728578))), borderColor: '#5985b9', backgroundColor: 'transparent', borderWidth: 2, tension: 0.3 }
  ]);

  updateChart('c-comp-session', ['Breakfast', 'Lunch', 'Snack', 'Dinner'], [
    { label: dualStoreA, data: [0.273, 0.303, 0.093, 0.331].map(f => Math.round(revA * f)), backgroundColor: '#E7BA44', borderRadius: 4 },
    { label: dualStoreB, data: [0.273, 0.303, 0.093, 0.331].map(f => Math.round(revB * f)), backgroundColor: '#5985b9', borderRadius: 4 }
  ]);

  updateChart('c-comp-cat', ['Rice Bowls', 'Omelettes', 'Coffee', 'Sandwiches'], [
    { label: dualStoreA, data: [Math.round(revA * 0.35), Math.round(revA * 0.25), Math.round(revA * 0.20), Math.round(revA * 0.20)], backgroundColor: '#415639', borderRadius: 4 },
    { label: dualStoreB, data: [Math.round(revB * 0.35), Math.round(revB * 0.25), Math.round(revB * 0.20), Math.round(revB * 0.20)], backgroundColor: '#907aa9', borderRadius: 4 }
  ]);
}



export function renderMarketBasketTab() {
  const mb = RAW.marketBasket;
  if (!mb) return;

  // 1. Render Combo Cards
  const comboGrid = document.getElementById('mb-combo-grid');
  if (comboGrid && mb.combos) {
    comboGrid.innerHTML = mb.combos.map(c => `
      <div class="combo-card">
        <div>
          <div class="combo-header">
            <div class="combo-title">${c.title}</div>
            <span class="combo-tag ${c.typeTag}">${c.type}</span>
          </div>
          <p style="font-size:11px;color:var(--muted);margin-bottom:10px">${c.desc}</p>
          <ul class="combo-items">
            ${c.items.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div>
          <div class="combo-pricing">
            <span class="combo-price-old">₹${c.standalonePrice}</span>
            <span class="combo-price-new">₹${c.comboPrice}</span>
            <span class="combo-discount-badge">${c.discountPct}% OFF</span>
          </div>
          <div class="combo-economics">
            <div class="combo-eco-item"><div class="combo-eco-label">Food Cost</div><div class="combo-eco-val">₹${c.cost.toFixed(1)}</div></div>
            <div class="combo-eco-item"><div class="combo-eco-label">Net Profit</div><div class="combo-eco-val" style="color:var(--green)">₹${c.profit.toFixed(1)}</div></div>
            <div class="combo-eco-item"><div class="combo-eco-label">Gross Margin</div><div class="combo-eco-val" style="color:var(--primary)">${c.marginPct}%</div></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // 2. Render Puzzles Table
  const puzzlesTbl = document.querySelector('#tbl-mb-puzzles tbody');
  if (puzzlesTbl && mb.puzzles) {
    puzzlesTbl.innerHTML = mb.puzzles.map(p => `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td><span class="tag online">${p.cat}</span></td>
        <td>₹${p.price}</td>
        <td>₹${p.cost}</td>
        <td style="font-weight:700;color:var(--green)">${p.marginPct}%</td>
        <td>${p.qty}</td>
        <td style="color:var(--primary);font-weight:600">✦ ${p.partner}</td>
      </tr>
    `).join('');
  }

  // 3. Render Rules Table
  window._mbRulesList = mb.topRules || [];
  renderMBRulesTable(window._mbRulesList);

  // 4. Render Category Co-occurrence Chart
  if (mb.catMatrix) {
    const labels = mb.catMatrix.map(m => `${m.catA} + ${m.catB}`);
    const coOccs = mb.catMatrix.map(m => m.coOcc);
    const lifts = mb.catMatrix.map(m => m.lift);

    updateChart('c-mb-cat', labels, [
      { label: 'Co-Occurrence Orders', data: coOccs, backgroundColor: '#E7BA44', borderRadius: 4, yAxisID: 'y' },
      { label: 'Lift Score (Affinity)', data: lifts, borderColor: '#9fc794', backgroundColor: 'transparent', borderWidth: 2, type: 'line', yAxisID: 'y2' }
    ]);
  }
}

export function renderMBRulesTable(rules) {
  const tbody = document.querySelector('#tbl-mb-rules tbody');
  if (!tbody) return;
  if (!rules || rules.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted)">No matching rules found</td></tr>';
    return;
  }
  tbody.innerHTML = rules.map(r => {
    const liftBadgeClass = r.lift >= 10 ? 'lift-high' : 'lift-med';
    const affinityText = r.lift >= 50 ? '🔥 Ultra High' : r.lift >= 10 ? '⭐ Strong Affinity' : '👍 Positive';
    return `
      <tr>
        <td><strong>${r.itemA}</strong></td>
        <td><strong>${r.itemB}</strong></td>
        <td style="font-weight:700">${r.coOcc.toLocaleString()}</td>
        <td>${(r.confA * 100).toFixed(1)}%</td>
        <td>${(r.confB * 100).toFixed(1)}%</td>
        <td style="font-weight:800;color:var(--primary)">${r.lift}x</td>
        <td><span class="lift-badge ${liftBadgeClass}">${affinityText}</span></td>
      </tr>
    `;
  }).join('');
}

export function filterMBRules() {
  const query = (document.getElementById('mb-rule-search')?.value || '').toLowerCase().trim();
  const allRules = window._mbRulesList || (RAW.marketBasket ? RAW.marketBasket.topRules : []);
  if (!query) {
    renderMBRulesTable(allRules);
    return;
  }
  const filtered = allRules.filter(r => r.itemA.toLowerCase().includes(query) || r.itemB.toLowerCase().includes(query));
  renderMBRulesTable(filtered);
}

export function renderDailySnapshot() {
  const branch = document.getElementById('f-branch')?.value || 'all';
  const channel = document.getElementById('f-channel')?.value || 'all';

  let scale = 1.0;
  if (branch !== 'all' && RAW.branch[branch]) {
    scale = (RAW.branch[branch].share || 15) / 100;
  }
  if (channel !== 'all') {
    scale *= 0.5;
  }

  const ds = RAW.dailySnapshot;
  if (!ds) return;

  const walkins = Math.round(ds.walkinsToday * scale);
  const orders = Math.round(ds.ordersToday * scale);
  const loyalty = Math.round(ds.loyaltyToday.newSignups * scale);
  const targetRev = Math.round(ds.monthlyTarget.targetRev * scale);
  const achievedRev = Math.round(ds.monthlyTarget.achievedRev * scale);
  const remainingRev = Math.max(0, targetRev - achievedRev);
  const daysLeft = ds.monthlyTarget.daysTotal - ds.monthlyTarget.daysElapsed;
  const reqRunRate = daysLeft > 0 ? Math.round(remainingRev / daysLeft) : 0;
  const pctAchieved = Math.min(100, Math.round((achievedRev / Math.max(1, targetRev)) * 1000) / 10);

  const elWalkins = document.getElementById('ds-walkins');
  if (elWalkins) elWalkins.textContent = walkins.toLocaleString();
  const elOrders = document.getElementById('ds-orders');
  if (elOrders) elOrders.textContent = orders.toLocaleString();
  const elLoyalty = document.getElementById('ds-loyalty');
  if (elLoyalty) elLoyalty.textContent = '+' + loyalty;
  const elTargetAchieved = document.getElementById('ds-target-achieved');
  if (elTargetAchieved) elTargetAchieved.textContent = pctAchieved + '%';
  const elRunRate = document.getElementById('ds-run-rate');
  if (elRunRate) elRunRate.textContent = '₹' + (reqRunRate / 100000).toFixed(2) + 'L';

  const elProgressFill = document.getElementById('ds-progress-fill');
  if (elProgressFill) elProgressFill.style.width = pctAchieved + '%';
  const elAchieved = document.getElementById('ds-progress-achieved');
  if (elAchieved) elAchieved.textContent = '₹' + (achievedRev / 100000).toFixed(2) + ' Lakhs';
  const elRemaining = document.getElementById('ds-progress-remaining');
  if (elRemaining) elRemaining.textContent = '₹' + (remainingRev / 100000).toFixed(2) + ' Lakhs';
  const elTotal = document.getElementById('ds-progress-total');
  if (elTotal) elTotal.textContent = '₹' + (targetRev / 100000).toFixed(2) + ' Lakhs';

  const elPaceStatus = document.getElementById('ds-pace-status');
  if (elPaceStatus) {
    elPaceStatus.textContent = pctAchieved >= 65 ? 'On Pace (' + pctAchieved + '% achieved)' : 'Lagging Target (' + pctAchieved + '% achieved)';
  }
  const elTargetNeeded = document.getElementById('ds-daily-target-needed');
  if (elTargetNeeded) elTargetNeeded.textContent = '₹' + reqRunRate.toLocaleString() + '/day';
  const elDaysLeft = document.getElementById('ds-days-left');
  if (elDaysLeft) elDaysLeft.textContent = daysLeft + ' days';

  const elTblWalkins = document.getElementById('ds-tbl-walkins');
  if (elTblWalkins) elTblWalkins.textContent = walkins.toLocaleString();
  const elTblSignups = document.getElementById('ds-tbl-signups');
  if (elTblSignups) elTblSignups.textContent = '+' + loyalty + ' Members';
  const elTblLoyaltyOrders = document.getElementById('ds-tbl-loyalty-orders');
  if (elTblLoyaltyOrders) elTblLoyaltyOrders.textContent = Math.round(orders * 0.33) + ' Orders (33.0%)';

  const grid = document.getElementById('ds-reviews-grid');
  if (grid && ds.reviews && ds.reviews.feed) {
    let reviews = ds.reviews.feed;
    if (branch !== 'all') {
      const match = reviews.filter(r => r.branch.toLowerCase().includes(branch.toLowerCase()));
      if (match.length > 0) reviews = match;
    }
    if (channel !== 'all') {
      const match = reviews.filter(r => r.channel.toLowerCase().includes(channel.toLowerCase()));
      if (match.length > 0) reviews = match;
    }

    grid.innerHTML = reviews.map(r => `
      <div class="review-card">
        <div class="review-header">
          <span class="review-user">${r.customer}</span>
          <div class="review-tags">
            <span class="review-tag">${r.branch}</span>
            <span class="review-tag">${r.channel}</span>
          </div>
        </div>
        <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
        <div class="review-text">${r.comment}</div>
        <div class="review-footer">
          <span>${r.time}</span>
          <span style="color:${r.sentiment==='positive'?'#9fc794':'var(--muted)'}">${r.sentiment.toUpperCase()}</span>
        </div>
      </div>
    `).join('');
  }

  const canvas = document.getElementById('c-daily-orders-ch');
  if (canvas && typeof Chart !== 'undefined') {
    if (CHARTS['c-daily-orders-ch']) {
      CHARTS['c-daily-orders-ch'].destroy();
    }
    const ctx = canvas.getContext('2d');
    CHARTS['c-daily-orders-ch'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Dine In', 'Zomato', 'Swiggy', 'Takeaway'],
        datasets: [{
          data: [Math.round(181 * scale), Math.round(149 * scale), Math.round(108 * scale), Math.round(4 * scale)],
          backgroundColor: ['#415639', '#cb202d', '#fc8019', '#a3979d'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: getTextColor(), font: { size: 10 } } }
        }
      }
    });
  }
}

export function recalcFranchiseeModel() {
  const targetProfit = parseFloat(document.getElementById('inp-target-profit')?.value || 200000);
  const capex = parseFloat(document.getElementById('inp-capex')?.value || 4000000);
  const cogsPct = parseFloat(document.getElementById('inp-cogs')?.value || 25.0);
  const laborPct = parseFloat(document.getElementById('inp-labor')?.value || 18.0);
  const rentPct = parseFloat(document.getElementById('inp-rent')?.value || 12.0);
  const commPct = parseFloat(document.getElementById('inp-comm')?.value || 25.0);
  const dineInShare = parseFloat(document.getElementById('inp-dinein-share')?.value || 50);
  const aov = parseFloat(document.getElementById('inp-aov')?.value || 516);

  if (document.getElementById('lbl-target-profit')) document.getElementById('lbl-target-profit').textContent = '₹' + targetProfit.toLocaleString();
  if (document.getElementById('lbl-capex')) document.getElementById('lbl-capex').textContent = '₹' + capex.toLocaleString();
  if (document.getElementById('lbl-cogs')) document.getElementById('lbl-cogs').textContent = cogsPct.toFixed(1) + '%';
  if (document.getElementById('lbl-labor')) document.getElementById('lbl-labor').textContent = laborPct.toFixed(1) + '%';
  if (document.getElementById('lbl-rent')) document.getElementById('lbl-rent').textContent = rentPct.toFixed(1) + '%';
  if (document.getElementById('lbl-comm')) document.getElementById('lbl-comm').textContent = commPct.toFixed(1) + '%';
  if (document.getElementById('lbl-channel-share')) document.getElementById('lbl-channel-share').textContent = dineInShare + '% Dine / ' + (100 - dineInShare) + '% Del';
  if (document.getElementById('lbl-aov')) document.getElementById('lbl-aov').textContent = '₹' + aov;

  const deliveryShare = (100 - dineInShare) / 100;
  const weightedCommPct = deliveryShare * commPct;
  const royaltyPct = 5.0;
  const opsPct = 5.0;
  const totalCostPct = cogsPct + laborPct + rentPct + weightedCommPct + royaltyPct + opsPct;
  const netMarginPct = Math.max(1.0, 100.0 - totalCostPct);

  const reqMonthlySales = Math.round(targetProfit / (netMarginPct / 100));
  const reqDailySales = Math.round(reqMonthlySales / 30);
  const reqDailyOrders = Math.round(reqDailySales / aov);
  const reqDailyWalkins = Math.round((reqDailySales * (dineInShare / 100)) / (aov * 0.85));
  const paybackMonths = (capex / Math.max(1, targetProfit)).toFixed(1);
  const roiPct = ((targetProfit * 12 / Math.max(1, capex)) * 100).toFixed(1);

  if (document.getElementById('res-monthly-sales')) document.getElementById('res-monthly-sales').textContent = '₹' + (reqMonthlySales / 100000).toFixed(2) + 'L';
  if (document.getElementById('res-net-margin')) document.getElementById('res-net-margin').textContent = 'Net EBITDA Margin: ' + netMarginPct.toFixed(1) + '%';
  if (document.getElementById('res-daily-sales')) document.getElementById('res-daily-sales').textContent = '₹' + reqDailySales.toLocaleString();
  if (document.getElementById('res-daily-orders')) document.getElementById('res-daily-orders').textContent = '~' + reqDailyOrders + ' Orders / Day';
  if (document.getElementById('res-daily-walkins')) document.getElementById('res-daily-walkins').textContent = reqDailyWalkins;
  if (document.getElementById('res-payback')) document.getElementById('res-payback').textContent = paybackMonths + ' Months';
  if (document.getElementById('res-roi')) document.getElementById('res-roi').textContent = roiPct + '%';

  const tbody = document.getElementById('tbody-sensitivity');
  if (tbody) {
    const aovList = [450, 500, 516, 580, 650];
    const cogsList = [22.0, 25.0, 28.0, 31.0];

    tbody.innerHTML = aovList.map(a => {
      const isCurrentAov = a === 516;
      return `
        <tr>
          <td><strong>₹${a} AOV ${isCurrentAov ? '(Current)' : ''}</strong></td>
          ${cogsList.map(c => {
            const costPct = c + laborPct + rentPct + weightedCommPct + royaltyPct + opsPct;
            const margin = Math.max(1.0, 100.0 - costPct);
            const sales = Math.round(targetProfit / (margin / 100));
            const ords = Math.round(sales / 30 / a);
            const isTargetCell = isCurrentAov && c === 25.0;
            const cellClass = isTargetCell ? 'sens-cell-target' : c <= 25.0 ? 'sens-cell-feasible' : 'sens-cell-high';

            return `
              <td class="${cellClass}">
                ₹${(sales / 100000).toFixed(2)}L/mo<br>
                <span style="font-size:10px;opacity:0.85">${ords} ord/day</span>
              </td>
            `;
          }).join('')}
        </tr>
      `;
    }).join('');
  }
}

// Window Event Listeners & Global Attachments
window.toggleTheme = toggleTheme;
window.renderMarketBasketTab = renderMarketBasketTab;
window.filterMBRules = filterMBRules;
window.renderDailySnapshot = renderDailySnapshot;
window.recalcFranchiseeModel = recalcFranchiseeModel;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.showPage = showPage;
window.openModal = openModal;
window.closeModal = closeModal;
window.openTargetModal = openTargetModal;
window.closeTargetModal = closeTargetModal;
window.saveSalesTargets = saveSalesTargets;
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.toggleCategoryGroup = toggleCategoryGroup;
window.selectAllCategories = selectAllCategories;
window.applyCategoryFilter = applyCategoryFilter;
window.toggleNonMenuFilter = toggleNonMenuFilter;
window.showInfoModal = showInfoModal;
window.buildExecutiveReport = buildExecutiveReport;
window.sortTable = sortTable;
window.exportTableToCSV = exportTableToCSV;
window.updateSim = updateSim;
window.setDualStoreA = setDualStoreA;
window.setDualStoreB = setDualStoreB;
window.swapDualStores = swapDualStores;
window.filterModalMenuTable = filterModalMenuTable;
window.selectBranchProfile = (b) => {
  currentBranchProfile = b;
  document.querySelectorAll('.branch-pill').forEach(p => p.classList.toggle('active', p.textContent === b));
  renderBranchProfile(b);
};

window.addEventListener('resize', () => { if (window._hmDrawn) drawHeatmap(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

window.addEventListener('DOMContentLoaded', () => {
  initCategorySelection();
  initCharts();
  refresh();
  renderBranchProfile('Kothrud');
  renderDualStoreComparison();
  renderDailySnapshot();
  recalcFranchiseeModel();
});


