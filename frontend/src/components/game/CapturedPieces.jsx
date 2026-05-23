/**
 * CapturedPieces
 * Shows pieces captured by each side, grouped by piece type with counts.
 *
 * Props:
 *   capturedByWhite – array of pieceType strings captured BY white (black pieces)
 *   capturedByBlack – array of pieceType strings captured BY black (white pieces)
 */

const PIECE_UNICODE = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
}

// Point values for material advantage calculation
const PIECE_VALUE = { K: 0, Q: 9, R: 5, B: 3, N: 3, P: 1 }

// Display order: most valuable first
const PIECE_ORDER = ['Q', 'R', 'B', 'N', 'P']

function groupPieces(pieces) {
  const counts = {}
  pieces.forEach(pt => {
    counts[pt] = (counts[pt] || 0) + 1
  })
  return counts
}

function materialScore(pieces) {
  return pieces.reduce((sum, pt) => sum + (PIECE_VALUE[pt[1]] || 0), 0)
}

function PieceRow({ label, dotClass, pieces, color }) {
  const grouped = groupPieces(pieces)
  const score   = materialScore(pieces)

  return (
    <div className="captured-row">
      <div className="captured-row-header">
        <span className={`captured-dot ${dotClass}`} />
        <span className="captured-label">{label}</span>
        {score > 0 && <span className="captured-score">+{score}</span>}
      </div>
      <div className="captured-pieces-grid">
        {pieces.length === 0 ? (
          <span className="captured-empty">None yet</span>
        ) : (
          PIECE_ORDER
            .filter(type => grouped[color + type])
            .map(type => {
              const pt    = color + type
              const count = grouped[pt]
              return (
                <span key={pt} className="captured-piece-group">
                  <span className="captured-piece-icon">{PIECE_UNICODE[pt]}</span>
                  {count > 1 && <span className="captured-piece-count">×{count}</span>}
                </span>
              )
            })
        )}
      </div>
    </div>
  )
}

export default function CapturedPieces({ capturedByWhite, capturedByBlack }) {
  return (
    <div className="captured-panel">
      <div className="captured-header">⚔ Captured Pieces</div>
      <div className="captured-body">
        {/* White captured black pieces */}
        <PieceRow
          label="White captured"
          dotClass="dot-white"
          pieces={capturedByWhite}
          color="b"
        />
        <div className="captured-divider" />
        {/* Black captured white pieces */}
        <PieceRow
          label="Black captured"
          dotClass="dot-black"
          pieces={capturedByBlack}
          color="w"
        />
      </div>
    </div>
  )
}