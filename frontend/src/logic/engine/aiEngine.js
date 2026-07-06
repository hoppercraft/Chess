import { PIECE_SYMBOLS } from '../../utils/constants.js'
import { applyMove } from './applyMove.js'
import { buildHighlights } from './gameState.js'

import { isCheck } from '../validation/isCheck.js'
import { isCheckmate } from '../validation/isCheckmate.js'
import { isStalemate } from '../validation/isStalemate.js'

import { positionToFen } from '../board/fenConverter.js'

const API_BASE = 'http://localhost:8000/api'

async function fetchRandomMove(fenString) {
  const res = await fetch(`${API_BASE}/engine/random-move/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fen: fenString }),
  })

  const data = await res.json()
  return data.move
}

async function fetchBestMove(fenString, level) {
  try {
    const res = await fetch(`${API_BASE}/engine/best-move/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fen: fenString,
        depth: level,
      }),
    })

    const data = await res.json()

    if (data && data.from && data.to) {
      return `${data.from}${data.to}`
    }
  } catch (err) {
    console.error('Error fetching best move:', err)
  }

  return null
}

function uciToMove(uci, position) {
  if (!uci || uci.length < 4) return null

  const from = uci.slice(0, 2)
  const to = uci.slice(2, 4)

  const piece = position[from]

  if (!piece) return null

  return {
    from,
    to,
    pieceType: piece.pieceType,
  }
}

export async function makeAIMove(
  currentPosition,
  currentTurn,
  level,
  setPosition,
  setTurn,
  setGameStatus,
  setMoveHistory,
  setLastMove,
  setHighlightSquares,
  setCapturedByWhite,
  setCapturedByBlack,
  castleRights,
  setCastleRights,
  setEnPassantSquare
) {
  const fen = positionToFen(
    currentPosition,
    currentTurn,
    castleRights,
    null,
    0,
    1
  )

  let uci

  if (level === 0) {
    uci = await fetchRandomMove(fen)
  } else {
    uci = await fetchBestMove(fen, level)

    if (!uci) {
      // Fallback until backend engine is fully implemented
      uci = await fetchRandomMove(fen)
    }
  }

  if (!uci) return false

  const move = uciToMove(uci, currentPosition)

  if (!move) return false

  const newPosition = applyMove(
    move.from,
    move.to,
    currentPosition,
    currentTurn,
    null
  )

  if (!newPosition) return false

  const piece = currentPosition[move.from]
  const targetPiece = currentPosition[move.to]

  const type = piece.pieceType[1]

  const notation =
    `${PIECE_SYMBOLS[type] || ''}` +
    `${move.from}` +
    `${targetPiece ? 'x' : '→'}` +
    `${move.to}`

  const lastMove = {
    from: move.from,
    to: move.to,
  }

  setMoveHistory(prev => [...prev, notation])

  if (targetPiece) {
    if (currentTurn === 'w') {
      setCapturedByWhite(prev => [...prev, targetPiece.pieceType])
    } else {
      setCapturedByBlack(prev => [...prev, targetPiece.pieceType])
    }
  }

  setLastMove(lastMove)

  setHighlightSquares(
    buildHighlights(
      null,
      newPosition,
      lastMove,
      castleRights,
      null
    )
  )

  setPosition(newPosition)

  const nextTurn = currentTurn === 'w' ? 'b' : 'w'

  if (isCheckmate(newPosition, nextTurn)) {
    setGameStatus('checkmate')
  } else if (isStalemate(newPosition, nextTurn)) {
    setGameStatus('stalemate')
  } else if (isCheck(newPosition, nextTurn)) {
    setGameStatus('check')
  } else {
    setGameStatus('playing')
  }

  setTurn(nextTurn)

  const rights = { ...castleRights }

  if (move.from === 'e1') rights.wKingMoved = true
  if (move.from === 'e8') rights.bKingMoved = true

  if (move.from === 'a1') rights.wLeftRookMoved = true
  if (move.from === 'h1') rights.wRightRookMoved = true

  if (move.from === 'a8') rights.bLeftRookMoved = true
  if (move.from === 'h8') rights.bRightRookMoved = true

  setCastleRights(rights)

  setEnPassantSquare(null)

  return true
}