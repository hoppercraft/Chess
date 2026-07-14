// hooks/useGameSocket.js
import { useEffect, useRef, useState, useCallback } from 'react'
import { fenToPosition } from '../logic/board/fenConverter.js'

export function useGameSocket(roomCode) {
  const wsRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [position, setPosition] = useState(null)
  const [status, setStatus] = useState('waiting')
  const [winner, setWinner] = useState(null)
  const [turn, setTurn] = useState('w')
  const [color, setColor] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!roomCode) return
    const token = localStorage.getItem('chess_token')
    const ws = new WebSocket(`ws://localhost:8000/ws/game/${roomCode}/`, [token])
    wsRef.current = ws

    ws.onopen = () => setConnected(true)

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'error') {
        setError(data.message)
        return
      }
      // game_state broadcast: { type: 'game_state', fen, status, winner }
      setPosition(fenToPosition(data.fen))
      setTurn(data.fen.split(' ')[1])
      setStatus(data.status)
      setWinner(data.winner ?? null)
      setError(null)
    }

    ws.onclose = () => setConnected(false)
    ws.onerror = () => setError('Connection error.')

    return () => ws.close()
  }, [roomCode])

  const sendMove = useCallback((from, to, promotion) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'move',
        move: `${from}${to}${promotion || ''}`,
      }))
    }
  }, [])

  return { connected, position, turn, status, winner, color, error, sendMove }
}