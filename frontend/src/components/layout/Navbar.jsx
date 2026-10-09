import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Globe, LogOut, Shield, UploadCloud } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { useApp } from '@/context/appContext.js'
import { useAuth } from '@/hooks/useAuth.js'

/**
 * Top bar matching the video landing page aesthetic:
 * circular white logo, sleek pill buttons, deep black backdrop.
 */
export default function Navbar() {
  const navigate = useNavigate()
  const { language, patientId, uploadedPatientId } = useApp()
  const { user: authUser, logout } = useAuth()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const displayName = authUser?.name || 'Demo User'
  const displayRole = authUser?.role || 'Patient'
  const displayEmail = authUser?.email || 'demo@acentra.health'
  const displayInitials =
    authUser?.initials ||
    displayName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    navigate('/role-select', { replace: true })
  }

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 w-full">
        {/* Brand */}
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
          <span className="flex flex-col justify-center leading-tight">
            <span className="text-base font-extrabold tracking-tight text-white leading-none mb-1">AEGIS</span>
            <span className="hidden text-[10px] font-semibold text-slate-400 sm:block tracking-wider uppercase leading-none">
              Care Intelligence
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Upload Shortcut Button */}
          <Link
            to="/upload"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-black bg-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100"
            style={{
              boxShadow: '0 0 0 1px rgba(255,255,255,0.15), 0 0 16px rgba(255,255,255,0.25)',
            }}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Upload PDF
          </Link>

          {/* Language Selector */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-[#c8c8c8] bg-[#28282a] border border-white/10 transition-colors hover:text-white hover:bg-[#323234]"
          >
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{language === 'en' ? 'EN' : language.toUpperCase()}</span>
          </button>

          <div className="h-7 w-px bg-white/10" />

          {/* User Account Button */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-label="User account menu"
              className="flex items-center gap-2.5 rounded-full p-1 pl-1.5 pr-2.5 bg-[#28282a] border border-white/10 transition-all duration-200 hover:bg-[#323234] hover:border-white/20 focus:outline-none"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-black bg-white shrink-0">
                {displayInitials}
              </span>
              <span className="hidden text-left leading-tight md:block">
                <span className="block text-xs font-semibold text-white">{displayName.split(' ')[0]}</span>
                <span className="block text-[10px] text-slate-400">{displayRole}</span>
              </span>
              <ChevronDown
                className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-64 rounded-2xl p-1 z-50 animate-scale-in"
                style={{
                  background: 'rgba(17, 17, 19, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
                }}
                role="menu"
              >
                {/* User Info */}
                <div className="px-3 py-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-black bg-white">
                      {displayInitials}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                      <p className="text-xs text-slate-400 truncate">{displayEmail}</p>
                    </div>
                  </div>
                  <div
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
                  >
                    <Shield className="h-3 w-3 text-emerald-400" />
                    Care Session Active
                  </div>
                </div>

                <div className="py-2 px-1">
                  <div className="px-2 py-1 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                    Portal
                  </div>
                  <Link
                    to={`/dashboard/${uploadedPatientId || patientId || 'demo'}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-2 py-1.5 text-xs text-slate-300 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Care Plan Dashboard
                  </Link>
                  <Link
                    to="/upload"
                    onClick={() => setMenuOpen(false)}
                    className="block px-2 py-1.5 text-xs text-slate-300 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Upload Document
                  </Link>
                </div>

                <div className="pt-1 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 transition-all duration-150 hover:bg-rose-500/10 hover:text-rose-300"
                    role="menuitem"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
