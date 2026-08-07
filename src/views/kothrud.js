// KOTHRUD GAP: replicable-driver board, playbook charts and matrix.
import { RAW } from '../data/dashboardData.js';
import { CHARTS, fmt, updateChart } from '../charts/chartManager.js';
import { MONTH_TREND } from '../core/metrics.js';

export function renderKothrudKPIs(fd) {
  const setEl = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  setEl('k-kothrud-rev', fmt(fd.branchRevs[RAW.branches.indexOf('Kothrud')]));
  const kbr = RAW.branch.Kothrud;
  setEl('k-kothrud-dinein', ((kbr.ch['Dine In']?.rev || 0) / kbr.rev * 100).toFixed(1) + '%');
  setEl('k-kothrud-bev', 'N/A');
  setEl('k-kothrud-aov', kbr.ch['Dine In']?.aov ? '₹' + kbr.ch['Dine In'].aov : 'N/A');
}

export function renderKothrudCharts(fd) {
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

export function renderKothrudTables(fd) {
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

export function renderKothrudGap() {
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

