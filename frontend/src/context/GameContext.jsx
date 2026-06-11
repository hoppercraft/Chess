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
 const [castleRights, setCastleRights] = useState({
  wKingMoved: false,
  bKingMoved: false,

  wLeftRookMoved: false,
  wRightRookMoved: false,

  bLeftRookMoved: false,
  bRightRookMoved: false,
})
  const [enPassantSquare, setEnPassantSquare] = useState(null)
  const [moveHistory,      setMoveHistory]      = useState([])
  const [promotionData, setPromotionData] = useState(null)
  const [showHistory,      setShowHistory]      = useState(false)
  const [highlightSquares, setHighlightSquares] = useState({})
  const [lastMove,         setLastMove]         = useState(null)
  const [capturedByWhite,  setCapturedByWhite]  = useState([])
  const [capturedByBlack,  setCapturedByBlack]  = useState([])

  function onSquareClick({ square }) {
    const piece = position[square]
    if (piece && piece.pieceType[0] === turn) {
      setHighlightSquares(buildHighlights(square, position, lastMove, castleRights, enPassantSquare))
    } else {
      setHighlightSquares(buildHighlights(null, position, lastMove, castleRights, enPassantSquare))
    }
  }

function onPieceDrop({ sourceSquare, targetSquare }) {

  if (
    gameStatus === 'checkmate' ||
    gameStatus === 'stalemate'
  ) {
    return false
  }

  const newPosition = applyMove(sourceSquare, targetSquare, position, turn, enPassantSquare)
  if (!newPosition) return false

  const piece       = position[sourceSquare]

  // handle promotion target square setting and promotion piece selection trigger

const promotionRank =
  piece.pieceType[0] === 'w'
    ? '8'
    : '1'

if (
  piece.pieceType[1] === 'P' &&
  targetSquare[1] === promotionRank
) {
  setPromotionData({
    sourceSquare,
    targetSquare,
    color: piece.pieceType[0],
  })

  return false
}


  // handle en passanr target square setting a pawn double move 
  // and reset after every move if not a double pawn move


  if (piece.pieceType[1] === 'P') {

  const startRank = Number(sourceSquare[1])
  const endRank = Number(targetSquare[1])

  if (Math.abs(endRank - startRank) === 2) {

    const middleRank =
      (startRank + endRank) / 2

    setEnPassantSquare(
      sourceSquare[0] + middleRank
    )

  } else {

    setEnPassantSquare(null)

  }

} else {

  setEnPassantSquare(null)

}

   // castling rights update after every move from or to the relevant squares 
  const rights = { ...castleRights }

if (sourceSquare === 'e1') rights.wKingMoved = true
if (sourceSquare === 'e8') rights.bKingMoved = true

if (sourceSquare === 'a1') rights.wLeftRookMoved = true
if (sourceSquare === 'h1') rights.wRightRookMoved = true

if (sourceSquare === 'a8') rights.bLeftRookMoved = true
if (sourceSquare === 'h8') rights.bRightRookMoved = true

setCastleRights(rights)



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
  setHighlightSquares(buildHighlights(null, newPosition, lm, castleRights,enPassantSquare))
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
// reset castling rights to initial state on game reset 
  setCastleRights({
  wKingMoved: false,
  bKingMoved: false,

  wLeftRookMoved: false,
  wRightRookMoved: false,

  bLeftRookMoved: false,
  bRightRookMoved: false,
})


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