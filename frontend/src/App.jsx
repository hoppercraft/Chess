import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import './App.css'

const INITIAL_POSITION = {
  a8: { pieceType: 'bR' }, b8: { pieceType: 'bN' }, c8: { pieceType: 'bB' }, d8: { pieceType: 'bQ' },
  e8: { pieceType: 'bK' }, f8: { pieceType: 'bB' }, g8: { pieceType: 'bN' }, h8: { pieceType: 'bR' },
  a7: { pieceType: 'bP' }, b7: { pieceType: 'bP' }, c7: { pieceType: 'bP' }, d7: { pieceType: 'bP' },
  e7: { pieceType: 'bP' }, f7: { pieceType: 'bP' }, g7: { pieceType: 'bP' }, h7: { pieceType: 'bP' },
  a2: { pieceType: 'wP' }, b2: { pieceType: 'wP' }, c2: { pieceType: 'wP' }, d2: { pieceType: 'wP' },
  e2: { pieceType: 'wP' }, f2: { pieceType: 'wP' }, g2: { pieceType: 'wP' }, h2: { pieceType: 'wP' },
  a1: { pieceType: 'wR' }, b1: { pieceType: 'wN' }, c1: { pieceType: 'wB' }, d1: { pieceType: 'wQ' },
  e1: { pieceType: 'wK' }, f1: { pieceType: 'wB' }, g1: { pieceType: 'wN' }, h1: { pieceType: 'wR' },
}

function rankIndex(square){
  return parseInt(square[1],10)
}

function fileIndex(square){
  return square.charCodeAt(0) - 'a'.charCodeAt(0)
}

function toSquare(file,rank){
  if(file < 0 || file > 7 || rank < 1 || rank > 8){
    return null
  }

  return String.fromCharCode('a'.charCodeAt(0) + file) + rank
}

function isPathClear(source, target, position) {
  const fileDiff = fileIndex(target) - fileIndex(source)
  const rankDiff = rankIndex(target) - rankIndex(source)

  const fileStep = fileDiff === 0 ? 0 : fileDiff / Math.abs(fileDiff)
  const rankStep = rankDiff === 0 ? 0 : rankDiff / Math.abs(rankDiff)

  let file = fileIndex(source) + fileStep
  let rank = rankIndex(source) + rankStep

  while(file !== fileIndex(target) || rank !== rankIndex(target)) {
    const square = toSquare(file,rank)
    if(position[square]){
      return false
    }
    file += fileStep
    rank += rankStep
  }
  return true
}

function findKingSquare(pos, color) {
  for (const [sq, piece] of Object.entries(pos)) {
    if (piece.pieceType === `${color}K`) return sq
  }
  return null
}

function isSquareAttacked(square, byColor, pos) {
  for (const [from, piece] of Object.entries(pos)) {
    if (piece.pieceType[0] !== byColor) continue
    const type = piece.pieceType[1]
    const fileDiff = fileIndex(square) - fileIndex(from)
    const rankDiff = rankIndex(square) - rankIndex(from)
    const absFile = Math.abs(fileDiff)
    const absRank = Math.abs(rankDiff)

    if (type === 'P') {
      const dir = byColor === 'w' ? 1 : -1
      if (rankDiff === dir && absFile === 1) return true
    } else if (type === 'N') {
      if ((absFile === 1 && absRank === 2) || (absFile === 2 && absRank === 1)) return true
    } else if (type === 'B') {
      if (absFile === absRank && absFile !== 0 && isPathClear(from, square, pos)) return true
    } else if (type === 'R') {
      if ((absFile === 0 || absRank === 0) && (absFile + absRank) !== 0 && isPathClear(from, square, pos)) return true
    } else if (type === 'Q') {
      const isDiagonal = absFile === absRank && absFile !== 0
      const isStraight = absFile === 0 || absRank === 0
      if ((isDiagonal || isStraight) && isPathClear(from, square, pos)) return true
    } else if (type === 'K') {
      if (absFile <= 1 && absRank <= 1 && (absFile + absRank) !== 0) return true
    }
  }
  return false
}

