import { useEffect, useRef, useState } from 'react'
import { AlertCircle, ArrowLeft, CheckCircle2, Mail, RotateCw } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import AuthLayout from '@/components/auth/AuthLayout.jsx'
import { getButtonClasses } from '@/components/common/buttonStyles.js'
import { useAuth } from '@/hooks/useAuth.js'
import { DEV_OTP, maskEmail, mockAuth } from '@/services/mockAuth.js'

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { verifyOtp, sendOtp } = useAuth()

  // Retrieve email from router state or pending signup store
  const [email] = useState(() => {
    return (
      location.state?.email ||
      mockAuth.getPendingSignup()?.email ||
      'patient@example.com'
    )
  })

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef([])

  const [resendTimer, setResendTimer] = useState(30)
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Countdown timer for resend code
  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = setInterval(() => {
      setResendTimer((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendTimer])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const otpValue = otpDigits.join('')

  const handleDigitChange = (index, value) => {
    if (error) setError('')
    // Handle paste of multiple characters
    const digitsOnly = value.replace(/\D/g, '')

    if (digitsOnly.length > 1) {
      // Pasted a string of digits
      const nextDigits = [...otpDigits]
      const pastedChars = digitsOnly.slice(0, 6).split('')
      for (let i = 0; i < 6; i++) {
        nextDigits[i] = pastedChars[i] || ''
      }
      setOtpDigits(nextDigits)
      const nextIndex = Math.min(pastedChars.length, 5)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    const nextDigits = [...otpDigits]
    nextDigits[index] = digitsOnly ? digitsOnly[digitsOnly.length - 1] : ''
    setOtpDigits(nextDigits)

    // Move to next input if single digit typed
    if (digitsOnly && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '')
    if (!pastedData) return

    const nextDigits = [...otpDigits]
    const chars = pastedData.slice(0, 6).split('')
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = chars[i] || ''
    }
    setOtpDigits(nextDigits)
    const targetFocus = Math.min(chars.length, 5)
    inputRefs.current[targetFocus]?.focus()
  }

  const handleVerify = async (e) => {
    if (e) e.preventDefault()
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits of the verification code.')
      return
    }

    try {
      setIsVerifying(true)
      setError('')
      const result = await verifyOtp(email, otpValue)
      setSuccessMessage(result.message || 'Email verified successfully.')

      // Brief delay to allow user to see success state before entering application
      setTimeout(() => {
        navigate('/dashboard/demo', { replace: true })
      }, 700)
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return
    try {
      setIsResending(true)
      setError('')
      await sendOtp(email)
      setResendTimer(30)
      setOtpDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the verification code sent to your email address."
    >
      <div className="space-y-6">
        {/* Email target indicator */}
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Mail className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <span>
              Code sent to: <strong className="font-semibold">{maskEmail(email)}</strong>
            </span>
          </div>
          <Link
            to="/signup"
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
          >
            Change Email
          </Link>
        </div>

        {/* Error alert */}
        {error && (
          <div
            className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Success alert */}
        {successMessage && (
          <div
            className="flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700"
            role="status"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <span>{successMessage} Redirecting to your dashboard...</span>
          </div>
        )}

        {/* 6-digit OTP Inputs */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="block text-center text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3">
              6-Digit Verification Code
            </label>
            <div
              className="flex items-center justify-center gap-2 sm:gap-3"
              onPaste={handlePaste}
            >
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  aria-label={`Digit ${index + 1}`}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`h-12 w-11 sm:h-14 sm:w-12 rounded-xl border text-center text-xl font-bold transition-all focus:outline-none ${
                    digit
                      ? 'border-blue-500 bg-blue-500/10 text-white ring-1 ring-blue-500'
                      : 'border-white/10 bg-slate-900/60 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Quick-fill helper for developer convenience during hackathon demo */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                setOtpDigits(DEV_OTP.split(''))
                inputRefs.current[5]?.focus()
              }}
              className="text-[11px] text-slate-400 hover:text-blue-600 transition-colors underline decoration-dotted"
            >
              Fill mock code ({DEV_OTP})
            </button>
          </div>

          {/* Verify button */}
          <button
            type="submit"
            disabled={otpValue.length !== 6 || isVerifying || Boolean(successMessage)}
            className={getButtonClasses({
              variant: 'primary',
              size: 'md',
              className: 'w-full justify-center',
            })}
          >
            {isVerifying ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Verifying...
              </span>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>

        {/* Resend actions & countdown */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
          <Link
            to="/signup"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign Up
          </Link>

          <div>
            {resendTimer > 0 ? (
              <span className="text-slate-400 font-medium">
                Resend code in <strong className="text-slate-600">{resendTimer}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
              >
                <RotateCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
                Resend Code
              </button>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
