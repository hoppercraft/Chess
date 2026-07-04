export default function LocalSetupModal({ onSelect }) {
  return (
    <div className="local-setup-overlay">
      <div className="local-setup-modal">
        <div className="local-setup-header">
          <h2>Local 1v1 Setup</h2>
          <p className="local-setup-subtitle">
            Auto-Flip Board? (highly recommended for shared-screen local play)
          </p>
        </div>
        <div className="local-setup-buttons">
          <button
            className="local-setup-btn local-setup-btn--primary"
            onClick={() => onSelect(true)}
          >
            Enable Auto-Flip
          </button>
          <button
            className="local-setup-btn local-setup-btn--secondary"
            onClick={() => onSelect(false)}
          >
            Keep Static Perspective
          </button>
        </div>
      </div>
    </div>
  )
}