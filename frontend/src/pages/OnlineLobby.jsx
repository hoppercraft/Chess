import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function OnlineLobby() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [joinCode, setJoinCode] = useState('')

  const pageStyle = {
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  if (!user) {
    return (
      <div style={pageStyle}>
        <div className="auth-card">
          <p>You need an account to play online.</p>
          <button className="auth-btn" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </div>
    )
  }

  function createGame() {
    const roomCode = Math.random().toString(36).slice(2, 8)
    navigate(`/play/online/${roomCode}`)
  }

  function joinGame() {
    if (joinCode.trim()) {
      navigate(`/play/online/${joinCode.trim()}`)
    }
  }

  return (
    <div style={pageStyle}>
      <div className="auth-card">
        <h2 className="auth-title">Play Online</h2>
        <button className="auth-btn" onClick={createGame}>Create New Game</button>
        <div className="auth-field">
          <label>Join with code</label>
          <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="Room code" />
        </div>
        <button className="auth-btn" onClick={joinGame}>Join Game</button>
      </div>
    </div>
  )
}