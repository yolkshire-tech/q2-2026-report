# Yolkshire Q2 2026 — BI Dashboard README

## What's in This Package

| File | Description |
|---|---|
| `Yolkshire_Dashboard.html` | 🖥️ Interactive 7-page executive dashboard (open in browser) |
| `Yolkshire_Executive_Report.md` | 📄 Full consulting-style business report |
| `KPI_Documentation.md` | 📊 KPI definitions, formulas, and methodology |
| `scratch/analyze.py` | 🐍 Python analysis script (reproducible) |
| `scratch/cleaned_transactions.csv` | 🧹 Cleaned transaction dataset (40,193 rows) |
| `scratch/kpis.json` | Core KPI values |
| `scratch/branch_perf.json` | Branch performance data |
| `scratch/channel_perf.json` | Channel performance data |
| `scratch/hour_perf.json` | Hourly performance data |
| `scratch/menu_engineering.json` | Full menu engineering classification |
| `scratch/forecast.json` | Revenue & order forecasts |
| *(+ 15 more JSON files)* | Supporting analysis data |

---

## How to Use the Dashboard

### Opening the Dashboard
1. Find `Yolkshire_Dashboard.html` in this folder
2. Double-click to open in your browser (Chrome, Edge, or Firefox recommended)
3. No internet connection required after the first load (Chart.js loads from CDN)
4. **Best viewed at 1440×900 or higher resolution**, full screen

### Navigating Pages
- Click the **tab buttons** at the top to switch between the 7 pages:
  1. **Executive Overview** — Start here for the big picture
  2. **Sales Performance** — Deep dive into time-based analysis
  3. **Menu Performance** — Product insights and menu engineering
  4. **Customer & Transactions** — Bill analysis and basket insights
  5. **Operations** — Kitchen load, staffing guide
  6. **Forecasting** — Jul–Sep revenue and order forecasts
  7. **Recommendations** — Actionable 7-day / 30-day / 90-day plan

### Filter Bar
- Dropdowns at the top of every page show available filters
- This version shows **aggregated Q2 data** — filters are informational indicators
- For dynamic filtering, the data JSON files in `scratch/` can be used with a BI tool

---

## How to Re-Run the Analysis

### Prerequisites
- Python 3.8+ installed
- Required packages: `pandas`, `numpy`, `scipy`, `openpyxl`

### Installation
```powershell
pip install pandas numpy scipy openpyxl
```

### Running the Script
```powershell
python "C:\Users\sayvi\.gemini\antigravity\brain\67107922-9c63-45a4-8689-8addcfa20a3f\scratch\analyze.py"
```

### What It Produces
All JSON files in the `scratch/` directory will be regenerated from the original CSV files. The script takes approximately 15–20 seconds to run.

### Adding New Data
To add a new month's data:
1. Add the transaction CSV to the data directory:
   `OneDrive - Viva Foods\Marketing's files - Social Media & Marketing by VV\Sales Reports\Apr 2026 - Jun 2026\`
2. Update the `tx_frames` loop in `analyze.py` to include the new month
3. Re-run the script

---

## Understanding the Data

### Branches Included
- AUNDH, Bavdhan, Kothrud, Salunkhe Vihar, Saudagar, Wadgaon Sheri, Yolkshire Wakad
- **Excluded:** Central Kitchen, FC ROAD, Head Office (non-revenue entities)

### Brand Filter
- Only **Yolkshire** brand transactions are included
- The Hoagie Club (minor brand) is excluded per analysis scope

### Sessions
- POS records all sessions as "Unknown"
- Sessions in this analysis are **derived from invoice hour**:
  - Breakfast: 7–10 AM
  - Lunch: 11 AM–2 PM
  - Snack: 3–5 PM
  - Dinner: 6–11 PM

### Channels
- **Dine In** = POS (in-restaurant)
- **Zomato** = Zomato delivery/dine-out
- **Swiggy** = Swiggy delivery
- **Takeaway** = Counter pickup (POS + DotPe)

---

## Assumptions & Limitations

1. **Food cost accuracy:** Menu food costs were noted as potentially inaccurate. Margin calculations are directional only.
2. **Basket analysis:** Conducted at category level (not individual invoice item level) — co-occurrences are cross-channel/session approximations, not true basket items per transaction.
3. **Forecast accuracy:** Linear regression on 3 months is indicative, not predictive. Real forecasting requires at least 12 months of data and seasonality adjustment.
4. **Staffing recommendations:** Based on 1 staff per 15 orders/hour. Actual requirement depends on kitchen layout, dish complexity, and service style.
5. **Pareto analysis:** Based on items in the Sales By Items file; some items with very few transactions may not appear due to data aggregation.

---

## Contact & Reproduction

This analysis was produced using Python data processing + HTML/JavaScript dashboard.

**Data Period:** April 1, 2026 – June 30, 2026
**Produced:** July 2026
**Brand:** Yolkshire | Viva Foods

---

*All figures in Indian Rupees (₹). "L" = Lakhs (1L = ₹1,00,000). "Cr" = Crores (1Cr = ₹1,00,00,000).*
