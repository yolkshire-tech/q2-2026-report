// Render dispatcher: computes filtered data once, renders the active page only.
import { S } from './core/state.js';
import { getFilteredData, buildContextLabel, updateFilterStyles } from './core/filter-engine.js';
import { renderHome } from './views/home.js';
import { renderOutletCharts, renderOutletTables, renderBranchProfile, renderDualStoreComparison } from './views/outlets.js';
import { renderKothrudCharts, renderKothrudKPIs, renderKothrudTables, renderKothrudGap } from './views/kothrud.js';
import { renderMenuCharts, renderMarketBasketTab, renderComboTracker } from './views/menu.js';
import { updateMoneyKPIs, renderMoneyCharts, renderMoneyTables, renderWhatIfSimulator, recalcFranchiseeModel } from './views/money.js';
import { renderUploadStatus } from './views/data-page.js';

export function refresh() {
  const fd = getFilteredData();
  document.getElementById('filter-ctx').textContent = buildContextLabel();
  updateFilterStyles();
  const active = document.querySelector('.page.active')?.id || 'pg-home';
  if (active === 'pg-home') {
    renderHome();
  } else if (active === 'pg-outlets') {
    renderOutletCharts(fd);
    renderOutletTables(fd);
    renderBranchProfile(S.currentBranchProfile);
    renderDualStoreComparison();
  } else if (active === 'pg-kothrud') {
    renderKothrudCharts(fd);
    renderKothrudKPIs(fd);
    renderKothrudTables(fd);
    renderKothrudGap();
  } else if (active === 'pg-menu-group') {
    renderMenuCharts(fd);
    renderMarketBasketTab();
    renderComboTracker();
  } else if (active === 'pg-money') {
    updateMoneyKPIs(fd);
    renderMoneyCharts(fd);
    renderMoneyTables(fd);
    renderWhatIfSimulator();
    recalcFranchiseeModel();
  } else if (active === 'pg-data') {
    renderUploadStatus();
  }
}

