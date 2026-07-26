export function isInsufficientMaterial(position) {
  const pieces = Object.values(position).map(p => p.pieceType)
  const whitePieces = pieces.filter(p => p[0] === 'w')
  const blackPieces = pieces.filter(p => p[0] === 'b')

  const isInsufficient = (side) => {
    if (side.length === 1) return true
    if (side.length === 2) return side.some(p => p[1] === 'B' || p[1] === 'N')
    return false
  }

  return isInsufficient(whitePieces) && isInsufficient(blackPieces)
}

export function isFiftyMoveRule(halfMoveClock) {
  return halfMoveClock >= 100
}

export function isThreefoldRepetition(positionHistory) {
  const counts = {}
  for (const fen of positionHistory) {
    counts[fen] = (counts[fen] || 0) + 1
    if (counts[fen] >= 3) return true
  }
  return false
}