import { getValidMoves } from '../engine/moveGenerator.js'
import { isLegalMove } from './isLegalMove.js'

export function getAllLegalMoves(position, color) {
  const legalMoves = []

  for (const square in position) {
    const piece = position[square]

    if (piece.pieceType[0] !== color) continue

    const { valid } = getValidMoves(square, position)

    for (const target of valid) {
      if (
        isLegalMove(
          square,
          target,
          position,
          color
        )
      ) {
        legalMoves.push({
          from: square,
          to: target,
        })
      }
    }
  }

  return legalMoves
}