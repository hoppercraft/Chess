import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function RegisterForm() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(username, email, password, password2)
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      const firstFieldError = data && typeof data === 'object'
        ? Object.values(data).flat().find(Boolean)
        : null
      setError(
        data?.message
        || data?.password
        || data?.non_field_errors?.[0]
        || firstFieldError
        || 'Registration failed.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-icon">♔</div>
      <h2 className="auth-title">Create Account</h2>
      <p className="auth-sub">Join and start playing</p>

      {error && <div className="auth-error">{error}</div>}

      <div className="auth-form">
        <div className="auth-field">
          <label>Username</label>
          <input
            type="text"
            placeholder="chessgrandmaster"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
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
        <div className="auth-field">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
          />
        </div>
        <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating account…' : 'Register'}
        </button>
      </div>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  )
}