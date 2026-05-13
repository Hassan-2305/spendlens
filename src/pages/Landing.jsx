import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

const LOGOS = ['Cursor', 'Copilot', 'Claude', 'ChatGPT', 'Gemini', 'Windsurf', 'OpenAI API', 'Anthropic API']

const FLOATING_CARDS = [
  { name: 'Cursor', plan: 'Pro · $20/mo', x: 12, y: 22, delay: 0 },
  { name: 'Claude', plan: 'Pro · $20/mo', x: 80, y: 15, delay: 1.2 },
  { name: 'ChatGPT', plan: 'Team · $30/mo', x: 8, y: 62, delay: 0.6 },
  { name: 'Copilot', plan: 'Business · $19/mo', x: 85, y: 58, delay: 1.8 },
  { name: 'Gemini', plan: 'Advanced · $20/mo', x: 72, y: 82, delay: 2.4 },
  { name: 'OpenAI', plan: 'API · ~$200/mo', x: 22, y: 85, delay: 0.3 },
]

function FloatingNav() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500">
      <div className={`flex items-center gap-2 rounded-full px-2 py-1.5 transition-all duration-500 bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]`}>
        <a href="/" className="font-serif italic text-lg text-slate-800 px-4 py-1.5 flex items-center gap-2">
          Spend<span className="not-italic font-sans font-bold text-sm">Lens</span>
        </a>
        <div className="hidden sm:flex items-center gap-1 border-l border-slate-200/60 pl-2">
          <a href="#how" className="text-[13px] text-slate-500 font-medium px-4 py-2 rounded-full hover:bg-slate-50 hover:text-slate-800 transition-colors">
            How it works
          </a>
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-slate-500 font-medium px-4 py-2 rounded-full hover:bg-slate-50 hover:text-slate-800 transition-colors mr-1"
          >
            Credex
          </a>
        </div>
        <button
          onClick={() => navigate('/audit')}
          className="bg-slate-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all ml-1 shadow-md shadow-slate-900/10"
        >
          Get started
        </button>
      </div>
    </nav>
  )
}

