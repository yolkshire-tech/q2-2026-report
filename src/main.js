import './styles/main.css';
import Chart from 'chart.js/auto';
import { RAW, DAILY_REVENUE, BRANCH_PROFILES } from './data/dashboardData.js';
import { TIERED_TARGETS, UNTARGETED_POS_BRANCHES } from './data/targets.js';
import { parseCSV, detectKind, processTransactions, processItems, loadUploads, saveUploads, clearUploads, applyUploads } from './data/ingest.js';
import { matchCombo } from './data/combos.js';
import { CHARTS, fmt, fmtN, hexToRgb, mkChart, updateChart, updateChartTheme } from './charts/chartManager.js';

let F = { period: 'all', branch: 'all' };
let baseMonths = [];
let uploadInfo = { applied: [], skipped: [], items: null };
let currentHeatmap = null;
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

// Pattern-based: catches every POS spelling variant ("Water Bottle (500 ml)",
// "Carry Bag", "Packing Charges"...) instead of an exact-name list.
const NON_MENU_PATTERNS = ['water bottle', 'carry bag', 'packaging', 'packing charge', 'cutlery', 'event sale'];
function isNonMenuItem(name) {
  const n = (name || '').toLowerCase();
  return NON_MENU_PATTERNS.some(pat => n.includes(pat));
}



