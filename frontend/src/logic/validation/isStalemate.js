import { isCheck } from './isCheck.js'
import { getAllLegalMoves } from './getAllLegalMoves.js'

export function isStalemate(position, color) {
  if (isCheck(position, color)) {
    return false
  }

  const moves = getAllLegalMoves(
    position,
    color
  )

  return moves.length === 0
}