function FloatingCard({ name, plan, x, y, delay }) {
  return (
    <div
      className="absolute pointer-events-none hidden md:block"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animation: `cardFloat 8s ease-in-out ${delay}s infinite, cardFadeIn 1.2s ease-out ${delay * 0.3}s both`,
      }}
    >
      <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-2xl px-5 py-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col gap-1 w-32">
        <div className="font-semibold text-sm text-slate-800">{name}</div>
        <div className="font-mono text-[10px] text-slate-400 tracking-wide uppercase">{plan}</div>
      </div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const tickerRef = useRef(null)
  const [inputFocused, setInputFocused] = useState(false)

  useEffect(() => {
    const el = tickerRef.current
    if (!el) return
    let pos = 0
    const half = el.scrollWidth / 2
    const tick = () => {
      pos += 0.4
      if (pos >= half) pos = 0
      el.style.transform = `translateX(-${pos}px)`
      requestAnimationFrame(tick)
    }
    const raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <main className="min-h-screen bg-[#FDFDFD] overflow-x-hidden font-sans">
      <FloatingNav />

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden">
        
        {/* Extremely subtle ambient mesh background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50/50 rounded-full blur-[100px]" />
          <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-purple-50/40 rounded-full blur-[120px]" />
        </div>

        {/* Floating tool cards */}
        {FLOATING_CARDS.map(card => (
          <FloatingCard key={card.name} {...card} />
        ))}

        <div className="relative z-10 max-w-4xl mx-auto text-center pt-24">
          
          {/* Badge */}
          <div className="fade-up mb-8">
            <span className="inline-flex items-center gap-2 bg-white border border-slate-200/60 rounded-full px-4 py-1.5 text-[11px] font-semibold text-slate-500 shadow-sm uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Free audit · No signup required
            </span>
          </div>

          {/* Headline */}
          <h1 className="fade-up animate-delay-1 mb-8">
            <span className="block text-[clamp(4rem,9vw,8.5rem)] font-serif italic text-slate-500 leading-[0.9] tracking-tight mb-2">
              Find what you're
            </span>
            <span className="block text-[clamp(4rem,9vw,8.5rem)] font-sans font-extrabold text-[#0B1320] leading-[0.9] tracking-[-0.04em]">
              wasting on AI.
            </span>
          </h1>

          <p className="text-slate-500 text-lg sm:text-xl max-w-xl mx-auto mb-16 leading-relaxed fade-up animate-delay-2 font-medium">
            Enter your tools and plans. Get an instant audit with exact savings in under two minutes.
          </p>

          {/* Interactive prompt input */}
          <div
            className={`fade-up animate-delay-3 max-w-2xl mx-auto transition-all duration-300 ${
              inputFocused ? 'scale-[1.02]' : ''
            }`}
          >
            <div
              onClick={() => navigate('/audit')}
              onMouseEnter={() => setInputFocused(true)}
              onMouseLeave={() => setInputFocused(false)}
              className={`group cursor-pointer bg-white/80 backdrop-blur-xl border rounded-2xl p-5 sm:p-6 transition-all duration-300 ${
                inputFocused
                  ? 'border-slate-300 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]'
                  : 'border-slate-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-1 text-left">
                  <div className="text-slate-400 font-medium text-base sm:text-lg">
                    What AI tools does your team pay for?
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    {['Cursor', 'Claude', 'ChatGPT', 'Copilot'].map(tool => (
                      <button
                        key={tool}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/audit', { state: { preSelect: tool } });
                        }}
                        className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all uppercase tracking-wider"
                      >
                        {tool}
                      </button>
                    ))}
                    <span className="text-[11px] text-slate-400 font-medium">+4 more</span>
                  </div>
                </div>
                <button className="shrink-0 bg-[#0B1320] text-white rounded-xl w-14 h-14 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-slate-900/20">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <p className="mt-8 text-[11px] font-medium text-slate-400 fade-up animate-delay-4 uppercase tracking-wider">
            No account needed · No data sold · Results in seconds
          </p>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#FDFDFD] to-transparent pointer-events-none" />
      </section>

      {/* ── Ticker ── */}
      <div className="overflow-hidden py-6 bg-[#FDFDFD] border-b border-slate-100">
        <div ref={tickerRef} className="ticker-track">
          {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
            <span key={i} className="font-mono text-[11px] text-slate-300 font-bold uppercase tracking-widest">
              {logo}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="px-6 py-32 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-serif italic text-4xl sm:text-5xl text-slate-500 mb-3">Three steps.</h2>
            <p className="font-sans font-extrabold text-3xl sm:text-4xl text-[#0B1320] tracking-[-0.02em]">Real numbers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Input your stack',
                desc: 'Select the AI tools you pay for, your current plan, seats, and actual monthly spend.',
              },
              {
                num: '02',
                title: 'Get instant audit',
                desc: 'The engine checks plan fit, seat efficiency, and finds cheaper alternatives for your use case.',
              },
              {
                num: '03',
                title: 'Capture savings',
                desc: 'Download your report. High-savings cases get connected to Credex discounted credits.',
              },
            ].map((step) => (
              <div key={step.num} className="bg-slate-50 border border-slate-100 rounded-3xl p-8 hover:border-slate-300 transition-colors group">
                <div className="font-mono text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest group-hover:text-blue-500 transition-colors">{step.num}</div>
                <h3 className="font-bold text-xl text-slate-800 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-[#0B1320] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Avg. monthly savings found', value: '$340' },
              { label: 'AI tools audited', value: '8' },
              { label: 'Annual impact per team', value: '$4,080' },
            ].map((stat) => (
              <div key={stat.label} className="p-8 border border-white/10 rounded-3xl bg-white/[0.02]">
                <div className="font-serif italic text-5xl sm:text-6xl text-white mb-4">{stat.value}</div>
                <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6 bg-[#FDFDFD] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif italic text-5xl sm:text-6xl text-slate-800 mb-6">Stop overpaying.</h2>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed font-medium">
            Run a free audit in 2 minutes and find out exactly how much your team
            can save on AI tools every month.
          </p>
          <button
            onClick={() => navigate('/audit')}
            className="inline-flex items-center gap-3 bg-[#0B1320] text-white font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-xl shadow-slate-900/10"
          >
            Start Free Audit
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </section>
      
      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-100 bg-[#FDFDFD]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <span className="font-serif italic text-sm text-slate-500">
            Spend<span className="not-italic font-sans font-bold text-xs text-slate-800">Lens</span>
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">© 2025 · Built for Credex</span>
        </div>
      </footer>

    </main>
  )
}
