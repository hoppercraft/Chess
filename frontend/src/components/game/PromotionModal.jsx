export default function PromotionModal({
  color,
  onSelect,
}) {
  const pieces = [
    { type: 'Q', label: '♕ Queen' },
    { type: 'R', label: '♖ Rook' },
    { type: 'B', label: '♗ Bishop' },
    { type: 'N', label: '♘ Knight' },
  ]

  return (
    <div className="promotion-overlay">
      <div className="promotion-modal">
        <h3>Choose Promotion</h3>

        {pieces.map(piece => (
          <button
            key={piece.type}
            onClick={() => onSelect(piece.type)}
          >
            {piece.label}
          </button>
        ))}
      </div>
    </div>
  )
}