const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function supabaseRequest(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured — skipping backend call');
    return { data: null, error: 'not_configured' };
  }

  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: 'return=representation',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    return { data: null, error };
  }

  const data = await res.json();
  return { data, error: null };
}

export async function saveAudit(auditId, auditData, publicData) {
  return supabaseRequest('audits', {
    method: 'POST',
    body: JSON.stringify({
      id: auditId,
      public_data: publicData,
      created_at: new Date().toISOString(),
    }),
  });
}

export async function getAudit(auditId) {
  return supabaseRequest(`audits?id=eq.${auditId}&select=public_data`);
}

export async function saveLead(leadData) {
  const honeypot = leadData._website;
  if (honeypot) return { data: null, error: 'rejected' };

  return supabaseRequest('leads', {
    method: 'POST',
    body: JSON.stringify({
      email: leadData.email,
      company: leadData.company || null,
      role: leadData.role || null,
      team_size: leadData.teamSize || null,
      monthly_savings: leadData.monthlySavings || 0,
      audit_id: leadData.auditId || null,
      created_at: new Date().toISOString(),
    }),
  });
}

export async function generateAiSummary(prompt) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.content?.[0]?.text || null;
  } catch {
    // CORS or network error — return null so fallback summary is used
    return null;
  }
}
