// Single mutable application state. Every module reads/writes S.* so
// state lives in exactly one place (no cross-module let-binding writes).
export const S = {
  F: { period: 'all', branch: 'all' },
  baseMonths: [],
  uploadInfo: { applied: [], skipped: [], items: null },
  currentHeatmap: null,
  currentBranchProfile: 'Kothrud',
  bpCharts: {},
  modalChart: null,
  excludeNonMenu: false,
  activeCategorySelection: null,
  simState: {
  cogsPct: 30.0,
  bevAttachUplift: 0,
  commRate: 25.0,
  priceAdj: 0
},
  dualStoreA: 'Kothrud',
  dualStoreB: 'Wadgaon Sheri',
};
