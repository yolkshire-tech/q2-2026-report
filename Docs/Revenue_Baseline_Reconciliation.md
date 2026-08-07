# Q2 2026 Revenue Baseline Reconciliation

**Date:** 2026-08-08 · **Prepared as Phase 0 of the platform rebuild** · **Status: APPROVED 2026-08-08 — the definitions below are canonical and enforced by `pipeline/build_data.py`**

## Why this exists

Two conflicting Q2 "revenue" baselines circulate in our own documents, and the stakeholder combo report explicitly flagged that they must be reconciled before revenue targets are approved:

| Claim | Source | Figure |
|---|---|---|
| A | `KPI_Documentation.md`, dashboard | **₹2,07,28,578** net sales · 40,193 orders · AOV ₹515.73 |
| B | `market_basket_master_report.md`, combo reports | **₹98,71,208** "Net Sales" · "74,445 Transaction Items" · AOV ₹245.60 |

## Method

All figures below were recomputed directly from the raw POS exports on 2026-08-08 (no intermediate reports trusted):

- Invoice-level: `Yolkshire Q2 2026 Report/Data/cleaned_transactions.csv` (40,193 Sale invoices, Apr 1 – Jun 30 2026)
- Item-level: `Docs/Q2/Multidate - Sales By Items.csv` and `Multidate - Sale Items By Channel.csv`
- Menu master: `Docs/Q2/Menu with Prices & Food Cost.csv` (178 SKUs)

## Finding 1 — The two raw sources agree with each other to the paisa

| Component | Amount (₹) |
|---|---|
| Item-line net revenue, all channels, Sale rows | 20,576,122.13 |
| less: "Zomato - THC" (The Hoagie Club brand, not Yolkshire) | −10,459.00 |
| = Item-line net revenue, Yolkshire only | 20,565,663.13 |
| plus: Direct charges (packaging etc., exist only at invoice level) | +162,915.01 |
| **= Reconstructed invoice-level net sales** | **20,728,578.14** |
| Invoice-level net sales (cleaned_transactions.csv) | 20,728,578.43 |
| **Unexplained difference** | **₹0.29** |

There is no real data conflict. **Q2 2026 net sales = ₹2,07,28,578.** Claim A is correct.

## Finding 2 — What ₹98.7L actually was

The ₹98,71,208 figure is a **partial-join artifact**, not a revenue measurement:

- The market-basket analysis joined POS item rows to the 178-SKU menu cost master. POS item names frequently differ from master dish names (e.g. POS *"Yolkshire Special English Breakfast"*, *"Peri-Peri Steak"*, *"Vietnamese Iced Coffee"* vs master *"Special English Breakfast"*, *"Peri-Peri Chicken Steak"*, *"Vietnamese Cold Coffee"*). Rows that failed the join were silently dropped.
- Even a generous exact-name rematch today captures only ₹1,24,40,880 (60%) of item revenue; the original analysis's stricter join captured ₹98,71,208 (~48%).
- **"AOV ₹245.60" = matched-subset revenue ÷ ALL 40,193 invoices** — a subset numerator over a full-population denominator. It is not an average order value of anything.
- **"74,445" is a count of line-item rows** in that analysis, mislabeled "baskets"/"orders" downstream (the dashboard displays it as "Reconstructed Baskets").
- A third artifact of the same disease: `full_market_basket_analysis.json → menu_summary` sums to ₹69.1L over 114 items, with cost columns NaN where the join failed.

## Consequences to correct downstream

1. **Combo reports:** every "AOV uplift vs ₹245.60 baseline" claim is overstated (true Q2 AOV is ₹515.73; median bill ₹420). Combo *rankings* by margin are mostly unaffected; revenue projections and AOV targets ("₹300+") need restating against the real AOV.
2. **Dashboard:** "Reconstructed Baskets 74,445" and any figure derived from the ₹98.7L basis must be removed.
3. **Root cause to fix in the pipeline:** POS numeric SKUs and the menu master's MI-### codes share no key, forcing name joins. The rebuild pipeline must maintain an **alias map** (POS name → MI-###), **report its unmatched rate**, and **never silently drop** unmatched revenue.

## Proposed canonical definitions (for KPI dictionary)

| Metric | Definition | Q2 2026 value | Use for |
|---|---|---|---|
| **Net Sales** | Invoice-level: Gross − Discounts + Direct Charges, Sale invoices, Yolkshire brand, 7 revenue outlets | ₹2,07,28,578 | Targets, pace tracking, P&L topline, AOV |
| **AOV** | Net Sales ÷ Sale invoice count | ₹515.73 | Bill-value analysis, ₹2L model |
| **Item Revenue** | Item-line net by SKU (excl. THC), reconciles to Net Sales − Direct Charges | ₹2,05,65,663 | Menu engineering, combos, category mix |
| **Menu Coverage** | % of Item Revenue successfully joined to the SKU cost master — a published health metric, target ≥98% | ~60% today | Data-quality gate |

**Rule:** any analysis whose Item Revenue total doesn't reconcile to Net Sales within stated exclusions is invalid and must not ship.
