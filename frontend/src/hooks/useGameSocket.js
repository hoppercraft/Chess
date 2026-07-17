import { useEffect, useRef, useState, useCallback } from 'react'
import { fenToPosition } from '../logic/board/fenConverter.js'
import { PIECE_SYMBOLS } from '../utils/constants.js'
import { gameApi } from '../api/gameApi.js'

function diffMove(oldPos, newPos) {
  const emptied = []
  const filled = []
  const squares = new Set([...Object.keys(oldPos || {}), ...Object.keys(newPos)])
  for (const sq of squares) {
    const before = oldPos?.[sq]
    const after = newPos[sq]
    if (!after && before) emptied.push(sq)
    else if (after && (!before || before.pieceType !== after.pieceType)) filled.push(sq)
  }
  return { emptied, filled }
}

export function useGameSocket(roomCode) {
  const wsRef = useRef(null)
  const prevPositionRef = useRef(null)
  const colorRef = useRef(null)       // mirrors `color` state, safe to read inside onmessage closure
  const savedRef = useRef(false)      // guards against saving the same finished game twice
  const moveHistoryRef = useRef([])
  const [connected, setConnected] = useState(false)
  const [position, setPosition] = useState(null)
  const [turn, setTurn] = useState('w')
  const [roomStatus, setRoomStatus] = useState('waiting')
  const [winner, setWinner] = useState(null)
  const [error, setError] = useState(null)
  const [moveHistory, setMoveHistory] = useState([])
  const [lastMove, setLastMove] = useState(null)
  const [capturedByWhite, setCapturedByWhite] = useState([])
  const [capturedByBlack, setCapturedByBlack] = useState([])
  const [color, setColor] = useState(null)

  useEffect(() => {
    savedRef.current = false
  }, [roomCode])

  useEffect(() => {
    if (!roomCode) return
    const token = localStorage.getItem('chess_token')
    const ws = new WebSocket(`ws://localhost:8000/ws/game/${roomCode}/`, [token])
    wsRef.current = ws

    ws.onopen = () => setConnected(true)

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)

      if (data.type === 'assigned_color') {
        setColor(data.color)
        colorRef.current = data.color
        return
      }
      if (data.type === 'error') {
        setError(data.message)
        return
      }

      const newPosition = fenToPosition(data.fen)
      const movedColor = data.fen.split(' ')[1] === 'w' ? 'b' : 'w'

      if (prevPositionRef.current) {
        const { emptied, filled } = diffMove(prevPositionRef.current, newPosition)

        if (emptied.length === 1 && filled.length === 1) {
          const from = emptied[0]
          const to = filled[0]
          const movedPiece = newPosition[to]
          const wasCapture = !!prevPositionRef.current[to]
          const type = movedPiece.pieceType[1]
          const notation = `${PIECE_SYMBOLS[type] || ''}${from}${wasCapture ? 'x' : '→'}${to}`

          setMoveHistory(prev => {
            const next = [...prev, notation]
            moveHistoryRef.current = next
            return next
          })
          setLastMove({ from, to })

          if (wasCapture) {
            const capturedType = prevPositionRef.current[to].pieceType
            if (movedColor === 'w') {
              setCapturedByWhite(prev => [...prev, capturedType])
            } else {
              setCapturedByBlack(prev => [...prev, capturedType])
            }
          }
        } else if (emptied.length > 0 || filled.length > 0) {
          setMoveHistory(prev => {
            const next = [...prev, 'Move']
            moveHistoryRef.current = next
            return next
          })
          setLastMove(null)
        }
      }

      prevPositionRef.current = newPosition
      setPosition(newPosition)
      setTurn(data.fen.split(' ')[1])
      setRoomStatus(data.status)
      setWinner(data.winner ?? null)
      setError(null)

      // Save the game once, when it reaches a finished state
      if (data.status === 'finished' && !savedRef.current) {
        savedRef.current = true

        const myColor = colorRef.current // 'white' | 'black'
        let result
        if (data.winner === 'draw') {
          result = 'draw'
        } else {
          result = data.winner === myColor ? 'win' : 'loss'
        }

        gameApi.saveGame({
          mode: 'online',
          result,
          termination: data.winner === 'draw' ? 'stalemate' : 'checkmate',
          engine_level: null,
          time_control_initial: null,
          time_control_increment: 0,
          moves: moveHistoryRef.current,
        }).catch(err => console.error('Failed to save online game:', err))
      }
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

  function resetLocalHistory() {
    setMoveHistory([])
    setCapturedByWhite([])
    setCapturedByBlack([])
    setLastMove(null)
  }

  return {
    connected, position, turn, roomStatus, winner, error, sendMove,
    moveHistory, lastMove, capturedByWhite, capturedByBlack, resetLocalHistory,
    color,
  }
}