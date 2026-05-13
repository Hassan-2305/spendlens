import { TOOLS } from '../data/pricing.js';

function getEffectivePrice(tool, planId, seats) {
  const plan = tool.plans[planId];
  if (!plan || plan.price === null) return null;
  if (plan.perSeat) return plan.price * seats;
  return plan.price;
}

function auditCursor(entry) {
  const { planId, seats, monthlySpend, useCase } = entry;
  const tool = TOOLS.cursor;
  const findings = [];
  let savings = 0;

  if (planId === 'teams' && seats <= 2) {
    const proCost = 20 * seats;
    const teamCost = getEffectivePrice(tool, 'teams', seats);
    savings = teamCost - proCost;
    findings.push({
      type: 'downgrade',
      message: `Teams at $40/seat is overkill for ${seats} users. ${seats} individual Pro subscriptions cost $${proCost}/mo vs $${teamCost}/mo Teams.`,
      savings,
      action: `Switch each user to individual Pro ($20/mo each)`,
    });
  }

  if (planId === 'ultra' && seats === 1) {
    const proPlusCost = 60;
    savings = Math.max(0, monthlySpend - proPlusCost);
    if (savings > 0) {
      findings.push({
        type: 'downgrade',
        message: `Ultra ($200/mo) is for AI-infrastructure-level use. Most developers are well-served by Pro+ ($60/mo) with 3x credits.`,
        savings,
        action: `Try Pro+ for one month and track credit consumption before committing to Ultra`,
      });
    }
  }

  if ((useCase === 'writing' || useCase === 'research') && (planId === 'pro' || planId === 'pro-plus' || planId === 'ultra')) {
    findings.push({
      type: 'alternative',
      message: `Cursor is built for coding. For writing/research, Claude Pro ($20/mo) or ChatGPT Plus ($20/mo) delivers more relevant features per dollar.`,
      savings: monthlySpend - 20,
      action: `Switch primary writing tool to Claude Pro or ChatGPT Plus`,
    });
  }

  if (monthlySpend > getEffectivePrice(tool, planId, seats) * 1.1) {
    findings.push({
      type: 'overage',
      message: `Your reported spend ($${monthlySpend}/mo) exceeds the plan list price. Review overage usage — switching to "Auto" mode is unlimited and doesn't consume credits.`,
      savings: monthlySpend - getEffectivePrice(tool, planId, seats),
      action: 'Enable Auto mode as default, reserve premium model selection for complex tasks',
    });
  }

  return findings;
}

function auditCopilot(entry) {
  const { planId, seats, monthlySpend, useCase } = entry;
  const tool = TOOLS.copilot;
  const findings = [];

  if (planId === 'enterprise' && seats < 50) {
    const businessCost = 19 * seats;
    findings.push({
      type: 'downgrade',
      message: `Copilot Enterprise ($39/seat) is justified at 50+ seats with compliance requirements. At ${seats} seats, Business ($19/seat = $${businessCost}/mo) covers all practical coding needs.`,
      savings: (39 - 19) * seats,
      action: `Downgrade to Copilot Business at $19/seat`,
    });
  }

  if ((planId === 'business' || planId === 'enterprise') && seats <= 3 && useCase === 'coding') {
    findings.push({
      type: 'alternative',
      message: `For ${seats} developers, Cursor Teams ($40/seat) offers a richer model selection and agent mode at comparable cost to Copilot Business ($19/seat) with better RAG on large codebases.`,
      savings: 0,
      action: `Evaluate Cursor Teams trial — comparable cost, stronger agentic coding features`,
    });
  }

  if (planId === 'pro-plus' && seats === 1) {
    findings.push({
      type: 'downgrade',
      message: `Copilot Pro+ ($39/mo) is costly for an individual. Copilot Pro ($10/mo) covers code completion and chat for most workflows.`,
      savings: 29,
      action: `Downgrade to Copilot Pro ($10/mo)`,
    });
  }

  return findings;
}

