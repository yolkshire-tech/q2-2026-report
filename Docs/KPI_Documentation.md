# Yolkshire Q2 2026 — KPI & Metrics Documentation

## Overview
This document defines every KPI and calculated metric used in the Yolkshire Q2 2026 Sales Report and Dashboard. All calculations are reproducible using the in-repo pipeline (`pipeline/build_data.py`).

## ✅ CANONICAL DEFINITIONS (approved 2026-08-08)
Reconciled from raw POS exports — see `Docs/Revenue_Baseline_Reconciliation.md`. These override any conflicting figure elsewhere:

| Metric | Definition | Q2 2026 value | Use for |
|---|---|---|---|
| **Net Sales** | Invoice-level: Gross − Discounts + Direct Charges; Sale invoices; Yolkshire brand; 7 revenue outlets; zero-net comped invoices excluded | ₹2,07,28,578.43 | Targets, pace tracking, P&L topline |
| **Orders** | Count of invoices under the same rules | 40,193 | Volume, AOV denominator |
| **AOV** | Net Sales ÷ Orders | ₹515.73 | Bill-value analysis, ₹2L model |
| **Item Revenue** | Item-line net by SKU (excl. The Hoagie Club); = Net Sales − Direct Charges | ₹2,05,65,663 | Menu engineering, combos, category mix |
| **Menu Coverage** | % of Item Revenue joined to the SKU cost master — published data-quality gate, target ≥98% | ~60% (alias map pending) | Analysis validity check |

⚠️ **Deprecated:** the ₹98,71,208 "Net Sales", AOV ₹245.60, and "74,445 baskets" figures used in the market-basket/combo reports are partial-join artifacts and must not be used. Combo AOV-uplift projections citing the ₹245.60 baseline are overstated and pending restatement.

---

## Revenue Metrics

### Total Gross Sales
**Definition:** Sum of all invoice gross amounts for Sale-type invoices, Yolkshire brand only, active branches only.
**Formula:** `SUM(Gross Amount) WHERE Invoice_Type = 'Sale' AND Brand = 'Yolkshire' AND Branch NOT IN ('Central Kitchen', 'FC ROAD', 'Head Office')`
**Value:** ₹2,12,10,077.21
**Source:** Transaction files (Apr/May/Jun)

### Total Discounts
**Definition:** Sum of all discount amounts applied across valid sale transactions.
**Formula:** `SUM(Discounts) WHERE Invoice_Type = 'Sale'`
**Value:** -₹6,44,413.79 (negative = deduction)
**Note:** Includes both POS discounts and aggregator-level discounts (Swiggy/Zomato promotional discounts)

### Total Packaging Charges (Direct Charges)
**Definition:** Packaging charges billed to customer on delivery orders.
**Formula:** `SUM(Direct Charge Amount) WHERE Invoice_Type = 'Sale'`
**Value:** ₹1,62,915.01
**Note:** Recovered from customer, not a revenue item per se — but included in Total collected

### Net Sales
**Definition:** Revenue retained after discounts, before tax. The primary revenue KPI.
**Formula:** `Gross Amount + Discounts + Direct Charge Amount`
**Value:** ₹2,07,28,578.43
**Note:** This is the key operational revenue figure

### Total Tax Collected
**Definition:** GST collected from customers (CGST 2.5% + SGST 2.5% = 5% effective on applicable items)
**Formula:** `SUM(Taxes) WHERE Invoice_Type = 'Sale'`
**Value:** ₹4,83,254.94
**Note:** Collected on behalf of government; not restaurant revenue

### Total Revenue Collected
**Definition:** Actual cash/digital payment collected from customers, including tax and packaging.
**Formula:** `SUM(Paid Amount) WHERE Invoice_Type = 'Sale'`
**Value:** ₹2,12,14,304.94

---

## Order Metrics

### Total Orders
**Definition:** Count of unique valid sale invoices.
**Formula:** `COUNT(Invoice Number) WHERE Invoice_Type = 'Sale' AND Total > 0`
**Value:** 40,193
**Note:** Excludes 33 cancelled/zero-value transactions

### Average Order Value — Net (AOV Net)
**Definition:** Average net revenue per order (before tax, after discounts).
**Formula:** `Net Sales / Total Orders`
**Value:** ₹515.73

### Average Order Value — Total (AOV Total)
**Definition:** Average total amount collected per order including tax.
**Formula:** `Total Revenue Collected / Total Orders`
**Value:** ₹527.81

### Average Daily Orders
**Formula:** `Total Orders / Days Covered`
**Value:** 441.7 orders/day

### Cancel Rate
**Definition:** Percentage of all invoice attempts that resulted in cancellation or zero-value transactions.
**Formula:** `COUNT(Total <= 0) / COUNT(All Invoices) * 100`
**Value:** 0.08% (33 out of 40,226 invoices)

---

