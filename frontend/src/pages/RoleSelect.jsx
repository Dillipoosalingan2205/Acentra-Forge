import { useState } from 'react'
import { Activity, Heart, Shield, Stethoscope, User } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth.js'

/**
 * Role Selection Page — Premium split-screen entry point.
 * Users choose "Patient" or "Doctor" portal before proceeding to login.
 */
export default function RoleSelect() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [hoveredRole, setHoveredRole] = useState(null)

  // If already authenticated, redirect based on role
  if (isAuthenticated) {
    if (user?.role === 'Doctor') {
      return <Navigate to="/reviews" replace />
    }
    return <Navigate to="/dashboard/demo" replace />
  }

  const roles = [
    {
      id: 'patient',
      title: 'Patient Portal',
      subtitle: 'Access your discharge care plan, medications, follow-ups, and recovery timeline.',
      icon: Heart,
      accentColor: '#6366f1',
      glowColor: 'rgba(99, 102, 241, 0.25)',
      features: [
        'View discharge summary',
        'Track medications & tasks',
        'Recovery timeline',
        'Care instructions',
      ],
    },
    {
      id: 'doctor',
      title: 'Doctor Portal',
      subtitle: 'Review AI-flagged clinical cases, approve care directives, and manage patient follow-ups.',
      icon: Stethoscope,
      accentColor: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.25)',
      features: [
        'Human review queue',
        'Approve care tasks',
        'Clinical oversight',
        'AI confidence reports',
      ],
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-black text-white overflow-hidden">
      {/* Ambient background effects */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 20% 30%, rgba(99, 102, 241, 0.06), transparent), radial-gradient(ellipse 50% 50% at 80% 70%, rgba(16, 185, 129, 0.06), transparent)',
        }}
      />

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-5"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
      >
        <Link to="/" className="flex items-center gap-3 group" aria-label="AEGIS Home">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white transition-transform duration-200 group-hover:scale-105"
            style={{ boxShadow: '0 0 24px rgba(255,255,255,0.3)' }}
          >
            <img src="/assets/logo.webp" alt="" className="w-[72%] h-[72%] object-contain" />
          </span>
          <div className="leading-tight">
            <span className="block text-base font-extrabold tracking-tight text-white">AEGIS</span>
            <span className="block text-[10px] font-semibold text-zinc-500 tracking-wider uppercase">
              Care Intelligence
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
            <Shield className="h-3 w-3 text-emerald-500" />
            Secure Portal
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-4xl animate-fade-in">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 bg-[#111113] border border-white/10 mb-6">
              <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
              Select Your Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              Welcome to AEGIS
            </h1>
            <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              Choose your portal to access personalized care coordination tools designed for your role.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {roles.map((role) => {
              const Icon = role.icon
              const isHovered = hoveredRole === role.id

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => navigate(`/login/${role.id}`)}
                  onMouseEnter={() => setHoveredRole(role.id)}
                  onMouseLeave={() => setHoveredRole(null)}
                  className="group relative rounded-3xl p-6 sm:p-8 text-left transition-all duration-300 cursor-pointer"
                  style={{
                    background: isHovered
                      ? `linear-gradient(135deg, rgba(17,17,19,0.95), rgba(17,17,19,0.8))`
                      : 'rgba(17, 17, 19, 0.9)',
                    border: `1px solid ${isHovered ? `${role.accentColor}40` : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: isHovered
                      ? `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${role.glowColor}, inset 0 1px 0 rgba(255,255,255,0.06)`
                      : '0 4px 20px rgba(0,0,0,0.3)',
                    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  }}
                  aria-label={`Continue as ${role.title}`}
                >
                  {/* Icon */}
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl mb-5 transition-all duration-300"
                    style={{
                      background: `${role.accentColor}15`,
                      border: `1px solid ${role.accentColor}30`,
                      boxShadow: isHovered ? `0 0 20px ${role.glowColor}` : 'none',
                    }}
                  >
                    <Icon
                      className="h-7 w-7 transition-transform duration-300"
                      style={{
                        color: role.accentColor,
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                      }}
                    />
                  </div>

                  {/* Title & Subtitle */}
                  <h2 className="text-xl font-bold text-white mb-2 tracking-tight">{role.title}</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-5">{role.subtitle}</p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {role.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5 text-xs text-zinc-500">
                        <span
                          className="w-1 h-1 rounded-full shrink-0"
                          style={{ background: role.accentColor }}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div
                    className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-300"
                    style={{
                      background: isHovered ? role.accentColor : `${role.accentColor}15`,
                      color: isHovered ? '#fff' : role.accentColor,
                      border: `1px solid ${role.accentColor}${isHovered ? '' : '30'}`,
                    }}
                  >
                    Continue as {role.id === 'patient' ? 'Patient' : 'Doctor'}
                    <svg
                      className="h-3 w-3 transition-transform duration-200"
                      style={{ transform: isHovered ? 'translateX(3px)' : 'translateX(0)' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="relative z-10 px-4 py-4 text-center text-xs text-zinc-600"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        AEGIS · Clinical Intelligence &amp; Care Coordination
      </footer>
    </div>
  )
}
