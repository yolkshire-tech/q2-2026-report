// DATA: upload zone for POS exports, device-upload status.
import { RAW } from '../data/dashboardData.js';
import { fmt } from '../charts/chartManager.js';
import { S } from '../core/state.js';
import { parseCSV, detectKind, processTransactions, processItems, loadUploads, saveUploads, clearUploads } from '../data/ingest.js';

export function renderUploadStatus() {
  const el = document.getElementById('upload-status');
  if (!el) return;
  const u = loadUploads();
  const parts = [];
  Object.values(u.months || {}).forEach(M => parts.push(`${M.label}: ${M.invoices.toLocaleString()} invoices, ${fmt(M.net)}${M.partial ? ` (partial, ${M.days} days)` : ''}`));
  if (u.items) parts.push(`Item export “${u.items.label}”: ${u.items.list.length} items, ${fmt(u.items.totalRev)}`);
  el.innerHTML = parts.length ? '<strong>Active on this device:</strong> ' + parts.join(' · ') : 'No device uploads active. Committed pipeline data only.';
}

export async function handleUploadFiles(files) {
  if (!files || !files.length) return;
  const resEl = document.getElementById('upload-result');
  const u = loadUploads();
  u.months = u.months || {};
  const lines = [];
  let changed = false;
  for (const f of files) {
    try {
      const text = await f.text();
      const rows = parseCSV(text);
      const kind = detectKind(rows);
      if (kind === 'transactions') {
        const { months, warnings } = processTransactions(rows, RAW.branches);
        if (!months.length) { lines.push(`❌ <strong>${f.name}</strong>: no valid sale invoices found.`); continue; }
        months.forEach(M => {
          if (S.baseMonths.includes(M.key)) {
            lines.push(`⚠️ <strong>${f.name}</strong>: ${M.label} is already in the committed dataset — skipped. Re-run the pipeline to update committed months.`);
          } else {
            u.months[M.key] = M;
            changed = true;
            lines.push(`✅ <strong>${f.name}</strong>: ${M.label}${M.partial ? ` (partial — ${M.days}/${M.calendarDays} days)` : ''} · ${M.invoices.toLocaleString()} invoices · ${fmt(M.net)} net sales.`);
          }
        });
        if (warnings.unknownBranches.length) lines.push(`⚠️ Skipped rows from unknown outlets: ${warnings.unknownBranches.join(', ')} (add them to the pipeline first).`);
        if (warnings.unknownChannels.length) lines.push(`⚠️ Skipped rows with unknown channels: ${warnings.unknownChannels.join(', ')}.`);
        if (warnings.zeroNet) lines.push(`ℹ️ ${warnings.zeroNet} zero-net comped invoices excluded (canonical rule).`);
      } else if (kind === 'items') {
        const res = processItems(rows);
        u.items = { label: f.name.replace(/\.csv$/i, ''), savedAt: new Date().toISOString(), list: res.list, totalRev: res.totalRev, totalQty: res.totalQty };
        changed = true;
        lines.push(`✅ <strong>${f.name}</strong>: item export · ${res.list.length} items · ${fmt(res.totalRev)} — powers the Combo Tracker.`);
      } else {
        lines.push(`❌ <strong>${f.name}</strong>: columns not recognized — expected a POS “Sale Transactions” or “Sales By Items” export.`);
      }
    } catch (err) {
      lines.push(`❌ <strong>${f.name}</strong>: ${err.message}`);
    }
  }
  if (changed) {
    saveUploads(u);
    lines.push(`<button class="filter-reset" onclick="location.reload()">↻ Apply now (reloads the app)</button>`);
  }
  if (resEl) resEl.innerHTML = lines.map(l => `<div class="home-alert sev-info"><div style="width:100%">${l}</div></div>`).join('');
  renderUploadStatus();
}
export function clearDeviceUploads() { clearUploads(); location.reload(); };

// Only the active page renders — every navigation triggers a refresh, so
// nothing goes stale, and filter changes stop re-drawing 35 hidden charts.

