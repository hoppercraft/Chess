import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function RegisterForm() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(username, email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
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