// Creates all chart shells once at boot (data arrives via updateChart).
import { RAW } from '../data/dashboardData.js';
import { fmt, mkChart } from '../charts/chartManager.js';

export function initCharts() {
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

