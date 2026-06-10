import { fileIndex, rankIndex } from '../../utils/coordinates.js'
import { isPathClear } from '../board/boardHelpers.js'
import { isLegalMove } from '../validation/isLegalMove.js'
/**
 * Validates a drag-and-drop move and, if legal, returns the new board position.
 *
 * @param {string} sourceSquare
 * @param {string} targetSquare
 * @param {object} position      - Current board position map
 * @param {string} turn          - 'w' or 'b'
 * @returns {object|false}  New position map on success, false if the move is illegal.
 */
export function applyMove(sourceSquare, targetSquare, position, turn) {
  if (!targetSquare) return false

  const piece = position[sourceSquare]
  if (!piece) return false
  if (piece.pieceType[0] !== turn) return false

  const targetPiece = position[targetSquare]
  if (targetPiece && targetPiece.pieceType[0] === turn) return false

  const type = piece.pieceType[1]
  const fd = fileIndex(targetSquare) - fileIndex(sourceSquare)
  const rd = rankIndex(targetSquare) - rankIndex(sourceSquare)
  const af = Math.abs(fd)
  const ar = Math.abs(rd)

  if (type === 'P') {
    const dir       = piece.pieceType[0] === 'w' ? 1 : -1
    const startRank = piece.pieceType[0] === 'w' ? 2 : 7
    const midSq     = sourceSquare[0] + (rankIndex(sourceSquare) + dir)
    const midEmpty  = !position[midSq]
    const fwd    = fd === 0 && rd === dir  && !targetPiece
    const dblFwd = rankIndex(sourceSquare) === startRank && midEmpty && fd === 0 && rd === dir * 2 && !targetPiece
    const cap    = af === 1 && rd === dir  && !!targetPiece
    if (!fwd && !dblFwd && !cap) return false
  }
  else if (type === 'R') {
    if (fd !== 0 && rd !== 0) return false
    if (!isPathClear(sourceSquare, targetSquare, position)) return false
  }
  else if (type === 'B') {
    if (af !== ar || af === 0) return false
    if (!isPathClear(sourceSquare, targetSquare, position)) return false
  }
  else if (type === 'Q') {
    const straight = fd === 0 || rd === 0
    const diagonal = af === ar && af > 0
    if (!straight && !diagonal) return false
    if (!isPathClear(sourceSquare, targetSquare, position)) return false
  }
  else if (type === 'N') {
    if (!((af === 1 && ar === 2) || (af === 2 && ar === 1))) return false
  }
  else if (type === 'K') {
    if (af > 1 || ar > 1) return false
  }

  // All checks passed — build the new position
 const next = { ...position }

next[targetSquare] = next[sourceSquare]
delete next[sourceSquare]

if (
  !isLegalMove(
    sourceSquare,
    targetSquare,
    position,
    turn
  )
) {
  return false
}
console.log(
  'Legal move:',
  sourceSquare,
  '->',
  targetSquare
)
return next
}