# Metrics

## North Star Metric

**Qualified leads generated per week** (defined as: email captured where audit showed ≥$100/month in identified savings).

**Why this metric:**

SpendLens is a lead-generation tool for Credex. The audit is the value delivery. But not every audit represents a monetizable opportunity — someone with $12/month in savings is not a Credex customer. The North Star has to track leads that can plausibly convert to Credex revenue: teams overspending meaningfully, who trusted the tool enough to give an email.

"Weekly qualified leads" is right-sized for the product's usage pattern. Most teams audit once per quarter at most — daily active users is a wrong metric for a tool people use quarterly. Weekly qualified leads captures the business outcome without penalizing the product for low repeat usage frequency.

---

## 3 Input Metrics

**1. Audit completion rate**
`(audits submitted) / (audit pages opened)`

If users land on /audit and drop off before submitting, the form is too complex or the tool selection is confusing. Target: >60%. Below 40% → investigate drop-off point in tool selection flow.

**2. Email capture rate (post-audit)**
`(emails captured) / (audits completed)`

Value-before-email gate works only if the result page is compelling enough that users want the report. Target: 12–20%. Below 10% → results page is not delivering a "wow" moment, or the email ask copy is too generic.

**3. High-savings rate**
`(audits with ≥$500/mo identified) / (audits completed)`

This measures whether the tool is reaching the right teams. If high-savings rate is low, either teams are already well-optimized (unlikely at scale) or the tool isn't reaching teams with large-enough stacks. Target: 8–15% of audits.

---

## What to Instrument First

1. **Funnel events:** `audit_started`, `audit_submitted`, `email_captured`, `share_url_copied`, `credex_cta_clicked`. Fire these as simple fetch calls to a `/events` table in Supabase or a Plausible custom event. No analytics vendor needed initially.

2. **Savings distribution histogram:** What's the median identified savings? What's the 90th percentile? This tells you whether the audit logic is calibrated correctly and whether you're reaching the right teams.

3. **Tool selection frequency:** Which tools appear most often in audits? Cursor and Copilot together in the same audit is the highest-savings scenario — flag this combination explicitly.

---

## Pivot Trigger

**If email capture rate falls below 8% for 3 consecutive weeks after 200+ audits/week:** the results page isn't delivering enough value to earn the email. This is a signal to either (a) improve the audit logic's specificity, or (b) move the shareable URL above the email gate — let sharing replace email as the primary virality mechanism.

**If audit completion rate falls below 35%:** the form is too long or the tool selection is confusing. Simplify to a 3-question quick-audit (biggest tool, team size, use case) with detailed inputs as optional.

**If Credex CTA clicks generate 0 consultation bookings in 4 weeks:** the CTA copy or timing is wrong. Try surfacing the consultation offer via email follow-up 24 hours after the audit rather than immediately on the results page — intent may be higher after the user has had time to process the numbers.
