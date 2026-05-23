import { useState } from 'react'
import './styles/board.css'

import Navbar         from './components/common/Navbar.jsx'
import ChessBoard     from './components/board/ChessBoard.jsx'
import GameInfo       from './components/game/GameInfo.jsx'
import GameControls   from './components/game/GameControls.jsx'
import MoveHistory      from './components/game/MoveHistory.jsx'
import CapturedPieces  from './components/game/CapturedPieces.jsx'

import { INITIAL_POSITION, PIECE_SYMBOLS } from './utils/constants.js'
import { applyMove }    from './logic/engine/applyMove.js'
import { buildHighlights } from './logic/engine/gameState.js'

export default function App() {
  const [turn,             setTurn]             = useState('w')
  const [position,         setPosition]         = useState(() => ({ ...INITIAL_POSITION }))
  const [moveHistory,      setMoveHistory]      = useState([])
  const [showHistory,      setShowHistory]      = useState(false)
  const [highlightSquares, setHighlightSquares] = useState({})
  const [lastMove,         setLastMove]         = useState(null)
  const [capturedByWhite,  setCapturedByWhite]  = useState([]) // black pieces white took
  const [capturedByBlack,  setCapturedByBlack]  = useState([]) // white pieces black took

  // ── Square click — select piece and preview valid moves ──────────────────
  function onSquareClick({ square }) {
    const piece = position[square]
    if (piece && piece.pieceType[0] === turn) {
      setHighlightSquares(buildHighlights(square, position, lastMove))
    } else {
      setHighlightSquares(buildHighlights(null, position, lastMove))
    }
  }

  // ── Drag & drop — validate, apply, and record the move ───────────────────
  function onPieceDrop({ sourceSquare, targetSquare }) {
    const newPosition = applyMove(sourceSquare, targetSquare, position, turn)
    if (!newPosition) return false

    const piece      = position[sourceSquare]
    const type       = piece.pieceType[1]
    const targetPiece = position[targetSquare]
    const notation   = `${PIECE_SYMBOLS[type] || ''}${sourceSquare}${targetPiece ? 'x' : '→'}${targetSquare}`

    const lm = { from: sourceSquare, to: targetSquare }
    setMoveHistory(prev => [...prev, notation])

    // Track captured piece
    if (targetPiece) {
      if (turn === 'w') setCapturedByWhite(prev => [...prev, targetPiece.pieceType])
      else              setCapturedByBlack(prev => [...prev, targetPiece.pieceType])
    }

    setLastMove(lm)
    setHighlightSquares(buildHighlights(null, newPosition, lm))
    setPosition(newPosition)
    setTurn(t => t === 'w' ? 'b' : 'w')
    return true
  }

  // ── Reset ────────────────────────────────────────────────────────────────
  function resetGame() {
    setPosition({ ...INITIAL_POSITION })
    setTurn('w')
    setMoveHistory([])
    setLastMove(null)
    setHighlightSquares({})
    setCapturedByWhite([])
    setCapturedByBlack([])
  }

  return (
    <>
      <Navbar />

      <main className="chess-app">
        <ChessBoard
          position={position}
          turn={turn}
          highlightSquares={highlightSquares}
          onPieceDrop={onPieceDrop}
          onSquareClick={onSquareClick}
        />

        <aside className="side-panel">
          <GameInfo turn={turn} moveCount={moveHistory.length} />
          <CapturedPieces
            capturedByWhite={capturedByWhite}
            capturedByBlack={capturedByBlack}
          />
          <GameControls
            showHistory={showHistory}
            onToggleHistory={() => setShowHistory(p => !p)}
            onNewGame={resetGame}
          />
          {showHistory && <MoveHistory moveHistory={moveHistory} />}
        </aside>
      </main>
    </>
  )
}