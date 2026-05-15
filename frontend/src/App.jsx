import { useState } from 'react'
import { Chessboard } from 'react-chessboard'

export default function App() {
  const [position, setPosition] = useState({
    e2: { pieceType: 'wP' },
    e7: { pieceType: 'bP' },
    e1: { pieceType: 'wK' },
    e8: { pieceType: 'bK' },
  })

  //react-chessboard function to handle drag and drop functionality of chess pieces
  function onPieceDrop({sourceSquare,targetSquare }) {
    if (!targetSquare) {
      return false
    }
    setPosition((prev) => {
      const next = {...prev }
      const piece= next[sourceSquare]
      if (!piece) return prev
      delete next[sourceSquare]
      next[targetSquare] = piece
      return next
    })

    return true
  }

  return (
    <div style={{width:480,height:480,margin:"24px auto"}}>
      <Chessboard options={{position,onPieceDrop,allowDragging: true}} />
    </div>
  )
}

