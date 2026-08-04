import { Chessboard } from 'react-chessboard'
import { AnimatePresence, motion } from 'framer-motion'
import GameStatus from '../game/GameStatus.jsx'
import { useGame } from '../../context/GameContext.jsx'

const BOARD_SIZE = 600

export default function ChessBoard({
  position,
  turn,
  gameStatus,
  highlightSquares,
  onPieceDrop,
  onSquareClick,
  boardOrientation: orientationOverride,
}) {
  const { boardOrientation: contextOrientation } = useGame()
  const boardOrientation = orientationOverride ?? contextOrientation   // ← use override if provided

  return (
    <section className="board-section">
      <GameStatus
        turn={turn}
        gameStatus={gameStatus}
      />

      <div
        className="board-wrapper"
        style={{
          width: BOARD_SIZE,
          height: BOARD_SIZE,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={boardOrientation}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <Chessboard
              options={{
                position,
                boardOrientation,
                onPieceDrop,
                allowDragging: true,
                squareStyles: highlightSquares,
                onSquareClick,
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}