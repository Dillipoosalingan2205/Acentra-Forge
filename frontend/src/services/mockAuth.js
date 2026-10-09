/**
 * Mock Authentication Service — Direct Email + Password Authentication
 *
 * Provides frontend mock authentication without OTP verification.
 * Supports Signup, Login, Forgot/Reset Password, and Logout.
 * Persists sessions in localStorage.
 */

const STORAGE_KEYS = {
  USER: 'auth_user',
  SESSION: 'auth_session',
  ACCOUNTS: 'mock_auth_accounts',
}

// Built-in immutable demo accounts so demo credentials ALWAYS work
export const DEFAULT_ACCOUNTS = [
  {
    id: 'USR-DEMO-001',
    name: 'Demo Provider',
    email: 'demo@acentra.health',
    passwordHash: 'Acentra@2026',
    emailVerified: true,
    role: 'Provider',
    initials: 'DP',
    createdAt: '2026-10-01T00:00:00.000Z',
    isDemo: true,
  },
  {
    id: 'USR-PAT-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    passwordHash: 'Acentra@2026',
    emailVerified: true,
    role: 'Patient',
    initials: 'JD',
    createdAt: '2026-10-08T00:00:00.000Z',
    isDemo: true,
  },
]

// Simulated network latency helper
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

export class AuthError extends Error {
  constructor(message, code = 'AUTH_ERROR') {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

/**
 * Validates password rules:
 * - Minimum 8 characters
 * - Uppercase letter (A-Z)
 * - Lowercase letter (a-z)
 * - Number (0-9)
 * - Special character (!@#$%^&*)
 */
export function validatePassword(password = '') {
  const minLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  return {
    minLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
  }
}

/**
 * Validates email format.
 */
export function validateEmail(email = '') {
  const trimmed = email.trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}

/**
 * Generates user initials from name.
 */
export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return 'U'
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Internal accounts database seeded with demo credentials.
 * Ensures DEFAULT_ACCOUNTS (demo@acentra.health) are always present even if
 * localStorage had stale or modified data.
 */
function getAccounts() {
  let userAccounts = []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        userAccounts = parsed
      }
    }
  } catch {
    // fallback
  }

  // Merge default demo accounts if not already present
  const merged = [...userAccounts]
  for (const defAcc of DEFAULT_ACCOUNTS) {
    const exists = merged.some(
      (a) => a.email.toLowerCase() === defAcc.email.toLowerCase()
    )
    if (!exists) {
      merged.push(defAcc)
    }
  }

  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(merged))
  } catch {
    // ignore
  }

  return merged
}

function saveAccounts(accounts) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts))
  } catch {
    // ignore
  }
}

/**
 * Sanitizes user object before returning to UI components.
 * NEVER exposes passwords or password hashes.
 */
function sanitizeUser(account) {
  if (!account) return null
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    emailVerified: true,
    role: account.role || 'Patient',
    initials: account.initials || getInitials(account.name),
    createdAt: account.createdAt,
    isDemo: Boolean(account.isDemo),
  }
}

