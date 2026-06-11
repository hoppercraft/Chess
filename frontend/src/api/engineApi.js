import React, { useState, useEffect } from 'react'
import { engineApi, getGameStatusMessage } from './engineApi'

function ChessBoard() {
  const [fen, setFen] = useState('start') // Your FEN string
  const [status, setStatus] = useState(null)

  useEffect(() => {
    checkGameStatus()
  }, [fen])

  const checkGameStatus = async () => {
    try {
      const gameStatus = await engineApi.getGameStatus(fen)
      const message = getGameStatusMessage(
        fen, 
        gameStatus.isCheck, 
        gameStatus.isCheckmate, 
        gameStatus.isStalemate,
        gameStatus.turn
      )
      setStatus(message)
    } catch (error) {
      console.error('Error checking game status:', error)
    }
  }

  return (
    <div>
      {/* Your chess board component here */}
      <div className="game-status">
        {status && status.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {line.includes('CHECK!') && <br />}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}