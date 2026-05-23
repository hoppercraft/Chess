import { useState } from 'react'
import './styles/board.css'

import Navbar          from './components/common/Navbar.jsx'
import ChessBoard      from './components/board/ChessBoard.jsx'
import GameInfo        from './components/game/GameInfo.jsx'
import GameControls    from './components/game/GameControls.jsx'
import MoveHistory     from './components/game/MoveHistory.jsx'
import CapturedPieces  from './components/game/CapturedPieces.jsx'
import Dashboard       from './pages/Dashboard.jsx'

import { INITIAL_POSITION, PIECE_SYMBOLS } from './utils/constants.js'
import { applyMove }       from './logic/engine/applyMove.js'
import { buildHighlights } from './logic/engine/gameState.js'

export default function App() {
  // ── Routing ───────────────────────────────────────────────────────────────
  const [page, setPage] = useState('dashboard') // 'dashboard' | 'pvp'

  // ── Game state ────────────────────────────────────────────────────────────
  const [turn,             setTurn]             = useState('w')
  const [position,         setPosition]         = useState(() => ({ ...INITIAL_POSITION }))
  const [moveHistory,      setMoveHistory]      = useState([])
  const [showHistory,      setShowHistory]      = useState(false)
  const [highlightSquares, setHighlightSquares] = useState({})
  const [lastMove,         setLastMove]         = useState(null)
  const [capturedByWhite,  setCapturedByWhite]  = useState([])
  const [capturedByBlack,  setCapturedByBlack]  = useState([])

  // ── Navigate to a game mode ───────────────────────────────────────────────
  function handleNavigate(mode) {
    resetGame()
    setPage(mode)
  }

  // ── Square click ──────────────────────────────────────────────────────────
  function onSquareClick({ square }) {
    const piece = position[square]
    if (piece && piece.pieceType[0] === turn) {
      setHighlightSquares(buildHighlights(square, position, lastMove))
    } else {
      setHighlightSquares(buildHighlights(null, position, lastMove))
    }
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────
  function onPieceDrop({ sourceSquare, targetSquare }) {
    const newPosition = applyMove(sourceSquare, targetSquare, position, turn)
    if (!newPosition) return false

    const piece       = position[sourceSquare]
    const type        = piece.pieceType[1]
    const targetPiece = position[targetSquare]
    const notation    = `${PIECE_SYMBOLS[type] || ''}${sourceSquare}${targetPiece ? 'x' : '→'}${targetSquare}`

    const lm = { from: sourceSquare, to: targetSquare }
    setMoveHistory(prev => [...prev, notation])

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

  // ── Reset ─────────────────────────────────────────────────────────────────
  function resetGame() {
    setPosition({ ...INITIAL_POSITION })
    setTurn('w')
    setMoveHistory([])
    setLastMove(null)
    setHighlightSquares({})
    setCapturedByWhite([])
    setCapturedByBlack([])
    setShowHistory(false)
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  if (page === 'dashboard') {
    return (
      <>
        <Navbar />
        <Dashboard onNavigate={handleNavigate} />
      </>
    )
  }

  // ── PvP board ─────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar onBack={() => setPage('dashboard')} />

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