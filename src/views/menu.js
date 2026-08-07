// MENU: engineering charts, market basket, combo tracker, catalog modal.
import { RAW } from '../data/dashboardData.js';
import { CHARTS, fmt, updateChart } from '../charts/chartManager.js';
import { S } from '../core/state.js';
import { getFilteredData } from '../core/filter-engine.js';
import { isNonMenuItem, itemPassesCategoryFilter } from '../core/menu-catalog.js';
import { matchCombo } from '../data/combos.js';

export function renderMenuCharts(fd) {
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

export function renderComboTracker() {
  const el = document.getElementById('combo-tracker');
  if (!el) return;
  const items = S.uploadInfo.items;
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
    if (S.excludeNonMenu && isNon) return;
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

