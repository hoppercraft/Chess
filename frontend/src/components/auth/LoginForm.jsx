import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function LoginForm() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-icon">♚</div>
      <h2 className="auth-title">Sign In</h2>
      <p className="auth-sub">Welcome back</p>

      {error && <div className="auth-error">{error}</div>}

      <div className="auth-form">
        <div className="auth-field">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="auth-field">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </div>

      <p className="auth-switch">
        No account? <Link to="/register">Register here</Link>
      </p>
    </div>
  )
}