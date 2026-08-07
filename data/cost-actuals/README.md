# Cost actuals drop-zone

One CSV (or several) with columns exactly as in `pipeline/cost_actuals_template.csv`:

    outlet,month,year,rent,payroll,purchases,other_opex

- `outlet` = POS branch name (Kothrud, AUNDH, Salunkhe Vihar, Saudagar, Wadgaon Sheri, Yolkshire Wakad, Bavdhan)
- `month` = jan…dec (lowercase), one row per outlet per month, amounts in ₹.

Then run `python pipeline/build_data.py`. The Money page's "Real EBITDA per Outlet" table switches from awaiting-state to actual rent/payroll/purchases vs the ₹2L/month goal.
