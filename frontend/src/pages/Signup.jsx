import { useState } from 'react'
import { AlertCircle, Check, Eye, EyeOff, X } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import AuthLayout from '@/components/auth/AuthLayout.jsx'
import PasswordRequirements from '@/components/auth/PasswordRequirements.jsx'
import { getButtonClasses } from '@/components/common/buttonStyles.js'
import { useAuth } from '@/hooks/useAuth.js'
import { validateEmail, validatePassword } from '@/services/mockAuth.js'

export default function Signup() {
  const navigate = useNavigate()
  const { signup, isAuthenticated } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/dashboard/demo" replace />
  }

  const passwordValidation = validatePassword(formData.password)
  const isEmailValid = validateEmail(formData.email)
  const passwordsMatch =
    Boolean(formData.password) &&
    Boolean(formData.confirmPassword) &&
    formData.password === formData.confirmPassword

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formError) setFormError('')
  }

  const isFormValid =
    Boolean(formData.name.trim()) &&
    isEmailValid &&
    passwordValidation.isValid &&
    passwordsMatch

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    })

    if (!formData.name.trim()) {
      setFormError('Please enter your full name.')
      return
    }

    if (!isEmailValid) {
      setFormError('Please enter a valid email address.')
      return
    }

    if (!passwordValidation.isValid) {
      setFormError('Password must meet all security requirements.')
      return
    }

    if (!passwordsMatch) {
      setFormError('Passwords do not match.')
      return
    }

    try {
      setIsSubmitting(true)
      setFormError('')

      const result = await signup({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      })

      if (result?.requiresVerification) {
        navigate('/verify-email', {
          state: {
            email: formData.email.trim().toLowerCase(),
            from: 'signup',
          },
        })
      } else {
        navigate('/dashboard/demo', { replace: true })
      }
    } catch (err) {
      setFormError(err.message || 'Unable to complete sign up. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Acentra to securely manage hospital discharge and recovery care plans."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="e.g. John Doe"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:outline-none ${
              touched.name && !formData.name.trim()
                ? 'border-rose-500/50 bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-white/10 bg-slate-900/60 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {touched.name && !formData.name.trim() && (
            <p className="mt-1 text-xs text-rose-400">Please enter your full name.</p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="e.g. john@example.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:outline-none ${
              touched.email && !isEmailValid
                ? 'border-rose-500/50 bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-white/10 bg-slate-900/60 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {touched.email && !isEmailValid && (
            <p className="mt-1 text-xs text-rose-400">Enter a valid email address.</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="e.g. Acentra@2026"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2.5 pr-10 text-sm text-white transition-colors placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {/* Real-time Password Requirements Checklist */}
          <div className="mt-2.5">
            <PasswordRequirements password={formData.password} />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => handleBlur('confirmPassword')}
              className={`w-full rounded-xl border px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-slate-500 transition-colors focus:outline-none ${
                touched.confirmPassword && !passwordsMatch
                  ? 'border-rose-500/50 bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-white/10 bg-slate-900/60 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
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

          {/* Match feedback */}
          {formData.confirmPassword && (
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
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>

        {/* Sign In Link */}
        <div className="pt-2 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
