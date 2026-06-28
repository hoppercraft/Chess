import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext.jsx'
import ChessBoard     from '../components/board/ChessBoard.jsx'
import GameInfo       from '../components/game/GameInfo.jsx'
import GameControls   from '../components/game/GameControls.jsx'
import MoveHistory    from '../components/game/MoveHistory.jsx'
import CapturedPieces from '../components/game/CapturedPieces.jsx'
import PromotionModal from '../components/game/PromotionModal.jsx'


export default function PlayLocal() {
  const navigate = useNavigate()
  const {
    turn, gameStatus,position, moveHistory, showHistory, setShowHistory,
    highlightSquares, capturedByWhite, capturedByBlack,
    onSquareClick, onPieceDrop, resetGame,promotionData, promotePawn,
    setGameMode,
  } = useGame()

  useEffect(() => {
    setGameMode('local')
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
      {promotionData && ( <PromotionModal color={promotionData.color} onSelect={promotePawn} /> )}
    </main>
  )
}