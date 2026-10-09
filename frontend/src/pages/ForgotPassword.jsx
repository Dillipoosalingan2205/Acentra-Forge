import { useState } from 'react'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import AuthLayout from '@/components/auth/AuthLayout.jsx'
import { getButtonClasses } from '@/components/common/buttonStyles.js'
import { useAuth } from '@/hooks/useAuth.js'
import { validateEmail } from '@/services/mockAuth.js'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { forgotPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const isEmailValid = validateEmail(email)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)

    if (!email.trim()) {
      setFormError('Enter your email address.')
      return
    }

    if (!isEmailValid) {
      setFormError('Enter a valid email address.')
      return
    }

    try {
      setIsSubmitting(true)
      setFormError('')
      if (forgotPassword) {
        await forgotPassword(email.trim().toLowerCase())
      }
      navigate('/reset-password', {
        state: { email: email.trim().toLowerCase() },
      })
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address to set a new password for your account."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <div
            className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="e.g. demo@acentra.health"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (formError) setFormError('')
            }}
            onBlur={() => setTouched(true)}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:outline-none ${
              touched && (!email || !isEmailValid)
                ? 'border-rose-500/50 bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-white/10 bg-[#111113] focus:border-white/40 focus:ring-1 focus:ring-white/20'
            }`}
          />
          {touched && !email && (
            <p className="mt-1 text-xs text-rose-400">Enter your email address.</p>
          )}
          {touched && email && !isEmailValid && (
            <p className="mt-1 text-xs text-rose-400">Enter a valid email address.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={getButtonClasses({
            variant: 'primary',
            size: 'md',
            className: 'w-full mt-2 justify-center',
          })}
        >
          {isSubmitting ? 'Continuing...' : 'Continue to Reset Password'}
        </button>

        <div className="pt-2 text-center text-xs">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
