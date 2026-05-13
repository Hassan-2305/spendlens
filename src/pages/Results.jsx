import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveLead } from '../utils/backend.js'

const STATUS_CONFIG = {
  overspending: { label: 'Overspending', color: 'text-red-600', border: 'border-red-100', bg: 'bg-red-50/50' },
  suboptimal: { label: 'Suboptimal', color: 'text-amber-600', border: 'border-amber-100', bg: 'bg-amber-50/50' },
  optimal: { label: 'Optimized', color: 'text-green-600', border: 'border-green-100', bg: 'bg-green-50/50' },
}

const FINDING_TYPE_LABEL = {
  downgrade: 'Downgrade available',
  alternative: 'Better alternative',
  overage: 'Overage detected',
  note: 'Worth reviewing',
}

function AnimatedNumber({ value, prefix = '' }) {
  const [display, setDisplay] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    const start = Date.now()
    const duration = 1000
    const from = 0
    const to = value

    const step = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 4) // Ququart ease
      setDisplay(Math.round(from + (to - from) * ease))
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }

    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [value])

  return <span>{prefix}{display.toLocaleString()}</span>
}

export default function Results() {
  const navigate = useNavigate()
  const [audit, setAudit] = useState(null)
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [leadError, setLeadError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('sl_audit')
    if (!raw) { navigate('/audit'); return }
    setAudit(JSON.parse(raw))
  }, [navigate])

  if (!audit) return null

  const highSavings = audit.totalMonthlySavings >= 500
  const lowSavings = audit.totalMonthlySavings < 100
  const shareUrl = `${window.location.origin}/share/${audit.auditId}`

  async function handleLeadSubmit() {
    if (!email || !email.includes('@')) {
      setLeadError('Valid email required.')
      return
    }
    setLeadError('')
    setSubmitting(true)

    const result = await saveLead({
      email,
      company,
      role,
      teamSize: audit.teamSize,
      monthlySavings: audit.totalMonthlySavings,
      auditId: audit.auditId,
      _website: honeypot,
    })

    setSubmitting(false)
    if (result.error && result.error !== 'not_configured') {
      setLeadError('Something went wrong. Try again.')
      return
    }
    setSubmitted(true)
  }

  function copyShareUrl() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD] pb-32">
      {/* Nav */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <a href="/" className="font-serif italic text-xl text-slate-800">
            Spend<span className="not-italic font-sans font-bold text-sm">Lens</span>
          </a>
          <button
            onClick={() => navigate('/audit')}
            className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2"
          >
            ← <span className="mt-0.5">Edit stack</span>
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-20">

        {/* Savings hero */}
        <div className="mb-20">
          <div className="label mb-4 opacity-60">Audit complete</div>

          <div className="card-premium overflow-hidden">
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100`}>
              <div className="p-10">
                <div className="label mb-4 text-slate-400">Monthly savings identified</div>
                <div className="heading-xl text-7xl sm:text-8xl text-green-600">
                  $<AnimatedNumber value={audit.totalMonthlySavings} />
                </div>
              </div>
              <div className="p-10">
                <div className="label mb-4 text-slate-400">Total annual impact</div>
                <div className="heading-xl text-7xl sm:text-8xl text-slate-900/10">
                  $<AnimatedNumber value={audit.totalAnnualSavings} />
                </div>
              </div>
            </div>
          </div>

          {lowSavings && audit.totalMonthlySavings === 0 && (
            <div className="mt-6 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <p className="text-sm text-slate-500 font-medium">
                Your stack looks well-optimized. No significant savings identified for your team size and use case.
              </p>
            </div>
          )}
        </div>

        {/* AI Summary */}
        <div className="mb-16">
          <div className="label mb-4 opacity-60">Executive Summary</div>
          <div className="card-premium border-l-4 border-l-slate-900 p-8">
            <p className="text-lg leading-relaxed text-slate-800 font-medium italic">
              "{audit.summary}"
            </p>
          </div>
        </div>

        {/* Per-tool breakdown */}
        <div className="mb-20">
          <div className="label mb-6 opacity-60">Per-tool breakdown</div>
          <div className="space-y-4">
            {audit.results.map(result => {
              const cfg = STATUS_CONFIG[result.status]
              return (
                <div key={result.toolId} className="card-premium group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-8">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{result.toolName}</h3>
                      <div className="data-mono mt-1">
                        {result.planName} · {result.seats} seat{result.seats !== 1 ? 's' : ''} · ${Number(result.currentMonthly || 0).toFixed(0)}/mo
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                      {result.savings > 0 && (
                        <span className="font-serif italic text-2xl text-green-600">−${result.savings}/mo</span>
                      )}
                      <span className={`tag ${cfg.border} ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    </div>
                  </div>

                  {result.findings.length > 0 && (
                    <div className="border-t border-slate-50 px-8 py-6 bg-slate-50/30 space-y-4">
                      {result.findings.map((f, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-1 h-auto bg-slate-200 rounded-full shrink-0" />
                          <div>
                            <div className="data-mono mb-1 text-slate-400">
                              {FINDING_TYPE_LABEL[f.type] || f.type}
                            </div>
                            <p className="text-sm text-slate-700 font-medium mb-1">{f.message}</p>
                            <p className="text-sm text-green-600 font-bold tracking-tight">→ {f.action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.findings.length === 0 && (
                    <div className="border-t border-slate-50 px-8 py-4">
                      <p className="text-sm text-slate-400 font-medium">This tool is correctly right-sized.</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Credex CTA */}
        {highSavings && (
          <div className="mb-20 card-premium bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="p-10 relative z-10">
              <div className="data-mono text-white/40 mb-6">Strategic Opportunity</div>
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
                Credex can unlock an additional 15–40% in savings.
              </h2>
              <p className="text-slate-400 text-base mb-8 max-w-xl leading-relaxed">
                Credex sources secondary AI credits from enterprise partners. Teams saving over $500/mo typically qualify for massive discounts on Cursor, Claude, and OpenAI Enterprise seats.
              </p>
              <a
                href="https://credex.rocks"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white text-slate-900 font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform"
              >
                Book Credex consultation
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        )}

        {/* Lead capture */}
        <div className="mb-20">
          <div className="label mb-6 opacity-60 text-center">
            {lowSavings ? 'Get notified when new optimizations apply' : 'Get your full executive report'}
          </div>

          {submitted ? (
            <div className="card-premium p-12 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900">Report sent.</h3>
              <p className="text-slate-500 font-medium">
                Check your inbox. {highSavings ? 'We will follow up regarding high-savings credits.' : ''}
              </p>
            </div>
          ) : (
            <div className="card-premium p-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="sm:col-span-2">
                  <label className="label block mb-2">Work Email *</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label block mb-2">Company</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Acme Inc."
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label block mb-2">Role</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Engineering Manager"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                  />
                </div>
              </div>

              <input
                type="text"
                name="_website"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              {leadError && (
                <p className="text-xs font-bold text-red-500 mb-4">{leadError}</p>
              )}

              <button
                onClick={handleLeadSubmit}
                disabled={submitting}
                className="btn-primary w-full sm:w-auto justify-center"
              >
                {submitting ? 'Sending Report…' : lowSavings ? 'Set Notification →' : 'Send My Report →'}
              </button>
              <p className="mt-4 data-mono text-[10px] text-slate-400">Zero spam. Unsubscribe at any time.</p>
            </div>
          )}
        </div>

        {/* Share */}
        <div className="max-w-2xl mx-auto text-center border-t border-slate-100 pt-16">
          <div className="label mb-6 opacity-60">Share this audit</div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 input-field font-mono text-xs text-slate-400 truncate bg-slate-50 border-slate-100 py-3">
              {shareUrl}
            </div>
            <button onClick={copyShareUrl} className="btn-outline whitespace-nowrap text-xs w-full sm:w-auto">
              {copied ? 'Copied ✓' : 'Copy public link'}
            </button>
          </div>
          <p className="mt-4 data-mono text-[10px] text-slate-400">Note: Personal details are stripped from the public link.</p>
        </div>
      </div>
    </main>
  )
}
