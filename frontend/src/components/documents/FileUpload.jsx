import { useRef, useState } from 'react'
import { AlertCircle, FileText, UploadCloud, X } from 'lucide-react'

import Button from '@/components/common/Button.jsx'
import Card from '@/components/common/Card.jsx'
import { cn } from '@/utils/classNames'
import { formatBytes } from '@/utils/format.js'

const ACCEPTED_TYPES = ['application/pdf', 'application/x-pdf', 'text/pdf']

export default function FileUpload({ onAnalyze, isSubmitting = false }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
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

  const handleRemove = () => {
    setFile(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleAnalyzeClick = () => {
    if (!file || isSubmitting) return
    onAnalyze(file)
  }

  return (
    <Card className="p-6 sm:p-8">
      {/* Drop Zone */}
      <div
        onDragEnter={() => setDragActive(true)}
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200',
          dragActive
            ? 'border-white bg-white/5'
            : 'border-white/10 bg-black/40 hover:border-white/30 hover:bg-white/[0.02]',
          file && 'border-emerald-500/40 bg-emerald-950/20',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          aria-label="Upload PDF discharge summary"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white mb-4 shadow-sm">
          <UploadCloud className="h-6 w-6" aria-hidden="true" />
        </div>

        <p className="text-base font-semibold text-white tracking-tight">
          Upload Discharge Summary
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          Drag and drop your medical discharge record here, or browse files
        </p>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
        >
          Browse Files
        </Button>

        <p className="mt-4 text-xs text-zinc-500">
          Supported format: <strong className="font-medium text-zinc-400">PDF documents only</strong> (Max 25MB)
        </p>
      </div>

      {/* Validation Error */}
      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Selected File Card */}
      {file && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-[#111113] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white">
                <FileText className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                <p className="text-xs text-zinc-400">{formatBytes(file.size)} &bull; Ready to analyze</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Remove uploaded file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          size="lg"
          disabled={!file || isSubmitting}
          onClick={handleAnalyzeClick}
          className="w-full sm:w-auto min-w-[200px]"
        >
          {isSubmitting ? 'Analyzing Document...' : 'Analyze Document'}
        </Button>
      </div>
    </Card>
  )
}
