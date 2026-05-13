# Architecture

## System Diagram

```mermaid
graph TD
    A[User Browser] -->|Form input| B[/audit page]
    B -->|Persisted via localStorage| B
    B -->|On submit| C[auditEngine.js]
    C -->|Static rules + pricing data| D[Audit Result Object]
    D -->|Prompt built| E[Anthropic API]
    E -->|AI summary text| F[Results assembled]
    F -->|Stored via fetch| G[(Supabase: audits table)]
    F -->|In sessionStorage| H[/results page]
    H -->|Email capture| I[(Supabase: leads table)]
    G -->|Public read| J[/share/:id page]
```

## Data Flow

1. User selects tools, plans, seats, and monthly spend on `/audit`. State persists to `localStorage` across reloads.
2. On submit, `runAudit()` in `auditEngine.js` processes each enabled tool entry against a set of deterministic rules — checking plan fit for team size, use-case alignment, and overage patterns.
3. `buildSummaryPrompt()` formats a 150-word CFO-advisor prompt from the audit result. The Anthropic API generates a personalized paragraph. If the API call fails (network error, rate limit, 429), `buildFallbackSummary()` returns a template-filled fallback — no silent errors.
4. A UUID is generated client-side. The sanitized public data (no email, no company name) is written to Supabase's `audits` table via REST API.
5. Full audit object lands in `sessionStorage`. The router navigates to `/results`.
6. On `/results`, the lead capture form writes to `leads` table. A honeypot field (`_website`) rejects bot submissions before the Supabase write.
7. The shareable URL (`/share/:id`) reads from Supabase's `audits` table — public data only.

## Stack Rationale

- **React + Vite**: No SSR needed. Vite's HMR and cold-start speed matter on a 7-day timeline. React's component model is right-sized for this app's complexity.
- **Tailwind CSS**: Utility-first prevents CSS file proliferation on a solo sprint. Custom design tokens (ink, acid, rust, mist) enforce a cohesive palette without a design system overhead.
- **Supabase**: Postgres + REST API + Row Level Security out of the box. No backend to deploy — the anon key with RLS policies is sufficient for this traffic pattern.
- **Vitest**: Co-located with Vite, zero config, fast. The test suite runs in ~650ms.
- **React Router v6**: Client-side routing with no server configuration required for Vercel (using `vercel.json` rewrites).

## Scaling to 10k Audits/Day

At 10k audits/day the current architecture hits two bottlenecks:

1. **Anthropic API rate limits**: The summary generation call happens synchronously on the user's submit. At scale, this creates latency spikes and 429s. Fix: move summary generation to a Supabase Edge Function with a queue (pg_cron or a simple Supabase webhook trigger). Return a "summary pending" state and poll.

2. **Supabase free tier RLS performance**: At high write volume, row-level security policies add per-row evaluation overhead. Fix: move to a dedicated Postgres instance, add an index on `audits.id`, and use a service-role key in an Edge Function rather than the anon key directly from the browser.

Additional changes: add Redis caching for frequently-shared audit IDs, CDN-cache the `/share/:id` HTML shell, and instrument Datadog for p95 latency on the audit write path.
