import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/authApi.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('chess_token')
    if (token) {
      authApi.me(token)
        .then(data => setUser(data.user))
        .catch(() => localStorage.removeItem('chess_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(email, password) {
    const data = await authApi.login(email, password)
    localStorage.setItem('chess_token', data.token)
    localStorage.setItem('chess_refresh', data.refresh)
    setUser(data.user)
    return data
  }

  async function register(username, email, password, password2) {
    const data = await authApi.register(username, email, password, password2)
    localStorage.setItem('chess_token', data.token)
    localStorage.setItem('chess_refresh', data.refresh)
    setUser(data.user)
    return data
  }

  function logout() {
    const refresh = localStorage.getItem('chess_refresh')
    authApi.logout(refresh).catch(() => {})
    localStorage.removeItem('chess_token')
    localStorage.removeItem('chess_refresh')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}