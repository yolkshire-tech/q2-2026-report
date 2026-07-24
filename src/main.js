import './styles/main.css';
import Chart from 'chart.js/auto';
import { RAW, DAILY_REVENUE, BRANCH_PROFILES } from './data/dashboardData.js';
import { CHARTS, fmt, fmtN, hexToRgb, mkChart, updateChart } from './charts/chartManager.js';

let F = { branch: 'all', month: 'all', channel: 'all', session: 'all' };
let currentBranchProfile = 'Kothrud';
let bpCharts = {};
let modalChart = null;

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

function buildChartTable(chart, chartId) {
  if (chartId === 'c-top10r' || chartId === 'c-top10r2' || chartId === 'c-top10q') {
    let html = `
      <div style="margin-bottom:10px;font-weight:700;font-size:12px;color:var(--primary)">Full Menu Catalog Performance Breakdown (160+ Items)</div>
      <table class="tbl">
        <tr><th>Rank</th><th>Item Name</th><th>Category</th><th>Qty Sold</th><th>Net Revenue</th><th>AOV Contribution</th></tr>
    `;
    const fullItems = [
      { r: 1, name: 'Chicken Stroganoff', cat: 'Rice Bowls & Mains', qty: 2150, rev: 892410, aov: '9.1%' },
      { r: 2, name: 'Special Roast Chicken', cat: 'Mains', qty: 1120, rev: 398120, aov: '4.1%' },
      { r: 3, name: 'Peri-Peri Steak', cat: 'Steaks & Grills', qty: 1050, rev: 381450, aov: '3.9%' },
      { r: 4, name: 'Chimmichurri Chicken', cat: 'Mains', qty: 890, rev: 290180, aov: '3.0%' },
      { r: 5, name: 'Kerala Curry', cat: 'Regional Mains', qty: 380, rev: 238420, aov: '2.4%' },
      { r: 6, name: 'Paprika Chicken', cat: 'Mains', qty: 370, rev: 237890, aov: '2.4%' },
      { r: 7, name: 'Classic Cold Coffee', cat: 'Beverages', qty: 2890, rev: 180420, aov: '1.8%' },
      { r: 8, name: 'Low-Carb Stroganoff', cat: 'Fitness & Keto', qty: 410, rev: 178900, aov: '1.8%' },
      { r: 9, name: 'Chicken Mayo Sandwich', cat: 'Sandwiches & Rolls', qty: 1640, rev: 172150, aov: '1.7%' },
      { r: 10, name: 'Vietnamese Iced Coffee', cat: 'Beverages', qty: 1380, rev: 168400, aov: '1.7%' },
      { r: 11, name: 'Egg White Omelette', cat: 'Eggs', qty: 3420, rev: 142100, aov: '1.5%' },
      { r: 12, name: 'Cappuccino', cat: 'Beverages', qty: 1520, rev: 136800, aov: '1.4%' },
      { r: 13, name: 'French Fries', cat: 'Sides', qty: 1480, rev: 118400, aov: '1.2%' },
      { r: 14, name: 'Butter Toast', cat: 'Breakfast Sides', qty: 1980, rev: 89100, aov: '0.9%' },
      { r: 15, name: 'Masala Chai', cat: 'Beverages', qty: 1850, rev: 74000, aov: '0.8%' },
      { r: 16, name: 'Boiled Eggs (2)', cat: 'Eggs', qty: 1410, rev: 56400, aov: '0.6%' }
    ];
    fullItems.forEach(item => {
      html += `<tr><td>#${item.r}</td><td><strong>${item.name}</strong></td><td>${item.cat}</td><td>${fmtN(item.qty)}</td><td>${fmt(item.rev)}</td><td><span class="tag star">${item.aov}</span></td></tr>`;
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
  const { branch, month, channel, session } = F;
  const result = {};
  let rev, ord, aov;

  if (branch !== 'all' && month !== 'all') {
    const bd = RAW.branch[branch];
    rev = bd[month];
    ord = Math.round(bd.ord * (rev / bd.rev));
    aov = bd.aov;
  } else if (branch !== 'all') {
    const bd = RAW.branch[branch];
    rev = bd.rev; ord = bd.ord; aov = bd.aov;
  } else if (month !== 'all') {
    const md = RAW.month[month];
    rev = md.rev; ord = md.ord; aov = md.aov;
  } else {
    rev = 20728578; ord = 40193; aov = 515.73;
  }

  if (channel !== 'all') {
    const chData = RAW.channel[channel];
    if (branch !== 'all') {
      const bd = RAW.branch[branch];
      const bChData = bd.ch[channel] || { rev: 0, ord: 0 };
      rev = bChData.rev; ord = bChData.ord;
    } else {
      rev = Math.round(rev * (chData.share / 100));
      ord = Math.round(ord * (chData.share / 100));
    }
    aov = chData.aov;
  }

  result.rev = rev; result.ord = ord; result.aov = Math.round(aov);
  result.daily = Math.round(rev / (month === 'all' ? 91 : 30));

  if (month !== 'all') {
    const md = RAW.month[month];
    result.branchRevs = RAW.branches.map(b => md.br[b] || 0);
  } else {
    result.branchRevs = RAW.branches.map(b => RAW.branch[b].rev);
  }

  result.branchColors = RAW.branches.map((b, i) => {
    if (branch !== 'all') return b === branch ? RAW.branchColors[i] : `rgba(${hexToRgb(RAW.branchColors[i])},0.25)`;
    return RAW.branchColors[i];
  });

  if (branch !== 'all') {
    const bd = RAW.branch[branch];
    result.chRevs = RAW.channels.map(c => (bd.ch[c] || { rev: 0 }).rev);
    result.chOrds = RAW.channels.map(c => (bd.ch[c] || { ord: 0 }).ord);
  } else if (month !== 'all') {
    const md = RAW.month[month];
    result.chRevs = RAW.channels.map(c => (md.ch[c] || { rev: 0 }).rev);
    result.chOrds = RAW.channels.map(c => (md.ch[c] || { ord: 0 }).ord);
  } else {
    result.chRevs = RAW.channels.map(c => RAW.channel[c].rev);
    result.chOrds = RAW.channels.map(c => RAW.channel[c].ord);
  }

  result.chColors = RAW.channels.map((c, i) => {
    if (channel !== 'all') return c === channel ? RAW.channelColors[i] : `rgba(${hexToRgb(RAW.channelColors[i])},0.2)`;
    return RAW.channelColors[i];
  });

  if (branch !== 'all') {
    const bd = RAW.branch[branch];
    result.monthlyRevs = [bd.apr, bd.may, bd.jun];
  } else {
    result.monthlyRevs = [RAW.month.apr.rev, RAW.month.may.rev, RAW.month.jun.rev];
  }

  result.monthColors = ['apr', 'may', 'jun'].map((m, i) => {
    if (month !== 'all') return m === month ? ['#E7BA44', '#56754d', '#9c5f59'][i] : 'rgba(163,151,157,0.3)';
    return ['#E7BA44', '#56754d', '#9c5f59'][i];
  });

  const sessMap = { all: { breakfast: 5663273, lunch: 6275153, snack: 1918526, dinner: 6856676 }, apr: RAW.month.apr.sess, may: RAW.month.may.sess, jun: RAW.month.jun.sess };
  const sessBase = month !== 'all' ? sessMap[month] : sessMap.all;

  result.sessRevs = ['breakfast', 'lunch', 'snack', 'dinner'].map(s => {
    let r = sessBase[s];
    if (branch !== 'all') r = Math.round(r * RAW.branch[branch].rev / 20728578);
    return r;
  });

  result.sessOrds = result.sessRevs.map((r, i) => {
    const base = [10626, 11372, 4058, 14134][i];
    return Math.round(base * r / (sessBase[['breakfast', 'lunch', 'snack', 'dinner'][i]] || r || 1));
  });

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
    if (channel !== 'all') return c === channel ? RAW.channelColors[i] : `rgba(${hexToRgb(RAW.channelColors[i])},0.25)`;
    return RAW.channelColors[i];
  });

  return result;
}

function buildContextLabel() {
  const parts = [];
  if (F.branch !== 'all') parts.push(F.branch);
  if (F.month !== 'all') parts.push({ apr: 'April 2026', may: 'May 2026', jun: 'June 2026' }[F.month]);
  if (F.channel !== 'all') parts.push(F.channel);
  if (F.session !== 'all') parts.push({ breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack', dinner: 'Dinner' }[F.session]);
  return parts.length ? 'Filtered: ' + parts.join(' · ') : 'Showing: All Q2 2026 Data · 40,193 orders';
}

function updateFilterStyles() {
  ['f-branch', 'f-month', 'f-channel', 'f-session'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('filter-active', el.value !== 'all');
  });
}

function updateKPIs(fd) {
  document.getElementById('k-rev').textContent = fmt(fd.rev);
  document.getElementById('k-rev-sub').textContent = fmtN(fd.ord) + ' orders';
  document.getElementById('k-ord').textContent = fmtN(fd.ord);
  document.getElementById('k-ord-sub').textContent = (fd.ord / 91).toFixed(0) + '/day avg';
  document.getElementById('k-aov').textContent = '₹' + fd.aov;
  document.getElementById('k-daily').textContent = fmt(fd.daily);

  if (F.branch !== 'all') {
    const bd = RAW.branch[F.branch];
    document.getElementById('k-branch').textContent = F.branch;
    document.getElementById('k-branch-sub').textContent = fmt(bd.rev) + ' · ' + bd.share + '%';
  } else {
    document.getElementById('k-branch').textContent = 'Kothrud';
    document.getElementById('k-branch-sub').textContent = '₹62.3L · 30.1%';
  }
}

function refresh() {
  const fd = getFilteredData();
  updateKPIs(fd);
  document.getElementById('filter-ctx').textContent = buildContextLabel();
  updateFilterStyles();

  const monthLabels = ['Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026'];
  const allRevs = [...fd.monthlyRevs, 7042431, 7108883, 7175336];
  const monthColors = [...fd.monthColors, 'rgba(144,122,169,.5)', 'rgba(144,122,169,.4)', 'rgba(144,122,169,.3)'];

  updateChart('c-monthly', monthLabels, [{ data: allRevs, backgroundColor: monthColors, borderRadius: 6, borderSkipped: false, label: 'Revenue' }]);
  updateChart('c-ch-donut', RAW.channels, [{ data: fd.chRevs, backgroundColor: fd.chColors, borderWidth: 0, hoverOffset: 8 }]);
  updateChart('c-br-bar', RAW.branches, [{ data: fd.branchRevs, backgroundColor: fd.branchColors, borderRadius: 5, borderSkipped: false }]);
  updateChart('c-session-donut', ['Breakfast', 'Lunch', 'Snack', 'Dinner'], [{ data: fd.sessRevs, backgroundColor: fd.sessColors, borderWidth: 0, hoverOffset: 8 }]);

  const hrRevColors = RAW.hours.map(h => (!fd.activeHours ? 'rgba(231,186,68,.7)' : fd.activeHours.includes(h) ? '#E7BA44' : 'rgba(231,186,68,.15)'));
  updateChart('c-hr-rev', RAW.hours.map(h => h + ':00'), [{ data: RAW.hRev, borderColor: '#E7BA44', backgroundColor: 'rgba(231,186,68,.08)', fill: true, tension: .4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: hrRevColors, label: 'Revenue' }]);

  const hrOrdColors = RAW.hours.map((h, i) => {
    const dim = fd.activeHours && !fd.activeHours.includes(h) ? 0.15 : 1;
    const load = RAW.hLoad[i];
    const base = load >= 80 ? '124,76,71' : load >= 50 ? '231,186,68' : '65,86,57';
    return `rgba(${base},${dim * 0.8})`;
  });

  updateChart('c-hr-ord', RAW.hours.map(h => h + ':00'), [{ data: RAW.hOrd, backgroundColor: hrOrdColors, borderRadius: 4, borderSkipped: false }]);

  const branchKeys = F.branch !== 'all' ? [F.branch] : Object.keys(RAW.branch).filter(b => b !== 'Bavdhan');
  const brTrendDs = branchKeys.map(b => {
    const bd = RAW.branch[b];
    const ci = RAW.branches.indexOf(b);
    return { label: b, data: [bd.apr, bd.may, bd.jun], borderColor: RAW.branchColors[ci], backgroundColor: 'transparent', tension: .3, borderWidth: F.branch !== 'all' ? 2 : 1.5, pointRadius: 4 };
  });

  updateChart('c-br-trend', ['Apr', 'May', 'Jun'], brTrendDs);
  updateChart('c-sess-bar', ['Breakfast', 'Lunch', 'Snack', 'Dinner'], [
    { label: 'Revenue', data: fd.sessRevs, backgroundColor: fd.sessColors, borderRadius: 5, borderSkipped: false, yAxisID: 'y' },
    { label: 'Orders', data: fd.sessOrds, backgroundColor: fd.sessColors.map(c => c.replace('.8', '.3').replace('0.2', '0.08')), borderRadius: 5, borderSkipped: false, yAxisID: 'y2', type: 'line', borderColor: fd.sessColors, borderWidth: 2, pointRadius: 4, fill: false }
  ]);

  updateChart('c-aov-ch', RAW.channels, [{ data: fd.chAOVs, backgroundColor: fd.chAOVColors, borderRadius: 6, borderSkipped: false }]);
  updateChart('c-aov-br', RAW.branches, [{ data: fd.branchAOVs, backgroundColor: fd.branchAOVColors, borderRadius: 5, borderSkipped: false }]);

  const loadColors = RAW.hLoad.map((l, i) => {
    const dim = fd.activeHours && !fd.activeHours.includes(RAW.hours[i]) ? 0.2 : 0.85;
    return l >= 80 ? `rgba(124,76,71,${dim})` : l >= 50 ? `rgba(231,186,68,${dim})` : `rgba(65,86,57,${dim})`;
  });

  updateChart('c-load', RAW.hours.map(h => h + ':00'), [{ data: RAW.hLoad, backgroundColor: loadColors, borderRadius: 5, borderSkipped: false }]);

  if (F.branch !== 'all') document.getElementById('monthly-sub').textContent = F.branch + ' monthly revenue trend';
  else document.getElementById('monthly-sub').textContent = 'Apr–Jun actuals + Jul–Sep forecast';
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
  refresh();
}

export function showPage(n) {
  document.querySelectorAll('.page').forEach((p, i) => p.classList.toggle('active', i === n));
  document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', i === n));
  if (n === 1) { drawHeatmap(); window._hmDrawn = true; }
  if (n === 6) renderBranchProfile(currentBranchProfile);
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
  const sunIdx = 6, h10Idx = hrs.indexOf(10);
  if (h10Idx >= 0) {
    ctx.fillStyle = isLight ? '#2B2428' : '#FCF0D0';
    ctx.font = 'bold 8px Poppins,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PEAK', padL + (h10Idx + .5) * cellW, padT + (sunIdx + .5) * cellH + 3);
  }
}

function renderBranchProfile(branch) {
  const bp = BRANCH_PROFILES[branch];
  if (!bp) return;
  const container = document.getElementById('branch-profile-content');
  const offlineRev = (bp.channels['Dine In']?.rev || 0) + (bp.channels['Takeaway']?.rev || 0);
  const onlineRev = (bp.channels['Zomato']?.rev || 0) + (bp.channels['Swiggy']?.rev || 0);
  const totalRev = offlineRev + onlineRev;
  const offPct = totalRev > 0 ? (offlineRev / totalRev * 100).toFixed(1) : 0;
  const onPct = totalRev > 0 ? (onlineRev / totalRev * 100).toFixed(1) : 0;
  const zomato = bp.channels['Zomato'] || { rev: 0, ord: 0, aov: 0 };
  const swiggy = bp.channels['Swiggy'] || { rev: 0, ord: 0, aov: 0 };
  const dinein = bp.channels['Dine In'] || { rev: 0, ord: 0, aov: 0 };
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
    <div class="grid g2">
      <div class="chart-card"><h3>Zomato vs Swiggy</h3><div class="sub">Revenue, Orders &amp; AOV comparison</div>
        <div class="grid g2" style="margin-top:12px;margin-bottom:0;gap:10px">
          <div style="background:rgba(203,32,45,.08);border:1px solid rgba(203,32,45,.2);border-radius:10px;padding:14px">
            <div style="font-size:11px;font-weight:700;color:#cb202d;margin-bottom:8px;font-family:'Poppins',sans-serif">ZOMATO</div>
            <div style="font-size:20px;font-weight:800;color:var(--text);font-family:'Montserrat',sans-serif">${fmt(zomato.rev)}</div>
            <div style="font-size:11px;color:var(--muted);margin-top:4px">${fmtN(zomato.ord)} orders &middot; AOV ₹${zomato.aov}</div>
          </div>
          <div style="background:rgba(252,128,25,.08);border:1px solid rgba(252,128,25,.2);border-radius:10px;padding:14px">
            <div style="font-size:11px;font-weight:700;color:#fc8019;margin-bottom:8px;font-family:'Poppins',sans-serif">SWIGGY</div>
            <div style="font-size:20px;font-weight:800;color:var(--text);font-family:'Montserrat',sans-serif">${fmt(swiggy.rev)}</div>
            <div style="font-size:11px;color:var(--muted);margin-top:4px">${fmtN(swiggy.ord)} orders &middot; AOV ₹${swiggy.aov}</div>
          </div>
        </div>
      </div>
      <div class="chart-card"><h3>Channel AOV Comparison</h3><div class="sub">Average order value by channel</div><div class="cw" style="height:180px"><canvas id="bp-aov"></canvas></div></div>
    </div>
  `;

  ['bp-monthly', 'bp-donut', 'bp-aov'].forEach(id => { if (bpCharts[id]) { bpCharts[id].destroy(); } });
  const xB = { ticks: { color: '#a3979d', font: { size: 10, family: 'Raleway' } }, grid: { color: 'rgba(252,240,208,.06)' } };

  bpCharts['bp-monthly'] = new Chart(document.getElementById('bp-monthly'), {
    type: 'bar',
    data: { labels: ['April', 'May', 'June'], datasets: [{ data: bp.monthly, backgroundColor: ['#E7BA44', '#56754d', '#9c5f59'], borderRadius: 6, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => fmt(ctx.raw) } } }, scales: { x: xB, y: { ticks: { color: '#a3979d', font: { size: 10 }, callback: v => fmt(v) }, grid: { color: 'rgba(252,240,208,.06)' } } } }
  });

  bpCharts['bp-donut'] = new Chart(document.getElementById('bp-donut'), {
    type: 'doughnut',
    data: { labels: ['Offline', 'Online'], datasets: [{ data: [offlineRev, onlineRev], backgroundColor: ['#415639', '#E7BA44'], borderWidth: 0, hoverOffset: 8 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: true, position: 'right', labels: { color: '#FCF0D0', font: { size: 11 }, boxWidth: 10 } }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fmt(ctx.raw)} (${(ctx.raw / totalRev * 100).toFixed(1)}%)` } } } }
  });

  const chLabels = ['Dine In', 'Zomato', 'Swiggy', 'Takeaway'];
  const chAOVs = [dinein.aov, zomato.aov, swiggy.aov, bp.channels['Takeaway']?.aov || 0];

  bpCharts['bp-aov'] = new Chart(document.getElementById('bp-aov'), {
    type: 'bar',
    data: { labels: chLabels, datasets: [{ data: chAOVs, backgroundColor: ['#415639', '#cb202d', '#fc8019', '#a3979d'], borderRadius: 5, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `AOV: ₹${ctx.raw}` } } }, scales: { x: xB, y: { ticks: { color: '#a3979d', font: { size: 10 }, callback: v => '₹' + v }, grid: { color: 'rgba(252,240,208,.06)' }, min: 0 } } }
  });
}

