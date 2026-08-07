import Chart from 'chart.js/auto';
import { CHARTS, fmt } from '../charts/chartManager.js';
import { S } from '../core/state.js';
import { MENU_CATEGORIES, getAllMenuItems } from '../core/menu-catalog.js';
import { buildMenuCatalogModalHtml } from '../views/menu.js';
import { refresh } from '../refresh.js';

export function openModal(title, chartId) {
  document.getElementById('modal-title').textContent = title;
  const overlay = document.getElementById('modal-overlay');
  const chartWrap = document.getElementById('modal-chart-wrap');
  const tableWrap = document.getElementById('modal-table-wrap');
  tableWrap.innerHTML = '';
  chartWrap.style.display = 'none';

  if (S.modalChart) {
    S.modalChart.destroy();
    S.modalChart = null;
  }

  if (chartId && CHARTS[chartId]) {
    chartWrap.style.display = 'block';
    const origChart = CHARTS[chartId];
    S.modalChart = new Chart(document.getElementById('modal-canvas'), {
      type: origChart.config.type,
      data: JSON.parse(JSON.stringify(origChart.data)),
      options: {
        ...JSON.parse(JSON.stringify(origChart.options)),
        responsive: true,
        maintainAspectRatio: false
      }
    });
    tableWrap.innerHTML = buildChartTable(origChart, chartId);
  }
  overlay.classList.add('open');
}

export function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  if (S.modalChart) {
    S.modalChart.destroy();
    S.modalChart = null;
  }
}

export function showInfoModal(title, hintText) {
  document.getElementById('modal-title').textContent = '💡 How to Read: ' + title;
  const overlay = document.getElementById('modal-overlay');
  const chartWrap = document.getElementById('modal-chart-wrap');
  const tableWrap = document.getElementById('modal-table-wrap');
  chartWrap.style.display = 'none';

  if (S.modalChart) {
    S.modalChart.destroy();
    S.modalChart = null;
  }

  tableWrap.innerHTML = `
    <div style="background:var(--bg3);padding:18px;border-radius:12px;border-left:4px solid var(--primary);line-height:1.6">
      <h4 style="font-size:14px;color:var(--primary);margin-bottom:8px">Executive Insights & Layman's Guide</h4>
      <p style="font-size:13px;color:var(--text);margin-bottom:12px">${hintText}</p>
      <div style="font-size:11px;color:var(--muted);border-top:1px solid var(--border);padding-top:8px">
        <strong>💡 Key Takeaway for Decision Making:</strong> Use this metric to determine whether sales growth is coming from higher volume, menu pricing power, or specific operational channels.
      </div>
    </div>
  `;
  overlay.classList.add('open');
}

export function buildChartTable(chart, chartId) {
  if (chartId && (chartId.startsWith('c-top') || chartId.startsWith('c-me') || chartId.startsWith('c-grow') || chartId.startsWith('c-decl') || chartId.startsWith('c-menu'))) {
    return buildMenuCatalogModalHtml();
  }

  if (!chart || !chart.data) return '';
  const labels = chart.data.labels || [];
  const datasets = chart.data.datasets || [];
  let html = '<table class="tbl"><tr><th>Label</th>';
  datasets.forEach(ds => { html += `<th>${ds.label || 'Value'}</th>`; });
  html += '</tr>';
  labels.forEach((lbl, ri) => {
    html += `<tr><td>${lbl}</td>`;
    datasets.forEach(ds => {
      const v = ds.data[ri];
      const numV = typeof v === 'object' && v !== null ? (v.y || v.x || 0) : v;
      html += `<td>${typeof numV === 'number' && numV > 999 ? fmt(numV) : numV}</td>`;
    });
    html += '</tr>';
  });
  return html + '</table>';
}

export function openCategoryModal() {
  initCategorySelection();
  const overlay = document.getElementById('category-modal-overlay');
  const container = document.getElementById('category-modal-list');
  if (!container) return;

  container.innerHTML = '';
  Object.keys(MENU_CATEGORIES).forEach(cat => {
    let catHtml = `
      <div style="background:var(--bg3);padding:12px 16px;border-radius:8px;border:1px solid var(--border)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <label style="font-weight:700;font-size:13px;color:var(--primary);cursor:pointer">
            <input type="checkbox" checked onchange="toggleCategoryGroup('${cat}', this.checked)" /> 📂 ${cat}
          </label>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:6px;padding-left:18px">
    `;
    MENU_CATEGORIES[cat].forEach(item => {
      const isChecked = S.activeCategorySelection.has(item);
      catHtml += `
        <label style="font-size:11px;color:var(--text);cursor:pointer;display:flex;align-items:center;gap:6px">
          <input type="checkbox" class="cat-item-cb" data-cat="${cat}" data-item="${item}" ${isChecked ? 'checked' : ''} /> ${item}
        </label>
      `;
    });
    catHtml += `</div></div>`;
    container.innerHTML += catHtml;
  });

  if (overlay) overlay.classList.add('open');
}

export function closeCategoryModal() {
  const overlay = document.getElementById('category-modal-overlay');
  if (overlay) overlay.classList.remove('open');
}

export function toggleCategoryGroup(cat, isChecked) {
  document.querySelectorAll(`.cat-item-cb[data-cat="${cat}"]`).forEach(cb => { cb.checked = isChecked; });
}

export function selectAllCategories(isChecked) {
  document.querySelectorAll('.cat-item-cb').forEach(cb => { cb.checked = isChecked; });
}

export function applyCategoryFilter() {
  const selected = new Set();
  document.querySelectorAll('.cat-item-cb:checked').forEach(cb => selected.add(cb.getAttribute('data-item')));
  S.activeCategorySelection = selected;
  alert(`🍕 Category & Item Filter Applied!\n\n${selected.size} items active for analysis across all tabs.`);
  closeCategoryModal();
  refresh();
}

