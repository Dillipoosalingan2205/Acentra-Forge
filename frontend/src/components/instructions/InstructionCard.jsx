import { useState } from 'react'
import { CheckCircle2, AlertTriangle, FileText } from 'lucide-react'

import { ConfidenceBadge } from '@/components/safety/ConfidenceBadge.jsx'
import { EscalationCard } from '@/components/safety/EscalationCard.jsx'
import { LanguageSelector } from '@/components/instructions/LanguageSelector.jsx'
import { SourceCitation } from '@/components/sources/SourceCitation.jsx'

/**
 * InstructionCard — displays extracted discharge guidance adhering to Phase 4 safety:
 *  - Original instruction (exact discharge text)
 *  - Patient-friendly explanation (plain wording, no clinical reasoning)
 *  - Confidence (Extraction / Interpretation confidence score)
 *  - Source (cited page/section in John_Doe_Discharge.pdf)
 *  - Review status (Validated vs Needs Human Review)
 *  - Languages: English, Tamil, Hindi with exact fallback if unavailable
 */
export function InstructionCard({ instruction }) {
  const [language, setLanguage] = useState('en')

  const isLowConfidence =
    Boolean(instruction.reviewRequired) || (instruction.confidence != null && instruction.confidence < 0.84)

  const getSimplifiedText = () => {
    if (language === 'en') {
      return instruction.simplifiedText
    }
    const translation = instruction.translations?.[language]
    if (translation && typeof translation === 'string') {
      return translation
    }
    return 'Translation not available for this instruction.'
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111113] p-5 sm:p-6 transition-all duration-300 hover:border-white/20">
      <div className="flex flex-col gap-4">
        {/* Header: Category, Review Status, Confidence */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white shrink-0">
              <FileText className="h-4 w-4" aria-hidden="true" />
            </span>
            <h3 className="text-sm font-semibold text-white tracking-wide">{instruction.category}</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Review Status Badge */}
            {isLowConfidence ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-950/70 border border-rose-500/30 px-2.5 py-0.5 text-xs font-semibold text-rose-300">
                <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
                Review Status: Needs Human Review
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                Review Status: Validated
              </span>
            )}

            <ConfidenceBadge
              confidence={instruction.confidence}
              type="interpretation"
            />
          </div>
        </div>

        {/* Original Instruction */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Original Instruction
          </p>
          <div className="rounded-xl bg-black border border-white/10 p-3.5 text-xs sm:text-sm text-zinc-200 font-mono break-words leading-relaxed">
            &ldquo;{instruction.originalText}&rdquo;
          </div>
        </div>

        {/* Patient-Friendly Explanation OR Escalation Card */}
        {isLowConfidence || instruction.simplifiedText === null ? (
          <EscalationCard
            originalText={instruction.originalText}
            sourceReference={instruction.sourceReference}
          />
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Patient-Friendly Explanation
              </p>
              <LanguageSelector
                language={language}
                onLanguageChange={setLanguage}
              />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-sm text-zinc-100 leading-relaxed">
              {getSimplifiedText()}
            </div>
          </div>
        )}

        {/* Source Citation */}
        <SourceCitation
          source={instruction.source}
          sourceReference={instruction.sourceReference}
        />
      </div>
    </div>
  )
}