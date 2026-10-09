import { FileText } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

/**
 * SourceCitation — displays source document citation and links to /sources/:id.
 * Traceability guarantee: links back to verified text in John_Doe_Discharge.pdf.
 */
export function SourceCitation({ source, sourceReference, className = '' }) {
  const { id } = useParams()
  const patientId = id || 'demo'

  if (!source && !sourceReference) return null

  const referenceText =
    sourceReference ||
    (source?.page ? `Discharge Summary · Page ${source.page}` : 'Discharge Summary')

  return (
    <div className={`mt-3 flex items-center justify-between border-t border-white/[0.08] pt-3 text-xs ${className}`}>
      <span className="flex items-center gap-1.5 font-medium text-slate-400">
        <FileText className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
        Source:
      </span>
      <Link
        to={`/sources/${patientId}`}
        className="font-medium text-white hover:text-zinc-300 underline transition-colors"
      >
        {referenceText}
      </Link>
    </div>
  )
}