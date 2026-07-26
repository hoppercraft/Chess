import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext.jsx'
import ChessBoard from '../components/board/ChessBoard.jsx'
import GameInfo from '../components/game/GameInfo.jsx'
import GameControls from '../components/game/GameControls.jsx'
import MoveHistory from '../components/game/MoveHistory.jsx'
import CapturedPieces from '../components/game/CapturedPieces.jsx'
import PromotionModal from '../components/game/PromotionModal.jsx'
import GameOverModal from '../components/game/GameOverModal.jsx'
import EngineSetupModal from '../components/board/EngineSetupModal.jsx'
import Timer from '../components/game/Timer.jsx'
import Toast from '../components/common/Toast.jsx'

const LEVELS = [
  { val: 0, title: "Level 0 — Random", desc: "plays legal moves at random" },
  { val: 1, title: "Level 1 — Minimax", desc: "minimax search depth 1" },
  { val: 2, title: "Level 2 — Pruning", desc: "alpha-beta search depth 2" },
  { val: 3, title: "Level 3 — Master", desc: "optimized search depth 3" }
]

export default function PlayEngine() {
  const navigate = useNavigate()
  const {
    turn, gameStatus, position, moveHistory, showHistory, setShowHistory,
    highlightSquares, capturedByWhite, capturedByBlack,
    onSquareClick, onPieceDrop, resetGame, promotionData, promotePawn,
    setGameMode, level, setLevel, showEnginePrompt, startEngineGame, activeTimer,
    toast, dismissToast,
  } = useGame()

  useEffect(() => {
    setGameMode('engine')
    resetGame('engine')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="chess-app">
      <ChessBoard
        position={position}
        turn={turn}
        gameStatus={gameStatus}
        highlightSquares={highlightSquares}
        onPieceDrop={onPieceDrop}
        onSquareClick={onSquareClick}
      />

      <aside className="side-panel">
        <GameInfo turn={turn} moveCount={moveHistory.length} />
        <Timer />

        {/* Typographic Level Selector */}
        <div className="engine-level-panel">
          <div className="level-panel-header">Engine Configuration</div>
          <div className="level-panel-body">
            <span className="level-panel-eyebrow">difficulty level</span>
            <div className="level-buttons-grid">
              {LEVELS.map(lvl => (
                <button
                  key={lvl.val}
                  className={`level-btn ${level === lvl.val ? 'active' : ''}`}
                  onClick={() => setLevel(lvl.val)}
                >
                  <span className="level-btn-title">{lvl.title}</span>
                  <span className="level-btn-desc">{lvl.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <CapturedPieces
          capturedByWhite={capturedByWhite}
          capturedByBlack={capturedByBlack}
        />

        <GameControls
          showHistory={showHistory}
          onToggleHistory={() => setShowHistory(p => !p)}
          onNewGame={() => resetGame('engine')}
        />

        {showHistory && <MoveHistory moveHistory={moveHistory} />}
      </aside>

      {promotionData && (
        <PromotionModal color={promotionData.color} onSelect={promotePawn} />
      )}
      {showEnginePrompt && <EngineSetupModal onSelect={startEngineGame} />}
      <GameOverModal
        gameStatus={gameStatus}
        turn={turn}
        activeTimer={activeTimer}
        onNewGame={() => resetGame('engine')}
        onGoDashboard={() => navigate('/')}
      />
      <Toast toast={toast} onDismiss={dismissToast} />
    </main>
  )
}