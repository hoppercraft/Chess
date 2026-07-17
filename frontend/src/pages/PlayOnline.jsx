import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useGameSocket } from '../hooks/useGameSocket.js'
import ChessBoard      from '../components/board/ChessBoard.jsx'
import GameInfo        from '../components/game/GameInfo.jsx'
import MoveHistory     from '../components/game/MoveHistory.jsx'
import CapturedPieces  from '../components/game/CapturedPieces.jsx'
import PromotionModal  from '../components/game/PromotionModal.jsx'
import GameOverModal   from '../components/game/GameOverModal.jsx'
import { isCheck }      from '../logic/validation/isCheck.js'
import { isCheckmate }  from '../logic/validation/isCheckmate.js'
import { isStalemate }  from '../logic/validation/isStalemate.js'

export default function PlayOnline() {
  const { roomCode } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    connected, position, turn, roomStatus, winner, error, sendMove,
    moveHistory, capturedByWhite, capturedByBlack,color,
  } = useGameSocket(roomCode)

  const [selected, setSelected] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [promotionData, setPromotionData] = useState(null)

  if (!user) {
    navigate('/login')
    return null
  }

  const gameActive = roomStatus === 'active'

  // derive check/checkmate/stalemate locally, same logic as local play
  const gameStatus = useMemo(() => {
    if (!position) return 'playing'
    if (isCheckmate(position, turn)) return 'checkmate'
    if (isStalemate(position, turn)) return 'stalemate'
    if (isCheck(position, turn)) return 'check'
    return 'playing'
  }, [position, turn])

  function attemptMove(from, to) {
    if (!gameActive) return
    const piece = position?.[from]
    const isPromotion = piece?.pieceType[1] === 'P' && (to[1] === '8' || to[1] === '1')
    if (isPromotion) {
      setPromotionData({ from, to, color: piece.pieceType[0] })
      return
    }
    sendMove(from, to, null)
  }

  function handlePromotionSelect(pieceType) {
    if (!promotionData) return
    sendMove(promotionData.from, promotionData.to, pieceType.toLowerCase())
    setPromotionData(null)
  }

  function onPieceDrop({ sourceSquare, targetSquare }) {
    attemptMove(sourceSquare, targetSquare)
    return false // wait for server-confirmed position
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
      <ChessBoard
        position={position || {}}
        turn={turn}
        gameStatus={gameStatus}
        highlightSquares={highlightSquares}
        onPieceDrop={onPieceDrop}
        onSquareClick={onSquareClick}
        boardOrientation={color === 'black' ? 'black' : 'white'}
      />

      <aside className="side-panel">
        <div className="game-info">
          <div className="game-info-header">Room {roomCode}</div>
          <div className="game-info-body">
            <div className="info-row">
              <span className="info-label">Status</span>
              <span className="info-value">
                {connected ? 'Connected' : 'Connecting…'}
              </span>
            </div>
            {roomStatus === 'waiting' && (
              <div className="info-row">
                <span className="info-label">Waiting</span>
                <span className="info-value">for opponent…</span>
              </div>
            )}
          </div>
        </div>

        <GameInfo turn={turn} moveCount={moveHistory.length} />

        <CapturedPieces
          capturedByWhite={capturedByWhite}
          capturedByBlack={capturedByBlack}
        />

        <div className="btn-row">
          <button
            className={`btn-history ${showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(p => !p)}
          >
            {showHistory ? 'Hide History' : 'Move History'}
          </button>
          <button className="btn-new-game" onClick={() => navigate('/play/online')}>
            Leave Room
          </button>
        </div>

        {showHistory && <MoveHistory moveHistory={moveHistory} />}
      </aside>

      {promotionData && (
        <PromotionModal color={promotionData.color} onSelect={handlePromotionSelect} />
      )}

      {error && (
        <div className="auth-error" style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}>
          {error}
        </div>
      )}

      <GameOverModal
        gameStatus={roomStatus === 'finished' ? (winner === 'draw' ? 'stalemate' : 'checkmate') : gameStatus}
        turn={turn}
        activeTimer={null}
        onNewGame={() => navigate('/play/online')}
        onGoDashboard={() => navigate('/')}
      />
    </main>
  )
}