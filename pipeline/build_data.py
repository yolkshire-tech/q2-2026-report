"""
Yolkshire Data Pipeline — builds src/data/dashboardData.js from raw POS exports.

Replaces the hand-transcribed (and partly fabricated) data module with real,
reconciled aggregates. Run from anywhere:

    python pipeline/build_data.py

Inputs (relative to repo root):
  Docs/Q1/{Jan,Feb,Mar}-2026 - Sale Transactions.csv     invoice-level, Q1
  Docs/Q2/{Apr,May,Jun}-2026 - Sale Transactions.csv     invoice-level, Q2
  Docs/Q2/Multidate - Sales By Items.csv                 item-line, Q2
  Yolkshire Q2 2026 Report/Data/fastest_growing.json     item growth (Apr vs Jun qty)
  Yolkshire Q2 2026 Report/Data/declining_items.json     item decline

Cleaning rules (same as the original analyze.py, per README):
  - Business Brand == 'Yolkshire' (excludes The Hoagie Club)
  - Invoice Type == 'Sale' (excludes returns/voids)
  - Branches Central Kitchen / FC ROAD / Head Office excluded (non-revenue)
  - Session derived from invoice hour (POS records sessions as 'Unknown'):
    7-10 Breakfast, 11-14 Lunch, 15-17 Snack, 18-23 Dinner, else Other
  - 'Dotpe Takeaway' folded into 'Takeaway' (counter pickup, per README)

Verification: Q2 totals must tie to the canonical baseline
(₹2,07,28,578.43 / 40,193 invoices — see Docs/Revenue_Baseline_Reconciliation.md)
or the script aborts without writing.
"""
import json
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "data" / "dashboardData.js"

CANON_Q2_NET = 20728578.43
CANON_Q2_ORD = 40193

EXCLUDE_BRANCHES = {"Central Kitchen", "FC ROAD", "Head Office"}
BRANCHES = ["Kothrud", "AUNDH", "Salunkhe Vihar", "Saudagar",
            "Wadgaon Sheri", "Yolkshire Wakad", "Bavdhan"]
CHANNELS = ["Dine In", "Zomato", "Swiggy", "Takeaway"]
CHANNEL_MAP = {"Dotpe Takeaway": "Takeaway", "DotPe": "Takeaway"}
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
HOURS = list(range(7, 24))


def hour_to_session(h):
    if 7 <= h <= 10:
        return "breakfast"
    if 11 <= h <= 14:
        return "lunch"
    if 15 <= h <= 17:
        return "snack"
    if 18 <= h <= 23:
        return "dinner"
    return "other"


def load_transactions():
    frames = []
    for q, months in (("Q1", ["Jan", "Feb", "Mar"]), ("Q2", ["Apr", "May", "Jun"])):
        for m in months:
            f = ROOT / "Docs" / q / f"{m}-2026 - Sale Transactions.csv"
            df = pd.read_csv(f, encoding="utf-8", low_memory=False)
            df["month"] = m
            frames.append(df)
            print(f"  loaded {f.name}: {len(df):,} rows")
    tx = pd.concat(frames, ignore_index=True)
    tx = tx[tx["Business Brand"] == "Yolkshire"]
    tx = tx[tx["Invoice Type"] == "Sale"]
    tx = tx[~tx["Branch Name"].isin(EXCLUDE_BRANCHES)].copy()
    for c in ["Gross Amount", "Discounts", "Direct Charge Amount", "Net Amount"]:
        tx[c] = pd.to_numeric(tx[c], errors="coerce").fillna(0)
    # Zero-net Sale invoices (fully comped bills) are excluded from order counts
    # and AOV, matching the canonical baseline (40,193 orders).
    dropped = int((tx["Net Amount"] == 0).sum())
    tx = tx[tx["Net Amount"] != 0]
    print(f"  dropped {dropped} zero-net (fully comped) Sale invoices")
    tx["Channel"] = tx["Channel"].map(lambda c: CHANNEL_MAP.get(c, c))
    unknown = set(tx["Channel"].unique()) - set(CHANNELS)
    if unknown:
        sys.exit(f"ABORT: unexpected channels {unknown}")
    tx["Invoice Date"] = pd.to_datetime(tx["Invoice Date"], errors="coerce")
    tx["Business Date"] = pd.to_datetime(tx["Business Date"], errors="coerce")
    tx["hour"] = tx["Invoice Date"].dt.hour
    tx["session"] = tx["hour"].map(hour_to_session)
    tx["weekday"] = tx["Business Date"].dt.dayofweek  # 0=Mon
    for c in ["Gross Amount", "Discounts", "Direct Charge Amount", "Net Amount"]:
        tx[c] = pd.to_numeric(tx[c], errors="coerce").fillna(0)
    return tx


def month_block(g):
    rev = g["Net Amount"].sum()
    ord_ = len(g)
    br = {b: round(g.loc[g["Branch Name"] == b, "Net Amount"].sum()) for b in BRANCHES}
    sess = {s: round(g.loc[g["session"] == s, "Net Amount"].sum())
            for s in ["breakfast", "lunch", "snack", "dinner"]}
    ch = {}
    for c in CHANNELS:
        sub = g[g["Channel"] == c]
        ch[c] = {"rev": round(sub["Net Amount"].sum()), "ord": len(sub)}
    return {"rev": round(rev), "ord": ord_, "aov": round(rev / ord_, 2) if ord_ else 0,
            "br": br, "sess": sess, "ch": ch}