// The category modal is built from menu-master names, while the data carries POS
// export names (which don't all match). A full selection therefore means "no
// filter" — only a real subset selection filters items.
function itemPassesCategoryFilter(item) {
  if (!activeCategorySelection) return true;
  if (activeCategorySelection.size >= getAllMenuItems().length) return true;
  return activeCategorySelection.has(item);
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

function getTextColor() {
  return document.body.classList.contains('light-mode') ? '#2B2428' : '#FCF0D0';
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


function periodMonths(period) {
  const meta = RAW.meta;
  if (period === 'all') return meta.months;
  if (meta.quarters[period]) return meta.quarters[period];
  return meta.months.includes(period) ? [period] : meta.months;
}

// Every number below is a straight sum of real invoices from the period cube.
// No scale factors, no pro-rating, no fabrication (memory.md rule 2).
function getFilteredData() {
  initCategorySelection();
  const { period, branch } = F;
  const meta = RAW.meta;
  const months = periodMonths(period);
  const branchesSel = branch === 'all' ? RAW.branches : [branch];
  const result = {};
  result.monthsSel = months;
  result.periodLabel = period === 'all' ? `All data (${meta.rangeLabel})`
    : (meta.quarterLabels[period] || meta.monthLabels[period] || period);

  const cubeSum = (b) => months.reduce((acc, m) => {
    const e = RAW.cube[m][b];
    if (e) { acc.rev += e.rev; acc.ord += e.ord; }
    return acc;
  }, { rev: 0, ord: 0 });

  let rev = 0, ord = 0;
  branchesSel.forEach(b => { const s = cubeSum(b); rev += s.rev; ord += s.ord; });
  result.rev = rev;
  result.ord = ord;
  result.aov = ord ? Math.round(rev / ord) : 0;
  const totalDays = months.reduce((a, m) => a + (meta.daysInMonth[m] || 30), 0);
  result.daily = Math.round(rev / Math.max(1, totalDays));
  result.ordPerDay = Math.round(ord / Math.max(1, totalDays));

  // Branch series
  result.branchRevs = RAW.branches.map(b => cubeSum(b).rev);
  result.branchColors = RAW.branches.map((b, i) =>
    branch !== 'all' && b !== branch ? `rgba(${hexToRgb(RAW.branchColors[i])},0.25)` : RAW.branchColors[i]);
  result.branchAOVs = RAW.branches.map(b => { const s = cubeSum(b); return s.ord ? Math.round(s.rev / s.ord) : 0; });
  result.branchAOVColors = result.branchColors;

  // Channel series (per selection) + per-branch channel matrix
  const chAgg = (b, c, k) => months.reduce((x, m) => x + (RAW.cube[m][b]?.ch?.[c]?.[k] || 0), 0);
  result.chRevs = RAW.channels.map(c => branchesSel.reduce((a, b) => a + chAgg(b, c, 'rev'), 0));
  result.chOrds = RAW.channels.map(c => branchesSel.reduce((a, b) => a + chAgg(b, c, 'ord'), 0));
  result.chAOVs = RAW.channels.map((c, i) => result.chOrds[i] ? Math.round(result.chRevs[i] / result.chOrds[i]) : 0);
  result.chColors = RAW.channelColors.slice();
  result.chAOVColors = RAW.channelColors.slice();
  result.branchCh = {};
  result.branchChOrd = {};
  RAW.branches.forEach(b => {
    result.branchCh[b] = {}; result.branchChOrd[b] = {};
    RAW.channels.forEach(c => {
      result.branchCh[b][c] = chAgg(b, c, 'rev');
      result.branchChOrd[b][c] = chAgg(b, c, 'ord');
    });
  });
  result.chTrend = {
    labels: months.map(m => meta.monthLabels[m].split(' ')[0]),
    series: {}
  };
  RAW.channels.forEach(c => {
    result.chTrend.series[c] = months.map(m => branchesSel.reduce((a, b) => a + (RAW.cube[m][b]?.ch?.[c]?.rev || 0), 0));
  });

  // Session series
  const sessKeys = ['breakfast', 'lunch', 'snack', 'dinner'];
  const sessColors = ['#E7BA44', '#5985b9', '#907aa9', '#56754d'];
  const sessAgg = (s, k) => branchesSel.reduce((a, b) => a + months.reduce((x, m) => x + (RAW.cube[m][b]?.sess?.[s]?.[k] || 0), 0), 0);
  result.sessRevs = sessKeys.map(s => sessAgg(s, 'rev'));
  result.sessOrds = sessKeys.map(s => sessAgg(s, 'ord'));
  result.sessColors = sessColors;
  result.activeHours = null;

  // Monthly trend across ALL known months (selection highlighted)
  result.trendLabels = meta.months.map(m => meta.monthLabels[m].split(' ')[0]);
  result.trendSelected = meta.months.map(m => months.includes(m));
  result.branchMonthly = {};
  RAW.branches.forEach(b => {
    result.branchMonthly[b] = meta.months.map(m => RAW.cube[m][b]?.rev || 0);
  });

  // Time-of-day / day-of-week / bill patterns — real, per outlet, full range
  const pat = RAW.branchPatterns[branch === 'all' ? 'all' : branch] || RAW.branchPatterns.all;
  result.hRev = pat.hRev;
  result.hOrd = pat.hOrd;
  result.hLoad = pat.hLoad;
  result.dRev = pat.dRev;
  result.bills = pat.bills;
  currentHeatmap = pat.heatmap;
  result.patternNote = `${branch === 'all' ? 'Chain-wide' : branch} time patterns computed over the committed data range (${meta.patternRangeLabel || meta.rangeLabel}) — patterns are structural, not period-sliced.`;

  // Daily trend — real per period + outlet, 7-day MA computed on the slice
  const series = RAW.dailyAll.filter(d => months.includes(d.m))
    .map(d => ({ date: d.label, rev: branch === 'all' ? d.total : (d.br[branch] || 0) }));
  series.forEach((d, i) => {
    const s = series.slice(Math.max(0, i - 6), i + 1);
    d.ma = Math.round(s.reduce((a, x) => a + x.rev, 0) / s.length);
  });
  result.dailyTrend = series;

  // Item analytics — real per outlet; scope is the item-export range, never scaled
  let itemSrc;
  if (branch === 'all') {
    itemSrc = RAW.mePoints;
  } else {
    const list = RAW.itemsByBranch[branch] || [];
    const med = arr => { const s = arr.slice().sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };
    const mq = med(list.map(pt => pt.x)), mr = med(list.map(pt => pt.y));
    itemSrc = list.map(pt => ({ ...pt, cat: pt.x >= mq ? (pt.y >= mr ? 'Star' : 'Plow Horse') : (pt.y >= mr ? 'Puzzle' : 'Dog') }));
  }
  const itemsF = itemSrc.filter(pt => (!excludeNonMenu || !isNonMenuItem(pt.item)) && itemPassesCategoryFilter(pt.item));
  result.mePoints = itemsF;
  const byRev = itemsF.slice().sort((a, b) => b.y - a.y);
  result.top10rItems = byRev.slice(0, 10).map(pt => pt.item);
  result.top10rRevs = byRev.slice(0, 10).map(pt => pt.y);
  const byQty = itemsF.slice().sort((a, b) => b.x - a.x);
  result.top10qItems = byQty.slice(0, 10).map(pt => pt.item);
  result.top10qQtys = byQty.slice(0, 10).map(pt => pt.x);
  const catRevs = {};
  itemsF.forEach(pt => { const c = pt.mcat || 'Uncategorized'; catRevs[c] = (catRevs[c] || 0) + pt.y; });
  const catSorted = Object.entries(catRevs).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  result.catLabels = catSorted.map(([k]) => k);
  result.catRevs = catSorted.map(([, v]) => v);
  const priceTiers = { '<₹150': 0, '₹150-250': 0, '₹250-350': 0, '₹350-500': 0, '₹500+': 0 };
  itemsF.forEach(pt => {
    const price = pt.y / (pt.x || 1);
    if (price < 150) priceTiers['<₹150'] += pt.x;
    else if (price < 250) priceTiers['₹150-250'] += pt.x;
    else if (price < 350) priceTiers['₹250-350'] += pt.x;
    else if (price < 500) priceTiers['₹350-500'] += pt.x;
    else priceTiers['₹500+'] += pt.x;
  });
  result.priceTierLabels = Object.keys(priceTiers);
  result.priceTierQtys = Object.values(priceTiers);
  const outsideItemScope = months.some(m => !meta.quarters.q2.includes(m));
  result.itemScopeNote = `📦 Item analytics scope: ${meta.itemDataScope}${branch !== 'all' ? ' · ' + branch + ' only' : ' · all outlets'}.` +
    (outsideItemScope ? ' ⚠️ Your selected period includes months outside the item-export range — menu figures stay Q2-scoped rather than being faked.' : '');

  // Targets & modelled P&L (real revenue; benchmark cost ratios until cost actuals land)
  let targetRev = 0;
  branchesSel.forEach(b => {
    const bt = RAW.branchTargets[b] || {};
    months.forEach(m => { targetRev += (bt[m] || 0); });
  });
  result.targetRev = targetRev;
  result.actualRev = rev;
  result.variancePct = targetRev > 0 ? ((rev / targetRev) * 100).toFixed(1) : '100.0';
  result.varianceVal = rev - targetRev;
  result.cogs = Math.round(rev * 0.30);
  result.labor = Math.round(rev * 0.18);
  result.rent = Math.round(rev * 0.15);
  const zi = RAW.channels.indexOf('Zomato'), si = RAW.channels.indexOf('Swiggy');
  const deliveryRev = (result.chRevs[zi] || 0) + (result.chRevs[si] || 0);
  result.deliveryShare = rev > 0 ? deliveryRev / rev : 0;
  result.commissions = Math.round(deliveryRev * 0.25);
  result.ops = Math.round(rev * 0.05);
  result.totalOpEx = result.cogs + result.labor + result.rent + result.commissions + result.ops;
  result.netProfit = rev - result.totalOpEx;
  result.ebitdaMargin = rev > 0 ? ((result.netProfit / rev) * 100).toFixed(1) : '0.0';

  return result;
}

function buildContextLabel() {
  const meta = RAW.meta;
  const parts = [];
  parts.push(F.period === 'all' ? `All data (${meta.rangeLabel})`
    : (meta.quarterLabels[F.period] || meta.monthLabels[F.period] || F.period));
  if (F.branch !== 'all') parts.push(F.branch);
  return 'Showing: ' + parts.join(' · ');
}

function updateFilterStyles() {
  ['f-period', 'f-branch'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('filter-active', el.value !== 'all');
  });
}

function renderKothrudKPIs(fd) {
  const setEl = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  setEl('k-kothrud-rev', fmt(fd.branchRevs[RAW.branches.indexOf('Kothrud')]));
  const kbr = RAW.branch.Kothrud;
  setEl('k-kothrud-dinein', ((kbr.ch['Dine In']?.rev || 0) / kbr.rev * 100).toFixed(1) + '%');
  setEl('k-kothrud-bev', 'N/A');
  setEl('k-kothrud-aov', kbr.ch['Dine In']?.aov ? '₹' + kbr.ch['Dine In'].aov : 'N/A');
}

function updateMoneyKPIs(fd) {
  const setEl = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  setEl('k-pnl-target', fmt(fd.targetRev));
  setEl('k-pnl-actual', fmt(fd.actualRev));
  setEl('k-pnl-var', fd.variancePct + '%');
  setEl('k-pnl-var-sub', (fd.varianceVal >= 0 ? '+' : '') + fmt(fd.varianceVal) + ' vs target');
  setEl('k-pnl-opex', fmt(fd.totalOpEx));
  setEl('k-pnl-opex-sub', (fd.actualRev > 0 ? ((fd.totalOpEx / fd.actualRev) * 100).toFixed(1) : '0') + '% of revenue');
  setEl('k-pnl-profit', fmt(fd.netProfit));
  setEl('k-pnl-margin', fd.ebitdaMargin + '% EBITDA Margin');
}

function renderOutletTables(fd) {
// Page 4: Staffing Guide Table
  const staffingTbl = document.getElementById('tbl-staffing');
  if (staffingTbl) {
    const scale = 1; // chain-wide daily pattern (full data range)
    staffingTbl.innerHTML = `
      <tr><th>Hour</th><th>Daily Orders</th><th>Load</th><th>Min Staff</th></tr>
      <tr style=""><td>7 AM</td><td>${Math.round(12 * scale)}</td><td><div class="load-cell"><div class="load-bar-wrap"><div class="load-bar-fill" style="width:29%;background:var(--green)"></div></div>29%</div></td><td style="font-weight:700">3</td></tr>
      <tr style=""><td>8 AM</td><td>${Math.round(26 * scale)}</td><td><div class="load-cell"><div class="load-bar-wrap"><div class="load-bar-fill" style="width:64%;background:var(--amber)"></div></div>64%</div></td><td style="font-weight:700">5-6</td></tr>
      <tr style=""><td>9 AM</td><td>${Math.round(37 * scale)}</td><td><div class="load-cell"><div class="load-bar-wrap"><div class="load-bar-fill" style="width:90%;background:var(--red)"></div></div>90%</div></td><td style="font-weight:700">7-8</td></tr>
      <tr style=""><td>10 AM</td><td>${Math.round(41 * scale)}</td><td><div class="load-cell"><div class="load-bar-wrap"><div class="load-bar-fill" style="width:100%;background:var(--red)"></div></div>100%</div></td><td style="font-weight:700">8</td></tr>
      <tr style=""><td>3-5 PM</td><td>${Math.round(12 * scale)}</td><td><div class="load-cell"><div class="load-bar-wrap"><div class="load-bar-fill" style="width:32%;background:var(--green)"></div></div>32%</div></td><td style="font-weight:700">3</td></tr>
      <tr style=""><td>9 PM</td><td>${Math.round(34 * scale)}</td><td><div class="load-cell"><div class="load-bar-wrap"><div class="load-bar-fill" style="width:83%;background:var(--red)"></div></div>83%</div></td><td style="font-weight:700">6-7</td></tr>
    `;
  }

  // Page 4: Branch Scorecard Table
  const scorecardTbl = document.getElementById('tbl-scorecard');
  if (scorecardTbl) {
    let html = `<tr><th onclick="sortTable('tbl-scorecard',0)">Branch</th><th onclick="sortTable('tbl-scorecard',1)">Revenue</th><th onclick="sortTable('tbl-scorecard',2)">AOV</th><th onclick="sortTable('tbl-scorecard',3)">Trend</th><th onclick="sortTable('tbl-scorecard',4)">Status</th></tr>`;
    RAW.branches.forEach(b => {
      if (F.branch !== 'all' && b !== F.branch) return;
      const bp = BRANCH_PROFILES[b];
      const bRev = fd.branchRevs[RAW.branches.indexOf(b)];
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
      const bc = fd.branchCh[b] || {};
      const bo = fd.branchChOrd[b] || {};
      const chAov = c => (bo[c] ? Math.round((bc[c] || 0) / bo[c]) : null);
      const bd = { ch: { 'Zomato': { aov: chAov('Zomato') }, 'Swiggy': { aov: chAov('Swiggy') }, 'Dine In': { aov: chAov('Dine In') } } };
      const dineInRev = bc['Dine In'] || 0;
      const takeawayRev = bc['Takeaway'] || 0;
      const zomatoRev = bc['Zomato'] || 0;
      const swiggyRev = bc['Swiggy'] || 0;
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
    const zRev = fd.chRevs[RAW.channels.indexOf('Zomato')] || 0;
    const sRev = fd.chRevs[RAW.channels.indexOf('Swiggy')] || 0;
    const zomatoDrain = Math.round(zRev * 0.25);
    const swiggyDrain = Math.round(sRev * 0.25);
    const totalDrain = zomatoDrain + swiggyDrain;
    const zomatoNet = zRev - zomatoDrain;
    const swiggyNet = sRev - swiggyDrain;
    const dineNet = fd.chRevs[RAW.channels.indexOf('Dine In')] || 0;

    commTbl.innerHTML = `
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Zomato commission drain</td><td style="color:#e68c85;font-weight:700">~${fmt(zomatoDrain)}/period</td></tr>
      <tr><td>Swiggy commission drain</td><td style="color:#e68c85;font-weight:700">~${fmt(swiggyDrain)}/period</td></tr>
      <tr><td>Total delivery commission</td><td style="color:#e68c85;font-weight:700">~${fmt(totalDrain)}/period</td></tr>
      <tr><td>True net from Zomato</td><td style="color:#9fc794;font-weight:700">~${fmt(zomatoNet)}</td></tr>
      <tr><td>True net from Swiggy</td><td style="color:#9fc794;font-weight:700">~${fmt(swiggyNet)}</td></tr>
      <tr><td>Dine In true net (0% commission)</td><td style="color:#9fc794;font-weight:700">${fmt(dineNet)}</td></tr>
    `;
  }

  // Page 8: Q1 vs Q2 Scorecard Table
  const q1q2Tbl = document.getElementById('tbl-q1q2-scorecard');
  if (q1q2Tbl) {
    let html = `<tr><th>Metric / Branch</th><th>Q1 Revenue</th><th>Q2 Revenue</th><th>QoQ Change</th><th>Q1 AOV</th><th>Q2 AOV</th><th>Status</th></tr>`;
    RAW.branches.forEach(b => {
      if (F.branch !== 'all' && b !== F.branch) return;
      const q1Rev = RAW.q1.branch[b]?.rev || 0;
      const q2Rev = RAW.branch[b]?.rev || 0;
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

  }

function renderKothrudTables(fd) {
  // Page 7: Kothrud Benchmark Matrix Table
  const kothrudTbl = document.getElementById('tbl-kothrud-playbook-matrix');
  if (kothrudTbl) {
    // Computed live from real Q2 branch/channel data (pipeline-generated).
    const cols = ['Kothrud', 'AUNDH', 'Salunkhe Vihar', 'Wadgaon Sheri', 'Yolkshire Wakad'];
    const dinePct = b => {
      const bd = RAW.branch[b];
      const d = bd?.ch?.['Dine In']?.rev || 0;
      return bd && bd.rev > 0 ? (d / bd.rev * 100).toFixed(1) : null;
    };
    const dineAov = b => RAW.branch[b]?.ch?.['Dine In']?.aov ?? null;
    const cell = (v, suffix, isKothrud, warnBelow) => {
      if (v == null) return '<td>N/A</td>';
      const warn = !isKothrud && warnBelow != null && parseFloat(v) < warnBelow;
      const style = isKothrud ? 'font-weight:700;color:var(--green)' : (warn ? 'color:#e68c85' : '');
      return `<td style="${style}">${suffix === '₹' ? '₹' + v : v + suffix}</td>`;
    };
    let html = `
      <tr>
        <th>Metric / Standard</th><th>Kothrud Flagship</th><th>AUNDH</th><th>Salunkhe Vihar</th><th>Wadgaon Sheri</th><th>Yolkshire Wakad</th><th>Kothrud Playbook Standard</th>
      </tr>
      <tr>
        <td><strong>Dine-In Rev Share</strong></td>
        ${cols.map((b, i) => cell(dinePct(b), '%', i === 0, 40)).join('')}
        <td><span class="tag star">Target 50%+</span></td>
      </tr>
      <tr>
        <td><strong>Beverage Attach %</strong></td>
        ${cols.map(() => '<td>N/A</td>').join('')}
        <td><span class="tag horse">Needs per-invoice item data</span></td>
      </tr>
      <tr>
        <td><strong>Dine-In AOV</strong></td>
        ${cols.map((b, i) => cell(dineAov(b), '₹', i === 0, null)).join('')}
        <td><span class="tag star">Target ₹550+</span></td>
      </tr>
    `;
    kothrudTbl.innerHTML = html;
  }

}

function renderMoneyTables(fd) {
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
      const bTargets = RAW.branchTargets[b] || {};
      const bTarget = fd.monthsSel.reduce((a, m) => a + (bTargets[m] || 0), 0);

      const bActual = fd.branchRevs[RAW.branches.indexOf(b)];
      const bDelReal = (fd.branchCh[b]?.Zomato || 0) + (fd.branchCh[b]?.Swiggy || 0);
      const bVarPct = bTarget > 0 ? ((bActual / bTarget) * 100).toFixed(1) : '100.0';
      const bCogs = Math.round(bActual * 0.30);
      const bLabor = Math.round(bActual * 0.18);
      const bRent = Math.round(bActual * 0.15);
      const bComm = Math.round(bDelReal * 0.25);
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
    // Single source: src/data/targets.js (the management targets sheet).
    let html = `
      <thead>
        <tr>
          <th onclick="sortTable('tbl-pnl-outlet-sales-roadmap',0)">Outlet</th>
          <th onclick="sortTable('tbl-pnl-outlet-sales-roadmap',1)">Current Avg Sale / mo</th>
          <th onclick="sortTable('tbl-pnl-outlet-sales-roadmap',2)">June Actual (POS)</th>
          <th onclick="sortTable('tbl-pnl-outlet-sales-roadmap',3)">Tier 1 (Base)</th>
          <th onclick="sortTable('tbl-pnl-outlet-sales-roadmap',4)">Tier 2 (Stretch)</th>
          <th onclick="sortTable('tbl-pnl-outlet-sales-roadmap',5)">Tier 3 (Super)</th>
          <th onclick="sortTable('tbl-pnl-outlet-sales-roadmap',6)">June Tier Achieved</th>
        </tr>
      </thead>
      <tbody>
    `;

    let totCur = 0, totT1 = 0, totT2 = 0, totT3 = 0, totJun = 0;
    TIERED_TARGETS.forEach(row => {
      totCur += row.currentAvgSale; totT1 += row.sales.t1; totT2 += row.sales.t2; totT3 += row.sales.t3;
      const junActual = row.pos ? (RAW.branch[row.pos]?.jun ?? null) : null;
      if (junActual) totJun += junActual;
      const at = junActual != null ? achievedTier(junActual, row.sales) : null;
      html += `
        <tr>
          <td><strong>${row.outlet}</strong></td>
          <td style="color:var(--muted)">${fmt(row.currentAvgSale)}</td>
          <td style="font-weight:700;color:var(--primary)">${junActual == null ? 'N/A' : fmt(junActual)}</td>
          <td>${fmt(row.sales.t1)}</td>
          <td>${fmt(row.sales.t2)}</td>
          <td style="color:var(--green)">${fmt(row.sales.t3)}</td>
          <td>${at ? `<span class="tag ${at.tag}">${at.label}</span>` : '<span class="tag horse">No POS feed</span>'}</td>
        </tr>
      `;
    });

    html += `
      <tr style="background:var(--bg3);font-weight:800;border-top:2px solid var(--primary)">
        <td>TOTAL CHAIN / MO</td>
        <td style="color:var(--muted)">${fmt(totCur)}</td>
        <td style="color:var(--primary)">${fmt(totJun)}</td>
        <td>${fmt(totT1)}</td>
        <td>${fmt(totT2)}</td>
        <td style="color:var(--green)">${fmt(totT3)}</td>
        <td><span class="tag star">T3 = +${((totT3 / totCur - 1) * 100).toFixed(0)}% vs current</span></td>
      </tr>
      </tbody>
    `;
    pnlSalesRoadmapTbl.innerHTML = html;
  }

  // Page 12: Outlet Profit & Turnaround Target Roadmap Table
  const pnlProfitRoadmapTbl = document.getElementById('tbl-pnl-outlet-profit-roadmap');
  if (pnlProfitRoadmapTbl) {
    // Single source: src/data/targets.js. (Fixes an old transcription error:
    // Pimple Saudagar's current avg profit is −₹40k, not +₹20k.)
    const profitData = TIERED_TARGETS.map(tt => ({
      outlet: tt.outlet, cur: tt.currentAvgProfit,
      t1: tt.profit.t1, t2: tt.profit.t2, t3: tt.profit.t3
    }));

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
        <td><span class="tag star">T3 = +${((totT3 / Math.max(1, totCur) - 1) * 100).toFixed(0)}% vs current</span></td>
      </tr>
      </tbody>
    `;
    pnlProfitRoadmapTbl.innerHTML = html;
  }
}

// ── Sub-navigation for group pages (Outlets / Menu / Money) ──────────────────
export function showSub(groupId, subId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.subpage').forEach(s => s.classList.toggle('active', s.id === subId));
  group.querySelectorAll('.subpill').forEach(p => {
    const oc = p.getAttribute('onclick') || '';
    p.classList.toggle('active', oc.includes(`'${subId}'`));
  });
  try { history.replaceState(null, '', '#' + groupId + '/' + subId); } catch (e) {}
  requestAnimationFrame(() => {
    Object.values(CHARTS).forEach(c => { try { c && c.resize && c.resize(); } catch (e) {} });
    renderSubContent(subId);
  });
}

function renderSubContent(subId) {
  if (subId === 'pg-sales') drawHeatmap();
  if (subId === 'pg-operations') renderMarketBasketTab();
  if (subId === 'pg-comparison') renderDualStoreComparison();
  if (subId === 'pg-franchisee') recalcFranchiseeModel();
  if (subId === 'pg-branches') renderBranchProfile(currentBranchProfile);
}

// ── HOME: tiered target board, alerts, daily trend ───────────────────────────
function latestMonths() {
  const meta = RAW.meta;
  const idx = meta.months.indexOf(meta.latestMonth);
  return { latest: meta.latestMonth, prev: idx > 0 ? meta.months[idx - 1] : null, label: meta.monthLabels[meta.latestMonth] };
}

const MONTH_TREND = b => {
  const { latest, prev } = latestMonths();
  const cur = RAW.cube[latest]?.[b]?.rev || 0;
  const before = prev ? (RAW.cube[prev]?.[b]?.rev || 0) : 0;
  return before > 0 ? (cur / before - 1) * 100 : null;
};

function achievedTier(v, tiers) {
  if (v >= tiers.t3) return { label: 'T3 Super', tag: 'star' };
  if (v >= tiers.t2) return { label: 'T2 Stretch', tag: 'grow' };
  if (v >= tiers.t1) return { label: 'T1 Base', tag: 'horse' };
  return { label: 'Below T1', tag: 'risk' };
}

function renderHome() {
  const setEl = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  const { latest, prev, label } = latestMonths();
  const latestRev = b => RAW.cube[latest]?.[b]?.rev || 0;
  const monRev = RAW.branches.reduce((a, b) => a + latestRev(b), 0);
  const monOrd = RAW.branches.reduce((a, b) => a + (RAW.cube[latest]?.[b]?.ord || 0), 0);
  const prevRev = prev ? RAW.branches.reduce((a, b) => a + (RAW.cube[prev]?.[b]?.rev || 0), 0) : 0;

  const partialInfo = (RAW.meta.partialMonths || {})[latest];
  const homeSec = document.querySelector('#pg-home .sec');
  if (homeSec) homeSec.textContent = partialInfo
    ? `This Month at a Glance — ${label.replace(' — partial', '')} (month to date · ${partialInfo.days} of ${partialInfo.calendarDays} days)`
    : `This Month at a Glance — ${label} (last full data month)`;
  const boardSub = document.querySelector('#pg-home .chart-card .sub');
  if (boardSub) boardSub.textContent = `${label} net sales vs the three incentive tiers (T1 Base · T2 Stretch · T3 Super-Achiever) · click an outlet for its profile`;

  const chainTrend = prevRev > 0 ? ((monRev / prevRev - 1) * 100).toFixed(1) : null;
  setEl('home-rev', fmt(monRev));
  setEl('home-rev-sub', chainTrend == null ? '—' : `${chainTrend >= 0 ? '+' : ''}${chainTrend}% vs ${prev ? RAW.meta.monthLabels[prev].split(' ')[0] : ''}`);
  const mapped = TIERED_TARGETS.filter(tt => tt.pos);
  const mappedActual = mapped.reduce((s, tt) => s + latestRev(tt.pos), 0);
  const mappedT1 = mapped.reduce((s, tt) => s + tt.sales.t1, 0);
  setEl('home-tier', (mappedActual / mappedT1 * 100).toFixed(1) + '%');
  setEl('home-orders', monOrd.toLocaleString());
  setEl('home-orders-sub', 'AOV ₹' + (monOrd ? Math.round(monRev / monOrd) : 0));
  const chainProfit = TIERED_TARGETS.reduce((s, tt) => s + tt.currentAvgProfit, 0);
  const lossCount = TIERED_TARGETS.filter(tt => tt.currentAvgProfit < 0).length;
  setEl('home-profit', fmt(chainProfit));
  setEl('home-profit-sub', lossCount > 0 ? `⚠️ ${lossCount} outlets currently loss-making` : 'All outlets profitable');

  const board = document.getElementById('home-board');
  if (board) {
    const shortLabel = label.split(' ')[0];
    let html = `<tr><th>Outlet</th><th>${shortLabel} Sales</th><th style="min-width:240px">Progress vs Tiers (markers: T1 · T2 · T3)</th><th>Tier Achieved</th><th>vs Prev Month</th><th>Avg Profit / mo*</th></tr>`;
    const rows = [];
    TIERED_TARGETS.forEach(tt => {
      rows.push({ name: tt.outlet, pos: tt.pos, actual: tt.pos ? latestRev(tt.pos) : null, tiers: tt.sales, profit: tt.currentAvgProfit });
    });
    UNTARGETED_POS_BRANCHES.forEach(b => {
      rows.push({ name: b + ' (new)', pos: b, actual: latestRev(b), tiers: null, profit: null });
    });
    rows.sort((a, b) => (b.actual ?? -1) - (a.actual ?? -1));
    rows.forEach(r => {
      const click = r.pos ? ` class="home-board-row" onclick="showPage('pg-outlets');selectBranchProfile('${r.pos}')" title="Open ${r.name} profile"` : '';
      let barCell = '<span style="color:var(--muted)">N/A</span>';
      let tierCell = '—', trendCell = '—';
      if (r.actual != null && r.tiers) {
        const max = r.tiers.t3 * 1.05;
        const pct = Math.min(100, r.actual / max * 100);
        const at = achievedTier(r.actual, r.tiers);
        const fillColor = at.tag === 'risk' ? '#cb202d' : at.tag === 'horse' ? '#E7BA44' : '#56754d';
        barCell = `<div class="tier-track">
          <div class="tier-fill" style="width:${pct.toFixed(1)}%;background:${fillColor}"></div>
          <div class="tier-marker" style="left:${(r.tiers.t1 / max * 100).toFixed(1)}%" title="T1 ${fmt(r.tiers.t1)}"></div>
          <div class="tier-marker" style="left:${(r.tiers.t2 / max * 100).toFixed(1)}%" title="T2 ${fmt(r.tiers.t2)}"></div>
          <div class="tier-marker" style="left:${(r.tiers.t3 / max * 100).toFixed(1)}%" title="T3 ${fmt(r.tiers.t3)}"></div>
        </div>
        <div style="font-size:10px;color:var(--muted);margin-top:3px">${(r.actual / r.tiers.t1 * 100).toFixed(0)}% of T1 ${fmt(r.tiers.t1)}</div>`;
        tierCell = `<span class="tag ${at.tag}">${at.label}</span>`;
      } else if (r.actual != null) {
        barCell = `<span style="color:var(--muted)">No targets set yet</span>`;
        tierCell = '<span class="tag grow">New</span>';
      }
      if (r.pos) {
        const tr = MONTH_TREND(r.pos);
        trendCell = tr == null ? 'New' : `<span class="${tr >= 0 ? 'trend-up' : 'trend-dn'}">${tr >= 0 ? '+' : ''}${tr.toFixed(1)}%</span>`;
      }
      const profitCell = r.profit == null ? '—'
        : `<span style="color:${r.profit >= 0 ? 'var(--green)' : '#e68c85'};font-weight:700">${r.profit < 0 ? '−' : ''}${fmt(Math.abs(r.profit))}</span>`;
      html += `<tr${click}>
        <td><strong>${r.name}</strong>${r.pos ? '' : ' <span style="font-size:10px;color:var(--muted)">(separate POS — feed pending)</span>'}</td>
        <td style="font-weight:700">${r.actual == null ? 'N/A' : fmt(r.actual)}</td>
        <td>${barCell}</td><td>${tierCell}</td><td>${trendCell}</td><td>${profitCell}</td>
      </tr>`;
    });
    html += `<tr><td colspan="6" style="font-size:10px;color:var(--muted)">*Current average profit from the management targets sheet (Aug 2026) — monthly cost actuals pending.</td></tr>`;
    board.innerHTML = html;
  }

  const alertsEl = document.getElementById('home-alerts');
  if (alertsEl) {
    const shortLabel = label.split(' ')[0];
    const alerts = [];
    const kTrend = MONTH_TREND('Kothrud');
    if (kTrend != null && kTrend < -5) alerts.push({ sev: 'high', icon: '🏆', text: `<strong>Kothrud — the benchmark — fell ${kTrend.toFixed(1)}% in ${shortLabel}.</strong> Diagnose before replicating its playbook.` });
    TIERED_TARGETS.filter(tt => tt.currentAvgProfit < 0).forEach(tt => {
      alerts.push({ sev: 'high', icon: '📉', text: `<strong>${tt.outlet} is loss-making</strong> (−${fmt(Math.abs(tt.currentAvgProfit))}/mo per targets sheet). Tier-1 profit goal: ${fmt(tt.profit.t1)}.` });
    });
    // Below-Tier-1: only the three furthest from target (the board shows the rest)
    const belowT1 = TIERED_TARGETS.filter(tt => tt.pos)
      .map(tt => ({ tt, actual: latestRev(tt.pos) }))
      .filter(x => x.actual > 0 && x.actual < x.tt.sales.t1)
      .sort((a, b) => (a.actual / a.tt.sales.t1) - (b.actual / b.tt.sales.t1))
      .slice(0, 3);
    belowT1.forEach(({ tt, actual }) => {
      alerts.push({ sev: 'med', icon: '🎯', text: `<strong>${tt.outlet}</strong> closed ${shortLabel} at ${(actual / tt.sales.t1 * 100).toFixed(0)}% of Tier-1 (${fmt(actual)} vs ${fmt(tt.sales.t1)}).` });
    });
    // Week-over-week from real daily data: last 7 data days vs the prior 7
    const dAll = RAW.dailyAll;
    if (dAll.length >= 14) {
      const last7 = dAll.slice(-7), prev7 = dAll.slice(-14, -7);
      const sumW = (arr, b) => arr.reduce((a, d) => a + (b ? (d.br[b] || 0) : d.total), 0);
      const cw = sumW(last7), pw = sumW(prev7);
      if (pw > 0) {
        const wow = (cw / pw - 1) * 100;
        alerts.push({ sev: wow < -10 ? 'high' : 'info', icon: '📊', text: `<strong>Chain, last 7 data days:</strong> ${fmt(cw)} vs ${fmt(pw)} the week before (${wow >= 0 ? '+' : ''}${wow.toFixed(1)}%).` });
      }
      RAW.branches.forEach(b => {
        const cb = sumW(last7, b), pb = sumW(prev7, b);
        if (pb > 20000 && cb / pb - 1 < -0.15) {
          alerts.push({ sev: 'med', icon: '📉', text: `<strong>${b}</strong> down ${Math.abs((cb / pb - 1) * 100).toFixed(0)}% week-over-week (${fmt(cb)} vs ${fmt(pb)}, last 7 data days).` });
        }
      });
    }
    if (!alerts.length) alerts.push({ sev: 'info', icon: '✅', text: 'All outlets on or above Tier-1 pace.' });
    const sevRank = { high: 0, med: 1, info: 2 };
    alerts.sort((a, b) => sevRank[a.sev] - sevRank[b.sev]);
    alertsEl.innerHTML = alerts.slice(0, 8).map(a =>
      `<div class="home-alert sev-${a.sev}"><div>${a.icon}</div><div>${a.text}</div></div>`).join('');
  }

  const canvas = document.getElementById('c-home-daily');
  if (canvas && !CHARTS['c-home-daily']) {
    const days = RAW.dailyAll;
    const ma = days.map((d, i) => {
      const s = days.slice(Math.max(0, i - 6), i + 1);
      return Math.round(s.reduce((a, x) => a + x.total, 0) / s.length);
    });
    mkChart('c-home-daily', 'line', days.map(d => d.label), [
      { label: 'Daily Net Sales', data: days.map(d => d.total), borderColor: 'rgba(231,186,68,0.5)', borderWidth: 1.2, pointRadius: 0, tension: 0.3 },
      { label: '7-Day Average', data: ma, borderColor: '#56754d', borderWidth: 2.5, pointRadius: 0, tension: 0.35 }
    ], { scales: { x: { ticks: { color: '#a3979d', maxTicksLimit: 14 }, grid: { display: false } }, y: { ticks: { color: '#a3979d', callback: v => fmt(v) }, grid: { color: 'rgba(252,240,208,.06)' } } } });
    const homeChartSub = document.querySelector('#pg-home .grid .chart-card:nth-child(2) .sub');
    if (homeChartSub) homeChartSub.textContent = `Chain-wide daily net sales with 7-day average · ${RAW.meta.rangeLabel}`;
    const homeChartH3 = document.querySelector('#pg-home .grid .chart-card:nth-child(2) h3');
    if (homeChartH3) homeChartH3.textContent = 'Daily Revenue Trend';
  }
}

// ── KOTHRUD GAP: replicable-driver board ─────────────────────────────────────
function renderKothrudGap() {
  const tbl = document.getElementById('tbl-kothrud-gap');
  if (!tbl) return;
  const K = RAW.branch.Kothrud;
  const kDine = (K.ch['Dine In']?.rev || 0) / K.rev;
  const kAov = K.aov;
  let html = `<tr><th>Outlet</th><th>Q2 Revenue</th><th>AOV vs ₹${Math.round(kAov)}</th><th>₹ impact / mo*</th><th>Dine-In share vs ${(kDine * 100).toFixed(1)}%</th><th>Commission drain saved*</th><th>Latest trend</th><th>Biggest replicable lever</th></tr>`;
  RAW.branches.filter(b => b !== 'Kothrud').forEach(b => {
    const bd = RAW.branch[b];
    if (!bd || !bd.rev) return;
    const aovGap = kAov - bd.aov;
    const aovImpact = aovGap > 0 ? Math.round(aovGap * bd.ord / 3) : 0;
    const dine = (bd.ch['Dine In']?.rev || 0) / bd.rev;
    const dineGap = kDine - dine;
    const commSaved = dineGap > 0 ? Math.round(dineGap * bd.rev / 3 * 0.25) : 0;
    const tr = MONTH_TREND(b);
    const lever = aovImpact >= commSaved
      ? (aovImpact > 0 ? 'Raise AOV (upsell, combos)' : 'Grow order volume')
      : 'Shift mix to dine-in';
    html += `<tr>
      <td><strong>${b}</strong></td>
      <td>${fmt(bd.rev)}</td>
      <td><span class="${aovGap > 0 ? 'trend-dn' : 'trend-up'}">₹${Math.round(bd.aov)} (${aovGap > 0 ? '−' : '+'}₹${Math.abs(Math.round(aovGap))})</span></td>
      <td style="font-weight:700;color:var(--primary)">${aovImpact > 0 ? '+' + fmt(aovImpact) : '—'}</td>
      <td><span class="${dineGap > 0.02 ? 'trend-dn' : 'trend-up'}">${(dine * 100).toFixed(1)}%</span></td>
      <td style="font-weight:700;color:var(--green)">${commSaved > 0 ? '+' + fmt(commSaved) : '—'}</td>
      <td>${tr == null ? 'New' : `<span class="${tr >= 0 ? 'trend-up' : 'trend-dn'}">${tr >= 0 ? '+' : ''}${tr.toFixed(1)}%</span>`}</td>
      <td style="font-size:11px">${lever}</td>
    </tr>`;
  });
  html += `<tr><td colspan="8" style="font-size:10px;color:var(--muted)">*Directional estimates from real Q2 POS data: AOV impact = gap × outlet monthly orders; commission saved assumes ~25% aggregator fee on the shifted share. Repeat-visit and attach-rate drivers unlock once the loyalty API and item-level transaction data land.</td></tr>`;
  tbl.innerHTML = html;
}

function renderOutletCharts(fd) {
  updateChart('c-daily-rev', fd.dailyTrend.map(d => d.date), [
    { label: 'Daily Revenue', data: fd.dailyTrend.map(d => d.rev), borderColor: '#E7BA44', backgroundColor: 'rgba(231,186,68,.08)', fill: true, tension: .3, borderWidth: 2, pointRadius: 0, pointHoverRadius: 5 },
    { label: '7-Day Moving Avg', data: fd.dailyTrend.map(d => d.ma), borderColor: '#907aa9', backgroundColor: 'transparent', fill: false, tension: .4, borderWidth: 2, borderDash: [6, 3], pointRadius: 0, pointHoverRadius: 4 }
  ]);

  const hrRevColors = RAW.hours.map(h => (!fd.activeHours ? 'rgba(231,186,68,.7)' : fd.activeHours.includes(h) ? '#E7BA44' : 'rgba(231,186,68,.15)'));
  updateChart('c-hr-rev', RAW.hours.map(h => h + ':00'), [{ data: fd.hRev, borderColor: '#E7BA44', backgroundColor: 'rgba(231,186,68,.08)', fill: true, tension: .4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: hrRevColors, label: 'Revenue' }]);

  const hrOrdColors = RAW.hours.map((h, i) => {
    const dim = fd.activeHours && !fd.activeHours.includes(h) ? 0.15 : 1;
    const load = fd.hLoad[i];
    const base = load >= 80 ? '124,76,71' : load >= 50 ? '231,186,68' : '65,86,57';
    return `rgba(${base},${dim * 0.8})`;
  });
  updateChart('c-hr-ord', RAW.hours.map(h => h + ':00'), [{ data: fd.hOrd, backgroundColor: hrOrdColors, borderRadius: 4, borderSkipped: false }]);

  const branchKeys = F.branch !== 'all' ? [F.branch] : RAW.branches.filter(b => b !== 'Bavdhan');
  const brTrendDs = branchKeys.map(b => {
    const ci = RAW.branches.indexOf(b);
    return { label: b, data: fd.branchMonthly[b], borderColor: RAW.branchColors[ci], backgroundColor: 'transparent', tension: .3, borderWidth: F.branch !== 'all' ? 2 : 1.5, pointRadius: 4 };
  });
  updateChart('c-br-trend', fd.trendLabels, brTrendDs);

  updateChart('c-sess-bar', ['Breakfast', 'Lunch', 'Snack', 'Dinner'], [
    { label: 'Revenue', data: fd.sessRevs, backgroundColor: fd.sessColors, borderRadius: 5, borderSkipped: false, yAxisID: 'y' },
    { label: 'Orders', data: fd.sessOrds, backgroundColor: fd.sessColors.map(c => c.replace('.8', '.3').replace('0.2', '0.08')), borderRadius: 5, borderSkipped: false, yAxisID: 'y2', type: 'line', borderColor: fd.sessColors, borderWidth: 2, pointRadius: 4, fill: false }
  ]);

  updateChart('c-bill', RAW.billBuckets, [{ data: fd.bills, backgroundColor: fd.bills.map(v => v === Math.max(...fd.bills) ? '#E7BA44' : 'rgba(231,186,68,.45)'), borderRadius: 5, borderSkipped: false }]);

  updateChart('c-aov-ch', RAW.channels, [{ data: fd.chAOVs, backgroundColor: fd.chAOVColors, borderRadius: 6, borderSkipped: false }]);
  updateChart('c-aov-br', RAW.branches, [{ data: fd.branchAOVs, backgroundColor: fd.branchAOVColors, borderRadius: 5, borderSkipped: false }]);

  const loadColors = fd.hLoad.map((l, i) => {
    const dim = fd.activeHours && !fd.activeHours.includes(RAW.hours[i]) ? 0.2 : 0.85;
    return l >= 80 ? `rgba(124,76,71,${dim})` : l >= 50 ? `rgba(231,186,68,${dim})` : `rgba(65,86,57,${dim})`;
  });
  updateChart('c-load', RAW.hours.map(h => h + ':00'), [{ data: fd.hLoad, backgroundColor: loadColors, borderRadius: 5, borderSkipped: false }]);

  // Channel Intelligence Charts — real per-branch channel actuals for the period
  updateChart('c-ch-split', RAW.branches, [
    { label: 'Offline (Dine In+Takeaway)', data: RAW.branches.map(b => (fd.branchCh[b]['Dine In'] || 0) + (fd.branchCh[b]['Takeaway'] || 0)), backgroundColor: '#415639', borderRadius: 4, borderSkipped: false },
    { label: 'Online (Zomato+Swiggy)', data: RAW.branches.map(b => (fd.branchCh[b]['Zomato'] || 0) + (fd.branchCh[b]['Swiggy'] || 0)), backgroundColor: '#E7BA44', borderRadius: 4, borderSkipped: false }
  ]);
  updateChart('c-zs-bar', RAW.branches, [
    { label: 'Zomato', data: RAW.branches.map(b => fd.branchCh[b]['Zomato'] || 0), backgroundColor: '#cb202d', borderRadius: 4, borderSkipped: false },
    { label: 'Swiggy', data: RAW.branches.map(b => fd.branchCh[b]['Swiggy'] || 0), backgroundColor: '#fc8019', borderRadius: 4, borderSkipped: false }
  ]);
  updateChart('c-ch-trend', fd.chTrend.labels, [
    { label: 'Dine In', data: fd.chTrend.series['Dine In'], borderColor: '#415639', backgroundColor: 'rgba(65,86,57,.08)', fill: true, tension: .3, borderWidth: 2.5, pointRadius: 5 },
    { label: 'Zomato', data: fd.chTrend.series['Zomato'], borderColor: '#cb202d', backgroundColor: 'rgba(203,32,45,.06)', fill: true, tension: .3, borderWidth: 2, pointRadius: 4 },
    { label: 'Swiggy', data: fd.chTrend.series['Swiggy'], borderColor: '#fc8019', backgroundColor: 'rgba(252,128,25,.06)', fill: true, tension: .3, borderWidth: 2, pointRadius: 4 }
  ]);

  const pn = document.getElementById('pattern-note');
  if (pn) pn.textContent = fd.patternNote;
  drawHeatmap();
}

function renderMenuCharts(fd) {
  updateChart('c-top10r2', fd.top10rItems, [{ data: fd.top10rRevs, backgroundColor: 'rgba(65,86,57,.75)', borderRadius: 4, borderSkipped: false }]);
  updateChart('c-top10q', fd.top10qItems, [{ data: fd.top10qQtys, backgroundColor: 'rgba(231,186,68,.75)', borderRadius: 4, borderSkipped: false }]);

  const meCats = ['Star', 'Plow Horse', 'Puzzle', 'Dog'];
  const meCols = ['rgba(159,199,148,.8)', 'rgba(148,184,227,.8)', 'rgba(231,186,68,.85)', 'rgba(230,140,133,.85)'];
  updateChart('c-me-scatter', [], meCats.map((cat, ci) => ({ label: cat, data: fd.mePoints.filter(p => p.cat === cat).map(p => ({ x: p.x, y: p.y, item: p.item })), backgroundColor: meCols[ci], pointRadius: 7, pointHoverRadius: 10 })));

  updateChart('c-grow', RAW.growItems, [{ data: RAW.growPct, backgroundColor: 'rgba(65,86,57,.75)', borderRadius: 6, borderSkipped: false, label: 'Growth%' }]);
  updateChart('c-decl', RAW.declItems, [{ data: RAW.declPct, backgroundColor: 'rgba(124,76,71,.75)', borderRadius: 6, borderSkipped: false, label: 'Change%' }]);

  updateChart('c-menu-cat-pie', fd.catLabels, [{ data: fd.catRevs, backgroundColor: ['#E7BA44', '#56754d', '#5985b9', '#907aa9', '#9c5f59', '#7C4C47'], borderWidth: 0 }]);
  updateChart('c-menu-price-tier', fd.priceTierLabels, [{ data: fd.priceTierQtys, backgroundColor: ['#56754d', '#E7BA44', '#5985b9', '#907aa9', '#9c5f59'], borderRadius: 5, label: 'Units Sold' }]);

  const mn = document.getElementById('menu-scope-note');
  if (mn) mn.textContent = fd.itemScopeNote;
  // Quadrant legend counts — computed from the same filtered item set the scatter plots
  const qc = { 'Star': 0, 'Plow Horse': 0, 'Puzzle': 0, 'Dog': 0 };
  fd.mePoints.forEach(pt => { if (qc[pt.cat] != null) qc[pt.cat]++; });
  const setCount = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v); };
  setCount('me-count-star', qc['Star']);
  setCount('me-count-horse', qc['Plow Horse']);
  setCount('me-count-puzzle', qc['Puzzle']);
  setCount('me-count-dog', qc['Dog']);
}

function renderKothrudCharts(fd) {
  const kShare = fd.branchRevs[RAW.branches.indexOf('Kothrud')];
  const restShare = Math.max(0, fd.rev - kShare);
  updateChart('c-kothrud-share', ['Kothrud (' + fmt(kShare) + ')', 'Rest of Chain (' + fmt(restShare) + ')'], [
    { data: [kShare, restShare], backgroundColor: ['#56754d', '#E7BA44'], borderWidth: 0 }
  ]);
  // Real Q2 data throughout (pipeline-generated): channel shares from branch
  // transactions, Kothrud hourly curve, and Kothrud item-level mixes.
  const compBranches = ['Kothrud', 'AUNDH', 'Wadgaon Sheri', 'Yolkshire Wakad'];
  const dineSharePct = b => {
    const bd = RAW.branch[b];
    return bd && bd.rev > 0 ? +(((bd.ch['Dine In']?.rev || 0) + (bd.ch['Takeaway']?.rev || 0)) / bd.rev * 100).toFixed(1) : 0;
  };
  updateChart('c-kothrud-channel-comp', ['Kothrud', 'Aundh', 'Wadgaon Sheri', 'Wakad'], [
    { label: 'Dine-In + Takeaway %', data: compBranches.map(dineSharePct), backgroundColor: '#56754d', borderRadius: 4 },
    { label: 'Delivery %', data: compBranches.map(b => +(100 - dineSharePct(b)).toFixed(1)), backgroundColor: '#E7BA44', borderRadius: 4 }
  ]);
  const kd = RAW.kothrudDetail;
  if (kd) {
    updateChart('c-kothrud-hourly', RAW.hours.map(h => h + ':00'), [
      { label: 'Kothrud Hourly Rev (full range)', data: RAW.branchPatterns.Kothrud.hRev, borderColor: '#56754d', backgroundColor: 'rgba(86,117,77,0.1)', fill: true, tension: 0.4 },
      { label: 'Chain Avg per Outlet', data: RAW.branchPatterns.all.hRev.map(v => Math.round(v / RAW.branches.length)), borderColor: '#E7BA44', borderDash: [5, 4], fill: false, tension: 0.4 }
    ]);
    updateChart('c-kothrud-bev-breakdown', kd.bevMix.labels, [
      { data: kd.bevMix.revs, backgroundColor: ['#56754d', '#E7BA44', '#907aa9', '#5985b9', '#9c5f59', '#a3979d'], borderWidth: 0 }
    ]);
    updateChart('c-kothrud-menu-mix', kd.top5.items, [
      { data: kd.top5.pcts, backgroundColor: ['#E7BA44', '#56754d', '#5985b9', '#907aa9', '#9c5f59'], borderRadius: 4 }
    ]);
  }

}

function renderMoneyCharts(fd) {
  // PnL Charts
  updateChart('c-pnl-waterfall', ['Target Sales', 'Actual Sales', 'COGS (30%)', 'Labor (18%)', 'Rent (15%)', 'Delivery Fee', 'Ops (5%)', 'Net Profit'], [
    { data: [fd.targetRev, fd.actualRev, -fd.cogs, -fd.labor, -fd.rent, -fd.commissions, -fd.ops, fd.netProfit], backgroundColor: ['#5985b9', '#E7BA44', '#9c5f59', '#9c5f59', '#9c5f59', '#cb202d', '#9c5f59', '#56754d'], borderRadius: 5, borderSkipped: false }
  ]);
  updateChart('c-pnl-breakdown', ['COGS (30%)', 'Labor Costs (18%)', 'Rent & CAM (15%)', 'Platform Fee', 'General Ops (5%)', 'Net Profit Margin'], [
    { data: [fd.cogs, fd.labor, fd.rent, fd.commissions, fd.ops, fd.netProfit], backgroundColor: ['#9c5f59', '#907aa9', '#5985b9', '#cb202d', '#a3979d', '#56754d'], borderWidth: 0, hoverOffset: 8 }
  ]);

  // Real EBITDA from cost actuals (Docs/Cost Actuals/*.csv via the pipeline)
  const ebTbl = document.getElementById('tbl-real-ebitda');
  if (ebTbl) {
    const ca = RAW.costActuals || {};
    if (!Object.keys(ca).length) {
      ebTbl.innerHTML = `<tr><td style="color:var(--muted);font-size:12px;padding:14px">Awaiting monthly cost actuals from accounts. Fill <strong>pipeline/cost_actuals_template.csv</strong> (one row per outlet per month, POS branch names, months as jan…dec), drop the file in <strong>Docs/Cost Actuals/</strong>, and re-run the pipeline — this table then shows each outlet's real EBITDA vs the ₹2L/month goal.</td></tr>`;
    } else {
      let html = `<tr><th>Outlet</th><th>Period Net Sales</th><th>Rent</th><th>Payroll</th><th>Purchases</th><th>Other</th><th>Real EBITDA</th><th>Margin</th><th>vs ₹2L/mo goal</th></tr>`;
      RAW.branches.forEach(b => {
        if (F.branch !== 'all' && b !== F.branch) return;
        const covered = fd.monthsSel.filter(m => ca[b]?.[m]);
        if (!covered.length) {
          html += `<tr><td><strong>${b}</strong></td><td colspan="8" style="color:var(--muted)">No cost actuals for the selected period</td></tr>`;
          return;
        }
        const sumK = k => covered.reduce((a, m) => a + (ca[b][m][k] || 0), 0);
        const revB = covered.reduce((a, m) => a + (RAW.cube[m]?.[b]?.rev || 0), 0);
        const rent = sumK('rent'), pay = sumK('payroll'), pur = sumK('purchases'), oth = sumK('other');
        const eb = revB - rent - pay - pur - oth;
        const margin = revB > 0 ? (eb / revB * 100).toFixed(1) : '0.0';
        const goal = 200000 * covered.length;
        html += `<tr><td><strong>${b}</strong></td><td>${fmt(revB)}</td><td>${fmt(rent)}</td><td>${fmt(pay)}</td><td>${fmt(pur)}</td><td>${fmt(oth)}</td><td style="font-weight:700;color:${eb >= 0 ? 'var(--green)' : '#e68c85'}">${fmt(eb)}</td><td>${margin}%</td><td><span class="tag ${eb >= goal ? 'star' : 'risk'}">${eb >= goal ? 'At/above' : 'Below'} goal</span></td></tr>`;
      });
      ebTbl.innerHTML = html;
    }
  }

}


// ── Combo Tracker (Menu page) ────────────────────────────────────────────────
function renderComboTracker() {
  const el = document.getElementById('combo-tracker');
  if (!el) return;
  const items = uploadInfo.items;
  if (!items || !items.list || !items.list.length) {
    el.innerHTML = `<div class="note" style="margin-bottom:0">No post-launch item export loaded yet. Export <strong>&ldquo;Multidate &mdash; Sales By Items&rdquo;</strong> from the POS for <strong>Jul 1 onwards</strong> and drop it on the <a href="#pg-data" style="color:var(--primary)">Data page upload box</a> &mdash; combo units, revenue and share appear here instantly.</div>`;
    return;
  }
  const matched = [];
  items.list.forEach(pt => { const c = matchCombo(pt.item); if (c) matched.push({ ...pt, combo: c }); });
  if (!matched.length) {
    el.innerHTML = `<div class="note" style="margin-bottom:0">Item export loaded (<strong>${items.label}</strong> &middot; ${items.list.length} items &middot; ${fmt(items.totalRev)}) but no items matched the launched-combo list. If the POS bills combos under different names, extend the match patterns in <strong>src/data/combos.js</strong>.</div>`;
    return;
  }
  const totQty = matched.reduce((a, m) => a + m.x, 0);
  const totRev = matched.reduce((a, m) => a + m.y, 0);
  let html = `<div style="display:flex;gap:18px;flex-wrap:wrap;margin-bottom:10px;font-size:12px">
    <span>Window: <strong>${items.label}</strong></span>
    <span>Combo units: <strong>${totQty.toLocaleString()}</strong></span>
    <span>Combo revenue: <strong>${fmt(totRev)}</strong></span>
    <span>Share of item revenue: <strong>${items.totalRev ? (totRev / items.totalRev * 100).toFixed(1) : '0'}%</strong></span>
  </div>
  <table class="tbl"><tr><th>Combo</th><th>POS item</th><th>Units</th><th>Revenue</th><th>Avg price</th></tr>`;
  matched.sort((a, b) => b.y - a.y).forEach(m => {
    html += `<tr><td><strong>${m.combo}</strong></td><td>${m.item}</td><td>${m.x.toLocaleString()}</td><td>${fmt(m.y)}</td><td>₹${m.x ? Math.round(m.y / m.x) : 0}</td></tr>`;
  });
  el.innerHTML = html + `</table>`;
}

// ── Upload zone (Data page) ──────────────────────────────────────────────────
function renderUploadStatus() {
  const el = document.getElementById('upload-status');
  if (!el) return;
  const u = loadUploads();
  const parts = [];
  Object.values(u.months || {}).forEach(M => parts.push(`${M.label}: ${M.invoices.toLocaleString()} invoices, ${fmt(M.net)}${M.partial ? ` (partial, ${M.days} days)` : ''}`));
  if (u.items) parts.push(`Item export “${u.items.label}”: ${u.items.list.length} items, ${fmt(u.items.totalRev)}`);
  el.innerHTML = parts.length ? '<strong>Active on this device:</strong> ' + parts.join(' · ') : 'No device uploads active. Committed pipeline data only.';
}

window.handleUploadFiles = async (files) => {
  if (!files || !files.length) return;
  const resEl = document.getElementById('upload-result');
  const u = loadUploads();
  u.months = u.months || {};
  const lines = [];
  let changed = false;
  for (const f of files) {
    try {
      const text = await f.text();
      const rows = parseCSV(text);
      const kind = detectKind(rows);
      if (kind === 'transactions') {
        const { months, warnings } = processTransactions(rows, RAW.branches);
        if (!months.length) { lines.push(`❌ <strong>${f.name}</strong>: no valid sale invoices found.`); continue; }
        months.forEach(M => {
          if (baseMonths.includes(M.key)) {
            lines.push(`⚠️ <strong>${f.name}</strong>: ${M.label} is already in the committed dataset — skipped. Re-run the pipeline to update committed months.`);
          } else {
            u.months[M.key] = M;
            changed = true;
            lines.push(`✅ <strong>${f.name}</strong>: ${M.label}${M.partial ? ` (partial — ${M.days}/${M.calendarDays} days)` : ''} · ${M.invoices.toLocaleString()} invoices · ${fmt(M.net)} net sales.`);
          }
        });
        if (warnings.unknownBranches.length) lines.push(`⚠️ Skipped rows from unknown outlets: ${warnings.unknownBranches.join(', ')} (add them to the pipeline first).`);
        if (warnings.unknownChannels.length) lines.push(`⚠️ Skipped rows with unknown channels: ${warnings.unknownChannels.join(', ')}.`);
        if (warnings.zeroNet) lines.push(`ℹ️ ${warnings.zeroNet} zero-net comped invoices excluded (canonical rule).`);
      } else if (kind === 'items') {
        const res = processItems(rows);
        u.items = { label: f.name.replace(/\.csv$/i, ''), savedAt: new Date().toISOString(), list: res.list, totalRev: res.totalRev, totalQty: res.totalQty };
        changed = true;
        lines.push(`✅ <strong>${f.name}</strong>: item export · ${res.list.length} items · ${fmt(res.totalRev)} — powers the Combo Tracker.`);
      } else {
        lines.push(`❌ <strong>${f.name}</strong>: columns not recognized — expected a POS “Sale Transactions” or “Sales By Items” export.`);
      }
    } catch (err) {
      lines.push(`❌ <strong>${f.name}</strong>: ${err.message}`);
    }
  }
  if (changed) {
    saveUploads(u);
    lines.push(`<button class="filter-reset" onclick="location.reload()">↻ Apply now (reloads the app)</button>`);
  }
  if (resEl) resEl.innerHTML = lines.map(l => `<div class="home-alert sev-info"><div style="width:100%">${l}</div></div>`).join('');
  renderUploadStatus();
};

window.clearDeviceUploads = () => { clearUploads(); location.reload(); };

// Only the active page renders — every navigation triggers a refresh, so
// nothing goes stale, and filter changes stop re-drawing 35 hidden charts.
function refresh() {
  const fd = getFilteredData();
  document.getElementById('filter-ctx').textContent = buildContextLabel();
  updateFilterStyles();
  const active = document.querySelector('.page.active')?.id || 'pg-home';
  if (active === 'pg-home') {
    renderHome();
  } else if (active === 'pg-outlets') {
    renderOutletCharts(fd);
    renderOutletTables(fd);
    renderBranchProfile(currentBranchProfile);
    renderDualStoreComparison();
  } else if (active === 'pg-kothrud') {
    renderKothrudCharts(fd);
    renderKothrudKPIs(fd);
    renderKothrudTables(fd);
    renderKothrudGap();
  } else if (active === 'pg-menu-group') {
    renderMenuCharts(fd);
    renderMarketBasketTab();
    renderComboTracker();
  } else if (active === 'pg-money') {
    updateMoneyKPIs(fd);
    renderMoneyCharts(fd);
    renderMoneyTables(fd);
    renderWhatIfSimulator();
    recalcFranchiseeModel();
  } else if (active === 'pg-data') {
    renderUploadStatus();
  }
}


export function applyFilters() {
  F.period = document.getElementById('f-period').value;
  F.branch = document.getElementById('f-branch').value;
  try { localStorage.setItem('yolk.filters', JSON.stringify(F)); } catch (e) {}
  refresh();
}

export function resetFilters() {
  F = { period: 'all', branch: 'all' };
  ['f-period', 'f-branch'].forEach(id => { const el = document.getElementById(id); if (el) el.value = 'all'; });
  excludeNonMenu = false;
  const btn = document.getElementById('btn-exclude-nonmenu');
  if (btn) btn.textContent = '💧 Exclude Water/Misc (OFF)';
  activeCategorySelection = new Set(getAllMenuItems());
  try { localStorage.setItem('yolk.filters', JSON.stringify(F)); } catch (e) {}
  refresh();
}

export function showPage(param) {
  try {
    const pages = Array.from(document.querySelectorAll('.page'));
    const tabs = Array.from(document.querySelectorAll('.tab'));

    // Resolve the target page by id (numeric args are legacy: treated as page index).
    let targetId = null;
    if (typeof param === 'number' && pages[param]) {
      targetId = pages[param].id;
    } else if (typeof param === 'string') {
      targetId = param;
    }

    let targetIndex = pages.findIndex(p => p.id === targetId);
    if (targetIndex < 0) {
      console.error(`showPage: no page with id "${targetId}" — falling back to first page`);
      targetIndex = 0;
    }
    const activeId = pages[targetIndex].id;

    pages.forEach((p, i) => p.classList.toggle('active', i === targetIndex));
    // Tabs and pages are not index-aligned; match each tab by the id in its onclick.
    tabs.forEach(t => {
      const oc = t.getAttribute('onclick') || '';
      t.classList.toggle('active', oc.includes(`'${activeId}'`));
    });

    try { history.replaceState(null, '', '#' + activeId); } catch (e) {}
    refresh();

    requestAnimationFrame(() => {
      Object.values(CHARTS).forEach(c => {
        try {
          if (c && typeof c.resize === 'function') c.resize();
        } catch (e) {}
      });

      if (activeId === 'pg-home') renderHome();
      if (activeId === 'pg-kothrud') renderKothrudGap();
      // Group pages: re-render whichever subpage is currently active.
      const activeSub = pages[targetIndex].querySelector('.subpage.active');
      if (activeSub) renderSubContent(activeSub.id);
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
  const hrs = RAW.hours; const data = currentHeatmap || RAW.heatmap;
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

  mkChart('c-q1q2-monthly', 'bar', ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], [{ label: 'Monthly Net Revenue', data: ['jan', 'feb', 'mar', 'apr', 'may', 'jun'].map(m => RAW.month[m].rev), backgroundColor: ['#907aa9', '#907aa9', '#907aa9', '#E7BA44', '#56754d', '#9c5f59'], borderRadius: 5 }], { scales: { x: xBase, y: yRev } });
  mkChart('c-q1q2-branch', 'bar', RAW.branches.filter(b => b !== 'Bavdhan'), [{ label: 'Q1 Net Revenue', data: RAW.branches.filter(b => b !== 'Bavdhan').map(b => RAW.q1.branch[b].rev), backgroundColor: 'rgba(144,122,169,.75)', borderRadius: 4 }, { label: 'Q2 Net Revenue', data: RAW.branches.filter(b => b !== 'Bavdhan').map(b => RAW.branch[b].rev), backgroundColor: '#E7BA44', borderRadius: 4 }], { scales: { x: xBase, y: yRev } });

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
  const scale = 1;

  // Catalog is built exclusively from real POS item data (RAW.mePoints, generated
  // by pipeline/build_data.py). No values are ever synthesized.
  const catalog = [];
  const quadMeta = {
    'Star': { label: 'Star ⭐', tag: 'star' },
    'Plow Horse': { label: 'Plow Horse 🐴', tag: 'horse' },
    'Puzzle': { label: 'Puzzle 🧩', tag: 'puzzle' },
    'Dog': { label: 'Dog 🐕', tag: 'risk' }
  };
  RAW.mePoints.forEach(p => {
    const isNon = isNonMenuItem(p.item);
    if (excludeNonMenu && isNon) return;
    if (!itemPassesCategoryFilter(p.item)) return;

    const rev = Math.round(p.y * scale);
    const qty = Math.round(p.x * scale);
    const aovContrib = fd.rev > 0 ? ((rev / fd.rev) * 100).toFixed(2) + '%' : '0.0%';
    const meta = quadMeta[p.cat] || { label: '—', tag: 'horse' };
    catalog.push({ name: p.item, cat: p.mcat || 'Uncategorized', qty, rev, aovContrib, quadrant: meta.label, tagClass: meta.tag });
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
  const delShare = fd.deliveryShare ?? 0.5253;
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
  const scale = 1;

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

  // Beverage attach rate needs per-invoice item data — no verified source yet.
  const bevAttachA = null;
  const bevAttachB = null;

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
  setEl('kpi-comp-bevgap', bevAttachA == null ? 'N/A' : `${bevAttachA}% vs ${bevAttachB}%`);
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
          <td style="font-weight:700;color:var(--amber)">N/A</td>
          <td>N/A</td>
          <td>N/A</td>
          <td>Requires per-invoice item data (planned: item-level pipeline)</td>
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
    { label: dualStoreA, data: (RAW.branchPatterns[dualStoreA] || RAW.branchPatterns.all).hRev, borderColor: '#E7BA44', backgroundColor: 'transparent', borderWidth: 2, tension: 0.3 },
    { label: dualStoreB, data: (RAW.branchPatterns[dualStoreB] || RAW.branchPatterns.all).hRev, borderColor: '#5985b9', backgroundColor: 'transparent', borderWidth: 2, tension: 0.3 }
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
window.recalcFranchiseeModel = recalcFranchiseeModel;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.showPage = showPage;
window.openModal = openModal;
window.closeModal = closeModal;
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.toggleCategoryGroup = toggleCategoryGroup;
window.selectAllCategories = selectAllCategories;
window.applyCategoryFilter = applyCategoryFilter;
window.toggleNonMenuFilter = toggleNonMenuFilter;
window.showInfoModal = showInfoModal;
window.sortTable = sortTable;
window.exportTableToCSV = exportTableToCSV;
window.updateSim = updateSim;
window.setDualStoreA = setDualStoreA;
window.setDualStoreB = setDualStoreB;
window.swapDualStores = swapDualStores;
window.filterModalMenuTable = filterModalMenuTable;
window.showSub = showSub;
window.selectBranchProfile = (b) => {
  currentBranchProfile = b;
  document.querySelectorAll('.branch-pill').forEach(p => p.classList.toggle('active', p.textContent === b));
  renderBranchProfile(b);
};

// Diagnostics hook: lets DevTools / automated tests inspect chart instances.
window.__CHARTS = CHARTS;

window.addEventListener('resize', () => { if (window._hmDrawn) drawHeatmap(); });

// Deep links also work as same-document navigations (typed/pasted #hashes).
window.addEventListener('hashchange', () => {
  const hash = (location.hash || '').replace('#', '');
  if (!hash) return;
  const [pg, sub] = hash.split('/');
  if (!document.getElementById(pg)) return;
  const activeNow = document.querySelector('.page.active')?.id;
  const activeSub = document.querySelector(`#${pg} .subpage.active`)?.id;
  if (activeNow !== pg) showPage(pg);
  if (sub && document.getElementById(sub) && sub !== activeSub) showSub(pg, sub);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

window.addEventListener('DOMContentLoaded', () => {
  // Device uploads (Data page) extend the committed dataset with new months.
  baseMonths = RAW.meta.months.slice();
  uploadInfo = applyUploads(RAW);
  uploadInfo.applied.forEach(mk => {
    TIERED_TARGETS.forEach(tt => {
      if (!tt.pos) return;
      RAW.branchTargets[tt.pos] = RAW.branchTargets[tt.pos] || {};
      if (RAW.branchTargets[tt.pos][mk] == null) RAW.branchTargets[tt.pos][mk] = tt.sales.t1;
    });
    if (RAW.branchTargets.Bavdhan && RAW.branchTargets.Bavdhan[mk] == null) RAW.branchTargets.Bavdhan[mk] = 500000;
  });

  // Period & outlet selectors are built from the data itself — the app never
  // assumes what months exist. New pipeline runs extend these automatically.
  const meta = RAW.meta;
  const periodSel = document.getElementById('f-period');
  if (periodSel) {
    let opts = `<option value="all">All data (${meta.rangeLabel})</option>`;
    Object.keys(meta.quarters).slice().reverse().forEach(q => {
      opts += `<option value="${q}">${meta.quarterLabels[q]}</option>`;
    });
    meta.months.slice().reverse().forEach(m => {
      opts += `<option value="${m}">${meta.monthLabels[m]}</option>`;
    });
    periodSel.innerHTML = opts;
  }
  const branchSel = document.getElementById('f-branch');
  if (branchSel) {
    branchSel.innerHTML = `<option value="all">All Outlets</option>` +
      RAW.branches.map(b => `<option value="${b}">${b === 'Kothrud' ? 'Kothrud (Benchmark)' : b}</option>`).join('');
  }

  // Restore last-used filters
  try {
    const saved = JSON.parse(localStorage.getItem('yolk.filters') || '{}');
    if (saved.period && (saved.period === 'all' || meta.quarters[saved.period] || meta.months.includes(saved.period))) F.period = saved.period;
    if (saved.branch && (saved.branch === 'all' || RAW.branches.includes(saved.branch))) F.branch = saved.branch;
  } catch (e) {}
  if (periodSel) periodSel.value = F.period;
  if (branchSel) branchSel.value = F.branch;

  // Header identity comes from the data too
  const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setTxt('badge-period', meta.rangeLabel);
  setTxt('badge-orders', meta.totalOrders.toLocaleString());
  setTxt('badge-branches', String(RAW.branches.length));
  const sub = document.getElementById('header-subtitle');
  if (sub) sub.textContent = `Operations & Intelligence Platform · data through ${meta.latestDate}`;

  initCategorySelection();
  initCharts();
  refresh();
  renderBranchProfile('Kothrud');
  renderDualStoreComparison();
  recalcFranchiseeModel();

  const zone = document.getElementById('upload-zone');
  if (zone) {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--primary)'; });
    zone.addEventListener('dragleave', () => { zone.style.borderColor = 'var(--border)'; });
    zone.addEventListener('drop', e => { e.preventDefault(); zone.style.borderColor = 'var(--border)'; window.handleUploadFiles(e.dataTransfer.files); });
  }
  renderUploadStatus();

  // Deep link: #page or #group/subpage
  const hash = (location.hash || '').replace('#', '');
  if (hash) {
    const [pg, sub2] = hash.split('/');
    if (document.getElementById(pg)) {
      showPage(pg);
      if (sub2 && document.getElementById(sub2)) showSub(pg, sub2);
    }
  }
});
