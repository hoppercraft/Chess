/** Starting position for a standard chess game.
 *  Keys are algebraic squares; values carry { pieceType } where
 *  pieceType is a two-character string: colour ('w'|'b') + piece ('K','Q','R','B','N','P').
 */
export const INITIAL_POSITION = {
  a8: { pieceType: 'bR' }, b8: { pieceType: 'bN' }, c8: { pieceType: 'bB' }, d8: { pieceType: 'bQ' },
  e8: { pieceType: 'bK' }, f8: { pieceType: 'bB' }, g8: { pieceType: 'bN' }, h8: { pieceType: 'bR' },
  a7: { pieceType: 'bP' }, b7: { pieceType: 'bP' }, c7: { pieceType: 'bP' }, d7: { pieceType: 'bP' },
  e7: { pieceType: 'bP' }, f7: { pieceType: 'bP' }, g7: { pieceType: 'bP' }, h7: { pieceType: 'bP' },
  a2: { pieceType: 'wP' }, b2: { pieceType: 'wP' }, c2: { pieceType: 'wP' }, d2: { pieceType: 'wP' },
  e2: { pieceType: 'wP' }, f2: { pieceType: 'wP' }, g2: { pieceType: 'wP' }, h2: { pieceType: 'wP' },
  a1: { pieceType: 'wR' }, b1: { pieceType: 'wN' }, c1: { pieceType: 'wB' }, d1: { pieceType: 'wQ' },
  e1: { pieceType: 'wK' }, f1: { pieceType: 'wB' }, g1: { pieceType: 'wN' }, h1: { pieceType: 'wR' },
}

/** Unicode symbols used in move-history notation. */
export const PIECE_SYMBOLS = {
  R: '♜', N: '♞', B: '♝', Q: '♛', K: '♚', P: '',
}