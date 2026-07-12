/**
 * Toast
 * Small, non-blocking notification used to surface async feedback
 * (e.g. "Game saved" / "Save failed") without interrupting play.
 */
export default function Toast({ toast, onDismiss }) {
  if (!toast) return null

  const { message, type } = toast
  const icon = type === 'error' ? '⚠' : '✓'

  return (
    <div className={`toast toast--${type}`} role="status">
      <span className="toast-icon">{icon}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-dismiss" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}