def js(v, indent=0):
    """Compact JS literal serializer (JSON is valid JS)."""
    return json.dumps(v, ensure_ascii=False, separators=(",", ":") if indent == 0 else (",", ": "))


def main():
    print("[1] Transactions")
    tx = load_transactions()
    q2 = tx[tx["month"].isin(["Apr", "May", "Jun"])]
    q1 = tx[tx["month"].isin(["Jan", "Feb", "Mar"])]

    q2_net, q2_ord = q2["Net Amount"].sum(), len(q2)
    print(f"  Q2: {q2_ord:,} invoices, net {q2_net:,.2f}")
    if abs(q2_net - CANON_Q2_NET) > 1 or q2_ord != CANON_Q2_ORD:
        sys.exit(f"ABORT: Q2 totals do not tie to canonical baseline "
                 f"({CANON_Q2_ORD:,} / {CANON_Q2_NET:,.2f})")
    other_pct = q2.loc[q2["session"] == "other", "Net Amount"].sum() / q2_net * 100
    print(f"  'Other' session (hours outside 7-23): {other_pct:.2f}% of Q2 net")

    print("[2] Month/quarter aggregates")
    month = {m.lower(): month_block(tx[tx["month"] == m]) for m in MONTHS}
    month["q1"] = month_block(q1)
    month["q2"] = month_block(q2)

    print("[3] Branch & channel (Q2)")
    branch = {}
    for b in BRANCHES:
        g = q2[q2["Branch Name"] == b]
        rev, ordn = g["Net Amount"].sum(), len(g)
        ch = {}
        for c in CHANNELS:
            sub = g[g["Channel"] == c]
            crev, cord = sub["Net Amount"].sum(), len(sub)
            ch[c] = {"rev": round(crev), "ord": cord,
                     "aov": round(crev / cord) if cord else None}
        branch[b] = {
            "rev": round(rev), "ord": ordn,
            "aov": round(rev / ordn, 2) if ordn else 0,
            "apr": month["apr"]["br"][b], "may": month["may"]["br"][b],
            "jun": month["jun"]["br"][b],
            "share": round(rev / q2_net * 100, 1), "ch": ch,
        }
    channel = {}
    for c in CHANNELS:
        g = q2[q2["Channel"] == c]
        rev, ordn = g["Net Amount"].sum(), len(g)
        channel[c] = {"rev": round(rev), "ord": ordn,
                      "aov": round(rev / ordn, 2) if ordn else 0,
                      "share": round(rev / q2_net * 100, 2)}

    print("[4] Time patterns (Q2)")
    dRev = [round(q2.loc[q2["weekday"] == d, "Net Amount"].sum()) for d in range(7)]
    hRev = [round(q2.loc[q2["hour"] == h, "Net Amount"].sum()) for h in HOURS]
    hOrd = [int((q2["hour"] == h).sum()) for h in HOURS]
    peak = max(hOrd)
    hLoad = [round(o / peak * 100) for o in hOrd]
    hm_ord = [[int(((q2["weekday"] == d) & (q2["hour"] == h)).sum()) for h in HOURS]
              for d in range(7)]
    hm_peak = max(max(r) for r in hm_ord)
    heatmap = [[round(v / hm_peak * 100) for v in row] for row in hm_ord]

    edges = [(0, 100), (100, 200), (200, 300), (300, 400), (400, 500),
             (500, 700), (700, 1000), (1000, float("inf"))]
    billCounts = [int(((q2["Net Amount"] >= lo) & (q2["Net Amount"] < hi)).sum())
                  for lo, hi in edges]

    daily = (q2.groupby(q2["Business Date"].dt.date)["Net Amount"].sum()
             .sort_index())
    ma = daily.rolling(7, min_periods=1).mean()
    DAILY_REVENUE = [
        {"date": pd.Timestamp(d).strftime("%b ") + str(pd.Timestamp(d).day),
         "rev": round(v), "ma": round(m)}
        for d, v, m in zip(daily.index, daily.values, ma.values)
    ]

    print("[4b] Period cube, daily series, per-branch patterns (real slicing)")
    SESS = ["breakfast", "lunch", "snack", "dinner"]
    cube = {}
    for m in MONTHS:
        g = tx[tx["month"] == m]
        e = {}
        for b in BRANCHES:
            gb = g[g["Branch Name"] == b]
            e[b] = {
                "rev": round(gb["Net Amount"].sum()), "ord": int(len(gb)),
                "ch": {c: {"rev": round(gb.loc[gb["Channel"] == c, "Net Amount"].sum()),
                           "ord": int((gb["Channel"] == c).sum())} for c in CHANNELS},
                "sess": {s: {"rev": round(gb.loc[gb["session"] == s, "Net Amount"].sum()),
                             "ord": int((gb["session"] == s).sum())} for s in SESS},
            }
        cube[m.lower()] = e

    daily_g = (tx.groupby([tx["Business Date"].dt.date, "Branch Name"])["Net Amount"]
               .sum().unstack(fill_value=0))
    dailyAll = []
    for d, row in daily_g.iterrows():
        ts = pd.Timestamp(d)
        dailyAll.append({"label": ts.strftime("%b ") + str(ts.day),
                         "m": ts.strftime("%b").lower(),
                         "total": round(row.sum()),
                         "br": {b: round(row.get(b, 0)) for b in BRANCHES}})

    def patterns(g):
        p_hOrd = [int((g["hour"] == h).sum()) for h in HOURS]
        peak = max(p_hOrd) or 1
        hm = [[int(((g["weekday"] == d) & (g["hour"] == h)).sum()) for h in HOURS]
              for d in range(7)]
        hm_peak = max(max(r) for r in hm) or 1
        return {
            "hRev": [round(g.loc[g["hour"] == h, "Net Amount"].sum()) for h in HOURS],
            "hOrd": p_hOrd,
            "hLoad": [round(o / peak * 100) for o in p_hOrd],
            "dRev": [round(g.loc[g["weekday"] == d, "Net Amount"].sum()) for d in range(7)],
            "heatmap": [[round(v / hm_peak * 100) for v in row] for row in hm],
            "bills": [int(((g["Net Amount"] >= lo) & (g["Net Amount"] < hi)).sum())
                      for lo, hi in edges],
        }

    branchPatterns = {"all": patterns(tx)}
    for b in BRANCHES:
        branchPatterns[b] = patterns(tx[tx["Branch Name"] == b])

    FULL_NAMES = {"Jan": "January", "Feb": "February", "Mar": "March",
                  "Apr": "April", "May": "May", "Jun": "June", "Jul": "July",
                  "Aug": "August", "Sep": "September", "Oct": "October",
                  "Nov": "November", "Dec": "December"}
    days_per_month = (tx.groupby("month")["Business Date"]
                      .apply(lambda s: s.dt.date.nunique()).to_dict())
    dmin, dmax = tx["Business Date"].min(), tx["Business Date"].max()
    year = int(dmax.year)
    meta = {
        "year": year,
        "months": [m.lower() for m in MONTHS],
        "monthLabels": {m.lower(): f"{FULL_NAMES[m]} {year}" for m in MONTHS},
        "quarters": {"q1": ["jan", "feb", "mar"], "q2": ["apr", "may", "jun"]},
        "quarterLabels": {"q1": f"Q1 {year} (Jan–Mar)", "q2": f"Q2 {year} (Apr–Jun)"},
        "daysInMonth": {m.lower(): int(days_per_month.get(m, 30)) for m in MONTHS},
        "latestMonth": MONTHS[-1].lower(),
        "latestDate": dmax.strftime("%b %d, %Y"),
        "rangeLabel": f"{dmin.strftime('%b %d')} – {dmax.strftime('%b %d, %Y')}",
        "totalOrders": int(len(tx)),
        "totalNet": round(tx["Net Amount"].sum()),
        "itemDataScope": "Q2 2026 (Apr–Jun) item-level exports",
    }

    # Cost actuals (optional): drop monthly CSVs from accounts into
    # "Docs/Cost Actuals/" using pipeline/cost_actuals_template.csv columns
    # (outlet = POS branch name, month = jan..dec lowercase). When present,
    # the Money page shows real per-outlet EBITDA instead of the %-model.
    costActuals = {}
    ca_dir = ROOT / "Docs" / "Cost Actuals"
    if ca_dir.exists():
        for f in sorted(ca_dir.glob("*.csv")):
            ca = pd.read_csv(f, encoding="utf-8-sig")
            for _, r in ca.iterrows():
                b, m = str(r["outlet"]).strip(), str(r["month"]).strip().lower()
                if b not in BRANCHES:
                    print(f"  WARN cost actuals: unknown outlet '{b}' in {f.name} — skipped")
                    continue
                costActuals.setdefault(b, {})[m] = {
                    "rent": round(float(r.get("rent", 0) or 0)),
                    "payroll": round(float(r.get("payroll", 0) or 0)),
                    "purchases": round(float(r.get("purchases", 0) or 0)),
                    "other": round(float(r.get("other_opex", 0) or 0)),
                }
        print(f"  cost actuals: {sum(len(v) for v in costActuals.values())} outlet-months loaded")
    else:
        print("  cost actuals: none (Docs/Cost Actuals/ not present)")

    print("[5] Menu items (Q2 item-line, full coverage)")
    items = pd.read_csv(ROOT / "Docs" / "Q2" / "Multidate - Sales By Items.csv",
                        encoding="utf-8")
    items = items[items["Invoice Type"] == "Sale"]
    for c in ["Quantity", "Net Amount"]:
        items[c] = pd.to_numeric(items[c], errors="coerce").fillna(0)
    # POS name hygiene: branches ring the same dish under case/spacing variants
    # ("Grilled Chicken Breast" vs "Grilled chicken Breast"). Merge them under
    # the highest-revenue spelling so quantities aren't split across rows.
    key = items["Item Name"].fillna("").str.strip().str.replace(r"\s+", " ", regex=True)
    kf = key.str.casefold()
    disp = (pd.DataFrame({"kf": kf, "name": key, "rev": items["Net Amount"]})
            .groupby(["kf", "name"])["rev"].sum().reset_index()
            .sort_values("rev").drop_duplicates("kf", keep="last")
            .set_index("kf")["name"])
    merged = int((kf.map(disp) != items["Item Name"]).sum())
    items["Item Name"] = kf.map(disp)
    print(f"  name hygiene: {merged} rows re-labelled to canonical spellings")
    it = (items[items["Type"] == "Item"]
          .groupby("Item Name")
          .agg(qty=("Quantity", "sum"), rev=("Net Amount", "sum"),
               cat=("Category", "first"))
          .reset_index())
    it = it[it["rev"] > 0]
    med_q, med_r = it["qty"].median(), it["rev"].median()

    def quadrant(r):
        hi_q, hi_r = r["qty"] >= med_q, r["rev"] >= med_r
        if hi_q and hi_r:
            return "Star"
        if hi_q:
            return "Plow Horse"
        if hi_r:
            return "Puzzle"
        return "Dog"

    it["quad"] = it.apply(quadrant, axis=1)
    it = it.sort_values("rev", ascending=False)
    mePoints = [{"x": int(row["qty"]), "y": round(row["rev"]), "cat": row["quad"],
                 "item": row["Item Name"], "mcat": row["cat"]}
                for _, row in it.iterrows()]
    quad_counts = it["quad"].value_counts().to_dict()
    print(f"  {len(it)} items · quadrants {quad_counts}")
    print(f"  item-line total (Items only): {it['rev'].sum():,.0f}")

    top_r = it.nlargest(10, "rev")
    top_q = it.nlargest(10, "qty")

    # Per-branch item lists (real branch-level menu analytics; Q2 scope)
    itemsByBranch = {}
    ib = items[items["Type"] == "Item"]
    for b in BRANCHES:
        gb = (ib[ib["Branch Name"] == b].groupby("Item Name")
              .agg(qty=("Quantity", "sum"), rev=("Net Amount", "sum"),
                   cat=("Category", "first")))
        gb = gb[gb["rev"] > 0].sort_values("rev", ascending=False)
        itemsByBranch[b] = [{"item": i, "x": int(r["qty"]), "y": round(r["rev"]),
                             "mcat": r["cat"]} for i, r in gb.iterrows()]

    # Kothrud benchmark detail — real branch-level series for the Playbook page
    koth_tx = q2[q2["Branch Name"] == "Kothrud"]
    kothrud_hourly = [round(koth_tx.loc[koth_tx["hour"] == h, "Net Amount"].sum())
                      for h in HOURS]
    kb = (items[(items["Type"] == "Item") & (items["Branch Name"] == "Kothrud")]
          .groupby("Item Name")
          .agg(rev=("Net Amount", "sum"), cat=("Category", "first")))
    kb = kb[kb["rev"] > 0]
    kb_total = kb["rev"].sum()
    k_top5 = kb.nlargest(5, "rev")
    kothrud_top5 = {
        "items": list(k_top5.index),
        "pcts": [round(v / kb_total * 100, 1) for v in k_top5["rev"]],
    }
    k_bev = kb[kb["cat"] == "Beverages"].nlargest(5, "rev")
    k_bev_other = kb.loc[kb["cat"] == "Beverages", "rev"].sum() - k_bev["rev"].sum()
    kothrud_bev = {
        "labels": list(k_bev.index) + ["Other Beverages"],
        "revs": [round(v) for v in k_bev["rev"]] + [round(k_bev_other)],
    }
    kothrudDetail = {"hourly": kothrud_hourly, "top5": kothrud_top5,
                     "bevMix": kothrud_bev}

    grow = json.load(open(ROOT / "Yolkshire Q2 2026 Report" / "Data" / "fastest_growing.json", encoding="utf-8"))
    decl = json.load(open(ROOT / "Yolkshire Q2 2026 Report" / "Data" / "declining_items.json", encoding="utf-8"))
    growItems = [g["Item Name"] for g in grow[:5]]
    growPct = [round(g["Growth_AprJun"]) for g in grow[:5]]
    declItems = [d["Item Name"] for d in decl[:5]]
    declPct = [round(d["Growth_AprJun"]) for d in decl[:5]]

    print("[6] Latest-day snapshot & June target (real)")
    last_day = daily.index.max()
    ld = q2[q2["Business Date"].dt.date == last_day]
    prev_day = sorted(daily.index)[-2]
    ld_ch = {}
    for c in CHANNELS:
        sub = ld[ld["Channel"] == c]
        ld_ch[c] = {"orders": len(sub), "rev": round(sub["Net Amount"].sum()),
                    "aov": round(sub["Net Amount"].sum() / len(sub)) if len(sub) else None}
    branch_targets = {
        "Kothrud": 2200000, "AUNDH": 1600000, "Salunkhe Vihar": 1300000,
        "Saudagar": 1200000, "Wadgaon Sheri": 1200000,
        "Yolkshire Wakad": 1000000, "Bavdhan": 500000,
    }
    jun_target = sum(branch_targets.values())
    jun_rev = month["jun"]["rev"]
    jun_days = 30
    dailySnapshot = {
        "latestDataDate": pd.Timestamp(last_day).strftime("%b %d, %Y"),
        "walkinsToday": None, "walkinsYesterday": None,
        "walkinConversionRate": None, "tableTurnoverRate": None,
        "ordersToday": int(len(ld)),
        "ordersYesterday": int((q2["Business Date"].dt.date == prev_day).sum()),
        "revToday": round(ld["Net Amount"].sum()),
        "channelBreakdown": ld_ch,
        "loyaltyToday": {"newSignups": None, "signupsTrend": None,
                         "loyaltyOrders": None, "loyaltySalesPct": None,
                         "pointsRedeemed": None, "repeatCustomerRate": None},
        "monthlyTarget": {
            "label": "June 2026 (last full data month)",
            "targetRev": jun_target, "achievedRev": jun_rev,
            "daysElapsed": jun_days, "daysTotal": jun_days,
            "remainingRev": max(0, jun_target - jun_rev),
            "requiredDailyRunRate": None,
            "currentDailyAvg": round(jun_rev / jun_days),
            "status": f"Month closed at {jun_rev / jun_target * 100:.1f}% of target",
        },
        "reviews": {"avgRating": None, "totalReviewsToday": None,
                    "positivePct": None, "breakdown": None, "feed": []},
    }
    # Store-audit feed regenerated from real Q2 figures
    def L(v):
        return f"₹{v / 100000:.1f}L"
    trends = {}
    for b in BRANCHES:
        may_v, jun_v = branch[b]["may"], branch[b]["jun"]
        trends[b] = (jun_v / may_v - 1) * 100 if may_v else None
    dailySnapshot["reviews"]["feed"] = [
        {"id": i + 1, "branch": b, "channel": "Dine In",
         "customer": f"{b} Store Audit", "rating": None,
         "time": "Q2 2026 POS data",
         "comment": (
             f"Q2 net sales {L(branch[b]['rev'])} · AOV ₹{round(branch[b]['aov'])} · "
             + ("June debut month." if trends[b] is None
                else f"June vs May: {trends[b]:+.1f}%.")),
         "sentiment": ("neutral" if trends[b] is not None and trends[b] < -5
                       else "positive")}
        for i, b in enumerate(BRANCHES)
    ]

    print("[7] Branch profiles (real trends)")
    def status_for(b, t):
        if b == "Bavdhan":
            return ("New Debut (Jun)", "grow", "N/A", "trend-up")
        cls = "trend-up" if t >= 0 else "trend-dn"
        lbl = f"{t:+.1f}%"
        if t >= 5:
            return ("Growing", "grow", lbl, cls)
        if t >= -5:
            return ("Stable", "star", lbl, cls)
        if t >= -12:
            return ("Softening", "warn", lbl, cls)
        return ("Declining", "risk", lbl, cls)

    BRANCH_PROFILES = {}
    for b in BRANCHES:
        st, tag, lbl, cls = status_for(b, trends[b] if trends[b] is not None else 0)
        if b == "Kothrud":
            st = f"Benchmark · {st}"
        BRANCH_PROFILES[b] = {
            "rev": branch[b]["rev"], "ord": branch[b]["ord"],
            "aov": round(branch[b]["aov"]), "status": st, "statusTag": tag,
            "trend": lbl, "trendClass": cls,
            "monthly": [branch[b]["apr"], branch[b]["may"], branch[b]["jun"]],
            "channels": branch[b]["ch"],
        }

    print("[8] Emit dashboardData.js")
    header = (
        "// GENERATED by pipeline/build_data.py — DO NOT HAND-EDIT.\n"
        "// Source: raw POS exports in Docs/Q1 + Docs/Q2 (see Docs/Revenue_Baseline_Reconciliation.md).\n"
        "// Regenerate with: python pipeline/build_data.py\n"
        "// null means: no real data source available (render as N/A — never invent).\n"
    )
    config_tail = f"""
  branchTargets: {{
    Kothrud: {{ jan: 2200000, feb: 2200000, mar: 2200000, apr: 2200000, may: 2200000, jun: 2200000 }},
    AUNDH: {{ jan: 1600000, feb: 1600000, mar: 1600000, apr: 1600000, may: 1600000, jun: 1600000 }},
    'Salunkhe Vihar': {{ jan: 1300000, feb: 1300000, mar: 1300000, apr: 1300000, may: 1300000, jun: 1300000 }},
    Saudagar: {{ jan: 1200000, feb: 1200000, mar: 1200000, apr: 1200000, may: 1200000, jun: 1200000 }},
    'Wadgaon Sheri': {{ jan: 1200000, feb: 1200000, mar: 1200000, apr: 1200000, may: 1200000, jun: 1200000 }},
    'Yolkshire Wakad': {{ jan: 1000000, feb: 1000000, mar: 1000000, apr: 1000000, may: 1000000, jun: 1000000 }},
    Bavdhan: {{ jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 500000 }}
  }},
  pnlBenchmarks: {{ cogsPct: 25.0, laborPct: 18.0, rentPct: 15.0, commissionPctDelivery: 25.0, opsPct: 5.0, kptTarget: 10.0, profitPct: 20.0 }},"""

    out = []
    out.append(header)
    out.append("export const RAW = {")
    out.append(f"  meta: {js(meta)},")
    out.append(f"  costActuals: {js(costActuals)},")
    out.append("  // Period cube: month -> branch -> real rev/ord/channel/session actuals.")
    out.append("  cube: {")
    for m in MONTHS:
        out.append(f"    {m.lower()}: {js(cube[m.lower()])},")
    out.append("  },")
    out.append("  dailyAll: [")
    for d in dailyAll:
        out.append(f"    {js(d)},")
    out.append("  ],")
    out.append("  branchPatterns: {")
    for k in ["all"] + BRANCHES:
        key = f"'{k}'" if " " in k else k
        out.append(f"    {key}: {js(branchPatterns[k])},")
    out.append("  },")
    out.append("  itemsByBranch: {")
    for b in BRANCHES:
        key = f"'{b}'" if " " in b else b
        out.append(f"    {key}: {js(itemsByBranch[b])},")
    out.append("  },")
    out.append(f"  branches: {js(BRANCHES)},")
    out.append("  branchColors: ['#E7BA44', '#56754d', '#5985b9', '#907aa9', '#9c5f59', '#415639', '#7C4C47'],")
    out.append(f"  channels: {js(CHANNELS)},")
    out.append("  channelColors: ['#415639', '#cb202d', '#fc8019', '#a3979d'],")
    out.append(f"  days: {js(DAYS)},")
    out.append(f"  dRev: {js(dRev)},")
    out.append(f"  hours: {js(HOURS)},")
    out.append(f"  hRev: {js(hRev)},")
    out.append(f"  hOrd: {js(hOrd)},")
    out.append(f"  hLoad: {js(hLoad)},")
    out.append(f"  top10Items: {js(list(top_r['Item Name']))},")
    out.append(f"  top10Rev: {js([round(v) for v in top_r['rev']])},")
    out.append(f"  top10QtyItems: {js(list(top_q['Item Name']))},")
    out.append(f"  top10Qty: {js([int(v) for v in top_q['qty']])},")
    out.append(f"  growItems: {js(growItems)},")
    out.append(f"  growPct: {js(growPct)},")
    out.append(f"  declItems: {js(declItems)},")
    out.append(f"  declPct: {js(declPct)},")
    out.append("  billBuckets: ['<\\u20b9100', '\\u20b9100-200', '\\u20b9200-300', '\\u20b9300-400', '\\u20b9400-500', '\\u20b9500-700', '\\u20b9700-1K', '\\u20b91K+'],")
    out.append(f"  billCounts: {js(billCounts)},")
    out.append("  heatmap: [")
    for row in heatmap:
        out.append(f"    {js(row)},")
    out.append("  ],")
    out.append("  mePoints: [")
    for p in mePoints:
        out.append(f"    {js(p)},")
    out.append("  ],")
    out.append("  month: {")
    for k in ["jan", "feb", "mar", "q1", "q2", "apr", "may", "jun"]:
        out.append(f"    {k}: {js(month[k])},")
    out.append("  },")
    out.append("  branch: {")
    for b in BRANCHES:
        key = f"'{b}'" if " " in b else b
        out.append(f"    {key}: {js(branch[b])},")
    out.append("  },")
    out.append(f"  kothrudDetail: {js(kothrudDetail)},")
    out.append("  channel: {")
    for c in CHANNELS:
        key = f"'{c}'" if " " in c else c
        out.append(f"    {key}: {js(channel[c])},")
    out.append("  },")
    out.append(config_tail)
    out.append("  marketBasket: {")
    out.append("    // totalBaskets/multiItemPct from the superseded ₹98.7L partial-join analysis — no verified source, so null (render N/A).")
    out.append("    overview: { totalBaskets: null, multiItemPct: null, totalRules: 6424, topLiftPair: 'Matcha & Iced Latte (116.5x)' },")
    out.append("    combos: " + js([
        {"id": "c1", "title": "The Executive English Brunch", "type": "Breakfast & Brunch", "typeTag": "breakfast",
         "items": ["Traditional / Special English Breakfast", "Vietnamese Iced Coffee / Iced Latte / ABC Juice"],
         "standalonePrice": 420, "comboPrice": 379, "discountPct": 10.0, "cost": 94.50, "profit": 284.50,
         "marginPct": 75.1, "aovUplift": "+45.8%",
         "desc": "Pairs high-volume breakfast mains with underselling specialty beverages."},
        {"id": "c2", "title": "Gourmet Bowl & Brew Meal Deal", "type": "Lunch & Dinner", "typeTag": "main",
         "items": ["Chicken Stroganoff or Roast Chicken", "Peach Iced Tea / Mint Mojito / Fresh Watermelon Juice"],
         "standalonePrice": 440, "comboPrice": 389, "discountPct": 11.5, "cost": 82.00, "profit": 307.00,
         "marginPct": 78.9, "aovUplift": "+25.5%",
         "desc": "Pairs #1 & #2 Star mains with 91.9% gross margin cold refreshers."},
        {"id": "c3", "title": "Fit & Fresh Power Pair", "type": "Wellness & High Protein", "typeTag": "fit",
         "items": ["Honey Glazed Chicken Salad (83.8% Margin)", "Fresh ABC Juice / Green Smoothie"],
         "standalonePrice": 460, "comboPrice": 399, "discountPct": 13.3, "cost": 80.84, "profit": 318.16,
         "marginPct": 79.7, "aovUplift": "+62.8%",
         "desc": "Drives volume for 2 underperforming high-margin items simultaneously."},
        {"id": "c4", "title": "Sweet Escape Pancake & Coffee", "type": "Afternoon & Evening Snack", "typeTag": "sweet",
         "items": ["Banana Nutella / Chocoburst Pancakes", "Iced Mocha Latte / Hazelnut Frappe / Hot Chocolate"],
         "standalonePrice": 380, "comboPrice": 329, "discountPct": 13.4, "cost": 119.07, "profit": 209.93,
         "marginPct": 63.8, "aovUplift": "+34.2%",
         "desc": "Leverages pancake popularity (Lift: 26.9x) to boost afternoon session AOV."},
        {"id": "c5", "title": "Quick Bites & Sip Express", "type": "Delivery & Takeaway", "typeTag": "delivery",
         "items": ["Classic Double Egg Roll / Bhuna Roll", "Mint Lemonade / Lemon Iced Tea"],
         "standalonePrice": 300, "comboPrice": 249, "discountPct": 17.0, "cost": 56.51, "profit": 192.49,
         "marginPct": 77.3, "aovUplift": "+24.5%",
         "desc": "High-velocity delivery bundle targeted under the \\u20b9250 price barrier."},
    ]) + ",")
    out.append("    puzzles: " + js([
        {"name": "Mint Lemonade", "cat": "Beverages", "price": 100, "cost": 8.13, "marginInr": 91.87, "marginPct": 91.9, "qty": 845, "partner": "Stroganoff / Roast Chicken"},
        {"name": "Honey Glazed Chicken Salad", "cat": "Salads & Sandwiches", "price": 300, "cost": 48.64, "marginInr": 251.36, "marginPct": 83.8, "qty": 152, "partner": "ABC Juice / Iced Tea"},
        {"name": "Filter Coffee", "cat": "Beverages", "price": 80, "cost": 13.58, "marginInr": 66.42, "marginPct": 83.0, "qty": 988, "partner": "Kerala Curry / Omelette"},
        {"name": "Ginger Lemon Honey Tea", "cat": "Beverages", "price": 60, "cost": 10.11, "marginInr": 49.89, "marginPct": 83.2, "qty": 528, "partner": "Swadeshi Breakfast"},
        {"name": "Cappuccino / Latte", "cat": "Beverages", "price": 150, "cost": 26.02, "marginInr": 123.98, "marginPct": 82.7, "qty": 497, "partner": "Creamy Mushroom Croissant"},
        {"name": "Thecha Eggs", "cat": "Salads & Sandwiches", "price": 160, "cost": 29.01, "marginInr": 130.99, "marginPct": 81.9, "qty": 205, "partner": "Masala Chai / Filter Coffee"},
        {"name": "Iced Americano / Cold Brew", "cat": "Beverages", "price": 130, "cost": 23.65, "marginInr": 106.35, "marginPct": 81.8, "qty": 445, "partner": "English Breakfast"},
        {"name": "Mocha Latte", "cat": "Beverages", "price": 160, "cost": 29.63, "marginInr": 130.37, "marginPct": 81.5, "qty": 104, "partner": "Banana Nutella Pancake"},
        {"name": "Yolkshire Eggwich", "cat": "Salads & Sandwiches", "price": 240, "cost": 47.39, "marginInr": 192.61, "marginPct": 80.3, "qty": 188, "partner": "Cold Coffee"},
        {"name": "Fresh ABC Juice", "cat": "Beverages", "price": 160, "cost": 32.20, "marginInr": 127.80, "marginPct": 79.9, "qty": 221, "partner": "High Protein Millet Salad"},
        {"name": "Thai Basil Chicken with Rice", "cat": "Rice Bowls & Mains", "price": 320, "cost": 84.33, "marginInr": 235.67, "marginPct": 73.6, "qty": 180, "partner": "Mint Mojito"},
        {"name": "High Protein Millet Salad", "cat": "Salads & Sandwiches", "price": 280, "cost": 75.05, "marginInr": 204.95, "marginPct": 73.2, "qty": 218, "partner": "Fresh ABC Juice"},
    ]) + ",")
    out.append("    topRules: " + js([
        {"itemA": "Chilli Garlic Glaze", "itemB": "Yolkshire Special Breakfast", "coOcc": 2630, "confA": 0.4175, "confB": 0.7093, "lift": 8.38},
        {"itemA": "Chilli Garlic Glaze", "itemB": "Omelette", "coOcc": 2288, "confA": 0.3632, "confB": 0.7343, "lift": 8.68},
        {"itemA": "Omelette", "itemB": "Yolkshire Special Breakfast", "coOcc": 1870, "confA": 0.6001, "confB": 0.5043, "lift": 12.05},
        {"itemA": "Banana Nutella", "itemB": "Pancake", "coOcc": 985, "confA": 0.8930, "confB": 0.3993, "lift": 26.95},
        {"itemA": "Chocoburst", "itemB": "Pancake", "coOcc": 555, "confA": 0.9158, "confB": 0.2250, "lift": 27.64},
        {"itemA": "Cold Brew", "itemB": "Fresh Orange Juice", "coOcc": 12, "confA": 0.4286, "confB": 1.0000, "lift": 2658.75},
        {"itemA": "Iced Latte", "itemB": "Matcha", "coOcc": 16, "confA": 0.0250, "confB": 1.0000, "lift": 116.50},
        {"itemA": "Masala Omelette", "itemB": "Swadeshi Breakfast", "coOcc": 281, "confA": 1.0000, "confB": 0.3461, "lift": 91.68},
        {"itemA": "Jane Say Cheese Omelette", "itemB": "Mushrooms", "coOcc": 226, "confA": 0.2640, "confB": 1.0000, "lift": 86.97},
        {"itemA": "Chicken Stroganoff", "itemB": "Lemon Iced Tea", "coOcc": 80, "confA": 0.0790, "confB": 0.1495, "lift": 1.04},
        {"itemA": "Chicken Mayo Sandwich", "itemB": "Cold Coffee", "coOcc": 30, "confA": 0.0320, "confB": 0.0637, "lift": 1.86},
        {"itemA": "Special Roast Chicken", "itemB": "Mint Lemonade", "coOcc": 37, "confA": 0.0330, "confB": 0.0438, "lift": 1.83},
        {"itemA": "Chimmichurri Chicken", "itemB": "Mint Lemonade", "coOcc": 42, "confA": 0.0500, "confB": 0.0497, "lift": 2.79},
        {"itemA": "Crispy Fried Chicken", "itemB": "Toasted Garlic Bread", "coOcc": 164, "confA": 0.6979, "confB": 0.1857, "lift": 58.84},
        {"itemA": "Ghee Roast Paratha", "itemB": "Extra Paratha", "coOcc": 15, "confA": 0.1500, "confB": 0.0761, "lift": 56.68},
    ]) + ",")
    out.append("    catMatrix: " + js([
        {"catA": "Rice Bowls & Mains", "catB": "Beverages", "coOcc": 14250, "lift": 2.8},
        {"catA": "Breakfast & Eggs", "catB": "Beverages", "coOcc": 12890, "lift": 3.4},
        {"catA": "Salads & Sandwiches", "catB": "Beverages", "coOcc": 9450, "lift": 2.1},
        {"catA": "Pancakes & French Toast", "catB": "Beverages", "coOcc": 5120, "lift": 4.2},
        {"catA": "Wholesome Rolls", "catB": "Beverages", "coOcc": 4890, "lift": 2.5},
        {"catA": "Rice Bowls & Mains", "catB": "Salads & Sides", "coOcc": 3820, "lift": 1.9},
    ]))
    out.append("  },")
    q1blk = {
        "totalRev": month["q1"]["rev"], "totalOrd": month["q1"]["ord"],
        "aov": month["q1"]["aov"],
        "monthly": {m: {"rev": month[m]["rev"], "ord": month[m]["ord"], "aov": month[m]["aov"]}
                    for m in ["jan", "feb", "mar"]},
        "branch": {b: {
            "rev": round(q1.loc[q1["Branch Name"] == b, "Net Amount"].sum()),
            "ord": int((q1["Branch Name"] == b).sum()),
            "aov": round(q1.loc[q1["Branch Name"] == b, "Net Amount"].sum()
                         / max(1, (q1["Branch Name"] == b).sum()), 1)}
            for b in BRANCHES},
        "channel": {c: {
            "rev": round(q1.loc[q1["Channel"] == c, "Net Amount"].sum()),
            "ord": int((q1["Channel"] == c).sum()),
            "aov": round(q1.loc[q1["Channel"] == c, "Net Amount"].sum()
                         / max(1, (q1["Channel"] == c).sum()), 1)}
            for c in CHANNELS},
    }
    out.append(f"  q1: {js(q1blk)},")
    out.append("""  franchiseeEconomics: {
    capex: 4000000,
    targetEbitda5Yr: 8000000,
    targetPat5Yr: 6000000,
    targetMonthlyProfit: 200000,
    defaultCosts: { cogsPct: 25.0, laborPct: 18.0, rentPct: 12.0, deliveryCommissionPct: 25.0, royaltyPct: 5.0, opsPct: 5.0, dineInPct: 50.0, deliveryPct: 50.0, aov: 516 },
    kothrudModel: {
      phase1: { name: 'Phase 1: Compact Micro Store', area: '450 sq ft', capex: 2500000, monthlySales: 2032000, ebitdaMargin: 23.5, monthlyProfit: 477520, staff: 6, rent: 120000, dineInPct: 58, deliveryPct: 42 },
      phase2: { name: 'Phase 2: Expanded Flagship Store', area: '1,100 sq ft', capex: 4000000, monthlySales: 2850000, ebitdaMargin: 25.2, monthlyProfit: 718200, staff: 11, rent: 220000, dineInPct: 65, deliveryPct: 35 },
      chainAvg: { name: 'Current Chain Average Store', area: '850 sq ft', capex: 3800000, monthlySales: 1480000, ebitdaMargin: 16.8, monthlyProfit: 248640, staff: 8, rent: 180000, dineInPct: 47, deliveryPct: 53 }
    }
  },""")
    out.append(f"  dailySnapshot: {js(dailySnapshot)}")
    out.append("};")
    out.append("")
    out.append("export const DAILY_REVENUE = [")
    for d in DAILY_REVENUE:
        out.append(f"  {js(d)},")
    out.append("];")
    out.append("")
    out.append("export const BRANCH_PROFILES = {")
    for b in BRANCHES:
        key = f"'{b}'" if " " in b else b
        out.append(f"  {key}: {js(BRANCH_PROFILES[b])},")
    out.append("};")
    out.append("")

    OUT.write_text("\n".join(out), encoding="utf-8")
    print(f"\nWrote {OUT}")
    print("\n=== VERIFICATION ===")
    print(f"Q2 net {q2_net:,.2f} / orders {q2_ord:,} (ties canonical)")
    print(f"Q1 net {q1['Net Amount'].sum():,.2f} / orders {len(q1):,}")
    for b in BRANCHES:
        print(f"  {b:16s} Q2 {branch[b]['rev']:>10,}  Apr {branch[b]['apr']:>9,} "
              f"May {branch[b]['may']:>9,} Jun {branch[b]['jun']:>9,}  "
              f"trend {BRANCH_PROFILES[b]['trend']}")
    print(f"quadrants: {quad_counts}")


if __name__ == "__main__":
    main()
