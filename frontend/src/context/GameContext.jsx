import { createContext, useContext, useState } from 'react'
import { INITIAL_POSITION, PIECE_SYMBOLS } from '../utils/constants.js'
import { applyMove }       from '../logic/engine/applyMove.js'
import { buildHighlights } from '../logic/engine/gameState.js'

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [turn,             setTurn]             = useState('w')
  const [position,         setPosition]         = useState(() => ({ ...INITIAL_POSITION }))
  const [moveHistory,      setMoveHistory]      = useState([])
  const [showHistory,      setShowHistory]      = useState(false)
  const [highlightSquares, setHighlightSquares] = useState({})
  const [lastMove,         setLastMove]         = useState(null)
  const [capturedByWhite,  setCapturedByWhite]  = useState([])
  const [capturedByBlack,  setCapturedByBlack]  = useState([])

  function onSquareClick({ square }) {
    const piece = position[square]
    if (piece && piece.pieceType[0] === turn) {
      setHighlightSquares(buildHighlights(square, position, lastMove))
    } else {
      setHighlightSquares(buildHighlights(null, position, lastMove))
    }
  }

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

  return (
    <GameContext.Provider value={{
      turn, position, moveHistory, showHistory, setShowHistory,
      highlightSquares, capturedByWhite, capturedByBlack,
      onSquareClick, onPieceDrop, resetGame,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  return useContext(GameContext)
}