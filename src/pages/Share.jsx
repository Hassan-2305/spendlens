import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAudit } from '../utils/backend.js'

const STATUS_CONFIG = {
  overspending: { label: 'Overspending', color: 'text-negative', border: 'border-negative/30', bg: 'bg-negative/5' },
  suboptimal: { label: 'Suboptimal', color: 'text-amber-600', border: 'border-amber-300', bg: 'bg-amber-50' },
  optimal: { label: 'Optimized', color: 'text-positive', border: 'border-positive/30', bg: 'bg-positive/5' },
}

export default function Share() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [audit, setAudit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await getAudit(id)
      if (error || !data || data.length === 0) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setAudit(data[0].public_data)
      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    if (!audit) return
    document.title = `SpendLens — $${audit.totalMonthlySavings}/mo savings found`
    const og = document.querySelector('meta[property="og:title"]')
    if (og) og.setAttribute('content', `AI Spend Audit — $${audit.totalAnnualSavings}/yr savings identified`)
    const desc = document.querySelector('meta[property="og:description"]')
    if (desc) desc.setAttribute('content', `This team could save $${audit.totalMonthlySavings}/month on AI tools. Run your own free audit at SpendLens.`)
  }, [audit])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <span className="font-mono text-xs text-muted animate-pulse uppercase tracking-wider">Loading audit…</span>
      </main>
    )
  }

  if (notFound) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center bg-white">
        <div className="label">404</div>
        <h1 className="heading-lg text-3xl">Audit not found</h1>
        <p className="text-dim text-sm max-w-sm">This audit link may have expired or the ID is incorrect.</p>
        <button onClick={() => navigate('/audit')} className="btn-primary">
          Run your own audit →
        </button>
      </main>
    )
  }

  const highSavings = audit.totalMonthlySavings >= 500

  return (
    <main className="min-h-screen bg-wash pb-24">
      {/* Nav */}
      <nav className="border-b border-line bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
          <a href="/" className="font-serif italic text-lg text-ink">
            Spend<span className="not-italic font-sans font-bold text-sm">Lens</span>
          </a>
          <button onClick={() => navigate('/audit')} className="btn-outline text-xs py-2 px-4">
            Run my audit →
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-16">
        <div className="label mb-4">Shared audit result</div>

        {/* Savings */}
        <div className="frame mb-12">
          <div className="frame-header">
            <div className="dot dot-red" />
            <div className="dot dot-yellow" />
            <div className="dot dot-green" />
            <span className="font-mono text-[10px] text-muted ml-2">audit_result.json</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-line">
            <div className="p-8">
              <div className="label mb-2">Monthly savings</div>
              <div className="heading-xl text-5xl text-accent">${audit.totalMonthlySavings.toLocaleString()}</div>
            </div>
            <div className="p-8">
              <div className="label mb-2">Annual savings</div>
              <div className="heading-xl text-5xl text-ink/60">${audit.totalAnnualSavings.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-12 frame border-l-2 border-l-accent p-6">
          <p className="text-sm leading-relaxed text-ink/80">{audit.summary}</p>
        </div>

        {/* Tools */}
        <div className="mb-12 space-y-3">
          {audit.results.map(result => {
            const cfg = STATUS_CONFIG[result.status]
            return (
              <div key={result.toolId} className="frame">
                <div className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="font-bold text-sm text-ink">{result.toolName}</h3>
                    <div className="font-mono text-xs text-muted mt-0.5">
                      {result.planName} · {result.seats} seat{result.seats !== 1 ? 's' : ''}
                      {result.savings > 0 && (
                        <span className="text-accent font-bold ml-3">−${result.savings}/mo potential</span>
                      )}
                    </div>
                  </div>
                  <span className={`tag ${cfg.border} ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                </div>
                {result.findings.length > 0 && (
                  <div className="border-t border-line px-5 py-4">
                    <ul className="space-y-2">
                      {result.findings.map((f, i) => (
                        <li key={i} className="text-sm text-dim border-l-2 border-line pl-3">
                          {f.action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="frame bg-ink text-white p-8 text-center">
          <h2 className="heading-lg text-2xl text-white mb-3">Run your own audit</h2>
          <p className="text-white/60 text-sm mb-6">Free. No login. Takes 2 minutes.</p>
          <button onClick={() => navigate('/audit')} className="inline-flex items-center gap-2 bg-white text-ink font-semibold text-sm px-6 py-3 hover:bg-white/90 transition-colors cursor-pointer">
            Start free audit →
          </button>
        </div>
      </div>
    </main>
  )
}
