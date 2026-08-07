# Loyalty / Membership API Contract (v0 draft)

**Purpose:** feed the platform's repeat-visit metrics — the key *replicable* driver in the Kothrud Gap model ("location → repeat visits" hypothesis becomes testable per outlet). You build the endpoints on the loyalty/membership systems you own; the platform consumes them.

## Transport
- HTTPS JSON. Read-only. Auth: `Authorization: Bearer <token>` (any scheme you prefer — the platform stores one token in config).
- CORS: allow the dashboard origin (Cloudflare Pages URL + localhost:3000 for dev).
- All money in ₹ integers, all dates `YYYY-MM-DD`, outlet names = **POS branch names** (Kothrud, AUNDH, Salunkhe Vihar, Saudagar, Wadgaon Sheri, Yolkshire Wakad, Bavdhan).

## Endpoint 1 — monthly summary (minimum viable)
`GET /api/loyalty/summary?from=2026-07-01&to=2026-07-31`

```json
{
  "period": { "from": "2026-07-01", "to": "2026-07-31" },
  "outlets": [
    {
      "outlet": "Kothrud",
      "newSignups": 0,
      "activeMembers": 0,
      "loyaltyOrders": 0,
      "loyaltyRevenue": 0,
      "pointsIssued": 0,
      "pointsRedeemed": 0,
      "repeatCustomers": 0,
      "totalIdentifiedCustomers": 0
    }
  ]
}
```

`repeatCustomers / totalIdentifiedCustomers` per outlet is the number the Kothrud Gap board needs most — it converts the "repeat visits" theory into a measured, comparable driver.

## Endpoint 2 — daily series (enables Home alerts)
`GET /api/loyalty/daily?from=...&to=...` → same fields per `date` per outlet.

## Platform side (already prepared)
- The Data page lists loyalty as a pending source; once an endpoint URL + token exist, the integration lands in `src/data/` alongside the upload ingestion and the Kothrud Gap board's repeat-rate column switches from N/A to live values.
- Rule inherited from the platform: any metric the API can't provide stays **N/A** — never estimated.