function isInCheck(pos, color) {
  const kingSquare = findKingSquare(pos, color)
  if (!kingSquare) return false
  const opponent = color === 'w' ? 'b' : 'w'
  return isSquareAttacked(kingSquare, opponent, pos)
}

function makeMove(pos, sourceSquare, targetSquare) {
  const next = { ...pos }
  const movingPiece = next[sourceSquare]
  if (!movingPiece) return pos
  const pieceType = movingPiece.pieceType[1]

  if (pieceType === 'K' && sourceSquare === 'e1' && targetSquare === 'g1') {
    next.f1 = next.h1
    delete next.h1
  } else if (pieceType === 'K' && sourceSquare === 'e1' && targetSquare === 'c1') {
    next.d1 = next.a1
    delete next.a1
  } else if (pieceType === 'K' && sourceSquare === 'e8' && targetSquare === 'g8') {
    next.f8 = next.h8
    delete next.h8
  } else if (pieceType === 'K' && sourceSquare === 'e8' && targetSquare === 'c8') {
    next.d8 = next.a8
    delete next.a8
  }

  delete next[sourceSquare]
  next[targetSquare] = movingPiece
  return next
}

function hasAnyLegalMove(pos, color) {
  for (const [from, piece] of Object.entries(pos)) {
    if (piece.pieceType[0] !== color) continue
    const { valid } = getValidMoves(from, pos)
    for (const to of valid) {
      const next = makeMove(pos, from, to)
      if (!isInCheck(next, color)) return true
    }
  }
  return false
}

function getValidMoves(square, pos) {
  const piece = pos[square]
  if (!piece) return { valid: [], blocked: [] }
  const color = piece.pieceType[0]
  const type = piece.pieceType[1]
  const valid = [], blocked = []

  const push = (sq) => {
    if (!sq) return
    if (pos[sq]) {
      pos[sq].pieceType[0] !== color ? valid.push(sq) : blocked.push(sq)
    } else {
      valid.push(sq)
    }
  }

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
    const dir = color === 'w' ? 1 : -1
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

  return { valid, blocked }
}

