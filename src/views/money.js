// MONEY: P&L, incentive tiers, real EBITDA, what-if, ₹2L franchisee model.
import { RAW } from '../data/dashboardData.js';
import { TIERED_TARGETS } from '../data/targets.js';
import { CHARTS, fmt, fmtN, updateChart } from '../charts/chartManager.js';
import { S } from '../core/state.js';
import { getFilteredData } from '../core/filter-engine.js';
import { achievedTier } from '../core/metrics.js';

export function updateMoneyKPIs(fd) {
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

export function renderMoneyCharts(fd) {
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
      ebTbl.innerHTML = `<tr><td style="color:var(--muted);font-size:12px;padding:14px">Awaiting monthly cost actuals from accounts. Fill <strong>pipeline/cost_actuals_template.csv</strong> (one row per outlet per month, POS branch names, months as jan…dec), drop the file in <strong>data/cost-actuals/</strong>, and re-run the pipeline — this table then shows each outlet's real EBITDA vs the ₹2L/month goal.</td></tr>`;
    } else {
      let html = `<tr><th>Outlet</th><th>Period Net Sales</th><th>Rent</th><th>Payroll</th><th>Purchases</th><th>Other</th><th>Real EBITDA</th><th>Margin</th><th>vs ₹2L/mo goal</th></tr>`;
      RAW.branches.forEach(b => {
        if (S.F.branch !== 'all' && b !== S.F.branch) return;
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

export function renderMoneyTables(fd) {
// Page 12: PnL Branch Statement Table
  const pnlTbl = document.getElementById('tbl-pnl-statement');
  if (pnlTbl) {
    let html = `
      <tr>
        <th onclick="sortTable('tbl-pnl-statement',0)">Branch</th><th onclick="sortTable('tbl-pnl-statement',1)">Target</th><th onclick="sortTable('tbl-pnl-statement',2)">Actual Rev</th><th onclick="sortTable('tbl-pnl-statement',3)">Variance</th><th onclick="sortTable('tbl-pnl-statement',4)">COGS (30%)</th><th onclick="sortTable('tbl-pnl-statement',5)">Labor (18%)</th><th onclick="sortTable('tbl-pnl-statement',6)">Rent (15%)</th><th onclick="sortTable('tbl-pnl-statement',7)">Commissions</th><th onclick="sortTable('tbl-pnl-statement',8)">Ops (5%)</th><th onclick="sortTable('tbl-pnl-statement',9)">Net EBITDA Profit</th><th onclick="sortTable('tbl-pnl-statement',10)">EBITDA Margin</th>
      </tr>
    `;

    RAW.branches.forEach(b => {
      if (S.F.branch !== 'all' && b !== S.F.branch) return;
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

export function updateSim(key, val) {
  S.simState[key] = parseFloat(val);
  renderWhatIfSimulator();
}

export function renderWhatIfSimulator() {
  const fd = getFilteredData();
  const baseRev = fd.rev;
  const priceMult = 1 + (S.simState.priceAdj / 100);
  const bevUpliftVal = Math.round(baseRev * (S.simState.bevAttachUplift / 100) * 0.15);
  const simRev = Math.round((baseRev + bevUpliftVal) * priceMult);

  const simCogs = Math.round(simRev * (S.simState.cogsPct / 100));
  const simLabor = Math.round(simRev * 0.18);
  const simRent = Math.round(simRev * 0.15);
  const delShare = fd.deliveryShare ?? 0.5253;
  const simComm = Math.round(simRev * delShare * (S.simState.commRate / 100));
  const simOps = Math.round(simRev * 0.05);

  const simTotalOpEx = simCogs + simLabor + simRent + simComm + simOps;
  const simNetProfit = simRev - simTotalOpEx;
  const simMargin = simRev > 0 ? ((simNetProfit / simRev) * 100).toFixed(1) : '0.0';
  const profitDiff = simNetProfit - fd.netProfit;

  const setEl = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  setEl('sim-val-cogs', S.simState.cogsPct.toFixed(1) + '%');
  setEl('sim-val-bev', '+' + S.simState.bevAttachUplift + '%');
  setEl('sim-val-comm', S.simState.commRate.toFixed(1) + '%');
  setEl('sim-val-price', (S.simState.priceAdj >= 0 ? '+' : '') + S.simState.priceAdj + '%');

  setEl('sim-res-rev', fmt(simRev));
  setEl('sim-res-opex', fmt(simTotalOpEx));
  setEl('sim-res-profit', fmt(simNetProfit));
  setEl('sim-res-margin', simMargin + '%');
  setEl('sim-res-diff', (profitDiff >= 0 ? '+' : '') + fmt(profitDiff) + ' vs baseline');
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

