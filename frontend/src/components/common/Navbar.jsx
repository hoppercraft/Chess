/**
 * Navbar
 * Site-wide header. When onBack is provided, shows a "← Dashboard" button.
 */
export default function Navbar({ onBack }) {
  return (
    <header className="chess-header">
      <span className="crown-icon">♚</span>
      <h1>Chess</h1>
      <span className="crown-icon">♔</span>
      {onBack && (
        <button className="nav-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
      )}
    </header>
  )
}