// In-browser POS export ingestion — the same cleaning rules as
// pipeline/build_data.py, so numbers reconcile whichever path loads them.
//
// Two file kinds are recognized by their columns:
//   - Sale Transactions export  -> monthly aggregates merged into RAW.cube/meta
//   - Sales By Items export     -> item aggregates (drives the Combo Tracker)
//
// Only NEW months can be added from the browser; months already shipped in the
// committed dataset are canonical and skipped (re-run the pipeline for those).
// Uploaded aggregates persist in localStorage per device.

const STORE_KEY = 'yolk.uploads.v1';

const EXCLUDE_BRANCHES = new Set(['Central Kitchen', 'FC ROAD', 'Head Office']);
const CHANNEL_MAP = { 'Dotpe Takeaway': 'Takeaway', 'DotPe': 'Takeaway' };
const CHANNELS = ['Dine In', 'Zomato', 'Swiggy', 'Takeaway'];
const SESS = ['breakfast', 'lunch', 'snack', 'dinner'];
const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CAL_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function hourToSession(h) {
  if (h >= 7 && h <= 10) return 'breakfast';
  if (h >= 11 && h <= 14) return 'lunch';
  if (h >= 15 && h <= 17) return 'snack';
  if (h >= 18 && h <= 23) return 'dinner';
  return 'other';
}

// Minimal RFC-4180-ish CSV parser (quotes, embedded commas/newlines).
export function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const header = rows[0].map(h => h.replace(/^﻿/, '').trim());
  return rows.slice(1).map(r => {
    const o = {};
    header.forEach((h, i) => { o[h] = r[i] !== undefined ? r[i] : ''; });
    return o;
  });
}

export function detectKind(rows) {
  if (!rows.length) return null;
  const cols = Object.keys(rows[0]);
  if (cols.includes('Invoice Number') && cols.includes('Business Date')) return 'transactions';
  if (cols.includes('Item Name') && cols.includes('Quantity')) return 'items';
  return null;
}

// ── Transactions → per-month aggregates (cube-entry shape) ───────────────────
export function processTransactions(rows, knownBranches) {
  const warnings = { unknownBranches: new Set(), unknownChannels: new Set(), otherBrand: 0, zeroNet: 0, badRows: 0 };
  const monthsOut = {};

  rows.forEach(r => {
    if ((r['Business Brand'] || 'Yolkshire') !== 'Yolkshire') { warnings.otherBrand++; return; }
    if (r['Invoice Type'] !== 'Sale') return;
    const b = r['Branch Name'];
    if (EXCLUDE_BRANCHES.has(b)) return;
    if (!knownBranches.includes(b)) { warnings.unknownBranches.add(b); return; }
    const net = parseFloat(String(r['Net Amount']).replace(/,/g, '')) || 0;
    if (net === 0) { warnings.zeroNet++; return; }
    const dateStr = r['Business Date'];
    const d = new Date(dateStr);
    if (isNaN(d)) { warnings.badRows++; return; }
    const mIdx = d.getMonth(), year = d.getFullYear(), day = d.getDate();
    const key = MONTH_KEYS[mIdx];
    let ch = r['Channel'] || 'Dine In';
    ch = CHANNEL_MAP[ch] || ch;
    if (!CHANNELS.includes(ch)) { warnings.unknownChannels.add(ch); return; }
    const inv = new Date(r['Invoice Date'] || dateStr);
    const hour = isNaN(inv) ? 12 : inv.getHours();
    const sess = hourToSession(hour);

    if (!monthsOut[key]) {
      monthsOut[key] = {
        key, year, monthIdx: mIdx,
        label: `${MONTH_NAMES[mIdx]} ${year}`,
        calendarDays: CAL_DAYS[mIdx] + (mIdx === 1 && year % 4 === 0 ? 1 : 0),
        invoices: 0, net: 0, daysSeen: new Set(),
        br: {}, daily: {},
      };
      knownBranches.forEach(kb => {
        monthsOut[key].br[kb] = {
          rev: 0, ord: 0,
          ch: Object.fromEntries(CHANNELS.map(c => [c, { rev: 0, ord: 0 }])),
          sess: Object.fromEntries(SESS.map(s => [s, { rev: 0, ord: 0 }])),
        };
      });
    }
    const M = monthsOut[key];
    M.invoices++; M.net += net; M.daysSeen.add(day);
    const e = M.br[b];
    e.rev += net; e.ord++;
    e.ch[ch].rev += net; e.ch[ch].ord++;
    if (SESS.includes(sess)) { e.sess[sess].rev += net; e.sess[sess].ord++; }
    const dk = day;
    if (!M.daily[dk]) M.daily[dk] = { day, total: 0, br: Object.fromEntries(knownBranches.map(kb => [kb, 0])) };
    M.daily[dk].total += net;
    M.daily[dk].br[b] += net;
  });

  const months = Object.values(monthsOut).map(M => {
    Object.values(M.br).forEach(e => {
      e.rev = Math.round(e.rev);
      CHANNELS.forEach(c => { e.ch[c].rev = Math.round(e.ch[c].rev); });
      SESS.forEach(s => { e.sess[s].rev = Math.round(e.sess[s].rev); });
    });
    const daily = Object.values(M.daily).sort((a, b) => a.day - b.day).map(d => ({
      label: `${MONTH_NAMES[M.monthIdx].slice(0, 3)} ${d.day}`,
      m: M.key, total: Math.round(d.total),
      br: Object.fromEntries(Object.entries(d.br).map(([k, v]) => [k, Math.round(v)])),
    }));
    return {
      key: M.key, year: M.year, monthIdx: M.monthIdx, label: M.label,
      calendarDays: M.calendarDays, days: M.daysSeen.size,
      partial: M.daysSeen.size < M.calendarDays,
      invoices: M.invoices, net: Math.round(M.net),
      br: M.br, daily,
    };
  }).sort((a, b) => (a.year * 12 + a.monthIdx) - (b.year * 12 + b.monthIdx));

  return {
    months,
    warnings: {
      unknownBranches: [...warnings.unknownBranches],
      unknownChannels: [...warnings.unknownChannels],
      otherBrand: warnings.otherBrand, zeroNet: warnings.zeroNet, badRows: warnings.badRows,
    },
  };
}

