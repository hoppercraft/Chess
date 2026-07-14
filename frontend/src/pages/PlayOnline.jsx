import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useGameSocket } from '../hooks/useGameSocket.js'
import ChessBoard from '../components/board/ChessBoard.jsx'

export default function PlayOnline() {
  const { roomCode } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { connected, position, turn, status, winner, error, sendMove } = useGameSocket(roomCode)
  const [selected, setSelected] = useState(null)

  if (!user) {
    navigate('/login')
    return null
  }

  const gameActive = status === 'active'
  const turnLabel = turn === 'w' ? 'white' : 'black'

  function attemptMove(from, to) {
    if (!gameActive) return
    const piece = position?.[from]
    const isPromotion = piece?.pieceType[1] === 'P' && (to[1] === '8' || to[1] === '1')
    sendMove(from, to, isPromotion ? 'q' : null)
  }

  function onPieceDrop({ sourceSquare, targetSquare }) {
    attemptMove(sourceSquare, targetSquare)
    return false
  }

  function onSquareClick({ square }) {
    if (!gameActive) return
    if (!selected) {
      if (position?.[square]) setSelected(square)
    } else if (selected === square) {
      setSelected(null)
    } else {
      attemptMove(selected, square)
      setSelected(null)
    }
  }

  const highlightSquares = selected
    ? { [selected]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' } }
    : {}

  return (
    <main className="chess-app">
      <p className="dash-hero-sub">
        Room: {roomCode} — {connected ? 'Connected' : 'Connecting…'}
        {status === 'waiting' && ' — waiting for opponent'}
      </p>
      {error && <div className="auth-error">{error}</div>}
      {status === 'finished' && (
        <div className="auth-error">
          Game over — {winner === 'draw' ? "It's a draw" : `${winner} wins`}
        </div>
      )}
      {position && (
        <ChessBoard
          position={position}
          turn={turnLabel}
          gameStatus={status}
          highlightSquares={highlightSquares}
          onPieceDrop={onPieceDrop}
          onSquareClick={onSquareClick}
        />
      )}
    </main>
  )
}