// OUTLETS: profiles, store comparison, trends/patterns, channels, kitchen.
import Chart from 'chart.js/auto';
import { RAW, BRANCH_PROFILES } from '../data/dashboardData.js';
import { CHARTS, fmt, fmtN, hexToRgb, mkChart, updateChart } from '../charts/chartManager.js';
import { S } from '../core/state.js';
import { getFilteredData } from '../core/filter-engine.js';

export function renderOutletCharts(fd) {
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

  const branchKeys = S.F.branch !== 'all' ? [S.F.branch] : RAW.branches.filter(b => b !== 'Bavdhan');
  const brTrendDs = branchKeys.map(b => {
    const ci = RAW.branches.indexOf(b);
    return { label: b, data: fd.branchMonthly[b], borderColor: RAW.branchColors[ci], backgroundColor: 'transparent', tension: .3, borderWidth: S.F.branch !== 'all' ? 2 : 1.5, pointRadius: 4 };
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

export function renderOutletTables(fd) {
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
      if (S.F.branch !== 'all' && b !== S.F.branch) return;
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
      if (S.F.branch !== 'all' && b !== S.F.branch) return;
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
      if (S.F.branch !== 'all' && b !== S.F.branch) return;
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

export function drawHeatmap() {
  const canvas = document.getElementById('c-heatmap');
  if (!canvas) return;
  window._hmDrawn = true;
  const W = canvas.offsetWidth || 960, H = 220;

  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hrs = RAW.hours; const data = S.currentHeatmap || RAW.heatmap;
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

export function renderBranchProfile(branch) {
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

  ['bp-monthly', 'bp-donut'].forEach(id => { if (S.bpCharts[id]) { S.bpCharts[id].destroy(); } });
  const xB = { ticks: { color: '#a3979d', font: { size: 10, family: 'Raleway' } }, grid: { color: 'rgba(252,240,208,.06)' } };

  const canvasM = document.getElementById('bp-monthly');
  if (canvasM) {
    S.bpCharts['bp-monthly'] = new Chart(canvasM, {
      type: 'bar',
      data: { labels: ['April', 'May', 'June'], datasets: [{ data: bp.monthly, backgroundColor: ['#E7BA44', '#56754d', '#9c5f59'], borderRadius: 6, borderSkipped: false }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: xB, y: { ticks: { color: '#a3979d', callback: v => fmt(v) }, grid: { color: 'rgba(252,240,208,.06)' } } } }
    });
  }

  const canvasD = document.getElementById('bp-donut');
  if (canvasD) {
    S.bpCharts['bp-donut'] = new Chart(canvasD, {
      type: 'doughnut',
      data: { labels: ['Offline', 'Online'], datasets: [{ data: [offlineRev, onlineRev], backgroundColor: ['#415639', '#E7BA44'], borderWidth: 0, hoverOffset: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: true, position: 'right', labels: { color: '#FCF0D0', font: { size: 11 } } } } }
    });
  }
}

export function setDualStoreA(b) {
  S.dualStoreA = b;
  renderDualStoreComparison();
}

export function setDualStoreB(b) {
  S.dualStoreB = b;
  renderDualStoreComparison();
}

export function swapDualStores() {
  const temp = S.dualStoreA;
  S.dualStoreA = S.dualStoreB;
  S.dualStoreB = temp;
  renderDualStoreComparison();
}

export function renderDualStoreComparison() {
  const pA = BRANCH_PROFILES[S.dualStoreA] || RAW.branch[S.dualStoreA];
  const pB = BRANCH_PROFILES[S.dualStoreB] || RAW.branch[S.dualStoreB];
  const bdA = RAW.branch[S.dualStoreA];
  const bdB = RAW.branch[S.dualStoreB];

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
  if (selA) selA.value = S.dualStoreA;
  if (selB) selB.value = S.dualStoreB;

  const setEl = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  setEl('kpi-comp-revdiff', (revDiff >= 0 ? '+' : '') + fmt(revDiff));
  setEl('kpi-comp-storesub', `${S.dualStoreA} vs ${S.dualStoreB}`);
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
          <th onclick="sortTable('tbl-comp-diagnostic',1)">${S.dualStoreA} (Store A)</th>
          <th onclick="sortTable('tbl-comp-diagnostic',2)">${S.dualStoreB} (Store B)</th>
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
          <td>${revA > revB ? `${S.dualStoreA} leads chain sales by ${((revA/(revB||1)-1)*100).toFixed(1)}%` : `${S.dualStoreB} outperforms ${S.dualStoreA}`}</td>
        </tr>
        <tr>
          <td><strong>Dine-In Preference %</strong></td>
          <td style="font-weight:700;color:var(--green)">${dinePctA}%</td>
          <td>${dinePctB}%</td>
          <td class="${parseFloat(dinePctA) >= parseFloat(dinePctB) ? 'trend-up' : 'trend-dn'}">${(parseFloat(dinePctA) - parseFloat(dinePctB)).toFixed(1)}% gap</td>
          <td>${parseFloat(dinePctA) > parseFloat(dinePctB) ? `${S.dualStoreA} retains more non-commissioned revenue` : `${S.dualStoreB} has higher Dine-In foot traffic`}</td>
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
          <td>${bdA.aov >= bdB.aov ? `${S.dualStoreA} captures higher spend per table` : `${S.dualStoreB} higher ticket size per table`}</td>
        </tr>
        <tr>
          <td><strong>Delivery Platform Fee Drain</strong></td>
          <td style="color:#e68c85">~${fmt(Math.round(onA * 0.25))}</td>
          <td style="color:#e68c85">~${fmt(Math.round(onB * 0.25))}</td>
          <td>&mdash;</td>
          <td>${onA > onB ? `${S.dualStoreA} loses more revenue to commissions` : `${S.dualStoreB} heavily delivery dependent`}</td>
        </tr>
      </tbody>
    `;
  }

  updateChart('c-comp-monthly', ['April', 'May', 'June'], [
    { label: S.dualStoreA, data: [Math.round((bdA.apr || 0) * scale), Math.round((bdA.may || 0) * scale), Math.round((bdA.jun || 0) * scale)], backgroundColor: '#E7BA44', borderRadius: 4 },
    { label: S.dualStoreB, data: [Math.round((bdB.apr || 0) * scale), Math.round((bdB.may || 0) * scale), Math.round((bdB.jun || 0) * scale)], backgroundColor: '#5985b9', borderRadius: 4 }
  ]);

  updateChart('c-comp-channels', ['Dine In', 'Zomato', 'Swiggy', 'Takeaway'], [
    { label: S.dualStoreA, data: ['Dine In', 'Zomato', 'Swiggy', 'Takeaway'].map(c => Math.round((bdA.ch[c]?.rev || 0) * scale)), backgroundColor: '#415639', borderRadius: 4 },
    { label: S.dualStoreB, data: ['Dine In', 'Zomato', 'Swiggy', 'Takeaway'].map(c => Math.round((bdB.ch[c]?.rev || 0) * scale)), backgroundColor: '#907aa9', borderRadius: 4 }
  ]);

  updateChart('c-comp-hourly', RAW.hours.map(h => h + ':00'), [
    { label: S.dualStoreA, data: (RAW.branchPatterns[S.dualStoreA] || RAW.branchPatterns.all).hRev, borderColor: '#E7BA44', backgroundColor: 'transparent', borderWidth: 2, tension: 0.3 },
    { label: S.dualStoreB, data: (RAW.branchPatterns[S.dualStoreB] || RAW.branchPatterns.all).hRev, borderColor: '#5985b9', backgroundColor: 'transparent', borderWidth: 2, tension: 0.3 }
  ]);

  updateChart('c-comp-session', ['Breakfast', 'Lunch', 'Snack', 'Dinner'], [
    { label: S.dualStoreA, data: [0.273, 0.303, 0.093, 0.331].map(f => Math.round(revA * f)), backgroundColor: '#E7BA44', borderRadius: 4 },
    { label: S.dualStoreB, data: [0.273, 0.303, 0.093, 0.331].map(f => Math.round(revB * f)), backgroundColor: '#5985b9', borderRadius: 4 }
  ]);

  updateChart('c-comp-cat', ['Rice Bowls', 'Omelettes', 'Coffee', 'Sandwiches'], [
    { label: S.dualStoreA, data: [Math.round(revA * 0.35), Math.round(revA * 0.25), Math.round(revA * 0.20), Math.round(revA * 0.20)], backgroundColor: '#415639', borderRadius: 4 },
    { label: S.dualStoreB, data: [Math.round(revB * 0.35), Math.round(revB * 0.25), Math.round(revB * 0.20), Math.round(revB * 0.20)], backgroundColor: '#907aa9', borderRadius: 4 }
  ]);
}

export function selectBranchProfile(b) {
  S.currentBranchProfile = b;
  document.querySelectorAll('.branch-pill').forEach(p => p.classList.toggle('active', p.textContent === b));
  renderBranchProfile(b);
};

// Diagnostics hook: lets DevTools / automated tests inspect chart instances.

