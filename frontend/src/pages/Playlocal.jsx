import { useEffect } from 'react'
import { useGame } from '../context/GameContext.jsx'
import ChessBoard     from '../components/board/ChessBoard.jsx'
import GameInfo       from '../components/game/GameInfo.jsx'
import GameControls   from '../components/game/GameControls.jsx'
import MoveHistory    from '../components/game/MoveHistory.jsx'
import CapturedPieces from '../components/game/CapturedPieces.jsx'
import PromotionModal from '../components/game/PromotionModal.jsx'
import LocalSetupModal from '../components/board/LocalSetupModal.jsx'
import Timer from "../components/game/Timer.jsx";

export default function PlayLocal() {
  const {
    turn, gameStatus, position, moveHistory, showHistory, setShowHistory,
    highlightSquares, capturedByWhite, capturedByBlack,
    onSquareClick, onPieceDrop, resetGame, promotionData, promotePawn,
    setGameMode, showFlipPrompt, startLocalGame,
  } = useGame()

  useEffect(() => {
    setGameMode('local')
    resetGame('local')
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

         <CapturedPieces
         capturedByWhite={capturedByWhite}
         capturedByBlack={capturedByBlack}
         />
        <GameControls
          showHistory={showHistory}
          onToggleHistory={() => setShowHistory(p => !p)}
          onNewGame={() => resetGame('local')}
        />
        {showHistory && <MoveHistory moveHistory={moveHistory} />}
      </aside>
      {promotionData && ( <PromotionModal color={promotionData.color} onSelect={promotePawn} /> )}
      {showFlipPrompt && <LocalSetupModal onSelect={startLocalGame} />}
    </main>
  )
}