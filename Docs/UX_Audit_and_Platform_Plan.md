# UX Audit — From Q2 Report to Permanent Daily Platform

**Date:** 2026-08-08 · Follows the 6-page IA redesign. Scope: what still prevents this from being the dashboard Yolkshire uses daily, every quarter, for years.

## The core diagnosis

The app's information architecture is now right, but its **mental model is still "a Q2 2026 report"**. Time is hardcoded, filters simulate instead of compute, and there is no session continuity. A permanent platform needs three properties the current app lacks:

1. **Data-driven time** — the app must *discover* what periods exist, never assume them.
2. **Real slicing** — a filter must recompute from records, never scale a total by a share.
3. **Continuity** — where I was, what I selected, what data I'm seeing must survive reload and be shareable.

---

## A. Time model (critical)

| # | Finding | Evidence | Why it blocks daily/perpetual use |
|---|---|---|---|
| A1 | App identity is "Q2 2026" | title tag, header badges "Apr 1 – Jun 30 · 40,193 orders" | Wrong the day July data lands |
| A2 | Month filter hardcodes Jan–Jun 2026 options | filter bar `<option>`s | Every new month = manual HTML edit |
| A3 | `20728578` (Q2 net sales) is the scaling base for ~25 computations | grep across main.js | Q3 data would still be divided by Q2's total |
| A4 | "June 2026 (last full data month)" typed into Home headings | index.html | Stale next month |
| A5 | Pipeline emits fixed keys `jan…jun` with no metadata | dashboardData.js | UI can't know what's current vs historical |

**Fix (implemented):** pipeline emits `RAW.meta` (months, labels, quarters, latest month, latest data date, generated-at) and a **period cube** `RAW.cube[month][branch]` with revenue/orders/channel/session actuals. All labels, dropdowns, "latest month" references derive from meta. Adding a quarter = drop CSVs in `Docs/Q3`, add the folder to the pipeline's month list, run it — the UI adapts with zero edits.

## B. Filters (critical)

| # | Finding | Why it's a problem |
|---|---|---|
| B1 | Filtering is multiplicative pro-ration (branch share × month ratio × channel share × session constant × 0.978 "water" factor × category count-ratio) | "Kothrud · April · Swiggy · Dinner" shows a *fabricated* number that looks precise. False precision is worse than no filter |
| B2 | Global bar promises scope it doesn't have — Money, Menu combos, comparisons silently ignore it | User believes filtered numbers that never changed |
| B3 | Six controls always visible; channel & session are *analysis dimensions* (every page already charts them), not user contexts | Cognitive tax on every page; violates "one primary purpose" |
| B4 | "Set Sales Target" modal edits in-memory targets that conflict with the targets sheet (now the canonical source) and vanish on reload | Two competing target sources |
| B5 | Category/item modal scales revenue by *count of items selected ÷ total* | Selecting half the menu halves revenue — nonsense math |
| B6 | Sticky chrome (header + 3-row filter bar + tabs) consumes ~45% of the viewport | The content the user came for is below the fold |

**Fix (implemented):** the global bar reduces to **Period + Outlet + Reset** on one row — the only two contexts that are honest everywhere — computed by **real cube lookups** (a filtered number is now a sum of actual invoices, or it isn't shown). Channel and session remain in-page chart dimensions. The water/misc toggle moves to the Menu page (the only place it means anything). Target modal removed (targets sheet is the source). Category modal button removed from global chrome. Analyses that are inherently quarter-scoped (menu engineering, Q1vQ2, store comparison, playbook matrix) stop pretending to slice: they pin to their real period and say so.

## C. Continuity & state

| # | Finding | Fix (implemented) |
|---|---|---|
| C1 | No URLs — refresh dumps to Home, nothing shareable | Hash routes `#page` / `#page/sub`, restored on load |
| C2 | Selected period/outlet lost on reload | Persisted in localStorage, restored on load |
| C3 | No indicator of data recency | Header shows "data through {latest date}" from meta |

## D. Structural debt

| # | Finding | Fix |
|---|---|---|
| D1 | 5 retired pages still shipped in DOM + rendered on every refresh | Purged (implemented) |
| D2 | Flat fabricated ratios remained in 3 channel charts (0.52/0.48 offline split, 0.32/0.20 Zomato/Swiggy, hardcoded channel trend) | Replaced with real cube data (implemented) |
| D3 | Hour/heatmap/bill data was chain-level Q2 only, scaled for branches | Pipeline now emits real per-branch patterns (hourly, day-of-week, heatmap, bill histogram) over the full data range (implemented) |
| D4 | Item analytics silently "scale" when a month is selected, though item exports are quarterly | Menu page now states its true scope ("Q2 2026 item exports") instead of scaling (implemented) |
| D5 | `refresh()` re-renders ~35 charts on any change regardless of visibility | Deferred (P2) — needs per-page render registry |
| D6 | Repeated charts across subpages (monthly trend ×4, scorecards ×4) | Deferred (P2) — merge during subpage consolidation |

## E. Perpetual-operation workflow (the ritual)

Monthly close, as of now: **1)** download the month's "Sale Transactions" CSV into `Docs/Q3/` (and quarterly item exports), **2)** run `python pipeline/build_data.py`, **3)** commit + deploy. The app adapts (new month appears in the period selector, Home flips to the new latest month, target board recomputes).

Roadmap to remove even that friction:
- **P2**: upload page (Cloudflare Worker + R2) so a browser drag-drop replaces steps 1–3; combo tracker on Jul–Aug item exports; per-page render registry (D5); chart dedupe (D6); restate combo docs vs real AOV.
- **P3**: cost-actuals ingestion → real per-outlet EBITDA replaces the P&L %-model; loyalty API (repeat-rate drivers in Kothrud Gap); reviews ingestion; week-over-week alert deltas once two live months exist.
- **P4**: conversational analytics on the trusted cube; auto weekly brief.

---

*Sections marked "implemented" shipped with this audit (commits on 2026-08-08). The rest is the standing roadmap.*
