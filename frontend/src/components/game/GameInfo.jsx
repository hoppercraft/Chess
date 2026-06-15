/**
 * GameInfo
 * Small card that summarises mode, active turn, and total move count.
 */
export default function GameInfo({ turn, moveCount }) {
  return (
    <div className="game-info">
      <div className="game-info-header">♟ Game Info</div>
      <div className="game-info-body">
        <div className="info-row">
          <span className="info-label">Mode</span>
          <span className="info-value">Local 2P</span>
        </div>
        <div className="info-row">
          <span className="info-label">Turn</span>
          <span className="info-value">{turn === 'w' ? 'White' : 'Black'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Moves</span>
          <span className="info-value">{moveCount}</span>
        </div>
      </div>
    </div>
  )
}