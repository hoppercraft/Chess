import { useEffect } from 'react'
import { useGame } from '../context/GameContext.jsx'
import ChessBoard     from '../components/board/ChessBoard.jsx'
import GameInfo       from '../components/game/GameInfo.jsx'
import GameControls   from '../components/game/GameControls.jsx'
import MoveHistory    from '../components/game/MoveHistory.jsx'
import CapturedPieces from '../components/game/CapturedPieces.jsx'
import PromotionModal from '../components/game/PromotionModal.jsx'

const LEVELS = [
  { val: 0, title: "Level 0 — Random", desc: "plays legal moves at random" },
  { val: 1, title: "Level 1 — Minimax", desc: "minimax search depth 2" },
  { val: 2, title: "Level 2 — Pruning", desc: "alpha-beta search depth 3" },
  { val: 3, title: "Level 3 — Master", desc: "optimized search depth 4" }
]

export default function PlayEngine() {
  const {
    turn, gameStatus, position, moveHistory, showHistory, setShowHistory,
    highlightSquares, capturedByWhite, capturedByBlack,
    onSquareClick, onPieceDrop, resetGame, promotionData, promotePawn,
    setGameMode, level, setLevel
  } = useGame()

  useEffect(() => {
    setGameMode('engine')
    resetGame()
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
          onNewGame={resetGame}
        />
        
        {showHistory && <MoveHistory moveHistory={moveHistory} />}
      </aside>

      {promotionData && (
        <PromotionModal color={promotionData.color} onSelect={promotePawn} />
      )}
    </main>
  )
}
