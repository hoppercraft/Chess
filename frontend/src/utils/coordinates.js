/**
 * Chess coordinate helpers.
 * All functions operate on algebraic notation squares (e.g. "e4").
 */

/** Returns the rank (row) as an integer 1–8. */
export function rankIndex(square) {
  return parseInt(square[1], 10)
}

/** Returns the file (column) as an integer 0–7, where 'a' = 0. */
export function fileIndex(square) {
  return square.charCodeAt(0) - 97
}

/**
 * Converts a file index (0–7) and rank (1–8) back to algebraic notation.
 * Returns null if the coordinates are out of bounds.
 */
export function toSquare(f, r) {
  if (f < 0 || f > 7 || r < 1 || r > 8) return null
  return String.fromCharCode(97 + f) + r
}