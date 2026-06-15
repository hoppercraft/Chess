import { isCheck } from './isCheck.js'

export function isLegalMove(
  sourceSquare,
  targetSquare,
  position,
  color
) {

  const piece = position[sourceSquare]

  // ===== CASTLING =====

  if (
    piece?.pieceType[1] === 'K' &&
    Math.abs(
      sourceSquare.charCodeAt(0) -
      targetSquare.charCodeAt(0)
    ) === 2
  ) {

    // Cannot castle while in check
    if (isCheck(position, color)) {
      return false
    }

    const throughSquare =
      targetSquare === 'g1' ? 'f1' :
      targetSquare === 'c1' ? 'd1' :
      targetSquare === 'g8' ? 'f8' :
      'd8'

    const throughPos = { ...position }

    throughPos[throughSquare] =
      throughPos[sourceSquare]

    delete throughPos[sourceSquare]

    // Cannot castle through check
    if (
      isCheck(
        throughPos,
        color
      )
    ) {
      return false
    }
  }

  const next = { ...position }

  next[targetSquare] =
    next[sourceSquare]

  delete next[sourceSquare]

  return !isCheck(next, color)
}