import {
  FaChessKing,
  FaChessQueen,
  FaChessRook,
  FaChessBishop,
  FaChessKnight,
  FaChessPawn,
} from 'react-icons/fa6'

/**
 * PieceIcon
 * Renders uniform high-contrast SVG vector icons for chess pieces.
 * 
 * Props:
 *   type: 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' (or prefixed 'wK', 'bQ', etc.)
 *   color: 'w' | 'b' (optional if prefix is in type)
 *   size: icon width/height (default 20)
 *   className: optional additional CSS classes
 */
export default function PieceIcon({ type, color, size = 20, className = "" }) {
  if (!type) return null

  // Support both 'K' (with color prop) and 'wK'/'bK' formats
  const pieceColor = type.length === 2 ? type[0] : color
  const pieceType = type.length === 2 ? type[1] : type

  const isLight = pieceColor === 'w'

  const iconProps = {
    size,
    className: `piece-icon ${isLight ? 'piece-icon--light' : 'piece-icon--dark'} ${className}`,
    style: {
      color: isLight ? 'var(--piece-light-color, #f9fafb)' : 'var(--piece-dark-color, #111827)',
      display: 'inline-block',
      verticalAlign: 'middle',
      stroke: isLight ? 'var(--piece-light-stroke, #111827)' : 'var(--piece-dark-stroke, #f9fafb)',
      strokeWidth: '10px',
    }
  }

  switch (pieceType.toUpperCase()) {
    case 'K':
      return <FaChessKing {...iconProps} />
    case 'Q':
      return <FaChessQueen {...iconProps} />
    case 'R':
      return <FaChessRook {...iconProps} />
    case 'B':
      return <FaChessBishop {...iconProps} />
    case 'N':
      return <FaChessKnight {...iconProps} />
    case 'P':
      return <FaChessPawn {...iconProps} />
    default:
      return null
  }
}
