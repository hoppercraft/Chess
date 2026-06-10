import { isCheck } from './isCheck.js'

export function isLegalMove(
  sourceSquare,
  targetSquare,
  position,
  color
) {
  const next = { ...position }

  next[targetSquare] = next[sourceSquare]
  delete next[sourceSquare]

  return !isCheck(next, color)
}