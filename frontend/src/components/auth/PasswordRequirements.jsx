import { Check, X } from 'lucide-react'
import { validatePassword } from '@/services/mockAuth.js'

export default function PasswordRequirements({ password = '', showOnlyWhenTyping = false }) {
  if (showOnlyWhenTyping && !password) {
    return null
  }

  const { minLength, hasUpper, hasLower, hasNumber, hasSpecial } = validatePassword(password)

  const rules = [
    { label: 'At least 8 characters', valid: minLength },
    { label: 'One uppercase letter (A-Z)', valid: hasUpper },
    { label: 'One lowercase letter (a-z)', valid: hasLower },
    { label: 'One number (0-9)', valid: hasNumber },
    { label: 'One special character (!@#$%^&*)', valid: hasSpecial },
  ]

  return (
    <div className="rounded-xl border border-white/[0.08] bg-slate-900/60 p-3.5 text-xs" aria-live="polite">
      <p className="font-semibold text-slate-300 mb-2">Password requirements:</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {rules.map((rule) => (
          <li
            key={rule.label}
            className={`flex items-center gap-2 transition-colors ${
              rule.valid ? 'text-emerald-300 font-medium' : 'text-slate-500'
            }`}
          >
            {rule.valid ? (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                <Check className="h-2.5 w-2.5 stroke-[3]" aria-hidden="true" />
              </span>
            ) : (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-500">
                <X className="h-2.5 w-2.5 stroke-[2.5]" aria-hidden="true" />
              </span>
            )}
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