function auditClaude(entry) {
  const { planId, seats, monthlySpend, useCase } = entry;
  const tool = TOOLS.claude;
  const findings = [];

  if ((planId === 'max-5x' || planId === 'max-20x') && useCase === 'coding') {
    const maxPrice = planId === 'max-5x' ? 100 : 200;
    findings.push({
      type: 'alternative',
      message: `Claude Max (${maxPrice}/mo) for coding is expensive when Cursor Pro ($20/mo) bundles Claude Sonnet with coding-specific features like multi-file editing and codebase context.`,
      savings: maxPrice - 20,
      action: `Use Cursor Pro for coding tasks; keep Claude Pro ($20) for writing/analysis`,
    });
  }

  if (planId === 'team-std' && seats <= 4) {
    findings.push({
      type: 'note',
      message: `Team Standard requires 5 seats minimum. For ${seats} people under that, individual Pro accounts ($20/seat = $${20 * seats}/mo) may actually be more cost-effective until you hit the 5-seat floor.`,
      savings: Math.max(0, 25 * seats - 20 * seats),
      action: `Confirm headcount — Team requires min 5 seats. Individual Pro if under that threshold.`,
    });
  }

  if (planId === 'team-prem' && useCase !== 'coding') {
    const stdCost = 25 * seats;
    const premCost = 125 * seats;
    findings.push({
      type: 'downgrade',
      message: `Team Premium ($125/seat) is primarily for teams needing Claude Code. For ${useCase} use cases, Team Standard ($25/seat = $${stdCost}/mo) covers all chat/project features at $${premCost - stdCost}/mo less.`,
      savings: premCost - stdCost,
      action: `Switch to Team Standard ($25/seat) unless developers need Claude Code`,
    });
  }

  return findings;
}

function auditChatgpt(entry) {
  const { planId, seats, monthlySpend, useCase } = entry;
  const findings = [];

  if (planId === 'pro' && monthlySpend === 200) {
    findings.push({
      type: 'downgrade',
      message: `ChatGPT Pro ($200/mo) is for power users exhausting Plus limits daily. If you're not consistently hitting Plus caps, $180/mo in savings by downgrading to Plus ($20/mo) is significant.`,
      savings: 180,
      action: `Downgrade to ChatGPT Plus ($20/mo) and monitor if you hit limits`,
    });
  }

  if (planId === 'business' && seats <= 2) {
    const plusCost = 20 * seats;
    const bizCost = 25 * seats;
    findings.push({
      type: 'downgrade',
      message: `ChatGPT Business for ${seats} users is $${bizCost}/mo. Two individual Plus subscriptions cost $${plusCost}/mo and cover the same core AI access without team overhead.`,
      savings: bizCost - plusCost,
      action: `Switch to individual Plus accounts for sub-3 person teams`,
    });
  }

  if (planId === 'plus' && useCase === 'coding' && seats === 1) {
    findings.push({
      type: 'alternative',
      message: `ChatGPT Plus ($20/mo) for coding is outperformed by Cursor Pro ($20/mo), which integrates Claude/GPT directly into your editor with multi-file context at the same price.`,
      savings: 0,
      action: `Switch to Cursor Pro for coding — same price, coding-native features`,
    });
  }

  return findings;
}

function auditGemini(entry) {
  const { planId, seats, monthlySpend, useCase } = entry;
  const findings = [];

  if (planId === 'ultra') {
    findings.push({
      type: 'downgrade',
      message: `Google AI Ultra ($249.99/mo) includes YouTube Premium, Google Home, and storage bundles. If you only need the AI, Google AI Pro ($19.99/mo) covers Gemini 3.1 Pro for standard usage.`,
      savings: 230,
      action: `Downgrade to Google AI Pro ($19.99/mo) unless you actively use bundled services`,
    });
  }

  if (planId === 'api' && useCase === 'writing') {
    findings.push({
      type: 'alternative',
      message: `Gemini API for writing workloads has comparable alternatives. Claude Sonnet 4.6 via Anthropic API ($3/MTok input) offers stronger instruction-following for content tasks.`,
      savings: 0,
      action: `Benchmark Claude Sonnet 4.6 vs Gemini 2.5 Pro on your specific writing tasks`,
    });
  }

  return findings;
}

function auditWindsurf(entry) {
  const { planId, seats, monthlySpend, useCase } = entry;
  const findings = [];

  if (planId === 'pro' && seats === 1) {
    findings.push({
      type: 'alternative',
      message: `Windsurf Pro ($15/mo) vs Cursor Pro ($20/mo): Cursor has a larger model selection and faster-growing agentic features. Worth evaluating if you're not deep in Windsurf workflows.`,
      savings: 0,
      action: `Run a 2-week Cursor Pro trial — $5/mo premium buys broader model access`,
    });
  }

  if (planId === 'teams' && seats <= 3 && useCase === 'coding') {
    const proCost = 15 * seats;
    const teamCost = 35 * seats;
    findings.push({
      type: 'downgrade',
      message: `Windsurf Teams ($35/seat) for ${seats} developers. Individual Pro accounts ($15/seat = $${proCost}/mo) cover the same AI features without team overhead.`,
      savings: teamCost - proCost,
      action: `Switch to individual Pro accounts for teams under 4`,
    });
  }

  return findings;
}

