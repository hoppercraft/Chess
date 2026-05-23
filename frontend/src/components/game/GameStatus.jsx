/**
 * GameStatus
 * Displays whose turn it is with a coloured indicator pill.
 */
export default function GameStatus({ turn }) {
  return (
    <div className={`turn-indicator ${turn === 'w' ? 'white' : 'black'}`}>
      <span className="turn-dot" />
      {turn === 'w' ? 'White to Move' : 'Black to Move'}
    </div>
  )
}