import { fileIndex, rankIndex, toSquare } from '../../utils/coordinates.js'

/**
 * Returns true if every square between src and tgt (exclusive) is empty.
 * Works for straight lines and diagonals.
 */
export function isPathClear(src, tgt, pos) {
  const fd = fileIndex(tgt) - fileIndex(src)
  const rd = rankIndex(tgt) - rankIndex(src)
  const fs = fd === 0 ? 0 : fd / Math.abs(fd)
  const rs = rd === 0 ? 0 : rd / Math.abs(rd)
  let f = fileIndex(src) + fs
  let r = rankIndex(src) + rs
  while (f !== fileIndex(tgt) || r !== rankIndex(tgt)) {
    if (pos[toSquare(f, r)]) return false
    f += fs
    r += rs
  }
  return true
}