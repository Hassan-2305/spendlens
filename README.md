# SpendLens — AI Tool Spend Audit

SpendLens is a free, no-login web app that audits AI tool spend for startup founders and engineering managers — surfacing plan mismatches, cheaper alternatives, and exact monthly savings in under 2 minutes. It serves as a lead-generation tool for [Credex](https://credex.rocks), which sells discounted AI credits to teams that discover they're overspending.

**Live:** [spendlens.app](https://spendlens.vercel.app)

---

## Screenshots

> _(Add 3 screenshots or Loom link here before submission)_

---

## Quick Start

```bash
git clone https://github.com/yourusername/spendlens
cd spendlens
npm install
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

### Deploy (Vercel)
```bash
npm run build
vercel --prod
# Set env vars in Vercel dashboard
```

### Run Tests
```bash
npm test
```

---

## Supabase Setup

Run this SQL in your Supabase project:

```sql
create table audits (
  id uuid primary key,
  public_data jsonb not null,
  created_at timestamptz default now()
);

create table leads (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  company text,
  role text,
  team_size int,
  monthly_savings numeric,
  audit_id uuid references audits(id),
  created_at timestamptz default now()
);

alter table audits enable row level security;
alter table leads enable row level security;

create policy "audits_insert" on audits for insert to anon with check (true);
create policy "audits_select" on audits for select to anon using (true);
create policy "leads_insert" on leads for insert to anon with check (true);
```

---

## Decisions

1. **React + Vite over Next.js** — This tool has no SSR requirements. Every page that needs SEO (the share URL) can use client-side meta tag injection since it's link-preview driven, not Google-indexed. Vite's dev startup is ~10x faster than Next.js for iteration speed during a 7-day sprint. The tradeoff is dynamic OG images aren't possible without a server function; I used static OG tags with savings data injected client-side instead.

2. **Plain JS over TypeScript** — At 7-day sprint pace, TypeScript's compile-time errors slow iteration on a solo project where I hold the full mental model. The audit engine has clear function contracts enforced by test coverage instead. If this product were handed to a second developer, TypeScript would be the first refactor.

3. **Hardcoded audit rules over LLM for the math** — The spec called this out directly, but it's worth stating why: LLMs hallucinate pricing. A rules engine that cites sources is auditable, explainable, and fast. The AI summary is valuable as *presentation layer* — it personalizes tone — not as the analytical layer.

4. **Honeypot over hCaptcha for abuse protection** — hCaptcha adds a render dependency, accessibility friction, and user drop-off. A honeypot field (`_website`, hidden via CSS, not `display:none` which bots ignore) catches most automated submissions with zero UX cost. Rate limiting is handled at Supabase's RLS level.

5. **sessionStorage for audit state, localStorage for form state** — Form inputs need to survive page reloads (localStorage). The audit result only needs to survive the redirect from /audit → /results within the same session (sessionStorage), after which the shareable URL is the persistence mechanism. Mixing the two avoids stale audit results polluting a fresh session.
