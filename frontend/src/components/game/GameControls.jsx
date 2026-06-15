/**
 * GameControls
 * Renders the "Show/Hide History" toggle and the "New Game" button.
 */
export default function GameControls({ showHistory, onToggleHistory, onNewGame }) {
  return (
    <div className="btn-row">
      <button
        className={`btn-history ${showHistory ? 'active' : ''}`}
        onClick={onToggleHistory}
      >
        📜 {showHistory ? 'Hide History' : 'Show History'}
      </button>
      <button className="btn-new-game" onClick={onNewGame}>
        New Game
      </button>
    </div>
  )
}