// Hash-routed navigation between pages and sub-views.
import { CHARTS } from '../charts/chartManager.js';
import { S } from '../core/state.js';
import { refresh } from '../refresh.js';
import { drawHeatmap, renderDualStoreComparison, renderBranchProfile } from '../views/outlets.js';
import { renderMarketBasketTab } from '../views/menu.js';
import { recalcFranchiseeModel } from '../views/money.js';
import { renderHome } from '../views/home.js';
import { renderKothrudGap } from '../views/kothrud.js';

export function showPage(param) {
  try {
    const pages = Array.from(document.querySelectorAll('.page'));
    const tabs = Array.from(document.querySelectorAll('.tab'));

    // Resolve the target page by id (numeric args are legacy: treated as page index).
    let targetId = null;
    if (typeof param === 'number' && pages[param]) {
      targetId = pages[param].id;
    } else if (typeof param === 'string') {
      targetId = param;
    }

    let targetIndex = pages.findIndex(p => p.id === targetId);
    if (targetIndex < 0) {
      console.error(`showPage: no page with id "${targetId}" — falling back to first page`);
      targetIndex = 0;
    }
    const activeId = pages[targetIndex].id;

    pages.forEach((p, i) => p.classList.toggle('active', i === targetIndex));
    // Tabs and pages are not index-aligned; match each tab by the id in its onclick.
    tabs.forEach(t => {
      const oc = t.getAttribute('onclick') || '';
      t.classList.toggle('active', oc.includes(`'${activeId}'`));
    });

    try { history.replaceState(null, '', '#' + activeId); } catch (e) {}
    refresh();

    requestAnimationFrame(() => {
      Object.values(CHARTS).forEach(c => {
        try {
          if (c && typeof c.resize === 'function') c.resize();
        } catch (e) {}
      });

      if (activeId === 'pg-home') renderHome();
      if (activeId === 'pg-kothrud') renderKothrudGap();
      // Group pages: re-render whichever subpage is currently active.
      const activeSub = pages[targetIndex].querySelector('.subpage.active');
      if (activeSub) renderSubContent(activeSub.id);
    });
  } catch (err) {
    console.error('Error in showPage navigation:', err);
  }
}

export function showSub(groupId, subId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.subpage').forEach(s => s.classList.toggle('active', s.id === subId));
  group.querySelectorAll('.subpill').forEach(p => {
    const oc = p.getAttribute('onclick') || '';
    p.classList.toggle('active', oc.includes(`'${subId}'`));
  });
  try { history.replaceState(null, '', '#' + groupId + '/' + subId); } catch (e) {}
  requestAnimationFrame(() => {
    Object.values(CHARTS).forEach(c => { try { c && c.resize && c.resize(); } catch (e) {} });
    renderSubContent(subId);
  });
}

export function renderSubContent(subId) {
  if (subId === 'pg-sales') drawHeatmap();
  if (subId === 'pg-operations') renderMarketBasketTab();
  if (subId === 'pg-comparison') renderDualStoreComparison();
  if (subId === 'pg-franchisee') recalcFranchiseeModel();
  if (subId === 'pg-branches') renderBranchProfile(S.currentBranchProfile);
}

// ── HOME: tiered target board, alerts, daily trend ───────────────────────────

