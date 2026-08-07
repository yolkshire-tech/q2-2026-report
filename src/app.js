// Application entry point: filters, global bindings, listeners, boot.
import './styles/main.css';
import { RAW } from './data/dashboardData.js';
import { TIERED_TARGETS } from './data/targets.js';
import { applyUploads } from './data/ingest.js';
import { CHARTS } from './charts/chartManager.js';
import { S } from './core/state.js';
import { getAllMenuItems, initCategorySelection } from './core/menu-catalog.js';
import { refresh } from './refresh.js';
import { showPage, showSub } from './ui/router.js';
import { initCharts } from './ui/init-charts.js';
import { toggleTheme } from './ui/theme.js';
import { openModal, closeModal, showInfoModal, openCategoryModal, closeCategoryModal, toggleCategoryGroup, selectAllCategories, applyCategoryFilter } from './ui/modals.js';
import { sortTable, exportTableToCSV } from './ui/table-utils.js';
import { drawHeatmap, setDualStoreA, setDualStoreB, swapDualStores, renderBranchProfile, renderDualStoreComparison, selectBranchProfile } from './views/outlets.js';
import { renderMarketBasketTab, filterMBRules, filterModalMenuTable } from './views/menu.js';
import { updateSim, recalcFranchiseeModel } from './views/money.js';
import { handleUploadFiles, clearDeviceUploads, renderUploadStatus } from './views/data-page.js';

export function applyFilters() {
  S.F.period = document.getElementById('f-period').value;
  S.F.branch = document.getElementById('f-branch').value;
  try { localStorage.setItem('yolk.filters', JSON.stringify(S.F)); } catch (e) {}
  refresh();
}

export function resetFilters() {
  S.F = { period: 'all', branch: 'all' };
  ['f-period', 'f-branch'].forEach(id => { const el = document.getElementById(id); if (el) el.value = 'all'; });
  S.excludeNonMenu = false;
  const btn = document.getElementById('btn-exclude-nonmenu');
  if (btn) btn.textContent = '💧 Exclude Water/Misc (OFF)';
  S.activeCategorySelection = new Set(getAllMenuItems());
  try { localStorage.setItem('yolk.filters', JSON.stringify(S.F)); } catch (e) {}
  refresh();
}

export function toggleNonMenuFilter() {
  S.excludeNonMenu = !S.excludeNonMenu;
  const btn = document.getElementById('btn-exclude-nonmenu');
  if (btn) {
    btn.textContent = S.excludeNonMenu ? '💧 Exclude Water/Misc (ON)' : '💧 Exclude Water/Misc (OFF)';
    btn.style.background = S.excludeNonMenu ? 'var(--primary)' : 'var(--bg2)';
    btn.style.color = S.excludeNonMenu ? 'var(--bg)' : 'var(--text)';
    btn.style.borderColor = S.excludeNonMenu ? 'var(--primary)' : 'var(--border)';
  }
  refresh();
}

// ── Global bindings (inline onclick handlers in index.html) ──────────────────
Object.assign(window, {
  showPage, showSub, refresh, applyFilters, resetFilters, toggleNonMenuFilter,
  toggleTheme, openModal, closeModal, showInfoModal,
  openCategoryModal, closeCategoryModal, toggleCategoryGroup, selectAllCategories, applyCategoryFilter,
  sortTable, exportTableToCSV, updateSim,
  setDualStoreA, setDualStoreB, swapDualStores, selectBranchProfile,
  renderMarketBasketTab, filterMBRules, filterModalMenuTable,
  handleUploadFiles, clearDeviceUploads, recalcFranchiseeModel,
});

// Diagnostics hook for DevTools / automated tests.
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
  S.baseMonths = RAW.meta.months.slice();
  S.uploadInfo = applyUploads(RAW);
  S.uploadInfo.applied.forEach(mk => {
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
    if (saved.period && (saved.period === 'all' || meta.quarters[saved.period] || meta.months.includes(saved.period))) S.F.period = saved.period;
    if (saved.branch && (saved.branch === 'all' || RAW.branches.includes(saved.branch))) S.F.branch = saved.branch;
  } catch (e) {}
  if (periodSel) periodSel.value = S.F.period;
  if (branchSel) branchSel.value = S.F.branch;

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

