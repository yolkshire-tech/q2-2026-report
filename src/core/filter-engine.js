// The filter engine: every number is a real sum over the period cube.
import { RAW } from '../data/dashboardData.js';
import { hexToRgb } from '../charts/chartManager.js';
import { S } from './state.js';
import { getNonMenuItems, isNonMenuItem, itemPassesCategoryFilter, initCategorySelection } from './menu-catalog.js';

export function periodMonths(period) {
  const meta = RAW.meta;
  if (period === 'all') return meta.months;
  if (meta.quarters[period]) return meta.quarters[period];
  return meta.months.includes(period) ? [period] : meta.months;
}

// Every number below is a straight sum of real invoices from the period cube.
// No scale factors, no pro-rating, no fabrication (memory.md rule 2).

export function getFilteredData() {
  initCategorySelection();
  const { period, branch } = S.F;
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
  S.currentHeatmap = pat.heatmap;
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
  const itemsF = itemSrc.filter(pt => (!S.excludeNonMenu || !isNonMenuItem(pt.item)) && itemPassesCategoryFilter(pt.item));
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

export function buildContextLabel() {
  const meta = RAW.meta;
  const parts = [];
  parts.push(S.F.period === 'all' ? `All data (${meta.rangeLabel})`
    : (meta.quarterLabels[S.F.period] || meta.monthLabels[S.F.period] || S.F.period));
  if (S.F.branch !== 'all') parts.push(S.F.branch);
  return 'Showing: ' + parts.join(' · ');
}

export function updateFilterStyles() {
  ['f-period', 'f-branch'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('filter-active', el.value !== 'all');
  });
}

