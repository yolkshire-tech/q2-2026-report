// HOME: tiered target board, computed alerts, daily trend.
import { RAW } from '../data/dashboardData.js';
import { TIERED_TARGETS, UNTARGETED_POS_BRANCHES } from '../data/targets.js';
import { CHARTS, fmt, mkChart } from '../charts/chartManager.js';
import { latestMonths, MONTH_TREND, achievedTier } from '../core/metrics.js';

export function renderHome() {
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

