import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  X,
  FileText,
  Languages,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  Mail,
  Building2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Phone,
  Send,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth.js'

const BG_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4'

const STATS_CONFIG = [
  { icon: '<', target: 120, decimals: 0, suffix: 'ms', label: 'Extraction Latency', delay: '0.5s' },
  { icon: '%', target: 99.99, decimals: 2, suffix: '%', label: 'Platform Uptime', delay: '0.58s' },
  { icon: '*', target: 24, decimals: 0, suffix: '/7', label: 'Autonomous Monitoring', delay: '0.66s' },
  { icon: '#', target: 30, decimals: 0, suffix: ' Days', label: 'Follow-up Window', delay: '0.74s' },
]

export default function Home() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Home')
  const [statValues, setStatValues] = useState([0, 0, 0, 0])
  const [contactSubmitted, setContactSubmitted] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', org: '', email: '', message: '' })
  const statsRef = useRef(null)

  // Document title
  useEffect(() => {
    document.title = 'Care that Continues'
  }, [])

  // Count-up animation for the 4 metrics
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isReduced) {
      setStatValues(STATS_CONFIG.map((s) => s.target))
      return
    }

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
    let animationFrames = []

    const startCounters = () => {
      STATS_CONFIG.forEach((stat, i) => {
        const duration = 1500 + i * 80
        const delayMs = 480 + i * 90

        setTimeout(() => {
          let startTime = null

          const step = (now) => {
            if (!startTime) startTime = now
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = easeOutCubic(progress)
            const currentVal = eased * stat.target

            setStatValues((prev) => {
              const next = [...prev]
              next[i] = progress < 1 ? currentVal : stat.target
              return next
            })

            if (progress < 1) {
              const frame = requestAnimationFrame(step)
              animationFrames.push(frame)
            }
          }

          const initialFrame = requestAnimationFrame(step)
          animationFrames.push(initialFrame)
        }, delayMs)
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          startCounters()
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    } else {
      startCounters()
    }

    return () => {
      observer.disconnect()
      animationFrames.forEach((id) => cancelAnimationFrame(id))
    }
  }, [])

  // Keyboard navigation & body lock for mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    const handleResize = () => {
      if (window.innerWidth > 720) setMobileMenuOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard/demo')
    } else {
      navigate('/upload')
    }
  }

  return (
    <div className="relative h-screen overflow-hidden bg-black text-white select-none">
      {/* Exact Background Video */}
      <div
        className="absolute inset-0 overflow-hidden bg-black pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <video
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={BG_VIDEO_URL} type="video/mp4" />
        </video>
      </div>

      {/* Single Viewport Container */}
      <div
        className="relative z-10 flex flex-col items-center justify-between h-screen overflow-hidden"
        style={{
          padding: 'clamp(16px, 2.4vh, 28px) clamp(14px, 3vw, 32px)',
        }}
      >
        {/* 1) HEADER */}
        <header
          className="relative z-20 flex items-center justify-between w-full shrink-0 px-2 sm:px-6 lg:px-8"
          style={{
            animation: 'slideDown 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
          }}
        >
          {/* Top Left: AEGIS Brand */}
          <div className="flex-1 flex items-center justify-start">
            <Link to="/" className="group flex items-center gap-3 shrink-0" aria-label="AEGIS Home">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white transition-transform duration-200 group-hover:scale-105"
                style={{
                  boxShadow: 'var(--nav-shadow)',
                }}
              >
                <img
                  src="/assets/logo.webp"
                  alt=""
                  width="52"
                  height="52"
                  className="w-[72%] h-[72%] object-contain block"
                />
              </span>
              <span className="flex flex-col justify-center leading-tight text-left">
                <span className="text-base font-extrabold tracking-tight text-white leading-none mb-1">AEGIS</span>
                <span className="hidden text-[10px] font-semibold text-slate-400 sm:block tracking-wider uppercase leading-none">
                  Care Intelligence
                </span>
              </span>
            </Link>
          </div>

          {/* Center: Desktop Nav Pill (White) */}
          <nav
            className="hidden md:flex items-center justify-around bg-white rounded-full px-2"
            style={{
              height: 'clamp(44px, 5.2vw, 48px)',
              maxWidth: '350px',
              width: '100%',
              boxShadow: 'var(--nav-shadow)',
            }}
            aria-label="Main Navigation"
          >
            {['Home', 'Product', 'Contact'].map((tab) => {
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-1.5 text-sm font-medium tracking-tight transition-opacity duration-200 cursor-pointer ${
                    isActive ? 'opacity-100 text-[#2e2e2e]' : 'opacity-50 text-[#2e2e2e] hover:opacity-75'
                  }`}
                  style={{
                    fontSize: 'clamp(13px, 1.4vw, 15px)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {tab}
                  {isActive && (
                    <span
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-black"
                      style={{
                        boxShadow: '-5px 0 0 #000, 5px 0 0 #000',
                      }}
                    />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Top Right: Sign In Pill / Dashboard Link & Mobile Burger */}
          <div className="flex-1 flex items-center justify-end gap-3">
            <Link
              to={isAuthenticated ? '/dashboard/demo' : '/role-select'}
              className="hidden md:inline-flex items-center justify-center rounded-full shrink-0 font-medium transition-all duration-200 hover:bg-[#323234] hover:text-white hover:-translate-y-0.5"
              style={{
                background: 'var(--pill-dark)',
                color: 'var(--sign-in-text)',
                height: 'clamp(44px, 5.2vw, 48px)',
                padding: '0 clamp(18px, 2.2vw, 22px)',
                boxShadow: 'var(--nav-shadow)',
                fontSize: 'clamp(13px, 1.4vw, 15px)',
              }}
            >
              {isAuthenticated ? 'Dashboard' : 'Sign in'}
            </Link>

            {/* Mobile Burger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden w-11 h-11 rounded-full flex-col items-center justify-center gap-1.5 transition-colors duration-250 shrink-0"
              style={{
                background: mobileMenuOpen ? '#ffffff' : 'var(--pill-dark)',
                boxShadow: 'var(--nav-shadow)',
              }}
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
            >
              <span
                className={`w-[18px] h-[1.5px] rounded-sm transition-all duration-250 ${
                  mobileMenuOpen
                    ? 'bg-black translate-y-[4.5px] rotate-45'
                    : 'bg-white'
                }`}
              />
              <span
                className={`w-[18px] h-[1.5px] rounded-sm transition-all duration-250 ${
                  mobileMenuOpen ? 'opacity-0 bg-black' : 'bg-white'
                }`}
              />
              <span
                className={`w-[18px] h-[1.5px] rounded-sm transition-all duration-250 ${
                  mobileMenuOpen
                    ? 'bg-black -translate-y-[4.5px] -rotate-45'
                    : 'bg-white'
                }`}
              />
            </button>
          </div>
        </header>

        {/* 2) HERO (CENTER) */}
        <main
          className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-[900px] my-auto"
          style={{
            paddingTop: 'clamp(24px, 4.5vh, 52px)',
          }}
        >
          {/* Headline (Two Lines in retro dot-matrix font) */}
          <h1
            className="headline anim font-normal text-white text-center whitespace-nowrap overflow-hidden"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 6.2vw, 80px)',
              letterSpacing: '-0.04em',
              lineHeight: 1.12,
            }}
          >
            <span
              className="line-1 block"
              style={{
                opacity: 0,
                transform: 'translateY(14px)',
                animation: 'headlineFade 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.12s forwards',
              }}
            >
              Care that
            </span>
            <span
              className="line-2 block"
              style={{
                opacity: 0,
                transform: 'translateY(14px)',
                animation: 'headlineFade 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards',
              }}
            >
              Continues
            </span>
          </h1>

          {/* Subhead */}
          <p
            className="subhead anim text-[#d0d0d0] text-center font-normal"
            style={{
              '--d': '0.28s',
              maxWidth: 'min(580px, 92%)',
              fontSize: 'clamp(calc(13.5px + 2pt), calc(1.55vw + 2pt), calc(16.5px + 2pt))',
              lineHeight: 1.55,
              opacity: 0.8,
              margin: 'clamp(12px, 2vh, 20px) auto clamp(20px, 2.8vh, 32px)',
            }}
          >
            Agentic hospital discharge coordinator transforming complex medical records into
            structured recovery plans, multilingual instructions, and proactive clinical follow-up.
          </p>

          {/* CTA Button */}
          <button
            type="button"
            onClick={handleCtaClick}
            className="cta-btn anim inline-flex items-center justify-center font-semibold text-black bg-white rounded-full transition-all duration-200"
            style={{
              '--d': '0.4s',
              fontSize: 'clamp(13.5px, 1.5vw, 14.5px)',
              padding: 'clamp(11px, 1.6vh, 13px) clamp(22px, 3vw, 28px)',
              boxShadow:
                '0 0 0 1px rgba(255,255,255,0.15), 0 0 22px rgba(255,255,255,0.32), 0 0 44px rgba(255,255,255,0.12)',
            }}
          >
            Get Started
          </button>
        </main>

        {/* 3) STATS FOOTER (EXACT 4 METRICS) */}
        <footer
          ref={statsRef}
          className="relative z-10 grid grid-cols-2 md:grid-cols-4 w-full max-w-[920px] mx-auto shrink-0"
          style={{
            gap: 'clamp(12px, 2vw, 28px)',
          }}
        >
          {STATS_CONFIG.map((stat, i) => {
            const currentVal = statValues[i] || 0
            const formatted = `${currentVal.toFixed(stat.decimals)}${stat.suffix}`

            return (
              <div
                key={stat.label}
                className="anim flex flex-col items-center text-center"
                style={{ '--d': stat.delay }}
              >
                <div className="flex items-baseline justify-center gap-1.5 mb-0.5">
                  <span
                    className="text-white leading-none"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(22px, 3vw, 33px)',
                    }}
                  >
                    {stat.icon}
                  </span>
                  <span
                    className="text-white font-semibold leading-none tabular-nums"
                    style={{
                      fontSize: 'clamp(18px, 2.2vw, 26px)',
                      letterSpacing: '-0.025em',
                    }}
                  >
                    {formatted}
                  </span>
                </div>
                <span
                  className="font-normal"
                  style={{
                    color: 'var(--muted)',
                    fontSize: 'clamp(11px, 1.2vw, 12.5px)',
                  }}
                >
                  {stat.label}
                </span>
              </div>
            )
          })}
        </footer>
      </div>

      {/* Product Overlay Modal */}
      {activeTab === 'Product' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className="relative w-full max-w-2xl bg-[#0e0e10] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            style={{ animation: 'menuIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveTab('Home')}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 mb-2.5">
                <Sparkles className="h-3 w-3" />
                Autonomous Care Coordination
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Clinical Intelligence for Hospital Discharge
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                AEGIS transforms unstructured medical notes into actionable recovery plans, reducing 30-day readmissions through proactive patient coordination.
              </p>
            </div>

            {/* Feature Modules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
              <div className="p-4 rounded-2xl bg-[#141416] border border-white/5">
                <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white mb-2.5">
                  <FileText className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">Discharge Ingestion & Provenance</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Extracts medications, tasks, and red flags from synthetic PDFs with line-level bounding citations back to original pages.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#141416] border border-white/5">
                <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white mb-2.5">
                  <Languages className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">Multilingual Health Literacy</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Converts clinical jargon into 6th-grade reading level in English, Tamil, and Hindi with audio playback.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#141416] border border-white/5">
                <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white mb-2.5">
                  <Calendar className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">Recovery Timeline & Tasks</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Structured checklist for post-care appointments, diagnostics, wound care, and daily medication administration.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#141416] border border-white/5">
                <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white mb-2.5">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">Human-in-the-Loop Triage</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Automated safety guardrails escalate conflicting prescriptions and unverified instructions to clinician review queues.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
              <Link
                to="/dashboard/demo"
                onClick={() => setActiveTab('Home')}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:bg-[#e4e4e6] transition-all"
              >
                Launch Demo Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/upload"
                onClick={() => setActiveTab('Home')}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-white bg-[#28282a] border border-white/10 hover:bg-[#323234] transition-all"
              >
                Upload Discharge Summary
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Contact Overlay Modal */}
      {activeTab === 'Contact' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className="relative w-full max-w-xl bg-[#0e0e10] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            style={{ animation: 'menuIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveTab('Home')}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 mb-2">
                <Building2 className="h-3 w-3" />
                Hospital & Clinical Integration
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Connect with the Care Coordination Team
              </h2>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                Interested in deploying AEGIS within your clinical department, cardiology center, or surgical recovery ward?
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#141416] border border-white/5">
                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                  <Mail className="h-3.5 w-3.5 text-zinc-300" />
                  <span className="font-semibold text-white">Direct Inquiries</span>
                </div>
                <p className="font-mono text-zinc-400 text-[11px]">coordination@aegis.health</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141416] border border-white/5">
                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                  <Phone className="h-3.5 w-3.5 text-zinc-300" />
                  <span className="font-semibold text-white">Pilot Hotline</span>
                </div>
                <p className="font-mono text-zinc-400 text-[11px]">+1 (800) 223-6872</p>
              </div>
            </div>

            {/* Quick Pilot Inquiry Form */}
            {contactSubmitted ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Pilot Request Received</h4>
                <p className="text-xs text-zinc-400">
                  Thank you! Our clinical solutions team will contact you within 24 hours to schedule a walkthrough.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setContactSubmitted(false)
                    setActiveTab('Home')
                  }}
                  className="mt-2 inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setContactSubmitted(true)
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Sarah Mitchell"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full rounded-xl px-3.5 py-2 text-xs bg-[#19191c] border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Health System / Hospital</label>
                    <input
                      type="text"
                      required
                      placeholder="Metro General Hospital"
                      value={contactForm.org}
                      onChange={(e) => setContactForm({ ...contactForm, org: e.target.value })}
                      className="w-full rounded-xl px-3.5 py-2 text-xs bg-[#19191c] border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah.mitchell@metrohealth.org"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full rounded-xl px-3.5 py-2 text-xs bg-[#19191c] border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Inquiry / Specialty Focus</label>
                  <textarea
                    rows={2}
                    placeholder="We want to automate post-discharge instructions for our cardiology ward..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full rounded-xl px-3.5 py-2 text-xs bg-[#19191c] border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <p className="text-[10px] text-zinc-500">
                    Synthetic testbed · HIPAA-aligned architecture
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-white shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-[#e4e4e6] transition-all cursor-pointer shrink-0"
                  >
                    <Send className="h-3 w-3" />
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu Backdrop & Sheet (<=720px) */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
            style={{ animation: 'overlayIn 0.28s ease forwards' }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav
            className="fixed z-50 left-1/2 -translate-x-1/2 w-[min(92%,380px)] bg-white rounded-[28px] p-5 shadow-2xl flex flex-col items-center gap-2"
            style={{
              top: 'clamp(70px, 10vh, 88px)',
              animation: 'menuIn 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            }}
            aria-label="Mobile Navigation"
          >
            {['Home', 'Product', 'Contact'].map((tab) => {
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full py-2.5 text-center text-base font-medium rounded-xl transition-colors relative ${
                    isActive ? 'text-black opacity-100 font-semibold' : 'text-[#2e2e2e] opacity-60 hover:opacity-100 hover:bg-black/5'
                  }`}
                >
                  {tab}
                  {isActive && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black"
                      style={{ boxShadow: '-6px 0 0 #000, 6px 0 0 #000' }}
                    />
                  )}
                </button>
              )
            })}

            <Link
              to={isAuthenticated ? '/dashboard/demo' : '/role-select'}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full mt-2 h-11 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
              style={{
                background: 'var(--pill-dark)',
                color: 'var(--sign-in-text)',
              }}
            >
              {isAuthenticated ? 'Dashboard' : 'Sign in'}
            </Link>
          </nav>
        </>
      )}
    </div>
  )
}
