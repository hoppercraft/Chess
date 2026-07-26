/**
 * GameOverModal
 * Shown once the game reaches a terminal state (checkmate, stalemate, or
 * timeout). Blocks the board and forces the player to either start a new
 * game or head back to the dashboard.
 */
export default function GameOverModal({ gameStatus, turn, activeTimer, onNewGame, onGoDashboard }) {
  if (gameStatus !== 'checkmate' && gameStatus !== 'stalemate' && gameStatus !== 'timeout' && gameStatus !== 'draw') {
    return null
  }

  let title = 'Game Over'
  let subtitle = ''

  if (gameStatus === 'stalemate') {
    title = 'Draw'
    subtitle = 'Stalemate — no legal moves remain'
  } else if (gameStatus === 'draw') {
    title = 'Draw'
    subtitle = 'Threefold repetition, 50-move rule, or insufficient material.'
  } else {
    const loserColor = gameStatus === 'timeout' ? activeTimer : turn
    const winner = loserColor === 'w' ? 'Black' : 'White'
    title = `${winner} Wins`
    subtitle = gameStatus === 'timeout' ? 'By timeout' : 'By checkmate'
  }

  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <h2 className="game-over-title">{title}</h2>
        <p className="game-over-subtitle">{subtitle}</p>

        <div className="game-over-actions">
          <button className="game-over-btn game-over-btn--primary" onClick={onNewGame}>
            New Game
          </button>
          <button className="game-over-btn game-over-btn--secondary" onClick={onGoDashboard}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
