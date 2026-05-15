import { useState } from 'react'
import { Chessboard } from 'react-chessboard'


export default function App() {
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

  return (
    <div style={{ padding: '20px' }}>
      <h1>Chess</h1>
      <Chessboard position={fen} />
    </div>
  )
}