## Bill Statistics

### Median Bill
**Definition:** The 50th percentile of Total (amount collected) across all valid transactions.
**Value:** ₹420.00
**Interpretation:** Half of all transactions are below ₹420 and half above.

### Bill P25 / P75
**P25:** 25th percentile = ₹315 (25% of bills below this)
**P75:** 75th percentile = ₹651 (75% of bills below this)
**IQR:** ₹651 - ₹315 = ₹336 (the middle 50% of bills)

### Maximum Bill
**Value:** ₹28,800
**Note:** Likely a group dining/event order. Not an outlier to be excluded — it's a real high-value transaction.

---

## Time Metrics

### Revenue Per Hour
**Definition:** Average revenue generated per operating hour, across all branches.
**Formula:** `Net Sales / (Days Covered × Operating Hours Per Day × Active Branches)`
**Assumptions:** 16 operating hours/day (7 AM–11 PM), 7 active branches
**Value:** ₹2,033.81 per branch-hour

### Derived Sessions
Since POS sessions are all "Unknown," time-of-day sessions are derived from invoice hour:
- **Breakfast:** 07:00–10:59
- **Lunch:** 11:00–14:59
- **Snack:** 15:00–17:59
- **Dinner:** 18:00–23:59

---

## Growth Metrics

### Month-over-Month Revenue Growth
**Formula:** `(Revenue_Month_N - Revenue_Month_N-1) / Revenue_Month_N-1 × 100`
- May vs Apr: +4.54%
- Jun vs May: -2.46%

---

## Product Metrics

### Revenue Contribution %
**Formula:** `Item Net Revenue / Total Item Net Revenue × 100`

### Popularity Rank
**Formula:** `RANK(Total Quantity DESCENDING)` across all revenue-generating items

### Menu Engineering Classification
**Median Quantity:** Calculated across all revenue-generating items
**Median Revenue:** Calculated across all revenue-generating items

| Category | Condition |
|---|---|
| Star | Qty ≥ Median AND Revenue ≥ Median |
| Plow Horse | Qty ≥ Median AND Revenue < Median |
| Puzzle | Qty < Median AND Revenue ≥ Median |
| Dog | Qty < Median AND Revenue < Median |

### Item Growth Rate (Apr → Jun)
**Formula:** `(Jun Qty - Apr Qty) / Apr Qty × 100`
**Minimum volume filter:** Items with < 5 units in April excluded from growth ranking (statistically unstable)

---

## Branch & Channel Metrics

### Revenue Concentration
**Definition:** What % of total revenue comes from the top N branches/channels.
- Top 1 Branch: 30.1% → indicates some concentration risk
- Top 3 Branches: 62.2% → moderate concentration

### Pareto Analysis (80/20)
**Question:** How many items generate 80% of revenue?
**Method:** Sort items by revenue descending → cumulative sum → find the point where cumulative % crosses 80%
**Result:** 58 items (36.2% of catalogue) generate 80% of revenue

---

## Operational Metrics

### Kitchen Load %
**Definition:** Hourly orders relative to the peak hour (10 AM = 100%).
**Formula:** `Hour Orders / Max Hour Orders × 100`
**Peak:** 10 AM = 3,752 orders → 100%
**Minimum:** 5 PM = 1,050 orders → 28%

### Recommended Staffing
**Definition:** Minimum kitchen staff required per hour per branch.
**Formula:** `CEILING(Hourly Orders / Days / 15)`
**Assumption:** 1 kitchen staff handles 15 orders/hour effectively
**Note:** This is a guideline; actual staffing depends on dish complexity and kitchen layout

---

## Forecasting Methodology

### Revenue & Orders Forecast
**Method:** Ordinary least squares linear regression on 3 monthly data points (Apr, May, Jun)
**Variables:** Month index (1=Apr, 2=May, 3=Jun) → forecast for indices 4, 5, 6 (Jul, Aug, Sep)
**Limitation:** 3 data points is insufficient for seasonal adjustment. Forecasts are directional only.
**Confidence:** Low — do not use for financial planning without Q1 2026 or prior year comparison data

---

## Data Quality Notes

| Issue | Handling |
|---|---|
| Sessions all "Unknown" | Derived from invoice hour |
| Hoagie Club transactions | Filtered out (Brand ≠ Yolkshire) |
| Non-Sale invoice types | Excluded from revenue (kept for quantity where noted) |
| Zero-amount items (Options) | Excluded from revenue KPIs |
| Central Kitchen / FC ROAD / HO | Excluded from all branch analysis |
| Bavdhan (Jun only) | Flagged in MoM analysis; not compared equally |
| Food costs in menu file | Flagged as potentially inaccurate by owner; used directionally |
| Decimal rounding in POS | Minor rounding present in source data; accepted as-is |
| Duplicate SKUs across branches | Expected — same item appears per branch in Sales By Items |
