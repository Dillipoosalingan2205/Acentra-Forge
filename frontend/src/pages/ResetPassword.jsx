import { useState } from 'react'
import { AlertCircle, ArrowLeft, Check, CheckCircle2, Eye, EyeOff, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import AuthLayout from '@/components/auth/AuthLayout.jsx'
import PasswordRequirements from '@/components/auth/PasswordRequirements.jsx'
import { getButtonClasses } from '@/components/common/buttonStyles.js'
import { useAuth } from '@/hooks/useAuth.js'
import { validateEmail, validatePassword } from '@/services/mockAuth.js'

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const { resetPassword } = useAuth()

  const [email, setEmail] = useState(() => {
    return location.state?.email || 'demo@acentra.health'
  })

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const passwordValidation = validatePassword(newPassword)
  const passwordsMatch =
    Boolean(newPassword) &&
    Boolean(confirmPassword) &&
    newPassword === confirmPassword

  const isFormValid =
    validateEmail(email) &&
    passwordValidation.isValid &&
    passwordsMatch

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({
      email: true,
      newPassword: true,
      confirmPassword: true,
    })

    if (!validateEmail(email)) {
      setFormError('Enter a valid email address.')
      return
    }

    if (!passwordValidation.isValid) {
      setFormError('Password must satisfy all security requirements.')
      return
    }

    if (!passwordsMatch) {
      setFormError('Passwords do not match.')
      return
    }

    try {
      setIsSubmitting(true)
      setFormError('')
      await resetPassword({
        email: email.trim().toLowerCase(),
        newPassword,
      })
      setSuccessMessage('Password reset successfully.')

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            message: 'Password reset successfully. Please sign in with your new password.',
          },
        })
      }, 700)
    } catch (err) {
      setFormError(err.message || 'Unable to reset password for this account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Choose a new secure password for your account."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Success Alert */}
        {successMessage && (
          <div
            className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300"
            role="status"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            <span>{successMessage} Redirecting to sign in...</span>
          </div>
        )}

        {/* Error Alert */}
        {formError && (
          <div
            className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
          >
            Account Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (formError) setFormError('')
            }}
            onBlur={() => setTouched((p) => ({ ...p, email: true }))}
            className="w-full rounded-xl border border-white/10 bg-[#111113] px-3.5 py-2.5 text-sm text-white transition-colors focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="e.g. Acentra@2026"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                if (formError) setFormError('')
              }}
              onBlur={() => setTouched((p) => ({ ...p, newPassword: true }))}
              className="w-full rounded-xl border border-white/10 bg-[#111113] px-3.5 py-2.5 pr-10 text-sm text-white transition-colors placeholder:text-zinc-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {/* Password Requirements Checklist */}
          <div className="mt-2.5">
            <PasswordRequirements password={newPassword} />
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (formError) setFormError('')
              }}
              onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
              className={`w-full rounded-xl border px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-zinc-500 transition-colors focus:outline-none ${
                confirmPassword && !passwordsMatch
                  ? 'border-rose-500/50 bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-white/10 bg-[#111113] focus:border-white/40 focus:ring-1 focus:ring-white/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded transition-colors"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Match Indicator */}
          {confirmPassword && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs">
              {passwordsMatch ? (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Check className="h-3 w-3 stroke-[3]" /> Passwords match
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-400">
                  <X className="h-3 w-3 stroke-[3]" /> Passwords do not match
                </span>
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className={getButtonClasses({
            variant: 'primary',
            size: 'md',
            className: 'w-full mt-2 justify-center',
          })}
        >
          {isSubmitting ? 'Updating password...' : 'Update Password'}
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
