/**
 * MoveHistory
 * Renders a scrollable, two-column move list (white / black per row).
 */
export default function MoveHistory({ moveHistory }) {
  return (
    <div className="move-history">
      <div className="move-history-header">📜 Move History</div>
      <div className="move-history-body">
        {moveHistory.length === 0 ? (
          <div className="move-history-empty">No moves yet</div>
        ) : (
          Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
            <div className="move-row" key={i}>
              <span className="move-num">{i + 1}.</span>
              <span className="move-white">{moveHistory[i * 2]}</span>
              <span className="move-black">{moveHistory[i * 2 + 1] || ''}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}