// Outlet targets & incentive tiers — transcribed from the management targets
// sheet (provided 2026-08-08). Monthly ₹ values. Three tiers drive staff
// incentives: t1 = Base, t2 = Stretch, t3 = Super-Achiever.
//
// `pos` maps each sheet outlet to its POS branch name (null = outlet has no
// branch in this POS export, so no live sales tracking is possible yet).
// PYC (Incl Cart) bills on a SEPARATE POS account (confirmed 2026-08-08) —
// its exports must be added to the pipeline when available.
// Bavdhan (in POS since June) has no targets in the sheet yet.

export const TIERED_TARGETS = [
  { outlet: 'Kothrud',         pos: 'Kothrud',         currentAvgSale: 2000000, sales: { t1: 2250000, t2: 2500000, t3: 2750000 }, currentAvgProfit: 420000,  profit: { t1: 450000, t2: 525000, t3: 605000 } },
  { outlet: 'PYC (Incl Cart)', pos: null,              currentAvgSale: 700000,  sales: { t1: 1000000, t2: 1250000, t3: 1500000 }, currentAvgProfit: -180000, profit: { t1: 100000, t2: 137500, t3: 180000 } },
  { outlet: 'Aundh',           pos: 'AUNDH',           currentAvgSale: 1350000, sales: { t1: 1500000, t2: 1750000, t3: 2000000 }, currentAvgProfit: 178000,  profit: { t1: 300000, t2: 350000, t3: 400000 } },
  { outlet: 'Salunkhe Vihar',  pos: 'Salunkhe Vihar',  currentAvgSale: 1000000, sales: { t1: 1250000, t2: 1500000, t3: 1750000 }, currentAvgProfit: 116000,  profit: { t1: 250000, t2: 300000, t3: 350000 } },
  { outlet: 'Wadgaon Sheri',   pos: 'Wadgaon Sheri',   currentAvgSale: 850000,  sales: { t1: 1000000, t2: 1250000, t3: 1500000 }, currentAvgProfit: -5000,   profit: { t1: 200000, t2: 250000, t3: 300000 } },
  { outlet: 'Pimple Saudagar', pos: 'Saudagar',        currentAvgSale: 850000,  sales: { t1: 1000000, t2: 1250000, t3: 1500000 }, currentAvgProfit: -40000,  profit: { t1: 200000, t2: 250000, t3: 300000 } },
  { outlet: 'Wakad',           pos: 'Yolkshire Wakad', currentAvgSale: 600000,  sales: { t1: 1000000, t2: 1250000, t3: 1500000 }, currentAvgProfit: -79000,  profit: { t1: 250000, t2: 300000, t3: 300000 } },
];

// Outlets present in POS data but absent from the targets sheet.
export const UNTARGETED_POS_BRANCHES = ['Bavdhan'];

export function targetForPosBranch(posName) {
  return TIERED_TARGETS.find(t => t.pos === posName) || null;
}
