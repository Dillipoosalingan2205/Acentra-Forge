import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

const DEFAULT_STAGES = [
  { name: 'Uploading document', detail: 'Securely transferring your PDF' },
  { name: 'Reading document', detail: 'Parsing medical text and structure' },
  { name: 'Extracting instructions', detail: 'Identifying discharge directives' },
  { name: 'Identifying follow-up actions', detail: 'Mapping appointments and tasks' },
  { name: 'Validating information', detail: 'Cross-checking clinical safety flags' },
  { name: 'Creating follow-up plan', detail: 'Building your personalized care plan' },
]

export default function ProcessingSteps({ currentStep = 0, stages = DEFAULT_STAGES, state = 'processing', patientName = '' }) {
  const stageList = typeof stages[0] === 'string'
    ? stages.map((name, i) => ({ name, detail: DEFAULT_STAGES[i]?.detail || '' }))
    : stages

  const progressPercent = Math.min(
    100,
    Math.round(((currentStep + (state === 'completed' ? 1 : 0.5)) / stageList.length) * 100),
  )

  return (
    <div
      className="rounded-3xl p-8 sm:p-10 animate-fade-in max-w-xl mx-auto"
      style={{
        background: 'rgba(14, 14, 16, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-slate-200 mb-4"
          style={{ background: 'var(--pill-dark)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
          AI Extraction Pipeline
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          {state === 'completed' ? 'Analysis Complete' : 'Analyzing Summary'}
        </h2>
        {patientName && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span>Patient:</span>
            <strong className="text-white">{patientName}</strong>
          </div>
        )}
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
          {state === 'completed'
            ? `Care coordinator plan successfully built${patientName ? ` for ${patientName}` : ''}. Redirecting to dashboard...`
            : `Extracting post-discharge directives${patientName ? ` for ${patientName}` : ''} with clinical safety guardrails.`}
        </p>

        {/* Progress bar */}
        <div
          className="mt-6 w-full rounded-full overflow-hidden"
          style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: state === 'completed'
                ? '#10b981'
                : '#ffffff',
              boxShadow: state === 'completed'
                ? '0 0 12px rgba(16,185,129,0.5)'
                : '0 0 12px rgba(255,255,255,0.5)',
            }}
          />
        </div>
        <p
          className="mt-2.5 text-base font-normal text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {progressPercent}%
        </p>
      </div>

      {/* Stages */}
      <div className="space-y-2.5 max-w-lg mx-auto">
        {stageList.map((stage, index) => {
          const isDone = index < currentStep || state === 'completed'
          const isCurrent = index === currentStep && state === 'processing'

          return (
            <div
              key={stage.name}
              className="flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-300"
              style={{
                background: isDone
                  ? 'rgba(16,185,129,0.06)'
                  : isCurrent
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(255,255,255,0.02)',
                border: isDone
                  ? '1px solid rgba(16,185,129,0.2)'
                  : isCurrent
                  ? '1px solid rgba(255,255,255,0.2)'
                  : '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-700" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${isDone ? 'text-emerald-300' : isCurrent ? 'text-white' : 'text-slate-500'}`}>
                  {stage.name}
                </p>
                {stage.detail && (
                  <p className={`text-xs mt-0.5 ${isDone ? 'text-slate-500' : isCurrent ? 'text-slate-400' : 'text-slate-600'}`}>
                    {stage.detail}
                  </p>
                )}
              </div>

              <div className="shrink-0 text-xs font-semibold">
                {isDone && <span className="text-emerald-400">Done</span>}
                {isCurrent && <span className="text-slate-300">Processing...</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
