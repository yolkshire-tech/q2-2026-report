# Project Memory & Operating Guidelines

## Core Operating Guidelines

0. **Check Memory First**: Before executing any big plan, must go through memory once to always have context and not lose sight of our purpose.
1. **Clarify Uncertainty**: If not sure, ask, don't assume.
2. **Real Data Only**: Never, ever, ever use fake data or mock data. Always use real data from sources. If not available, show `N/A`.
3. **Vite Project**: This is a Vite project, so use appropriate Vite scripts/commands (`npm run dev`, `npm run build`, etc.).
4. **Clean Architecture**: Follow Clean Architecture principles (separation of concerns, data services, state management, modular component/view layers).
5. **Version Control Discipline**: Commit after every implementation. Push only when explicitly asked.
6. **Feature Purpose & Recommendation**: Every time we add a new feature, ask why are we doing it, what purpose it will serve, and offer suggestion/recommendation/opinion on whether or not we should go ahead with it.

---

## Business Goal: What & Why of this Dashboard

1. **Franchisee ROI Target (2L Net Profit / Month)**:
   - Every franchisee invests around **₹40L** to start a new outlet.
   - In 5 years, they expect a return of around **₹80L EBITDA** (~**₹60L profit after tax**).
   - Monthly, that comes to **₹1L post-tax baseline**. Thus, our target business model must enable the franchisee to make a profit of **₹2L per month**.

2. **Backward Financial Engineering**:
   - Working backwards from the ₹2L net profit target determines:
     - Required sales volume / top-line revenue target
     - Target Food Cost Ratio
     - Target Manpower Ratio & Operating Expenses

3. **Kothrud Model Replication**:
   - Replicating the **Kothrud model** is one of the primary ways to achieve this target.
   - The Kothrud model proves that achieving **₹20L sales in a compact space** before expanding allows outlets to scale up and aim for significantly higher top-line sales.
   - This dashboard exercise and future menu/operational optimizations must aim to replicate the Kothrud benchmark across other branches to achieve the required top-line revenue for ₹2L monthly franchisee profit.
