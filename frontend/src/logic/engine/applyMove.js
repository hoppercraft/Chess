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
export function applyMove(sourceSquare, targetSquare, position, turn, enPassantSquare = null) {
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
 const cap =
  af === 1 &&
  rd === dir &&
  !!targetPiece

const enPassant =
  af === 1 &&
  rd === dir &&
  !targetPiece &&
  targetSquare === enPassantSquare

if (
  !fwd &&
  !dblFwd &&
  !cap &&
  !enPassant
) {
  return false
}
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
/* castling is handled as a special case in GameContext onpiecedrop,
  so we validate it here byy allowing the king to move two dquares if all other conditions are meet
 (castling rights, castling move,path clear, not moving out og check tec )*/
  const castlingMove =
    (sourceSquare === 'e1' && (targetSquare === 'g1' || targetSquare === 'c1')) ||
    (sourceSquare === 'e8' && (targetSquare === 'g8' || targetSquare === 'c8'))

  if (!castlingMove) {
    if (af > 1 || ar > 1) return false
  }
}

  // All checks passed — build the new position
const next = { ...position }

next[targetSquare] = next[sourceSquare]
delete next[sourceSquare]
// handle an en passant capture by removing the captured pawn from the board in the new position

if (
  type === 'P' &&
  af === 1 &&
  !targetPiece &&
  targetSquare === enPassantSquare
) {

  const capturedRank =
    rankIndex(targetSquare) +
    (turn === 'w' ? -1 : 1)

  const capturedSquare =
    targetSquare[0] + capturedRank

  delete next[capturedSquare]
}


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

/* White kingside */
if (
  sourceSquare === 'e1' &&
  targetSquare === 'g1'
) {
  next.f1 = next.h1
  delete next.h1
}

/* White queenside */
if (
  sourceSquare === 'e1' &&
  targetSquare === 'c1'
) {
  next.d1 = next.a1
  delete next.a1
}

/* Black kingside */
if (
  sourceSquare === 'e8' &&
  targetSquare === 'g8'
) {
  next.f8 = next.h8
  delete next.h8
}

/* Black queenside */
if (
  sourceSquare === 'e8' &&
  targetSquare === 'c8'
) {
  next.d8 = next.a8
  delete next.a8
}

console.log(
  'Legal move:',
  sourceSquare,
  '->',
  targetSquare
)

return next
}