function auditApiSpend(entry, toolId) {
  const { monthlySpend, useCase, seats } = entry;
  const findings = [];

  if (monthlySpend > 0 && monthlySpend < 50) {
    findings.push({
      type: 'alternative',
      message: `Your API spend ($${monthlySpend}/mo) is below the threshold where a flat subscription beats pay-as-you-go. Claude Pro ($20) or ChatGPT Plus ($20) likely covers equivalent usage.`,
      savings: Math.max(0, monthlySpend - 20),
      action: `Switch to a flat subscription plan at $20/mo`,
    });
  }

  if (monthlySpend > 200 && useCase === 'coding') {
    findings.push({
      type: 'note',
      message: `High API spend ($${monthlySpend}/mo) on ${toolId === 'anthropic_api' ? 'Anthropic' : 'OpenAI'} API for coding. Claude Max 20x ($200/mo) or Cursor Ultra ($200/mo) may offer better economics with predictable billing.`,
      savings: 0,
      action: `Compare flat-rate Max/Ultra plans vs current API bill`,
    });
  }

  return findings;
}

export function runAudit(entries, teamSize, useCase) {
  const results = [];
  let totalSavings = 0;

  for (const entry of entries) {
    if (!entry.toolId || !entry.planId) continue;

    const tool = TOOLS[entry.toolId];
    if (!tool) continue;

    const planPrice = tool.plans[entry.planId]?.price;
    const effectivePrice = getEffectivePrice(tool, entry.planId, entry.seats || 1);
    const currentMonthly = entry.monthlySpend || effectivePrice || 0;

    let findings = [];

    switch (entry.toolId) {
      case 'cursor': findings = auditCursor({ ...entry, monthlySpend: currentMonthly, useCase }); break;
      case 'copilot': findings = auditCopilot({ ...entry, monthlySpend: currentMonthly, useCase }); break;
      case 'claude': findings = auditClaude({ ...entry, monthlySpend: currentMonthly, useCase }); break;
      case 'chatgpt': findings = auditChatgpt({ ...entry, monthlySpend: currentMonthly, useCase }); break;
      case 'gemini': findings = auditGemini({ ...entry, monthlySpend: currentMonthly, useCase }); break;
      case 'windsurf': findings = auditWindsurf({ ...entry, monthlySpend: currentMonthly, useCase }); break;
      case 'anthropic_api': findings = auditApiSpend({ ...entry, monthlySpend: currentMonthly, useCase }, 'anthropic_api'); break;
      case 'openai_api': findings = auditApiSpend({ ...entry, monthlySpend: currentMonthly, useCase }, 'openai_api'); break;
    }

    const toolSavings = findings.reduce((sum, f) => sum + (f.savings || 0), 0);
    totalSavings += toolSavings;

    const planObj = tool.plans[entry.planId];
    results.push({
      toolId: entry.toolId,
      toolName: tool.name,
      planName: planObj?.name || entry.planId,
      seats: entry.seats || 1,
      currentMonthly,
      findings,
      savings: toolSavings,
      status: findings.length === 0 ? 'optimal' : toolSavings > 0 ? 'overspending' : 'suboptimal',
    });
  }

  return {
    results,
    totalMonthlySavings: Math.max(0, totalSavings),
    totalAnnualSavings: Math.max(0, totalSavings * 12),
    teamSize,
    useCase,
    generatedAt: new Date().toISOString(),
  };
}

export function buildSummaryPrompt(audit, teamSize, useCase) {
  const toolNames = audit.results.map(r => r.toolName).join(', ');
  const savings = audit.totalMonthlySavings;
  const findings = audit.results
    .flatMap(r => r.findings)
    .map(f => f.message)
    .slice(0, 3)
    .join(' ');

  return `You are a no-nonsense CFO advisor reviewing AI tool spend for a ${teamSize}-person team whose primary use case is ${useCase}. 

They currently use: ${toolNames}.
Potential monthly savings identified: $${savings}.
Key issues: ${findings}

Write a 90-word professional summary paragraph — direct, specific, zero filler. Mention the actual dollar figure. No bullet points. No headers. One tight paragraph.`;
}

export function buildFallbackSummary(audit, teamSize, useCase) {
  if (audit.totalMonthlySavings === 0) {
    return `Your ${teamSize}-person team's AI stack for ${useCase} appears well-optimized. Current spend aligns with your plan tiers and usage patterns. The tools you've chosen match your primary use case. No immediate reductions recommended — revisit quarterly as model capabilities shift and pricing evolves across vendors.`;
  }
  return `Your ${teamSize}-person team is spending an estimated $${audit.totalMonthlySavings}/month more than necessary on AI tools. For a ${useCase}-focused team, the main opportunities are plan right-sizing and eliminating redundant tool overlap. Capturing these savings totals $${audit.totalAnnualSavings} annually — roughly ${Math.round(audit.totalAnnualSavings / (teamSize * 50000) * 100)}% of an engineer's annual tooling budget. Act on the highest-impact line items first.`;
}
