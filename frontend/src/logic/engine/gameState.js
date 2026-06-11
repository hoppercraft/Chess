import { getValidMoves } from '../engine/moveGenerator.js'

/**
 * Builds the squareStyles object consumed by <Chessboard>.
 *
 * @param {string|null} selected  - The currently selected square, or null
 * @param {object}      pos       - Current board position map
 * @param {{ from, to }|null} lm  - Last move, used for the green trail
 * @returns {object} squareStyles map
 */
export function buildHighlights(selected, pos, lm,castleRights) {
  const h = {}

  // Always paint the last-move trail first (lowest priority)
  if (lm) {
    h[lm.from] = { backgroundColor: 'rgba(0,200,100,0.45)' }
    h[lm.to]   = { backgroundColor: 'rgba(0,200,100,0.45)' }
  }

  if (!selected) return h

const { valid, blocked } =
  getValidMoves(
    selected,
    pos,
    castleRights
  )

  valid.forEach(sq   => { h[sq]      = { backgroundColor: 'rgba(255,165,0,0.6)' } })
  blocked.forEach(sq => { h[sq]      = { backgroundColor: 'rgba(220,50,50,0.6)'  } })
  h[selected]                        = { backgroundColor: 'rgba(255,255,0,0.55)'  }

  // Re-apply last-move trail so green always wins over orange/red
  if (lm) {
    h[lm.from] = { backgroundColor: 'rgba(0,200,100,0.45)' }
    h[lm.to]   = { backgroundColor: 'rgba(0,200,100,0.45)' }
  }

  return h
}