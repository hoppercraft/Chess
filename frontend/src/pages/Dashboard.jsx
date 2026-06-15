import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="dashboard">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="dash-hero">
        <div className="dash-hero-board" aria-hidden="true">
          {Array.from({ length: 64 }, (_, i) => (
            <div key={i} className={`dash-sq ${(Math.floor(i / 8) + i) % 2 === 0 ? 'light' : 'dark'}`} />
          ))}
          {DECORATIVE_PIECES.map(({ sq, symbol, cls }) => (
            <span key={sq} className={`dash-piece ${cls}`} style={squareStyle(sq)}>{symbol}</span>
          ))}
        </div>

        <div className="dash-hero-text">
          <p className="dash-hero-eyebrow">{user ? `Welcome back, ${user.username}` : 'Welcome to'}</p>
          <h1 className="dash-hero-title">
            <span className="dash-crown">♚</span> Chess
          </h1>
          <p className="dash-hero-sub">
            A handcrafted chess engine — play locally, challenge a friend, or study the board.
          </p>
          {!user && (
            <div className="dash-auth-cta">
              <button className="dash-cta-btn dash-cta-primary" onClick={() => navigate('/register')}>
                Create Account
              </button>
              <button className="dash-cta-btn dash-cta-secondary" onClick={() => navigate('/login')}>
                Sign In
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Mode cards ───────────────────────────────────────────────────── */}
      <section className="dash-modes">
        <h2 className="dash-section-title">Choose your game</h2>
        <div className="dash-cards">

          <button className="dash-card dash-card--primary" onClick={() => navigate('/play/local')}>
            <span className="dash-card-icon">♟</span>
            <div className="dash-card-body">
              <span className="dash-card-title">Local 2 Players</span>
              <span className="dash-card-desc">Pass &amp; play on the same screen</span>
            </div>
            <span className="dash-card-arrow">→</span>
          </button>

          <button className="dash-card dash-card--disabled" disabled>
            <span className="dash-card-icon">🤖</span>
            <div className="dash-card-body">
              <span className="dash-card-title">Play vs AI</span>
              <span className="dash-card-desc">Coming soon</span>
            </div>
            <span className="dash-card-badge">Soon</span>
          </button>

          <button className="dash-card dash-card--disabled" disabled>
            <span className="dash-card-icon">🌐</span>
            <div className="dash-card-body">
              <span className="dash-card-title">Online Multiplayer</span>
              <span className="dash-card-desc">Coming soon</span>
            </div>
            <span className="dash-card-badge">Soon</span>
          </button>

          {user && (
            <button className="dash-card dash-card--secondary" onClick={() => navigate('/profile')}>
              <span className="dash-card-icon">👤</span>
              <div className="dash-card-body">
                <span className="dash-card-title">My Profile</span>
                <span className="dash-card-desc">Stats &amp; game history</span>
              </div>
              <span className="dash-card-arrow">→</span>
            </button>
          )}
        </div>
      </section>

      {/* ── How to play ──────────────────────────────────────────────────── */}
      <section className="dash-rules">
        <h2 className="dash-section-title">How to play</h2>
        <div className="dash-rules-grid">
          {RULES.map(({ icon, title, desc }) => (
            <div className="dash-rule-item" key={title}>
              <span className="dash-rule-icon">{icon}</span>
              <div>
                <div className="dash-rule-title">{title}</div>
                <div className="dash-rule-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

const FILES = ['a','b','c','d','e','f','g','h']

function squareStyle(sq) {
  const file = FILES.indexOf(sq[0])
  const rank = 8 - parseInt(sq[1], 10)
  return {
    position: 'absolute',
    left: `${file * 12.5}%`, top: `${rank * 12.5}%`,
    width: '12.5%', height: '12.5%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
}

const DECORATIVE_PIECES = [
  { sq: 'e8', symbol: '♚', cls: 'p-black' }, { sq: 'd8', symbol: '♛', cls: 'p-black' },
  { sq: 'a8', symbol: '♜', cls: 'p-black' }, { sq: 'h8', symbol: '♜', cls: 'p-black' },
  { sq: 'b8', symbol: '♞', cls: 'p-black' }, { sq: 'g8', symbol: '♞', cls: 'p-black' },
  { sq: 'c8', symbol: '♝', cls: 'p-black' }, { sq: 'f8', symbol: '♝', cls: 'p-black' },
  { sq: 'e1', symbol: '♔', cls: 'p-white' }, { sq: 'd1', symbol: '♕', cls: 'p-white' },
  { sq: 'a1', symbol: '♖', cls: 'p-white' }, { sq: 'h1', symbol: '♖', cls: 'p-white' },
  { sq: 'e4', symbol: '♟', cls: 'p-black' }, { sq: 'd5', symbol: '♙', cls: 'p-white' },
]

const RULES = [
  { icon: '🖱️', title: 'Drag or click',    desc: 'Drag a piece or click to select, then click a destination.' },
  { icon: '🟡', title: 'Valid moves',       desc: 'Yellow = selected piece. Orange = squares you can move to.' },
  { icon: '🔴', title: 'Blocked squares',  desc: 'Red highlights show squares your own pieces occupy.' },
  { icon: '🟢', title: 'Last move',        desc: 'Green highlights show the most recent move made.' },
  { icon: '⚔️', title: 'Captures',         desc: 'Move onto an enemy piece to capture. Tracked in the side panel.' },
  { icon: '🔄', title: 'New game',         desc: 'Hit "New Game" anytime to reset the board and start fresh.' },
]