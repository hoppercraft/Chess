import { getValidMoves } from '../engine/moveGenerator.js'

export function isCheck(position, color) {
  let kingSquare = null

  for (const square in position) {
    const piece = position[square]

    if (piece.pieceType === `${color}K`) {
      kingSquare = square
      break
    }
  }

  if (!kingSquare) return false

  const enemyColor = color === 'w' ? 'b' : 'w'

  for (const square in position) {
    const piece = position[square]

    if (piece.pieceType[0] !== enemyColor) continue

    const { valid } = getValidMoves(square, position)

    if (valid.includes(kingSquare)) {
      return true
    }
  }

  return false
}