export default function App() {
  const [turn, setTurn] = useState('w')
  const [castle, setCastle] = useState({
    wK: false, wQ: false,
    bK: false, bQ: false
  })
  const [position, setPosition] = useState(() => ({ ...INITIAL_POSITION }))
  const [moveHistory, setMoveHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [highlightSquares, setHighlightSquares] = useState({})
  const [lastMove, setLastMove] = useState(null)
  const [capturedByWhite, setCapturedByWhite] = useState([])
  const [capturedByBlack, setCapturedByBlack] = useState([])
  const [status, setStatus] = useState('In Play')

  function buildHighlights(square, pos, lm) {
    const h = {}
    if (!square) {
      if (lm) {
        h[lm.from] = { backgroundColor: 'rgba(0,200,100,0.45)' }
        h[lm.to]   = { backgroundColor: 'rgba(0,200,100,0.45)' }
      }
      return h
    }
    const { valid, blocked } = getValidMoves(square, pos)
    valid.forEach(sq   => { h[sq] = { backgroundColor: 'rgba(255,165,0,0.6)'  } })
    blocked.forEach(sq => { h[sq] = { backgroundColor: 'rgba(220,50,50,0.6)'  } })
    h[square] = { backgroundColor: 'rgba(255,255,0,0.55)' }
    // Apply green last so it always wins over orange/red
    if (lm) {
      h[lm.from] = { backgroundColor: 'rgba(0,200,100,0.45)' }
      h[lm.to]   = { backgroundColor: 'rgba(0,200,100,0.45)' }
    }
    return h
  }

  function onSquareClick({ square }) {
    const piece = position[square]
    if (piece && piece.pieceType[0] === turn) {
      setHighlightSquares(buildHighlights(square, position, lastMove))
    } else {
      setHighlightSquares(buildHighlights(null, position, lastMove))
    }
  }

  function onPieceDrop({ sourceSquare, targetSquare }) {
    if (!targetSquare) return false
    if (status === 'Checkmate' || status === 'Stalemate') return false
    const piece = position[sourceSquare]
    if (!piece) return false
    const pieceColor = piece.pieceType[0]
    if (pieceColor !== turn) return false
    const targetPiece = position[targetSquare]
    if (targetPiece && targetPiece.pieceType[0] === turn) return false

    const pieceType = piece.pieceType[1]

    
    const fileDiff = fileIndex(targetSquare) - fileIndex(sourceSquare)
    const rankDiff = rankIndex(targetSquare) - rankIndex(sourceSquare)

    const isDiagonal = Math.abs(fileDiff) === Math.abs(rankDiff) && fileDiff !== 0
    const isStraight = fileDiff === 0 || rankDiff === 0


    //Move logic for pawn
    if(pieceType === 'P') {
      const direction = pieceColor === 'w'?1:-1
      const fileDiff = fileIndex(targetSquare) - fileIndex(sourceSquare)
      const rankDiff = rankIndex(targetSquare) - rankIndex(sourceSquare)
      const isInSameFile = fileDiff === 0

      const startPos = pieceColor === 'w'?2:7
      const isAtStart = rankIndex(sourceSquare) === startPos
      const middleRank = rankIndex(sourceSquare) + direction
      const middleSquare = sourceSquare[0] + middleRank
      const ismiddleEmpty = !position[middleSquare]
      const isForward = isInSameFile && rankDiff === direction && !targetPiece
      const isDoubleForward = isAtStart && ismiddleEmpty && isInSameFile && rankDiff === direction * 2 && !targetPiece
      const isCapture = Math.abs(fileDiff) === 1 && targetPiece && rankDiff === direction

      if(!isForward && !isCapture &&!isDoubleForward){
        return false
      }
    }else if(pieceType === "R"){
      if(!isStraight) {
        return false
      }
      if(!isPathClear(sourceSquare,targetSquare,position)){
        return false
      }
    }else if (pieceType === "B"){
      if(!isDiagonal){
        return false
      }
      if(!isPathClear(sourceSquare,targetSquare,position)){
        return false
      }
    }else if (pieceType === "N"){
      const isLegal = Math.abs(fileDiff) === 1 && Math.abs(rankDiff) === 2 || Math.abs(rankDiff) === 1 && Math.abs(fileDiff) === 2
      if(!isLegal){
        return false
      }
    }else if(pieceType === "Q"){
      if(!isDiagonal && !isStraight){
        return false
      }

      if(!isPathClear(sourceSquare,targetSquare,position)){
        return false
      }
    }else if (pieceType === 'K') {
      const isKingMove = Math.abs(fileDiff) <= 1 && Math.abs(rankDiff) <= 1 && !(fileDiff === 0 && rankDiff === 0)

      const isCastleKingSide = pieceColor === 'w' && sourceSquare === 'e1' &&
      targetSquare === 'g1' && !castle.wK && !castle.wQ && !position.f1 && !position.g1

      const isCastleQueenSide = pieceColor === 'w' && sourceSquare === 'e1' &&targetSquare === 'c1' && !castle.wK && !castle.wQ && !position.d1 && !position.c1 && !position.b1

      const isBlackCastleKingSide = pieceColor === 'b' && sourceSquare === 'e8' &&targetSquare === 'g8' && !castle.bK && !castle.bQ && !position.f8 && !position.g8

      const isBlackCastleQueenSide =pieceColor === 'b' && sourceSquare === 'e8' &&targetSquare === 'c8' && !castle.bK && !castle.bQ && !position.d8 && !position.c8 && !position.b8

  if (!isKingMove && !isCastleKingSide && !isCastleQueenSide && !isBlackCastleKingSide && !isBlackCastleQueenSide) {
    return false
  }
}

    const tentative = makeMove(position, sourceSquare, targetSquare)
    if (isInCheck(tentative, turn)) return false

    if (pieceType === 'K') setCastle(c => ({ ...c, [turn + 'K']: true }))
    if (pieceType === 'R') {
      if (sourceSquare === 'a1') setCastle(c => ({ ...c, wQ: true }))
      if (sourceSquare === 'h1') setCastle(c => ({ ...c, wK: true }))
      if (sourceSquare === 'a8') setCastle(c => ({ ...c, bQ: true }))
      if (sourceSquare === 'h8') setCastle(c => ({ ...c, bK: true }))
    }

    const symbols = { R:'♜', N:'♞', B:'♝', Q:'♛', K:'♚', P:'' }
    const notation = `${symbols[pieceType]||''}${sourceSquare}${targetPiece?'x':'→'}${targetSquare}`
    setMoveHistory(prev => [...prev, notation])

    if (targetPiece) {
      if (turn === 'w') setCapturedByWhite(prev => [...prev, targetPiece.pieceType])
      else setCapturedByBlack(prev => [...prev, targetPiece.pieceType])
    }

    const lm = { from: sourceSquare, to: targetSquare }
    setLastMove(lm)
    setHighlightSquares(buildHighlights(null, position, lm))

    const nextPosition = tentative
    const nextTurn = turn === 'w' ? 'b' : 'w'
    const inCheck = isInCheck(nextPosition, nextTurn)
    const hasMove = hasAnyLegalMove(nextPosition, nextTurn)
    let nextStatus = 'In Play'
    if (inCheck && !hasMove) nextStatus = 'Checkmate'
    else if (inCheck) nextStatus = 'Check'
    else if (!inCheck && !hasMove) nextStatus = 'Stalemate'

    setPosition(nextPosition)
    setStatus(nextStatus)
    setTurn(nextTurn)
    return true
  }

  function resetGame() {
    setPosition({ ...INITIAL_POSITION })
    setTurn('w')
    setMoveHistory([])
    setCapturedByWhite([])
    setCapturedByBlack([])
    setLastMove(null)
    setHighlightSquares({})
    setStatus('In Play')
  }

  return (
    <>
      <header className="chess-header">
        <h1>Chess</h1>
      </header>

      <main className="chess-app">
        <div className={`turn-indicator ${turn === 'w' ? 'white' : 'black'}`}>
          <span className="turn-dot" />
          {turn === 'w' ? 'White to Move' : 'Black to Move'}
        </div>

        <div className="main-columns">
          <section className="board-section">
            <div className="board-wrapper">
              <div style={{ width: 480, height: 480 }}>
                <Chessboard 
                  position={generateFen(position, turn, castle, lastMove, moveHistory)} 
                  onPieceDrop={onPieceDrop}
                  arePiecesDraggable={true} 
                  customSquareStyles={highlightSquares} 
                  onSquareClick={(square) => onSquareClick({ square })} 
                />
              </div>
            </div>
          </section>

          <aside className="side-panel">
            <div className="info-row">
            <span className="info-label">Current FEN</span>
            <span className="info-value" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
              {generateFen(position, turn, castle, lastMove, moveHistory)}
            </span>
          </div>
          <div className="game-info">
            <div className="game-info-header">Game Info</div>
            <div className="game-info-body">
              <div className="info-row">
                <span className="info-label">Mode</span>
                <span className="info-value">Local 2P</span>
              </div>
              <div className="info-row">
                <span className="info-label">Turn</span>
                <span className="info-value">{turn === 'w' ? 'White' : 'Black'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Moves</span>
                <span className="info-value">{moveHistory.length}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status</span>
                <span className="info-value">{status}</span>
              </div>
            </div>
          </div>

          <div className="captured-panel">
            <div className="captured-header"> Captured</div>
            <div className="captured-body">
              <div className="captured-row">
                <span className="captured-label">White</span>
                <span className="captured-value">
                  {capturedByWhite.length === 0 ? 'None' : capturedByWhite.join(' ')}
                </span>
              </div>
              <div className="captured-row">
                <span className="captured-label">Black</span>
                <span className="captured-value">
                  {capturedByBlack.length === 0 ? 'None' : capturedByBlack.join(' ')}
                </span>
              </div>
            </div>
          </div>

          <div className="btn-row">
            <button
              className={`btn-history ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(p => !p)}
            >
               {showHistory ? 'Hide History' : 'Show History'}
            </button>
            <button className="btn-new-game" onClick={resetGame}>New Game</button>
          </div>

          {showHistory && (
            <div className="move-history">
              <div className="move-history-header"> Move History</div>
              <div className="move-history-body">
                {moveHistory.length === 0 ? (
                  <div className="move-history-empty">No moves yet</div>
                ) : (
                  Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
                    <div className="move-row" key={i}>
                      <span className="move-num">{i + 1}.</span>
                      <span className="move-white">{moveHistory[i * 2]}</span>
                      <span className="move-black">{moveHistory[i * 2 + 1] || ''}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          </aside>
        </div>
      </main>
    </>
  )
}

function generateFen(position, turn, castle, lastMove, moveHistory) {
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const fenRows = [];

  // 1. Piece Placement Data
  ranks.forEach(rank => {
    let emptyCount = 0;
    let rowStr = '';

    files.forEach(file => {
      const square = file + rank;
      const piece = position[square];

      if (piece) {
        if (emptyCount > 0) {
          rowStr += emptyCount;
          emptyCount = 0;
        }
        // Transform 'wP' -> 'P', 'bP' -> 'p'
        const color = piece.pieceType[0];
        const type = piece.pieceType[1];
        rowStr += color === 'w' ? type.toUpperCase() : type.toLowerCase();
      } else {
        emptyCount++;
      }
    });

    if (emptyCount > 0) {
      rowStr += emptyCount;
    }
    fenRows.push(rowStr);
  });

  const piecePlacement = fenRows.join('/');

  // 2. Active Color
  const activeColor = turn;

  // 3. Castling Availability
  let castlingStr = '';
  if (!castle.wK && position.e1?.pieceType === 'wK' && position.h1?.pieceType === 'wR') castlingStr += 'K';
  if (!castle.wQ && position.e1?.pieceType === 'wK' && position.a1?.pieceType === 'wR') castlingStr += 'Q';
  if (!castle.bK && position.e8?.pieceType === 'bK' && position.h8?.pieceType === 'bR') castlingStr += 'k';
  if (!castle.bQ && position.e8?.pieceType === 'bK' && position.a8?.pieceType === 'bR') castlingStr += 'q';
  if (castlingStr === '') castlingStr = '-';

  // 4. En Passant Target Square
  let enPassant = '-';
  if (lastMove) {
    const fromPiece = position[lastMove.to];
    if (fromPiece && fromPiece.pieceType[1] === 'P') {
      const fromRank = parseInt(lastMove.from[1], 10);
      const toRank = parseInt(lastMove.to[1], 10);
      if (Math.abs(fromRank - toRank) === 2) {
        // En passant target square is the square skipped over
        const epRank = fromRank === 2 ? 3 : 6;
        enPassant = lastMove.to[0] + epRank;
      }
    }
  }

  // 5 & 6. Clock Cycles (Approximated or simplified placeholders for local play)
  const halfmoveClock = '0'; 
  const fullmoveNumber = Math.floor(moveHistory.length / 2) + 1;

  return `${piecePlacement} ${activeColor} ${castlingStr} ${enPassant} ${halfmoveClock} ${fullmoveNumber}`;
}