import { useState } from 'react'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Sparkles } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import AuthLayout from '@/components/auth/AuthLayout.jsx'
import { useAuth } from '@/hooks/useAuth.js'
import { validateEmail } from '@/services/mockAuth.js'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()

  const successNotice = location.state?.message || ''
  const redirectTarget = location.state?.from?.pathname || '/dashboard/demo'

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  if (isAuthenticated) {
    return <Navigate to={redirectTarget} replace />
  }

  const isEmailValid = validateEmail(formData.email)

  const handleBlur = (field) => setTouched((prev) => ({ ...prev, [field]: true }))

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formError) setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true })

    if (!formData.email.trim()) { setFormError('Enter your email address.'); return }
    if (!isEmailValid) { setFormError('Enter a valid email address.'); return }
    if (!formData.password) { setFormError('Enter your password.'); return }

    try {
      setIsSubmitting(true)
      setFormError('')
      await login(formData.email, formData.password)
      navigate(redirectTarget, { replace: true })
    } catch (err) {
      setFormError(err.message || 'Email or password is incorrect.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillDemoCredentials = () => {
    setFormData({ email: 'demo@acentra.health', password: 'Acentra@2026' })
    setFormError('')
    setTouched({})
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue managing your discharge follow-up plan."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {successNotice && (
          <div
            className="flex items-start gap-2.5 rounded-xl p-3 text-xs text-emerald-300"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
            role="status"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{successNotice}</span>
          </div>
        )}

        {formError && (
          <div
            className="flex items-start gap-2.5 rounded-xl p-3 text-xs text-rose-300"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="demo@acentra.health"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            className={`input-dark${touched.email && (!formData.email || !isEmailValid) ? ' error' : ''}`}
          />
          {touched.email && !formData.email && (
            <p className="mt-1.5 text-xs text-rose-400">Enter your email address.</p>
          )}
          {touched.email && formData.email && !isEmailValid && (
            <p className="mt-1.5 text-xs text-rose-400">Enter a valid email address.</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              className={`input-dark pr-11${touched.password && !formData.password ? ' error' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-lg cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {touched.password && !formData.password && (
            <p className="mt-1.5 text-xs text-rose-400">Enter your password.</p>
          )}
        </div>

        {/* Demo credential autofill */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-zinc-300 bg-[#28282a] border border-white/10 hover:bg-[#323234] hover:text-white transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-white" />
            Autofill demo credentials
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-xs font-semibold uppercase tracking-wider text-black bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_20px_rgba(255,255,255,0.3)] hover:bg-[#e4e4e6] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Sign up link */}
        <div className="pt-1 text-center text-xs text-zinc-500">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-white hover:underline transition-colors">
            Create an account
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
