import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { gameApi } from '../api/gameApi.js'

export default function Profile() {
  const { user, logout } = useAuth()
  const [games,   setGames]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    gameApi.getMyGames()
      .then(data => setGames(data.games || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const wins   = games.filter(g => g.result === 'win').length
  const losses = games.filter(g => g.result === 'loss').length
  const draws  = games.filter(g => g.result === 'draw').length

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">♚</div>
        <h2 className="profile-name">{user?.username}</h2>
        <p className="profile-email">{user?.email}</p>

        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{wins}</span>
            <span className="stat-label">Wins</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{losses}</span>
            <span className="stat-label">Losses</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{draws}</span>
            <span className="stat-label">Draws</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{games.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>

        <div className="profile-history">
          <div className="profile-history-header">Recent Games</div>
          {loading ? (
            <div className="profile-loading">Loading…</div>
          ) : games.length === 0 ? (
            <div className="profile-empty">No games recorded yet. Play some games!</div>
          ) : (
            <div className="profile-games-list">
              {games.slice(0, 10).map(g => (
                <div className="profile-game-row" key={g.id}>
                  <span className={`game-result-badge result-${g.result}`}>
                    {g.result?.toUpperCase()}
                  </span>
                  <span className="game-mode">{g.mode}</span>
                  <span className="game-moves">{g.total_moves} moves</span>
                  <span className="game-date">
                    {new Date(g.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="btn-logout" onClick={logout}>Sign Out</button>
      </div>
    </div>
  )
}