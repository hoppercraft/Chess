import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import './app.css'

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

function rankIndex(square) { return parseInt(square[1], 10) }
function fileIndex(square) { return square.charCodeAt(0) - 97 }
function toSquare(f, r) {
  if (f < 0 || f > 7 || r < 1 || r > 8) return null
  return String.fromCharCode(97 + f) + r
}

function isPathClear(src, tgt, pos) {
  const fd = fileIndex(tgt) - fileIndex(src)
  const rd = rankIndex(tgt) - rankIndex(src)
  const fs = fd === 0 ? 0 : fd / Math.abs(fd)
  const rs = rd === 0 ? 0 : rd / Math.abs(rd)
  let f = fileIndex(src) + fs
  let r = rankIndex(src) + rs
  while (f !== fileIndex(tgt) || r !== rankIndex(tgt)) {
    if (pos[toSquare(f, r)]) return false
    f += fs; r += rs
  }
  return true
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
        f += df; r += dr
      }
    })
  }

  if (type === 'P') {
    const dir = color === 'w' ? 1 : -1
    const startRank = color === 'w' ? 2 : 7
    const fi = fileIndex(square), ri = rankIndex(square)
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
  const [position, setPosition] = useState(() => ({ ...INITIAL_POSITION }))
  const [moveHistory, setMoveHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [highlightSquares, setHighlightSquares] = useState({})
  const [lastMove, setLastMove] = useState(null)

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
    const piece = position[sourceSquare]
    if (!piece) return false
    if (piece.pieceType[0] !== turn) return false
    const targetPiece = position[targetSquare]
    if (targetPiece && targetPiece.pieceType[0] === turn) return false

    const type = piece.pieceType[1]
    const fd = fileIndex(targetSquare) - fileIndex(sourceSquare)
    const rd = rankIndex(targetSquare) - rankIndex(sourceSquare)
    const af = Math.abs(fd), ar = Math.abs(rd)

    if (type === 'P') {
      const dir = piece.pieceType[0] === 'w' ? 1 : -1
      const startRank = piece.pieceType[0] === 'w' ? 2 : 7
      const midSq = sourceSquare[0] + (rankIndex(sourceSquare) + dir)
      const midEmpty = !position[midSq]
      const fwd    = fd === 0 && rd === dir && !targetPiece
      const dblFwd = rankIndex(sourceSquare) === startRank && midEmpty && fd === 0 && rd === dir*2 && !targetPiece
      const cap    = af === 1 && rd === dir && !!targetPiece
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
      if (!((af===1&&ar===2)||(af===2&&ar===1))) return false
    }

    const symbols = { R:'♜', N:'♞', B:'♝', Q:'♛', K:'♚', P:'' }
    const notation = `${symbols[type]||''}${sourceSquare}${targetPiece?'x':'→'}${targetSquare}`
    setMoveHistory(prev => [...prev, notation])

    const lm = { from: sourceSquare, to: targetSquare }
    setLastMove(lm)
    setHighlightSquares(buildHighlights(null, position, lm))

    setPosition(prev => {
      const next = { ...prev }
      next[targetSquare] = next[sourceSquare]
      delete next[sourceSquare]
      return next
    })
    setTurn(t => t === 'w' ? 'b' : 'w')
    return true
  }

  function resetGame() {
    setPosition({ ...INITIAL_POSITION })
    setTurn('w')
    setMoveHistory([])
    setLastMove(null)
    setHighlightSquares({})
  }

  return (
    <>
      <header className="chess-header">
        <span className="crown-icon">♚</span>
        <h1>Chess</h1>
        <span className="crown-icon">♔</span>
      </header>

      <main className="chess-app">
        <section className="board-section">
          <div className={`turn-indicator ${turn === 'w' ? 'white' : 'black'}`}>
            <span className="turn-dot" />
            {turn === 'w' ? 'White to Move' : 'Black to Move'}
          </div>
          <div className="board-wrapper">
            <div style={{ width: 480, height: 480 }}>
              <Chessboard options={{
                position,
                onPieceDrop,
                allowDragging: true,
                squareStyles: highlightSquares,
                onSquareClick,
              }} />
            </div>
          </div>
        </section>

        <aside className="side-panel">
          <div className="game-info">
            <div className="game-info-header">♟ Game Info</div>
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
            </div>
          </div>

          <div className="btn-row">
            <button
              className={`btn-history ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(p => !p)}
            >
              📜 {showHistory ? 'Hide History' : 'Show History'}
            </button>
            <button className="btn-new-game" onClick={resetGame}>New Game</button>
          </div>

          {showHistory && (
            <div className="move-history">
              <div className="move-history-header">📜 Move History</div>
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
      </main>
    </>
  )
}