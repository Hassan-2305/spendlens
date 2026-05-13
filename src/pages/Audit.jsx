import { useNavigate, useLocation } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { TOOLS, USE_CASES } from '../data/pricing.js'
import { useEffect, useState } from 'react'
import { runAudit, buildSummaryPrompt, buildFallbackSummary } from '../utils/auditEngine.js'
import { generateAiSummary, saveAudit } from '../utils/backend.js'
import { v4 as uuidv4 } from 'uuid'

const TOOL_IDS = Object.keys(TOOLS)

const defaultEntry = (toolId) => ({
  toolId,
  planId: '',
  seats: 1,
  monthlySpend: '',
  enabled: false,
})

export default function Audit() {
  const navigate = useNavigate()
  const location = useLocation()
  const [teamSize, setTeamSize] = useLocalStorage('sl_teamSize', '')
  const [useCase, setUseCase] = useLocalStorage('sl_useCase', '')
  const [entries, setEntries] = useLocalStorage('sl_entries', TOOL_IDS.map(defaultEntry))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const enabledEntries = entries.filter(e => e.enabled)

  useEffect(() => {
    if (location.state?.preSelect) {
      const toolName = location.state.preSelect
      const toolId = TOOL_IDS.find(id => TOOLS[id].name.toLowerCase() === toolName.toLowerCase())
      if (toolId) {
        toggleTool(toolId)
      }
      // Clear state so it doesn't re-select on refresh
      window.history.replaceState({}, document.title)
    }
  }, [])

  function updateEntry(toolId, field, value) {
    setEntries(prev => prev.map(e => e.toolId === toolId ? { ...e, [field]: value } : e))
  }

  function toggleTool(toolId) {
    setEntries(prev => prev.map(e => {
      if (e.toolId !== toolId) return e
      if (e.enabled) return defaultEntry(toolId)
      return { ...e, enabled: true }
    }))
  }

  async function handleSubmit() {
    if (!teamSize || !useCase) {
      setError('Set team size and use case first.')
      return
    }
    if (enabledEntries.length === 0) {
      setError('Select at least one tool.')
      return
    }
    const incomplete = enabledEntries.find(e => !e.planId)
    if (incomplete) {
      setError(`Select a plan for ${TOOLS[incomplete.toolId].name}.`)
      return
    }
    setError('')
    setLoading(true)

    try {
      const audit = runAudit(enabledEntries, parseInt(teamSize), useCase)
      const prompt = buildSummaryPrompt(audit, teamSize, useCase)
      let summary

      try {
        summary = await generateAiSummary(prompt)
      } catch {
        summary = null
      }

      if (!summary) {
        summary = buildFallbackSummary(audit, teamSize, useCase)
      }

      const auditId = uuidv4()
      const publicData = {
        results: audit.results,
        totalMonthlySavings: audit.totalMonthlySavings,
        totalAnnualSavings: audit.totalAnnualSavings,
        teamSize: audit.teamSize,
        useCase: audit.useCase,
        generatedAt: audit.generatedAt,
        summary,
      }

      try {
        await saveAudit(auditId, audit, publicData)
      } catch {
        // Supabase not configured — continue without saving
      }

      sessionStorage.setItem('sl_audit', JSON.stringify({ ...publicData, auditId }))
      navigate('/results')
    } catch (err) {
      console.error('Audit failed:', err)
      setError('Something went wrong running the audit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD] pb-32">
      {/* Nav */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <a href="/" className="font-serif italic text-xl text-slate-800">
            Spend<span className="not-italic font-sans font-bold text-sm">Lens</span>
          </a>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest text-slate-400">Step 1 of 2</span>
            <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-slate-900 rounded-full" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl mb-4">
            <span className="heading-xl">Build your</span>{" "}
            <span className="font-extrabold tracking-[-0.04em] text-slate-900">audit.</span>
          </h1>
          <p className="text-slate-500 font-medium">Add every AI tool your team pays for. We'll do the math.</p>
        </div>

        {/* Team config */}
        <div className="card-premium p-8 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="label block mb-3">Team Size</label>
              <input
                type="number"
                min="1"
                className="input-field"
                placeholder="e.g. 8"
                value={teamSize}
                onChange={e => setTeamSize(e.target.value)}
              />
            </div>
            <div>
              <label className="label block mb-3">Primary Use Case</label>
              <div className="relative">
                <select
                  className="select-field"
                  value={useCase}
                  onChange={e => setUseCase(e.target.value)}
                >
                  <option value="">Select use case</option>
                  {USE_CASES.map(uc => (
                    <option key={uc.id} value={uc.id}>{uc.label}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tool selection */}
        <div className="label mb-6 px-1">Select your tools</div>

        <div className="space-y-4">
          {TOOL_IDS.map(toolId => {
            const tool = TOOLS[toolId]
            const entry = entries.find(e => e.toolId === toolId)
            const plans = Object.entries(tool.plans)

            return (
              <div
                key={toolId}
                className={entry.enabled ? 'card-active' : 'card-premium'}
              >
                <button
                  onClick={() => toggleTool(toolId)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 border rounded-md flex items-center justify-center transition-all ${
                      entry.enabled ? 'border-slate-900 bg-slate-900' : 'border-slate-200 bg-slate-50 group-hover:border-slate-300'
                    }`}>
                      {entry.enabled && (
                        <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className={`font-bold text-base transition-colors ${entry.enabled ? 'text-slate-900' : 'text-slate-700'}`}>
                      {tool.name}
                    </span>
                    <span className="tag border-slate-100 text-slate-400 bg-slate-50/50">{tool.category}</span>
                  </div>
                  <span className="font-mono text-sm text-slate-300 group-hover:text-slate-400 transition-colors">
                    {entry.enabled ? '−' : '+'}
                  </span>
                </button>

                {entry.enabled && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100/60">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                      <div>
                        <label className="label block mb-2">Plan</label>
                        <div className="relative">
                          <select
                            className="select-field"
                            value={entry.planId}
                            onChange={e => updateEntry(toolId, 'planId', e.target.value)}
                          >
                            <option value="">Select plan</option>
                            {plans.map(([planId, plan]) => (
                              <option key={planId} value={planId}>
                                {plan.name}{plan.price !== null ? ` — $${plan.price}${plan.perSeat ? '/seat' : ''}/mo` : ' — Custom'}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
                        </div>
                      </div>
                      <div>
                        <label className="label block mb-2">Seats</label>
                        <input
                          type="number"
                          min="1"
                          className="input-field"
                          placeholder="1"
                          value={entry.seats}
                          onChange={e => updateEntry(toolId, 'seats', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <label className="label block mb-2">Monthly Spend ($)</label>
                        <input
                          type="number"
                          min="0"
                          className="input-field"
                          placeholder="Actual bill"
                          value={entry.monthlySpend}
                          onChange={e => updateEntry(toolId, 'monthlySpend', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 px-5 py-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">!</div>
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="mt-16 flex items-center justify-between border-t border-slate-100 pt-10">
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-lg">
              {enabledEntries.length} tool{enabledEntries.length !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Selected for analysis</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="32" strokeLinecap="round"/>
                </svg>
                Analyzing Stack…
              </>
            ) : (
              <>
                Run Audit
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-0.5 transition-transform">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  )
}
