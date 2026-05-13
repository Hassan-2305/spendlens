# Prompts

## Summary Generation Prompt

```
You are a no-nonsense CFO advisor reviewing AI tool spend for a {teamSize}-person team whose primary use case is {useCase}.

They currently use: {toolNames}.
Potential monthly savings identified: ${savings}.
Key issues: {topThreeFindings}

Write a 90-word professional summary paragraph — direct, specific, zero filler. Mention the actual dollar figure. No bullet points. No headers. One tight paragraph.
```

**Why this prompt:**

The original version I drafted was longer and included instructions like "Be empathetic" and "Acknowledge the complexity of choosing the right tools." This produced corporate-sounding, overly hedged output that felt generic. I stripped everything until the only instruction was tone (no-nonsense CFO) and format (one paragraph, 90 words, mention the dollar figure). Specificity in the persona produces more specific output.

I also tried using `system` vs `user` roles for the persona instruction. Both produced similar results with Sonnet 4.6, so I kept it simple as a single user message.

**What didn't work:**

- "Write a summary of the audit" → vague output that recited bullet points verbatim
- Adding chain-of-thought instruction ("First, consider...") → inflated word count with no quality gain
- Asking for "recommendations" in the summary → the summary duplicated the per-tool findings, making it redundant. Changed to framing it as an executive overview that connects findings to business impact.

**Failure handling:**

If the API returns an error (any non-200, timeout, or missing content block), `buildFallbackSummary()` in `auditEngine.js` generates a template-filled paragraph from the same audit data. This ensures the results page never shows a blank summary section. The fallback is disclosed to the user only if they ask — the product experience is unchanged.

**Model choice:**

`claude-sonnet-4-20250514` — Sonnet is the right call here. The task is ~90 words of structured prose from structured inputs. Opus would be slower and more expensive for no quality gain on a templated summarization task. Haiku produces serviceable output but occasionally drops the dollar figure or misattributes the use case.
