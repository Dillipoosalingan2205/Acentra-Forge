import { Calendar, FileCheck, Sparkles, UploadCloud } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '@/utils/format.js'

export default function PatientHeader({ patient }) {
  if (!patient) return null

  const displayName = patient?.name || (() => {
    try { return localStorage.getItem('aegis_last_patient_name') || '' } catch { return '' }
  })() || 'Patient'

  return (
    <header
      className="mb-8 rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: 'rgba(14, 14, 16, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-slate-200"
              style={{ background: 'var(--pill-dark)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
            >
              <Sparkles className="h-3 w-3 text-white" />
              AI-generated follow-up plan
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-emerald-300"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <FileCheck className="h-3 w-3 text-emerald-400" />
              Sourced from discharge summary
            </span>
          </div>

          {/* Patient name */}
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            {displayName}
          </h1>

          {/* Meta */}
          <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              Discharged {formatDate(patient.dischargeDate)}
            </span>
            {patient.documentName && (
              <span className="text-slate-500">
                Source: <strong className="font-semibold text-slate-300">{patient.documentName}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Upload button */}
        <div className="flex flex-col items-end gap-2">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-black bg-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100"
            style={{
              boxShadow: '0 0 0 1px rgba(255,255,255,0.15), 0 0 22px rgba(255,255,255,0.32)',
            }}
          >
            <UploadCloud className="h-4 w-4" />
            Upload New Summary
          </Link>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Organized for follow-up. Not clinical advice.
          </p>
        </div>
      </div>
    </header>
  )
}
