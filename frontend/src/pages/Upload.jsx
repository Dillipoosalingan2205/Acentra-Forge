import { useRef, useState } from 'react'
import { AlertCircle, CheckCircle, FileText, Sparkles, UploadCloud, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { uploadDischarge } from '@/services/mockApi.js'
import { formatBytes } from '@/utils/format.js'
import { useApp } from '@/context/appContext.js'

const ACCEPTED_TYPES = ['application/pdf', 'application/x-pdf', 'text/pdf']

export default function Upload() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const { updatePatient, setDocumentId } = useApp()

  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleFiles = (incoming) => {
    const next = incoming?.[0]
    setError(null)
    if (!next) return
    if (!ACCEPTED_TYPES.includes(next.type) && !next.name.toLowerCase().endsWith('.pdf')) {
      setFile(null)
      setError('Please upload a PDF discharge summary. Other formats are not supported in this prototype.')
      return
    }
    setFile(next)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    handleFiles(e.dataTransfer?.files)
  }

  const handleAnalyze = async () => {
    if (!file || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await uploadDischarge(file)
      const docId = res?.documentId || 'demo'
      const patId = res?.patientId || 'demo'
      const patName = res?.patientName || ''
      if (setDocumentId) setDocumentId(docId)
      if (updatePatient) updatePatient(patId, patName, true)
      navigate(`/processing/${docId}`)
    } catch {
      setSubmitting(false)
      setError('Something went wrong while starting analysis. Please try again.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in py-6">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-slate-200 mb-3"
          style={{ background: 'var(--pill-dark)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <Sparkles className="h-3 w-3 text-white" />
          AI Document Analysis
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          Upload Discharge Summary
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Upload a discharge summary PDF to extract appointments, medications, and follow-up care instructions.
        </p>
      </div>

      {error && (
        <div
          className="mb-6 flex items-start gap-2.5 rounded-2xl p-4 text-xs text-rose-300"
          role="alert"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragEnter={() => setDragActive(true)}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className="relative rounded-3xl p-10 text-center transition-all duration-300 cursor-pointer"
        style={{
          background: dragActive
            ? 'rgba(255, 255, 255, 0.05)'
            : file
            ? 'rgba(16,185,129,0.04)'
            : 'rgba(17, 17, 19, 0.9)',
          border: `2px dashed ${dragActive ? 'rgba(255,255,255,0.6)' : file ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.14)'}`,
          boxShadow: dragActive ? '0 0 35px rgba(255,255,255,0.1)' : 'none',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          aria-label="Upload PDF discharge summary"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-5 transition-all duration-300"
          style={{
            background: file ? 'rgba(16,185,129,0.15)' : 'var(--pill-dark)',
            border: `1px solid ${file ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.15)'}`,
          }}
        >
          <UploadCloud
            className="h-7 w-7 transition-all duration-300"
            style={{ color: file ? '#34d399' : '#ffffff' }}
          />
        </div>

        <p className="text-base font-bold text-white mb-1">
          {dragActive ? 'Drop file here' : 'Select Discharge Summary'}
        </p>
        <p className="text-sm text-slate-400 mb-5">
          Drag and drop your PDF here, or browse files directly
        </p>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: 'var(--pill-dark)', border: '1px solid rgba(255,255,255,0.18)' }}
        >
          Browse Files
        </button>

        <p className="mt-5 text-xs text-slate-500">
          Supported format: <strong className="text-slate-400">PDF only</strong> · Max 25MB
        </p>
      </div>

      {/* Selected file */}
      {file && (
        <div
          className="mt-4 rounded-2xl p-4 animate-fade-in"
          style={{ background: 'rgba(17, 17, 19, 0.95)', border: '1px solid rgba(16,185,129,0.25)' }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <FileText className="h-5 w-5 text-emerald-400" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-emerald-400" />
                  <p className="text-xs text-emerald-400">{formatBytes(file.size)} · Ready to analyze</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setFile(null); setError(null); if (inputRef.current) inputRef.current.value = '' }}
              className="p-1.5 rounded-full text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Analyze button */}
      <div className="mt-6">
        <button
          type="button"
          disabled={!file || submitting}
          onClick={handleAnalyze}
          className="w-full inline-flex items-center justify-center gap-2.5 rounded-full py-4 text-base font-bold text-black transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
          style={{
            background: '#ffffff',
            boxShadow: file ? '0 0 0 1px rgba(255,255,255,0.2), 0 0 28px rgba(255,255,255,0.35)' : 'none',
          }}
        >
          {submitting ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
              Analyzing Document...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Analyze with AI
            </>
          )}
        </button>
      </div>

      {/* Info note */}
      <p className="mt-4 text-center text-xs text-slate-500">
        Traceable intelligence. Quarantines ambiguous items for clinical verification.
      </p>
    </div>
  )
}
