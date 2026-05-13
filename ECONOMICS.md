# Economics

## What a Converted Lead Is Worth to Credex

Credex's model: source discounted AI credits from overforecast buyers, sell to teams that would otherwise pay retail.

Assume:
- Average discounted credit purchase: $2,000 (a 10-person team buying 6 months of discounted Cursor Pro credits)
- Credex margin on resale: 20% (conservative — vendor-to-Credex discount is ~30-40%, minus ops cost)
- Revenue per converted customer: **$400 per transaction**
- Repeat purchases per customer per year: 2 (one initial purchase, one renewal or upsell)
- **Lifetime value (first year): $800/customer**

For enterprise deals (ChatGPT Enterprise credits for 50+ seats), a single transaction could be $15,000+ at 20% margin = $3,000/sale. One enterprise close per month would be $36,000/year in gross margin from a single customer channel.

---

## CAC by Channel

| Channel | Estimated CAC |
|---------|--------------|
| Hacker News (organic) | ~$0 direct. Cost = 2 hours to write and monitor the thread. Amortize across 1,000 visitors = effectively $0 |
| Twitter/X thread | ~$0 direct. Cost = 1 hour per thread. If 3 threads drive 300 signups, CAC ≈ $0 |
| Reddit posts | ~$0 direct. Low conversion but high signal leads. CAC ≈ $0 |
| Direct LinkedIn outreach | ~$5/lead (counting time: 30 min to identify + DM 20 people = $50 at $100/hr effective rate, convert 2 → $25/lead) |
| Paid distribution (if ever) | Not in this plan |

Average blended CAC across channels: **$2–$5/lead** (mostly time-cost, not cash).

---

## Conversion Funnel Math

```
1,000 audits completed
→ 160 email captures (16% — value shown before email gate)
→ 24 high-savings cases flagged ($500+/mo) (15% of captures, 2.4% of audits)
→ 8 Credex consultation booked (33% of high-savings cases)
→ 4 credit purchases (50% of consultations close)
→ Revenue: 4 × $400 = $1,600 gross margin per 1,000 audits
```

At $2/lead blended CAC and 16% email rate: cost to drive 1,000 audits = ~$312 in time/cost.

**Gross margin on 1,000 audits: $1,600 − $312 = $1,288**

This is positive from audit #1. The tool pays for itself immediately.

---

## Path to $1M ARR in 18 Months

Target: $1M ARR = ~$83,333/month gross margin.

At $400/converted customer and 2 transactions/year → need ~1,042 paying customers over 18 months.

Monthly new customer target: **58 new customers/month by month 18** (ramping from 5/month in month 1).

What has to be true:
1. **Audit volume scales to ~3,000/month by month 6.** This requires either: a viral share loop that makes the shareable URL a meaningful acquisition channel, or SEO traction on "AI tool cost" queries, or a corporate partnership where an investor newsletter or VC firm links the tool to portfolio companies.

2. **Consultation close rate stays ≥ 33%.** This is achievable if Credex's discounts are real (they are) and if the sales conversation happens within 48 hours of the audit (intent is highest immediately post-audit).

3. **Enterprise accounts enter the mix by month 9.** One $3,000 gross margin enterprise transaction replaces 7.5 SMB transactions. If SpendLens drives 2 enterprise closes/month by month 9, the ARR trajectory accelerates sharply.

4. **The tool itself is free to operate.** Infrastructure: Supabase free tier handles ~50k rows before any paid plan. Vercel free tier handles ~100k pageviews/month. AI summary cost: ~$0.002/audit (Sonnet 4.6 at ~500 tokens output). At 3,000 audits/month → $6/month in API costs. The tool is effectively zero marginal cost until enterprise scale.

**Conservative 18-month revenue model:**

| Month | Audits/mo | Email captures | High-savings | Closes | Gross Margin |
|-------|-----------|----------------|--------------|--------|--------------|
| 1–3 | 300 | 48 | 7 | 2 | $800 |
| 4–6 | 1,000 | 160 | 24 | 8 | $3,200 |
| 7–12 | 2,500 | 400 | 60 | 20 | $8,000/mo |
| 13–18 | 5,000 | 800 | 120 | 40 | $16,000/mo |

18-month cumulative: roughly $185,000 in gross margin from the SMB funnel alone.

To hit $1M ARR by month 18 requires 6–8 enterprise accounts in the $3,000–$5,000/transaction range per month, which is achievable if Credex's existing vendor relationships are used as distribution (the unfair channel from GTM.md).
