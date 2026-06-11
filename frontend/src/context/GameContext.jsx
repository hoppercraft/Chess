import { createContext, useContext, useState } from 'react'
import { INITIAL_POSITION, PIECE_SYMBOLS } from '../utils/constants.js'
import { applyMove }       from '../logic/engine/applyMove.js'
import { buildHighlights } from '../logic/engine/gameState.js'
import { isCheck } from '../logic/validation/isCheck.js'
import { isCheckmate } from '../logic/validation/isCheckmate.js'
import { isStalemate } from '../logic/validation/isStalemate.js'
const GameContext = createContext(null)



export function GameProvider({ children }) {
  const [turn,             setTurn]             = useState('w')
  const [gameStatus, setGameStatus] = useState('playing')
  const [position,         setPosition]         = useState(() => ({ ...INITIAL_POSITION }))
 // console.log(position)
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

  if (
    gameStatus === 'checkmate' ||
    gameStatus === 'stalemate'
  ) {
    return false
  }

  const newPosition = applyMove(sourceSquare, targetSquare, position, turn)
  if (!newPosition) return false

  const piece       = position[sourceSquare]
  const type        = piece.pieceType[1]
  const targetPiece = position[targetSquare]
  const notation    = `${PIECE_SYMBOLS[type] || ''}${sourceSquare}${targetPiece ? 'x' : '→'}${targetSquare}`

  const lm = { from: sourceSquare, to: targetSquare }
  setMoveHistory(prev => [...prev, notation])

  if (targetPiece) {
    if (turn === 'w') {
      setCapturedByWhite(prev => [...prev, targetPiece.pieceType])
    } else {
      setCapturedByBlack(prev => [...prev, targetPiece.pieceType])
    }
  }

  setLastMove(lm)
  setHighlightSquares(buildHighlights(null, newPosition, lm))
  setPosition(newPosition)

  const nextTurn = turn === 'w' ? 'b' : 'w'

  if (isCheckmate(newPosition, nextTurn)) {
    setGameStatus('checkmate')
  }
  else if (isStalemate(newPosition, nextTurn)) {
    setGameStatus('stalemate')
  }
  else if (isCheck(newPosition, nextTurn)) {
    setGameStatus('check')
  }
  else {
    setGameStatus('playing')
  }

  setTurn(nextTurn)

  return true
}

  function resetGame() {
  setPosition({ ...INITIAL_POSITION })
  setTurn('w')
  setGameStatus('playing')
  setMoveHistory([])
  setLastMove(null)
  setHighlightSquares({})
  setCapturedByWhite([])
  setCapturedByBlack([])
  setShowHistory(false)
}

  return (
    <GameContext.Provider value={{
      turn, gameStatus, position, moveHistory, showHistory, setShowHistory,
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