export const mockAuth = {
  /**
   * Check if a mock session is currently active.
   */
  isAuthenticated() {
    try {
      const session = localStorage.getItem(STORAGE_KEYS.SESSION)
      const user = localStorage.getItem(STORAGE_KEYS.USER)
      return Boolean(session && user)
    } catch {
      return false
    }
  },

  /**
   * Retrieve current authenticated user object.
   */
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER)
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  },

  /**
   * Direct Signup: validates inputs, creates user immediately, logs them in.
   * No OTP verification required.
   */
  async signup({ name, email, password }) {
    await delay(350)

    const trimmedName = (name || '').trim()
    const trimmedEmail = (email || '').trim().toLowerCase()

    if (!trimmedName) {
      throw new AuthError('Please enter your full name.', 'MISSING_NAME')
    }
    if (!validateEmail(trimmedEmail)) {
      throw new AuthError('Enter a valid email address.', 'INVALID_EMAIL')
    }

    const passCheck = validatePassword(password)
    if (!passCheck.isValid) {
      throw new AuthError(
        'Password does not satisfy the security requirements.',
        'WEAK_PASSWORD',
      )
    }

    const accounts = getAccounts()
    const existing = accounts.find((a) => a.email.toLowerCase() === trimmedEmail)
    if (existing) {
      throw new AuthError(
        'An account with this email address already exists. Please sign in.',
        'DUPLICATE_EMAIL',
      )
    }

    const newAccount = {
      id: `USR-${Date.now().toString(36).toUpperCase()}`,
      name: trimmedName,
      email: trimmedEmail,
      passwordHash: password,
      emailVerified: true,
      role: 'Patient',
      initials: getInitials(trimmedName),
      createdAt: new Date().toISOString(),
    }

    accounts.push(newAccount)
    saveAccounts(accounts)

    // Directly log the user in
    const safeUser = sanitizeUser(newAccount)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser))
    localStorage.setItem(STORAGE_KEYS.SESSION, `mock-token-${Date.now()}`)

    return {
      success: true,
      user: safeUser,
      message: 'Account created successfully.',
    }
  },

  /**
   * Sign in an existing user with email and password.
   */
  async login(email, password) {
    await delay(300)
    const trimmedEmail = (email || '').trim().toLowerCase()
    const trimmedPassword = (password || '').trim()

    if (!trimmedEmail) {
      throw new AuthError('Enter your email address.', 'MISSING_EMAIL')
    }
    if (!validateEmail(trimmedEmail)) {
      throw new AuthError('Enter a valid email address.', 'INVALID_EMAIL')
    }
    if (!trimmedPassword) {
      throw new AuthError('Enter your password.', 'MISSING_PASSWORD')
    }

    // Direct fallback check for built-in demo credentials so demo login ALWAYS works
    if (
      trimmedEmail === 'demo@acentra.health' &&
      trimmedPassword === 'Acentra@2026'
    ) {
      const demoAccount = DEFAULT_ACCOUNTS[0]
      const safeUser = sanitizeUser(demoAccount)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser))
      localStorage.setItem(STORAGE_KEYS.SESSION, `mock-token-${Date.now()}`)
      return {
        success: true,
        user: safeUser,
      }
    }

    if (
      trimmedEmail === 'john.doe@example.com' &&
      trimmedPassword === 'Acentra@2026'
    ) {
      const patientAccount = DEFAULT_ACCOUNTS[1]
      const safeUser = sanitizeUser(patientAccount)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser))
      localStorage.setItem(STORAGE_KEYS.SESSION, `mock-token-${Date.now()}`)
      return {
        success: true,
        user: safeUser,
      }
    }

    const accounts = getAccounts()
    const account = accounts.find((a) => a.email.toLowerCase() === trimmedEmail)

    if (!account || account.passwordHash !== trimmedPassword) {
      throw new AuthError('Email or password is incorrect.', 'INVALID_CREDENTIALS')
    }

    const safeUser = sanitizeUser(account)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser))
    localStorage.setItem(STORAGE_KEYS.SESSION, `mock-token-${Date.now()}`)

    return {
      success: true,
      user: safeUser,
    }
  },

  /**
   * Forgot password: checks email and stages password reset.
   */
  async forgotPassword(email) {
    await delay(250)
    const trimmedEmail = (email || '').trim().toLowerCase()

    if (!trimmedEmail || !validateEmail(trimmedEmail)) {
      throw new AuthError('Enter a valid email address.', 'INVALID_EMAIL')
    }

    return {
      success: true,
      email: trimmedEmail,
      message: 'Password reset request acknowledged.',
    }
  },

  /**
   * Direct Reset Password: sets new password directly for email without OTP.
   */
  async resetPassword({ email, newPassword }) {
    await delay(350)
    const trimmedEmail = (email || '').trim().toLowerCase()

    if (!trimmedEmail || !validateEmail(trimmedEmail)) {
      throw new AuthError('Enter a valid email address.', 'INVALID_EMAIL')
    }

    const passCheck = validatePassword(newPassword)
    if (!passCheck.isValid) {
      throw new AuthError(
        'Password does not satisfy the security requirements.',
        'WEAK_PASSWORD',
      )
    }

    const accounts = getAccounts()
    const accountIndex = accounts.findIndex((a) => a.email.toLowerCase() === trimmedEmail)

    if (accountIndex === -1) {
      accounts.push({
        id: `USR-${Date.now().toString(36).toUpperCase()}`,
        name: 'Patient User',
        email: trimmedEmail,
        passwordHash: newPassword,
        emailVerified: true,
        role: 'Patient',
        initials: 'PU',
        createdAt: new Date().toISOString(),
      })
    } else {
      accounts[accountIndex].passwordHash = newPassword
    }

    saveAccounts(accounts)

    return {
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.',
    }
  },

  /**
   * Sign out and clear mock session.
   */
  async logout() {
    await delay(100)
    try {
      localStorage.removeItem(STORAGE_KEYS.USER)
      localStorage.removeItem(STORAGE_KEYS.SESSION)
    } catch {
      // ignore
    }
    return { success: true }
  },
}

// Standalone named function exports
export const signup = (params) => mockAuth.signup(params)
export const login = (email, password) => mockAuth.login(email, password)
export const logout = () => mockAuth.logout()
export const forgotPassword = (email) => mockAuth.forgotPassword(email)
export const resetPassword = (params) => mockAuth.resetPassword(params)
export const getCurrentUser = () => mockAuth.getCurrentUser()