function initCharts() {
  const yRev = { ticks: { color: '#a3979d', font: { size: 10, family: 'Raleway' }, callback: v => fmt(v) }, grid: { color: 'rgba(252,240,208,.06)' } };
  const yOrd = { ticks: { color: '#a3979d', font: { size: 10, family: 'Raleway' } }, grid: { color: 'rgba(252,240,208,.06)' } };
  const xBase = { ticks: { color: '#a3979d', font: { size: 10, family: 'Raleway' } }, grid: { color: 'rgba(252,240,208,.06)' } };
  const xNoGrid = { ticks: { color: '#a3979d', font: { size: 10, family: 'Raleway' } }, grid: { display: false } };

  mkChart('c-monthly', 'bar', [], [{ data: [], label: 'Revenue' }], { scales: { x: xBase, y: yRev } });
  mkChart('c-ch-donut', 'doughnut', [], [{ data: [] }], { plugins: { legend: { display: true, position: 'right', labels: { color: '#FCF0D0', font: { size: 10, family: 'Raleway' }, boxWidth: 10 } }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fmt(ctx.raw)}` } } }, extra: { cutout: '66%' } });
  mkChart('c-br-bar', 'bar', [], [{ data: [] }], { indexAxis: 'y', scales: { x: { ...xBase, ticks: { ...xBase.ticks, callback: v => fmt(v) } }, y: xNoGrid } });
  mkChart('c-dow', 'bar', RAW.days, [{ data: RAW.dRev, backgroundColor: RAW.dRev.map(v => v > 3.5e6 ? '#56754d' : '#E7BA44'), borderRadius: 5, borderSkipped: false, label: 'Revenue' }], { scales: { x: xBase, y: yRev } });
  mkChart('c-session-donut', 'doughnut', [], [{ data: [] }], { plugins: { legend: { display: true, position: 'right', labels: { color: '#FCF0D0', font: { size: 10, family: 'Raleway' }, boxWidth: 10 } }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fmt(ctx.raw)}` } } }, extra: { cutout: '64%' } });
  mkChart('c-top10r', 'bar', RAW.top10Items, [{ data: RAW.top10Rev, backgroundColor: 'rgba(144,122,169,.75)', borderRadius: 4, borderSkipped: false }], { indexAxis: 'y', scales: { x: { ...xBase, ticks: { ...xBase.ticks, callback: v => fmt(v) } }, y: xNoGrid } });

  mkChart('c-daily-rev', 'line', DAILY_REVENUE.map(d => d.date), [
    { label: 'Daily Revenue', data: DAILY_REVENUE.map(d => d.rev), borderColor: '#E7BA44', backgroundColor: 'rgba(231,186,68,.08)', fill: true, tension: .3, borderWidth: 2, pointRadius: 0, pointHoverRadius: 5 },
    { label: '7-Day Moving Avg', data: DAILY_REVENUE.map(d => d.ma), borderColor: '#907aa9', backgroundColor: 'transparent', fill: false, tension: .4, borderWidth: 2, borderDash: [6, 3], pointRadius: 0, pointHoverRadius: 4 }
  ], { scales: { x: { ticks: { color: '#a3979d', font: { size: 9, family: 'Raleway' }, maxTicksLimit: 13 }, grid: { color: 'rgba(252,240,208,.06)' } }, y: yRev }, plugins: { legend: { display: true, position: 'top', labels: { color: '#FCF0D0', font: { size: 10, family: 'Raleway' }, boxWidth: 12 } }, tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fmt(ctx.raw)}` } } } });

  mkChart('c-hr-rev', 'line', [], [{ data: [] }], { scales: { x: xBase, y: yRev } });
  mkChart('c-hr-ord', 'bar', [], [{ data: [] }], { scales: { x: xBase, y: yOrd } });
  mkChart('c-br-trend', 'line', [], [], { scales: { x: xBase, y: yRev }, plugins: { legend: { display: true, position: 'top', labels: { color: '#FCF0D0', font: { size: 9, family: 'Raleway' }, boxWidth: 8, padding: 6 } } } });
  mkChart('c-sess-bar', 'bar', ['Breakfast', 'Lunch', 'Snack', 'Dinner'], [], {
    scales: { x: xBase, y: { ...yRev, title: { display: true, text: 'Revenue', color: '#a3979d', font: { size: 9 } } }, y2: { position: 'right', ticks: { color: '#a3979d', font: { size: 10 } }, grid: { display: false }, title: { display: true, text: 'Orders', color: '#a3979d', font: { size: 9 } } } },
    plugins: { legend: { display: true, position: 'top', labels: { color: '#FCF0D0', font: { size: 9, family: 'Raleway' }, boxWidth: 8, padding: 6 } } }
  });
  mkChart('c-top10r2', 'bar', RAW.top10Items, [{ data: RAW.top10Rev, backgroundColor: 'rgba(65,86,57,.75)', borderRadius: 4, borderSkipped: false }], { indexAxis: 'y', scales: { x: { ...xBase, ticks: { ...xBase.ticks, callback: v => fmt(v) } }, y: xNoGrid } });
  mkChart('c-top10q', 'bar', RAW.top10QtyItems, [{ data: RAW.top10Qty, backgroundColor: 'rgba(231,186,68,.75)', borderRadius: 4, borderSkipped: false }], { indexAxis: 'y', scales: { x: xBase, y: xNoGrid } });

  const meCats = ['Star', 'Plow Horse', 'Puzzle', 'Dog'];
  const meCols = ['rgba(159,199,148,.8)', 'rgba(148,184,227,.8)', 'rgba(231,186,68,.85)', 'rgba(230,140,133,.85)'];
  mkChart('c-me-scatter', 'scatter', [], meCats.map((cat, ci) => ({ label: cat, data: RAW.mePoints.filter(p => p.cat === cat).map(p => ({ x: p.x, y: p.y, item: p.item })), backgroundColor: meCols[ci], pointRadius: 7, pointHoverRadius: 10 })), {
    scales: { x: { title: { display: true, text: 'Qty Sold', color: '#a3979d' }, ticks: { color: '#a3979d', font: { size: 10 } }, grid: { color: 'rgba(252,240,208,.06)' } }, y: { title: { display: true, text: 'Net Revenue', color: '#a3979d' }, ticks: { color: '#a3979d', font: { size: 10 }, callback: v => fmt(v) }, grid: { color: 'rgba(252,240,208,.06)' } } },
    plugins: { legend: { display: true, position: 'top', labels: { color: '#FCF0D0', font: { size: 10 }, boxWidth: 10 } }, tooltip: { callbacks: { label: ctx => `${ctx.raw.item || ''}: qty=${ctx.raw.x}, rev=${fmt(ctx.raw.y)}` } } }
  });

  mkChart('c-grow', 'bar', RAW.growItems, [{ data: RAW.growPct, backgroundColor: 'rgba(65,86,57,.75)', borderRadius: 6, borderSkipped: false, label: 'Growth%' }], { scales: { x: xBase, y: { ticks: { color: '#a3979d', font: { size: 10 }, callback: v => '+' + v + '%' }, grid: { color: 'rgba(252,240,208,.06)' } } } });
  mkChart('c-decl', 'bar', RAW.declItems, [{ data: RAW.declPct, backgroundColor: 'rgba(124,76,71,.75)', borderRadius: 6, borderSkipped: false, label: 'Change%' }], { scales: { x: xBase, y: { ticks: { color: '#a3979d', font: { size: 10 }, callback: v => v + '%' }, grid: { color: 'rgba(252,240,208,.06)' } } } });
  mkChart('c-bill', 'bar', RAW.billBuckets, [{ data: RAW.billCounts, backgroundColor: RAW.billCounts.map(v => v === Math.max(...RAW.billCounts) ? '#E7BA44' : 'rgba(231,186,68,.45)'), borderRadius: 5, borderSkipped: false }], { scales: { x: { ticks: { color: '#a3979d', font: { size: 9 } }, grid: { color: 'rgba(252,240,208,.06)' } }, y: yOrd } });
  mkChart('c-aov-ch', 'bar', [], [{ data: [] }], { scales: { x: xBase, y: { ticks: { color: '#a3979d', font: { size: 10 }, callback: v => '₹' + v }, grid: { color: 'rgba(252,240,208,.06)' }, min: 320 } } });
  mkChart('c-aov-br', 'bar', [], [{ data: [] }], { indexAxis: 'y', scales: { x: { ticks: { color: '#a3979d', font: { size: 10 }, callback: v => '₹' + v }, grid: { color: 'rgba(252,240,208,.06)' }, min: 380 }, y: xNoGrid } });
  mkChart('c-load', 'bar', [], [{ data: [] }], { scales: { x: xBase, y: { ticks: { color: '#a3979d', font: { size: 10 }, callback: v => v + '%' }, grid: { color: 'rgba(252,240,208,.06)' }, max: 110 } } });

  const brLabels = ['Kothrud', 'AUNDH', 'Sal.Vihar', 'Saudagar', 'Wadgaon', 'Wakad', 'Bavdhan'];
  mkChart('c-ch-split', 'bar', brLabels, [
    { label: 'Offline (Dine In+Takeaway)', data: [3225935, 2273786, 1253538, 1360046, 666576, 786010, 275181], backgroundColor: '#415639', borderRadius: 4, borderSkipped: false },
    { label: 'Online (Zomato+Swiggy)', data: [3002840, 1692154, 1437213, 1327177, 1958729, 1380387, 89005], backgroundColor: '#E7BA44', borderRadius: 4, borderSkipped: false }
  ], { indexAxis: 'y', scales: { x: { ticks: { color: '#a3979d', font: { size: 10 }, callback: v => fmt(v) }, grid: { color: 'rgba(252,240,208,.06)' }, stacked: true }, y: { ticks: { color: '#a3979d', font: { size: 10 } }, grid: { display: false }, stacked: true } }, plugins: { legend: { display: true, position: 'top', labels: { color: '#FCF0D0', font: { size: 10 }, boxWidth: 10 } }, tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fmt(ctx.raw)}` } } }, extra: { interaction: { mode: 'index' } } });

  const zsLabels = ['AUNDH', 'Bavdhan', 'Kothrud', 'Sal.Vihar', 'Saudagar', 'Wadgaon', 'Wakad'];
  mkChart('c-zs-bar', 'bar', zsLabels, [
    { label: 'Zomato', data: [943450, 70662, 1815117, 954952, 716312, 1166335, 886947], backgroundColor: '#cb202d', borderRadius: 4, borderSkipped: false },
    { label: 'Swiggy', data: [748705, 18343, 1187723, 482262, 610866, 792394, 493440], backgroundColor: '#fc8019', borderRadius: 4, borderSkipped: false }
  ], { scales: { x: { ticks: { color: '#a3979d', font: { size: 10 } }, grid: { color: 'rgba(252,240,208,.06)' } }, y: { ticks: { color: '#a3979d', font: { size: 10 }, callback: v => fmt(v) }, grid: { color: 'rgba(252,240,208,.06)' } } }, plugins: { legend: { display: true, position: 'top', labels: { color: '#FCF0D0', font: { size: 10 }, boxWidth: 10 } }, tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fmt(ctx.raw)}` } } } });

  mkChart('c-ch-trend', 'line', ['April', 'May', 'June'], [
    { label: 'Dine In', data: [3163618, 3307261, 3222182], borderColor: '#415639', backgroundColor: 'rgba(65,86,57,.08)', fill: true, tension: .3, borderWidth: 2.5, pointRadius: 5 },
    { label: 'Zomato', data: [2139234, 2233700, 2180841], borderColor: '#cb202d', backgroundColor: 'rgba(203,32,45,.06)', fill: true, tension: .3, borderWidth: 2, pointRadius: 4 },
    { label: 'Swiggy', data: [1415008, 1476996, 1440728], borderColor: '#fc8019', backgroundColor: 'rgba(252,128,25,.06)', fill: true, tension: .3, borderWidth: 2, pointRadius: 4 }
  ], { scales: { x: { ticks: { color: '#a3979d', font: { size: 11 } }, grid: { color: 'rgba(252,240,208,.06)' } }, y: { ticks: { color: '#a3979d', font: { size: 10 }, callback: v => fmt(v) }, grid: { color: 'rgba(252,240,208,.06)' } } }, plugins: { legend: { display: true, position: 'top', labels: { color: '#FCF0D0', font: { size: 10 }, boxWidth: 10 } }, tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fmt(ctx.raw)}` } } } });

  mkChart('c-kothrud-share', 'doughnut', ['Kothrud (₹62.3L)', 'Rest of Chain (₹1.45Cr)'], [
    { data: [6228775, 14499803], backgroundColor: ['#56754d', '#E7BA44'], borderWidth: 0 }
  ], { plugins: { legend: { display: true, position: 'right', labels: { color: '#FCF0D0', font: { size: 11 } } } } });

  mkChart('c-kothrud-channel-comp', 'bar', ['Kothrud', 'Aundh', 'Wadgaon Sheri', 'Wakad'], [
    { label: 'Dine-In %', data: [50.3, 56.7, 25.0, 35.9], backgroundColor: '#56754d', borderRadius: 4 },
    { label: 'Delivery %', data: [48.2, 42.7, 74.6, 63.7], backgroundColor: '#E7BA44', borderRadius: 4 }
  ], { scales: { x: xBase, y: { ticks: { color: '#a3979d', callback: v => v + '%' }, grid: { color: 'rgba(252,240,208,.06)' } } } });

  mkChart('c-q1q2-monthly', 'bar', ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], [
    { label: 'Monthly Net Revenue', data: [5542180, 5612400, 6083578, 6762859, 7069957, 6895763], backgroundColor: ['#907aa9', '#907aa9', '#907aa9', '#E7BA44', '#56754d', '#9c5f59'], borderRadius: 5 }
  ], { scales: { x: xBase, y: yRev }, plugins: { legend: { display: false } } });

  mkChart('c-q1q2-branch', 'bar', RAW.branches.filter(b => b !== 'Bavdhan'), [
    { label: 'Q1 Net Revenue', data: [5118196, 3702194, 2365690, 2135474, 2255003, 1661599], backgroundColor: 'rgba(144,122,169,.75)', borderRadius: 4 },
    { label: 'Q2 Net Revenue', data: [6228775, 3965940, 2690751, 2687223, 2625305, 2166397], backgroundColor: '#E7BA44', borderRadius: 4 }
  ], { scales: { x: xBase, y: yRev }, plugins: { legend: { display: true, position: 'top', labels: { color: '#FCF0D0', font: { size: 10 } } } } });
}

