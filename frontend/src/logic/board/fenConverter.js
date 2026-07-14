export function positionToFen(position, turn, castleRights, enPassantSquare, halfmove = 0, fullmove = 1) {
  const pieceMap = {
    'wP': 'P', 'wN': 'N', 'wB': 'B', 'wR': 'R', 'wQ': 'Q', 'wK': 'K',
    'bP': 'p', 'bN': 'n', 'bB': 'b', 'bR': 'r', 'bQ': 'q', 'bK': 'k',
  }

  let fen = ''
  for (let rank = 8; rank >= 1; rank--) {
    let emptyCount = 0
    for (let file = 0; file < 8; file++) {
      const square = String.fromCharCode(97 + file) + rank
      const piece = position[square]
      if (piece) {
        if (emptyCount > 0) {
          fen += emptyCount
          emptyCount = 0
        }
        fen += pieceMap[piece.pieceType] || ''
      } else {
        emptyCount++
      }
    }
    if (emptyCount > 0) fen += emptyCount
    if (rank > 1) fen += '/'
  }

  fen += ` ${turn === 'w' ? 'w' : 'b'}`

  let castleStr = ''
  if (!castleRights.wKingMoved) {
    if (!castleRights.wRightRookMoved) castleStr += 'K'
    if (!castleRights.wLeftRookMoved) castleStr += 'Q'
  }
  if (!castleRights.bKingMoved) {
    if (!castleRights.bRightRookMoved) castleStr += 'k'
    if (!castleRights.bLeftRookMoved) castleStr += 'q'
  }
  fen += ` ${castleStr || '-'}`

  fen += ` ${enPassantSquare || '-'}`
  fen += ` ${halfmove} ${fullmove}`

  return fen
}


export function fenToPosition(fen) {
  const placement = fen.split(' ')[0]
  const rows = placement.split('/')
  const position = {}

  const pieceMap = {
    p: 'P', n: 'N', b: 'B', r: 'R', q: 'Q', k: 'K',
  }

  rows.forEach((row, rankIndex) => {
    const rank = 8 - rankIndex
    let file = 0
    for (const char of row) {
      if (/\d/.test(char)) {
        file += Number(char)
      } else {
        const color = char === char.toUpperCase() ? 'w' : 'b'
        const type = pieceMap[char.toLowerCase()]
        const square = String.fromCharCode(97 + file) + rank
        position[square] = { pieceType: color + type }
        file += 1
      }
    }
  })

  return position
}