import './styles/main.css';
import Chart from 'chart.js/auto';
import { RAW, DAILY_REVENUE, BRANCH_PROFILES } from './data/dashboardData.js';
import { CHARTS, fmt, fmtN, hexToRgb, mkChart, updateChart } from './charts/chartManager.js';

let F = { branch: 'all', month: 'all', channel: 'all', session: 'all' };
let currentBranchProfile = 'Kothrud';
let bpCharts = {};
let modalChart = null;
let excludeNonMenu = false;
let activeCategorySelection = null;

const MENU_CATEGORIES = {
  'Signature Breakfasts & Omelettes': [
    'Chicken Stroganoff', 'Special Roast Chicken', 'Yolkshire Special Breakfast', 'Traditional English Breakfast', 
    'Egg White Omelette', 'Masala Omelette', 'Spanish Omelette', 'Cheese Omelette', 'Mushroom & Cheese Omelette',
    'Peri Peri Paneer Scramble', 'Peri Peri Chicken Scramble', 'Paneer Potpourri Scramble', 'Chicken Potpourri Scramble',
    'Italian Reve Scramble', 'Mexican Salsa Verde Scramble', 'Mezze Lebanese Scramble', 'Honey Bee Chicken'
  ],
  'Rice Bowls & Regional Mains': [
    'Kerala Curry', 'Paprika Chicken', 'Low-Carb Stroganoff', 'Chimmichurri Chicken', 'Peri-Peri Steak',
    'Herb Chicken Rice Bowl', 'BBQ Chicken Bowl', 'Paneer Butter Masala Bowl', 'Dal Makhani Rice Bowl',
    'Veg Thai Green Curry', 'Chicken Thai Red Curry', 'Grilled Fish Rice Bowl', 'Teriyaki Chicken Bowl'
  ],
  'Sandwiches, Rolls & Burgers': [
    'Chicken Mayo Sandwich', 'Masala Omelette Eggwich', 'White Eggwich', 'Bombay Masala Sandwich',
    'Bacon Eggwich', 'Classic Double Egg Roll', 'Hakuna Matata Roll', 'Potpourri Paneer Roll',
    'Chicken Alfredo Roll', 'Classic Veg Burger', 'Egg On Cheese Burger', 'Chicken Burger',
    'Club Sandwich', 'Grilled Cheese Sandwich', 'Paneer Tikka Roll', 'BBQ Chicken Roll'
  ],
  'Pancakes, Waffles & Desserts': [
    'Salted Caramel and Cream', 'Banana Nutella Pancake', 'Classic Fluffy Pancakes', 'Belgian Chocolate Waffle',
    'Blueberry Pancakes', 'Maple Butter Waffle', 'Nutella Waffle', 'Chocolate Brownie with Ice Cream'
  ],
  'Beverages & Gourmet Coffee': [
    'Classic Cold Coffee', 'Vietnamese Iced Coffee', 'Cappuccino', 'Cold Brew', 'Espresso', 'Americano',
    'Iced Americano', 'Filter Coffee', 'Iced Mocha Latte', 'Spanish Latte', 'Masala Chai', 'Peach Iced Tea',
    'Lemon Iced Tea', 'Mint Lemonade', 'Green Smoothie', 'Fresh Watermelon Juice', 'Hot Chocolate'
  ],
  'Salads, Sides & Extras': [
    'Russian Salad', 'Chicken Caesar Salad', 'Orange and Chicken Salad', 'Greek Salad', 'French Fries',
    'Peri Peri Fries', 'Garlic Bread Sticks', 'Cheese Garlic Bread', 'Butter Toast', '2 Boiled Eggs',
    'Cook in Butter', 'Cook in Olive Oil', 'Chicken Sausage', 'Crispy Bacon Strips', 'Pesto Glaze'
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
  if (chartId === 'c-top10r' || chartId === 'c-top10r2' || chartId === 'c-top10q') {
    let html = `
      <div style="margin-bottom:10px;font-weight:700;font-size:12px;color:var(--primary)">Full Menu Catalog Performance Breakdown (${excludeNonMenu ? 'Food & Drink Only' : '160+ Items'})</div>
      <table class="tbl">
        <tr><th>Rank</th><th>Item Name</th><th>Category</th><th>Qty Sold</th><th>Net Revenue</th><th>AOV Contribution</th></tr>
    `;
    let fullItems = [
      { r: 1, name: 'Chicken Stroganoff', cat: 'Rice Bowls & Mains', qty: 2150, rev: 892410, aov: '9.1%', nonMenu: false },
      { r: 2, name: 'Special Roast Chicken', cat: 'Mains', qty: 1120, rev: 398120, aov: '4.1%', nonMenu: false },
      { r: 3, name: 'Peri-Peri Steak', cat: 'Steaks & Grills', qty: 1050, rev: 381450, aov: '3.9%', nonMenu: false },
      { r: 4, name: 'Chimmichurri Chicken', cat: 'Mains', qty: 890, rev: 290180, aov: '3.0%', nonMenu: false },
      { r: 5, name: 'Kerala Curry', cat: 'Regional Mains', qty: 380, rev: 238420, aov: '2.4%', nonMenu: false },
      { r: 6, name: 'Paprika Chicken', cat: 'Mains', qty: 370, rev: 237890, aov: '2.4%', nonMenu: false },
      { r: 7, name: 'Classic Cold Coffee', cat: 'Beverages', qty: 2890, rev: 180420, aov: '1.8%', nonMenu: false },
      { r: 8, name: 'Low-Carb Stroganoff', cat: 'Fitness & Keto', qty: 410, rev: 178900, aov: '1.8%', nonMenu: false },
      { r: 9, name: 'Chicken Mayo Sandwich', cat: 'Sandwiches & Rolls', qty: 1640, rev: 172150, aov: '1.7%', nonMenu: false },
      { r: 10, name: 'Vietnamese Iced Coffee', cat: 'Beverages', qty: 1380, rev: 168400, aov: '1.7%', nonMenu: false },
      { r: 11, name: 'Egg White Omelette', cat: 'Eggs', qty: 3420, rev: 142100, aov: '1.5%', nonMenu: false },
      { r: 12, name: 'Cappuccino', cat: 'Beverages', qty: 1520, rev: 136800, aov: '1.4%', nonMenu: false },
      { r: 13, name: 'Packaged Water Bottle', cat: 'Non-Menu / Misc', qty: 5487, rev: 123457, aov: '1.3%', nonMenu: true },
      { r: 14, name: 'French Fries', cat: 'Sides', qty: 1480, rev: 118400, aov: '1.2%', nonMenu: false },
      { r: 15, name: 'Carry Bag / Packaging Fee', cat: 'Non-Menu / Misc', qty: 4120, rev: 94500, aov: '0.9%', nonMenu: true }
    ];
    if (excludeNonMenu) fullItems = fullItems.filter(item => !item.nonMenu);
    if (activeCategorySelection) fullItems = fullItems.filter(item => activeCategorySelection.has(item.name));
    fullItems.forEach((item, idx) => {
      html += `<tr><td>#${idx + 1}</td><td><strong>${item.name}</strong></td><td>${item.cat}</td><td>${fmtN(item.qty)}</td><td>${fmt(item.rev)}</td><td><span class="tag star">${item.aov}</span></td></tr>`;
    });
    return html + '</table>';
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
  if (month === 'apr') rawDailySlice = DAILY_REVENUE.slice(0, 30);
  else if (month === 'may') rawDailySlice = DAILY_REVENUE.slice(30, 61);
  else if (month === 'jun') rawDailySlice = DAILY_REVENUE.slice(61, 91);
  result.dailyTrend = rawDailySlice.map(d => ({ date: d.date, rev: Math.round(d.rev * scale), ma: Math.round(d.ma * scale) }));

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
    let html = `<tr><th>Branch</th><th>Revenue</th><th>AOV</th><th>Trend</th><th>Status</th></tr>`;
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
        <th>Branch</th><th>Total Rev</th><th>Offline Rev</th><th>Online Rev</th><th>Offline%</th><th>Zomato Rev</th><th>Swiggy Rev</th><th>Z-AOV</th><th>S-AOV</th><th>DineIn AOV</th><th>Winner</th>
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
          <td>₹${bd.ch['Zomato'] ? Math.round(bd.ch['Zomato'].aov || 485) : 485}</td>
          <td>₹${bd.ch['Swiggy'] ? Math.round(bd.ch['Swiggy'].aov || 441) : 441}</td>
          <td>₹${bd.ch['Dine In'] ? Math.round(bd.ch['Dine In'].aov || 589) : 589}</td>
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
        <th>Branch</th><th>Apr-Jun Target</th><th>Actual Rev</th><th>Variance</th><th>COGS (30%)</th><th>Labor (18%)</th><th>Rent (15%)</th><th>Commissions</th><th>Ops (5%)</th><th>Net EBITDA Profit</th><th>EBITDA Margin</th>
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
      <tr><th>Channel Mode</th><th>Gross Sales</th><th>Sales Share</th><th>COGS (30%)</th><th>Platform Fee</th><th>Net Operating Revenue</th><th>Net Margin %</th></tr>
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
  renderTables(fd);
  renderRecommendations(fd);
  buildExecutiveReport();
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

export function showPage(n) {
  document.querySelectorAll('.page').forEach((p, i) => p.classList.toggle('active', i === n));
  document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', i === n));
  refresh();
}

function drawHeatmap() {
  const canvas = document.getElementById('c-heatmap');
  if (!canvas) return;
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

// Window Event Listeners & Global Attachments
window.toggleTheme = toggleTheme;
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
});
