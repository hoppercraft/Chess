import { Chessboard } from 'react-chessboard'
import GameStatus from '../game/GameStatus.jsx'

const BOARD_SIZE = 480

/**
 * ChessBoard
 * Wraps react-chessboard and the turn indicator in a styled board section.
 */
export default function ChessBoard({
  position,
  turn,
  highlightSquares,
  onPieceDrop,
  onSquareClick,
}) {
  return (
    <section className="board-section">
      <GameStatus turn={turn} />
      <div className="board-wrapper">
        <div style={{ width: BOARD_SIZE, height: BOARD_SIZE }}>
          <Chessboard
            options={{
              position,
              onPieceDrop,
              allowDragging: true,
              squareStyles: highlightSquares,
              onSquareClick,
            }}
          />
        </div>
      </div>
    </section>
  )
}