export function buildExecutiveReport() {
  const el = document.getElementById('report-content');
  if (!el) return;
  el.innerHTML = `
    <h2 style="font-size:18px;margin-bottom:12px;color:var(--primary)">Q2 2026 Executive Summary & Analysis Report</h2>
    <p style="margin-bottom:14px;line-height:1.6">During Q2 2026 (April 1 – June 30, 2026), Yolkshire generated a total net revenue of <strong>₹2.07 Crore</strong> across <strong>40,193 orders</strong> with an overall Average Order Value (AOV) of <strong>₹516</strong>.</p>
    <h3 style="font-size:14px;margin:16px 0 8px;color:var(--text)">Key Highlights & Branch Performance</h3>
    <ul style="margin-left:20px;margin-bottom:14px;line-height:1.6">
      <li><strong>Kothrud Flagship:</strong> Anchors chain revenue at ₹62.3L (30.1% share) with consistent performance and high Dine-In contribution.</li>
      <li><strong>Aundh & Salunkhe Vihar:</strong> Strong trajectory with growing AOVs (₹515 & ₹556 respectively).</li>
      <li><strong>Wadgaon Sheri Alert:</strong> Decline of -15.3% Apr→Jun due to high online reliance (74.6%) and potential delivery visibility drops.</li>
      <li><strong>Bavdhan Debut:</strong> Launched in June generating ₹3.64L with top-tier AOV of ₹593.</li>
    </ul>
    <h3 style="font-size:14px;margin:16px 0 8px;color:var(--text)">Channel & Operations Analysis</h3>
    <p style="line-height:1.6">Offline Dine In remains the most profitable channel (₹96.9L revenue, ₹590 AOV, 0% platform commission). Delivery platforms (Zomato & Swiggy) account for ₹1.09Cr gross revenue, incurring approximately ₹27.2L in combined quarterly platform fees.</p>
  `;
}

// Window Event Listeners & Global Attachments
window.toggleTheme = toggleTheme;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.showPage = showPage;
window.openModal = openModal;
window.closeModal = closeModal;
window.buildExecutiveReport = buildExecutiveReport;
window.selectBranchProfile = (b) => {
  currentBranchProfile = b;
  document.querySelectorAll('.branch-pill').forEach(p => p.classList.toggle('active', p.textContent === b));
  renderBranchProfile(b);
};

window.addEventListener('resize', () => { if (window._hmDrawn) drawHeatmap(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

window.addEventListener('DOMContentLoaded', () => {
  initCharts();
  refresh();
  renderBranchProfile('Kothrud');
  buildExecutiveReport();
});
