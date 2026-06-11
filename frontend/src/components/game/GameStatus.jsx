/**
 * GameStatus
 * Displays turn, check, checkmate and stalemate status.
 */
export default function GameStatus({ turn, gameStatus }) {
  let message = turn === 'w'
    ? 'White to Move'
    : 'Black to Move'

  if (gameStatus === 'check') {
    message += ' — CHECK!'
  }

  if (gameStatus === 'checkmate') {
    message = turn === 'w'
      ? 'White is Checkmated!'
      : 'Black is Checkmated!'
  }

  if (gameStatus === 'stalemate') {
    message = 'STALEMATE!'
  }

  return (
    <div className={`turn-indicator ${turn === 'w' ? 'white' : 'black'}`}>
      <span className="turn-dot" />
      {message}
    </div>
  )
}