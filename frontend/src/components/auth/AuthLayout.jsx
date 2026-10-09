import { Activity, ShieldCheck, Terminal } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AuthLayout({ title, subtitle, children, footer, role }) {
  const isDoctor = role === 'doctor'

  return (
    <div className="flex min-h-screen flex-col justify-between bg-black text-white">
      {/* Dev banner */}
      <div className="relative z-10 px-4 py-2.5 text-center text-xs bg-[#111113] border-b border-white/10">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-semibold text-white">
            <Terminal className="h-3.5 w-3.5 text-zinc-400" />
            Demo Mode:
          </span>
          {isDoctor ? (
            <span className="text-zinc-400">
              Email: <strong className="text-white font-semibold">doctor@aegis.health</strong>{' '}
              · Password: <strong className="text-white font-semibold">Aegis@2026</strong>
            </span>
          ) : (
            <span className="text-zinc-400">
              Email: <strong className="text-white font-semibold">demo@acentra.health</strong>{' '}
              · Password: <strong className="text-white font-semibold">Acentra@2026</strong>
            </span>
          )}
        </div>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md animate-fade-in">
          {/* Brand */}
          <div className="mb-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-3 transition-all duration-200 hover:scale-105"
              aria-label="Back to home"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-2 shadow-[0_0_24px_rgba(255,255,255,0.35)] shrink-0">
                <img src="/assets/logo.webp" alt="Acentra" className="w-full h-full object-contain" />
              </span>
              <div className="text-left">
                <span className="block text-2xl font-black tracking-tight text-white">AEGIS</span>
                <span className="block text-xs font-medium text-zinc-500">Hospital Discharge &amp; Follow-up</span>
              </div>
            </Link>
          </div>

          {/* Card */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[#111113] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.8)]">
            {title && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
                {subtitle && (
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{subtitle}</p>
                )}
              </div>
            )}
            {children}
          </div>

          {/* Footer trust indicators */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-zinc-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Frontend prototype · Production API-ready architecture</span>
            </p>
          </div>

          {footer && <div className="mt-4">{footer}</div>}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-4 text-center text-xs text-zinc-600 border-t border-white/10">
        AEGIS · Clinical Intelligence &amp; Care Coordination
      </footer>
    </div>
  )
}
