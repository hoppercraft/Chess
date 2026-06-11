import { fileIndex, rankIndex, toSquare } from '../../utils/coordinates.js'

/**
 * Returns all pseudo-legal destination squares for the piece on `square`.
 *
 * @param {string} square  - Algebraic square, e.g. "e2"
 * @param {object} pos     - Current board position map
 * @returns {{ valid: string[], blocked: string[] }}
 *   valid   – squares the piece can legally move to (empty or enemy-occupied)
 *   blocked – squares occupied by a friendly piece (highlighted differently)
 */
export function getValidMoves(
  square,
  pos,
  castleRights = null
) {
  const piece = pos[square]
  if (!piece) return { valid: [], blocked: [] }

  const color = piece.pieceType[0]
  const type  = piece.pieceType[1]
  const valid = []
  const blocked = []

  /** Push a single target square, sorting it into valid or blocked. */
  const push = (sq) => {
    if (!sq) return
    if (pos[sq]) {
      pos[sq].pieceType[0] !== color ? valid.push(sq) : blocked.push(sq)
    } else {
      valid.push(sq)
    }
  }

  /** Slide in each direction until blocked or out of bounds. */
  const slide = (dirs) => {
    dirs.forEach(([df, dr]) => {
      let f = fileIndex(square) + df
      let r = rankIndex(square) + dr
      while (f >= 0 && f < 8 && r >= 1 && r <= 8) {
        const sq = toSquare(f, r)
        if (pos[sq]) {
          pos[sq].pieceType[0] !== color ? valid.push(sq) : blocked.push(sq)
          break
        }
        valid.push(sq)
        f += df
        r += dr
      }
    })
  }

  if (type === 'P') {
    const dir       = color === 'w' ? 1 : -1
    const startRank = color === 'w' ? 2 : 7
    const fi = fileIndex(square)
    const ri = rankIndex(square)
    const fwd = toSquare(fi, ri + dir)

    if (fwd && !pos[fwd]) {
      valid.push(fwd)
      if (ri === startRank) {
        const dbl = toSquare(fi, ri + dir * 2)
        if (dbl && !pos[dbl]) valid.push(dbl)
        else if (dbl && pos[dbl]) blocked.push(dbl)
      }
    } else if (fwd && pos[fwd]) {
      blocked.push(fwd)
    }

    ;[-1, 1].forEach(df => {
      const cap = toSquare(fi + df, ri + dir)
      if (cap && pos[cap]) {
        pos[cap].pieceType[0] !== color ? valid.push(cap) : blocked.push(cap)
      }
    })
  }
  else if (type === 'R') slide([[1,0],[-1,0],[0,1],[0,-1]])
  else if (type === 'B') slide([[1,1],[1,-1],[-1,1],[-1,-1]])
  else if (type === 'Q') slide([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]])
  else if (type === 'N') {
    [[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]].forEach(([df, dr]) => {
      push(toSquare(fileIndex(square) + df, rankIndex(square) + dr))
    })
  }
 else if (type === 'K') {

  [
    [1,0],[-1,0],
    [0,1],[0,-1],
    [1,1],[1,-1],
    [-1,1],[-1,-1]
  ].forEach(([df, dr]) => {
    push(
      toSquare(
        fileIndex(square) + df,
        rankIndex(square) + dr
      )
    )
  })

  if (castleRights) {

    if (
      color === 'w' &&
      square === 'e1' &&
      !castleRights.wKingMoved
    ) {

      if (
        !castleRights.wRightRookMoved &&
        !pos.f1 &&
        !pos.g1
      ) {
        valid.push('g1')
      }

      if (
        !castleRights.wLeftRookMoved &&
        !pos.b1 &&
        !pos.c1 &&
        !pos.d1
      ) {
        valid.push('c1')
      }
    }

    if (
      color === 'b' &&
      square === 'e8' &&
      !castleRights.bKingMoved
    ) {

      if (
        !castleRights.bRightRookMoved &&
        !pos.f8 &&
        !pos.g8
      ) {
        valid.push('g8')
      }

      if (
        !castleRights.bLeftRookMoved &&
        !pos.b8 &&
        !pos.c8 &&
        !pos.d8
      ) {
        valid.push('c8')
      }
    }
  }
}
  return { valid, blocked }
}