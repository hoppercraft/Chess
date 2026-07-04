import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import PieceIcon from '../components/common/PieceIcon.jsx'

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
          {DECORATIVE_PIECES.map(({ sq, type, color, cls }) => (
            <span key={sq} className={`dash-piece ${cls}`} style={squareStyle(sq)}>
              <PieceIcon type={type} color={color} size={22} />
            </span>
          ))}
        </div>

        <div className="dash-hero-text">
          <p className="dash-hero-eyebrow">{user ? `Welcome back, ${user.username}` : 'Welcome to'}</p>
          <h1 className="dash-hero-title">
            Chess
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
            <div className="dash-card-body">
              <span className="dash-card-title">Local 2 Players</span>
              <span className="dash-card-subtext">pass &amp; play on the same screen</span>
            </div>
            <span className="dash-card-arrow">→</span>
          </button>

          <button className="dash-card dash-card--primary" onClick={() => navigate('/play/engine')}>
            <div className="dash-card-body">
              <span className="dash-card-title">Play vs Engine</span>
              <span className="dash-card-subtext">challenge the computer at different levels</span>
            </div>
            <span className="dash-card-arrow">→</span>
          </button>

          <button className="dash-card dash-card--disabled" disabled>
            <div className="dash-card-body">
              <span className="dash-card-title">Online Multiplayer</span>
              <span className="dash-card-subtext">coming soon</span>
            </div>
            <span className="dash-card-badge">Soon</span>
          </button>

          {user && (
            <button className="dash-card dash-card--secondary" onClick={() => navigate('/profile')}>
              <div className="dash-card-body">
                <span className="dash-card-title">My Profile</span>
                <span className="dash-card-subtext">stats &amp; game history</span>
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
          {RULES.map(({ label, title, desc }) => (
            <div className="dash-rule-item" key={title}>
              <div>
                <div className="dash-rule-title">{title}</div>
                <div className="dash-rule-subtext">{label}</div>
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
  { sq: 'e8', type: 'K', color: 'b', cls: 'p-black' }, { sq: 'd8', type: 'Q', color: 'b', cls: 'p-black' },
  { sq: 'a8', type: 'R', color: 'b', cls: 'p-black' }, { sq: 'h8', type: 'R', color: 'b', cls: 'p-black' },
  { sq: 'b8', type: 'N', color: 'b', cls: 'p-black' }, { sq: 'g8', type: 'N', color: 'b', cls: 'p-black' },
  { sq: 'c8', type: 'B', color: 'b', cls: 'p-black' }, { sq: 'f8', type: 'B', color: 'b', cls: 'p-black' },
  { sq: 'e1', type: 'K', color: 'w', cls: 'p-white' }, { sq: 'd1', type: 'Q', color: 'w', cls: 'p-white' },
  { sq: 'a1', type: 'R', color: 'w', cls: 'p-white' }, { sq: 'h1', type: 'R', color: 'w', cls: 'p-white' },
  { sq: 'e4', type: 'P', color: 'b', cls: 'p-black' }, { sq: 'd5', type: 'P', color: 'w', cls: 'p-white' },
]

const RULES = [
  { label: 'control', title: 'Drag or click',    desc: 'Drag a piece or click to select, then click a destination.' },
  { label: 'movement', title: 'Valid moves',       desc: 'Yellow = selected piece. Orange = squares you can move to.' },
  { label: 'blocks', title: 'Blocked squares',  desc: 'Red highlights show squares your own pieces occupy.' },
  { label: 'history', title: 'Last move',        desc: 'Green highlights show the most recent move made.' },
  { label: 'captures', title: 'Captures',         desc: 'Move onto an enemy piece to capture. Tracked in the side panel.' },
  { label: 'reset', title: 'New game',         desc: 'Hit "New Game" anytime to reset the board and start fresh.' },
]