// ── Items export → aggregated item list (Combo Tracker) ──────────────────────
export function processItems(rows) {
  const agg = {};
  let totalRev = 0, totalQty = 0;
  rows.forEach(r => {
    if (r['Invoice Type'] && r['Invoice Type'] !== 'Sale') return;
    if (r['Type'] && r['Type'] !== 'Item') return;
    const name = (r['Item Name'] || '').trim();
    if (!name) return;
    const qty = parseFloat(String(r['Quantity']).replace(/,/g, '')) || 0;
    const rev = parseFloat(String(r['Net Amount']).replace(/,/g, '')) || 0;
    if (rev <= 0 && qty <= 0) return;
    if (!agg[name]) agg[name] = { item: name, x: 0, y: 0, mcat: r['Category'] || 'Uncategorized' };
    agg[name].x += qty; agg[name].y += rev;
    totalRev += rev; totalQty += qty;
  });
  const list = Object.values(agg).map(p => ({ ...p, x: Math.round(p.x), y: Math.round(p.y) }))
    .sort((a, b) => b.y - a.y);
  return { list, totalRev: Math.round(totalRev), totalQty: Math.round(totalQty) };
}

// ── Persistence ──────────────────────────────────────────────────────────────
export function loadUploads() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch (e) { return {}; }
}

export function saveUploads(u) {
  localStorage.setItem(STORE_KEY, JSON.stringify(u));
}

export function clearUploads() {
  localStorage.removeItem(STORE_KEY);
}

// ── Merge uploaded months into RAW before first render ───────────────────────
export function applyUploads(RAW) {
  const u = loadUploads();
  const meta = RAW.meta;
  meta.patternRangeLabel = meta.patternRangeLabel || meta.rangeLabel;
  meta.partialMonths = meta.partialMonths || {};
  const applied = [];
  const skipped = [];
  const monthList = Object.values(u.months || {})
    .sort((a, b) => (a.year * 12 + a.monthIdx) - (b.year * 12 + b.monthIdx));

  monthList.forEach(M => {
    if (meta.months.includes(M.key)) { skipped.push(M.key); return; }
    RAW.cube[M.key] = M.br;
    RAW.dailyAll = RAW.dailyAll.concat(M.daily);
    meta.months.push(M.key);
    meta.monthLabels[M.key] = M.label + (M.partial ? ' — partial' : '');
    meta.daysInMonth[M.key] = M.days;
    if (M.partial) meta.partialMonths[M.key] = { days: M.days, calendarDays: M.calendarDays };
    const qNum = Math.floor(M.monthIdx / 3) + 1;
    const qKey = 'q' + qNum;
    if (!meta.quarters[qKey]) {
      meta.quarters[qKey] = [];
      meta.quarterLabels[qKey] = `Q${qNum} ${M.year}`;
    }
    if (!meta.quarters[qKey].includes(M.key)) meta.quarters[qKey].push(M.key);
    meta.latestMonth = M.key;
    const lastDay = M.daily[M.daily.length - 1];
    meta.latestDate = lastDay ? `${lastDay.label}, ${M.year}` : meta.latestDate;
    meta.totalOrders += M.invoices;
    meta.totalNet += M.net;
    meta.rangeLabel = meta.rangeLabel.replace(/–.*$/, `– ${meta.latestDate}`);
    applied.push(M.key);
  });

  return { applied, skipped, items: u.items || null };
}
