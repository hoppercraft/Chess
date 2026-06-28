import { Chessboard } from 'react-chessboard'
import GameStatus from '../game/GameStatus.jsx'
import { useGame } from '../../context/GameContext.jsx'

const BOARD_SIZE = 480

/**
 * ChessBoard
 * Wraps react-chessboard and the turn indicator in a styled board section.
 */
export default function ChessBoard({
  position,
  turn,
  gameStatus,
  highlightSquares,
  onPieceDrop,
  onSquareClick,
}) {
  const { boardOrientation } = useGame()

  return (
    <section className="board-section">
      <GameStatus
  turn={turn}
  gameStatus={gameStatus}
 />
      <div className="board-wrapper">
        <div style={{ width: BOARD_SIZE, height: BOARD_SIZE }}>
          <Chessboard
            key={boardOrientation}
            options={{
              position,
              boardOrientation,
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