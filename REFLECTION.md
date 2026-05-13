# Reflection

---

## 1. The hardest bug — and how I debugged it

The hardest bug was the audit engine silently returning zero savings for Cursor Teams with 2 seats, even though the math clearly showed it should flag savings.

My first hypothesis: the `getEffectivePrice` function was returning `null` for the Teams plan, causing the comparison to fail silently. I added a `console.log` at the top of `auditCursor()` and confirmed the plan object was reaching the function correctly — price was not null.

Second hypothesis: the `savings` variable was being computed correctly but the result object's `status` field wasn't updating from the findings array. I traced the `status` assignment in `runAudit()` and found the bug: I had written `toolSavings > 0 ? 'overspending' : 'suboptimal'` but `toolSavings` was being summed from `findings.reduce()` before the findings array was fully populated. The issue was that I'd called `reduce()` on the `findings` array *before* returning it from `auditCursor()` — so at the time of the reduce, `findings` was an empty array.

The fix was to move the `toolSavings` calculation to after the `findings` array was returned from the tool-specific function, not before. Simple sequencing bug, but it masked itself because the findings array was being populated correctly — only the sum was wrong.

The test I wrote for this case (`flags Teams plan for 2-seat Cursor`) is what caught it. The test failed, I had a concrete failure point to trace, and the fix took 3 minutes once I found it.

---

## 2. A decision I reversed mid-week

My original plan was to make the audit run server-side — a Supabase Edge Function that received form data, ran the audit logic, stored the result, and returned the audit ID for the client to redirect to. I started building this on Day 3.

I reversed it by Day 4 for two reasons. First, the audit engine has zero dynamic dependencies — it's pure JavaScript with hardcoded rules against a static pricing dataset. Running it server-side added a network round-trip for something that can execute in 2ms client-side. Second, the Edge Function added a deployment dependency that could fail independently of the frontend, complicating the CI setup and the debugging loop.

What made me reverse it: I wrote the Edge Function, deployed it to Supabase, and the first call took 1.8 seconds due to cold start. The client-side version of the same logic ran in 2ms. There was no contest. The AI summary call stayed server-optional (it's the only piece that needs an external API), but the audit math moved back to the client.

---

## 3. What I'd build in week 2

Three things, in priority order:

**Dynamic OG images for share URLs.** Right now the share URL has static meta tags that say "$X/mo savings found." The viral loop would be dramatically stronger if the shared link showed a card with the actual tool breakdown — the way Spotify Wrapped generates custom share images. This needs a server-side image generator (Vercel OG functions handle this with React templates). The spec identified the share URL as the viral loop — I'd invest here first.

**Benchmark mode.** "Your team spends $340/developer/month on AI tools — similar-stage startups average $180." This requires a dataset of anonymized audit results (which the leads table starts building from day one) and a simple percentile calculation. It's a powerful retention mechanism: users who see they're above-average are more likely to share the tool with peers who might also be surprised.

**Resend transactional emails.** The lead capture form captures email but doesn't currently send a confirmation email with the full report. Resend's free tier (3,000 emails/month) is sufficient for early traction and adds the professional signal that Credex will follow up on high-savings cases.

---

## 4. How I used AI tools

I used Claude (claude.ai) throughout the week, primarily for two task types: drafting the initial structure of complex functions before I wrote the actual logic, and rubber-ducking architectural decisions when I was unsure of the tradeoff.

**What I trusted it with:** The animated number counter in Results.jsx — I described the behavior (ease-out cubic, starts from 0, reaches target in ~900ms using rAF) and it produced working code that I verified and kept. The Tailwind config color palette — I described the aesthetic direction (editorial, high-contrast, not purple-gradient-on-white) and it suggested color names I liked.

**What I didn't trust it with:** The audit engine logic. I wrote every tool-specific audit function myself after doing the pricing research. The reasoning has to be mine — if a Credex reviewer asks "why did you flag Copilot Enterprise under 50 seats?" I need to be able to explain it from the vendor docs, not from a summary an AI generated. Same for the entrepreneurial documents — those required thinking about the actual business, which can't be delegated.

**One specific time the AI was wrong:** When I asked Claude to draft the Supabase RLS policies, it generated a policy that used `auth.uid()` for the insert check — which assumes authenticated users. The app has no authentication. The correct policy for anonymous inserts is `with check (true)`. I caught this because the Supabase dashboard showed a policy evaluation error on the first test insert. The AI was generating a pattern from authenticated app context that didn't apply here.

---

## 5. Self-ratings

**Discipline: 7/10.** I started Day 1 with a clear plan and executed against it, but I lost about half a day on the server-side audit detour that I ultimately reversed — that's a discipline failure, not just a technical one.

**Code quality: 7/10.** The audit engine is clean and testable. The UI components are functional but could be decomposed further — Results.jsx in particular is doing too much. I'd extract the lead capture form and the per-tool card into separate components with a clear interface.

**Design sense: 8/10.** The aesthetic is intentional and consistent. The choice to go editorial/dark with acid green as the sole accent color is defensible — it reads as "finance tool," not "AI startup." The animated number counter is the one interaction that makes the product feel alive.

**Problem solving: 8/10.** The audit engine sequencing bug was found quickly because I had tests. The decision to move audit logic client-side was made with actual data (1.8s cold start vs 2ms local). Both are examples of evidence-based debugging rather than intuition-driven flailing.

**Entrepreneurial thinking: 7/10.** The GTM plan is specific and grounded in how founders actually discover tools. The economics section has real numbers. The user interviews were real conversations. Where I fell short: I didn't ship the benchmark mode or the embeddable widget, both of which would meaningfully expand the tool's distribution.
