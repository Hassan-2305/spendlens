# Tests

All tests live in `src/tests/auditEngine.test.js` and cover the audit engine's core logic.

## How to Run

```bash
npm test
# or
npx vitest run
```

Tests run in ~650ms with no external dependencies or API calls.

---

## Test Coverage

| # | Test Name | What It Covers |
|---|-----------|----------------|
| 1 | flags Teams plan for single-user Cursor as overspending | Cursor Teams ($40/seat) for 1 user should flag savings vs Pro ($20) |
| 2 | flags Teams plan for 2-seat Cursor as overspending vs individual Pro | 2-user Teams ($80/mo) should flag ≥$40 savings over 2x Pro ($40/mo) |
| 3 | marks optimal Cursor Pro for single developer as no findings | Cursor Pro for 1 developer is right-sized — no findings, status = optimal |
| 4 | flags Copilot Enterprise under 50 seats as overspending vs Business | 10 Enterprise seats ($390/mo) vs Business ($190/mo) → $200/mo savings |
| 5 | flags Claude Team Premium for non-coding use case | Team Premium ($125/seat) for writing use case should flag downgrade to Team Standard ($25/seat) |
| 6 | correctly totals monthly and annual savings across multiple tools | Multi-tool audit: total savings and annual (×12) computed correctly |
| 7 | returns zero savings for already-optimal small stack | Copilot Pro for 1 user is optimal — totalMonthlySavings === 0 |
| 8 | fallback summary includes savings amount when nonzero | buildFallbackSummary includes the $200 and $2400 figures |
| 9 | fallback summary says well-optimized when savings is zero | Zero-savings fallback contains "optimized" |
| 10 | API spend under $50 gets subscription recommendation | Anthropic API at $30/mo → alternative finding recommending flat subscription |
