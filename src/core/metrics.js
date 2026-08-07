// Cross-view business metrics: latest-month resolution, month trends, tiers.
import { RAW } from '../data/dashboardData.js';

export function latestMonths() {
  const meta = RAW.meta;
  const idx = meta.months.indexOf(meta.latestMonth);
  return { latest: meta.latestMonth, prev: idx > 0 ? meta.months[idx - 1] : null, label: meta.monthLabels[meta.latestMonth] };
}

export const MONTH_TREND = b => {
  const { latest, prev } = latestMonths();
  const cur = RAW.cube[latest]?.[b]?.rev || 0;
  const before = prev ? (RAW.cube[prev]?.[b]?.rev || 0) : 0;
  return before > 0 ? (cur / before - 1) * 100 : null;
};

export function achievedTier(v, tiers) {
  if (v >= tiers.t3) return { label: 'T3 Super', tag: 'star' };
  if (v >= tiers.t2) return { label: 'T2 Stretch', tag: 'grow' };
  if (v >= tiers.t1) return { label: 'T1 Base', tag: 'horse' };
  return { label: 'Below T1', tag: 'risk' };
}

