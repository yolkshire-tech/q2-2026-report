# data/ — platform inputs

| Folder | Contents | How it's used |
|---|---|---|
| `pos/Q1`, `pos/Q2`, … | Raw POS exports ("Sale Transactions" per month, "Sales By Items" per quarter). Add `pos/Q3/` when Q3 closes. | `pipeline/build_data.py` reads these and regenerates `src/data/dashboardData.js`. (Day-to-day, the app's Data page also accepts these files by drag-drop.) |
| `menu/` | The 178-SKU menu master with prices & food costs (MI-001…MI-178). | Future margin-based menu engineering (needs the POS-name alias map). |
| `cost-actuals/` | Monthly cost actuals from accounts — see its README. | Activates the Real-EBITDA table on the Money page. |
| `reference/` | Item growth/decline lists derived from the original Q2 analysis (no per-month item exports exist to recompute them). | Read by the pipeline for the Menu movers charts. |

CSV/XLSX files here are gitignored (large, exported data); `reference/*.json` and READMEs are tracked.
