import { useMemo, useState } from 'react'

import { AuthContext } from '@/context/authContext.js'
import { mockAuth } from '@/services/mockAuth.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      if (mockAuth.isAuthenticated()) {
        return mockAuth.getCurrentUser()
      }
    } catch {
      // fallback
    }
    return null
  })
  const [isLoading] = useState(false)

  const login = async (email, password) => {
    const result = await mockAuth.login(email, password)
    setUser(result.user)
    return result
  }

  const signup = async ({ name, email, password }) => {
    const result = await mockAuth.signup({ name, email, password })
    setUser(result.user)
    return result
  }

  const forgotPassword = async (email) => {
    return await mockAuth.forgotPassword(email)
  }

  const resetPassword = async (params) => {
    return await mockAuth.resetPassword(params)
  }

  const logout = async () => {
    await mockAuth.logout()
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      signup,
      forgotPassword,
      resetPassword,
      logout,
    }),
    [user, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
