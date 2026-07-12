import { createContext, useContext, useState, useRef, useEffect } from 'react'
import { INITIAL_POSITION, PIECE_SYMBOLS } from '../utils/constants.js'
import { makeAIMove } from '../logic/engine/aiEngine.js'
import { buildHighlights } from '../logic/engine/gameState.js'
import { isCheck } from '../logic/validation/isCheck.js'
import { isCheckmate } from '../logic/validation/isCheckmate.js'
import { isStalemate } from '../logic/validation/isStalemate.js'
import { positionToFen } from '../logic/board/fenConverter.js'
import { applyMove } from '../logic/engine/applyMove.js'
import { gameApi } from '../api/gameApi.js'
import { useAuth } from './AuthContext.jsx'

const API_BASE = 'http://localhost:8000/api'

const GameContext = createContext(null)

async function fetchRandomMove(fenString) {
  const res = await fetch(`${API_BASE}/engine/random-move/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fen: fenString }),
  })
  const data = await res.json()
  return data.move
}

async function fetchBestMove(fenString, level) {
  try {
    const res = await fetch(`${API_BASE}/engine/best-move/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fen: fenString, depth: level }),
    })
    const data = await res.json()
    if (data && data.from && data.to) {
      return `${data.from}${data.to}`
    }
  } catch (err) {
    console.error("Error fetching best move:", err)
  }
  return null
}

function uciToMove(uci, position) {
  if (!uci || uci.length < 4) return null
  const from = uci.slice(0, 2)
  const to = uci.slice(2, 4)
  const piece = position[from]
  if (!piece) return null
  return { from, to, pieceType: piece.pieceType }
}

async function makeAIMoveOLD(currentPosition, currentTurn, level, setPosition, setTurn, setGameStatus, setMoveHistory, setLastMove, setHighlightSquares, setCapturedByWhite, setCapturedByBlack, castleRights, setCastleRights, setEnPassantSquare) {
  const fen = positionToFen(currentPosition, currentTurn, castleRights, null, 0, 1)

  let uci
  if (level === 0) {
    uci = await fetchRandomMove(fen)
  } else {
    uci = await fetchBestMove(fen, level)
    if (!uci) {
      // Fallback to random move if minimax/best_move is not fully implemented in backend yet
      uci = await fetchRandomMove(fen)
    }
  }

  if (!uci) return false

  const move = uciToMove(uci, currentPosition)
  if (!move) return false

  const newPosition = applyMove(move.from, move.to, currentPosition, currentTurn, null)
  if (!newPosition) return false

  const piece = currentPosition[move.from]
  const targetPiece = currentPosition[move.to]

  const type = piece.pieceType[1]
  const notation = `${PIECE_SYMBOLS[type] || ''}${move.from}${targetPiece ? 'x' : '→'}${move.to}`

  const lm = { from: move.from, to: move.to }
  setMoveHistory(prev => [...prev, notation])

  if (targetPiece) {
    if (currentTurn === 'w') {
      setCapturedByWhite(prev => [...prev, targetPiece.pieceType])
    } else {
      setCapturedByBlack(prev => [...prev, targetPiece.pieceType])
    }
  }

  setLastMove(lm)
  setHighlightSquares(buildHighlights(null, newPosition, lm, castleRights, null))
  setPosition(newPosition)

  const nextTurn = currentTurn === 'w' ? 'b' : 'w'

  if (isCheckmate(newPosition, nextTurn)) {
    setGameStatus('checkmate')
  } else if (isStalemate(newPosition, nextTurn)) {
    setGameStatus('stalemate')
  } else if (isCheck(newPosition, nextTurn)) {
    setGameStatus('check')
  } else {
    setGameStatus('playing')
  }

  setTurn(nextTurn)

  // Update castling rights for AI move
  const rights = { ...castleRights }
  if (move.from === 'e1') rights.wKingMoved = true
  if (move.from === 'e8') rights.bKingMoved = true
  if (move.from === 'a1') rights.wLeftRookMoved = true
  if (move.from === 'h1') rights.wRightRookMoved = true
  if (move.from === 'a8') rights.bLeftRookMoved = true
  if (move.from === 'h8') rights.bRightRookMoved = true
  setCastleRights(rights)

  setEnPassantSquare(null)

  return true
}



export function GameProvider({ children }) {
  const { user } = useAuth()
  const [turn,             setTurn]             = useState('w')
  const [gameStatus, setGameStatus] = useState('playing')
  const [gameMode,         setGameMode]         = useState('local')
  const [level,            setLevel]            = useState(0)


// ---------------- Timer ----------------

const [timeControl, setTimeControl] = useState({
  initial: null,
  increment: 0,
})

const [whiteTime, setWhiteTime] = useState(null)
const [blackTime, setBlackTime] = useState(null)

const [timerRunning, setTimerRunning] = useState(false)
// Whose clock is currently counting
const [activeTimer, setActiveTimer] = useState('w')

// Keep the active clock in sync with whose turn it actually is
useEffect(() => {
  setActiveTimer(turn)
}, [turn])

// The actual countdown loop
useEffect(() => {
  if (!timerRunning) return
  if (timeControl.initial === null) return // unlimited time control, nothing to tick
  if (gameStatus === 'checkmate' || gameStatus === 'stalemate' || gameStatus === 'timeout') return

  const interval = setInterval(() => {
    const setTime = activeTimer === 'w' ? setWhiteTime : setBlackTime

    setTime(prev => {
      if (prev === null) return prev
      if (prev <= 1) {
        clearInterval(interval)
        setTimerRunning(false)
        setGameStatus('timeout')
        return 0
      }
      return prev - 1
    })
  }, 1000)

  return () => clearInterval(interval)
}, [timerRunning, activeTimer, gameStatus, timeControl.initial])

//..............


  const [position,         setPosition]         = useState(() => ({ ...INITIAL_POSITION }))
  const [boardOrientation, setBoardOrientation] = useState('white')
  const [autoFlip,         setAutoFlip]         = useState(false)
  const [showFlipPrompt,   setShowFlipPrompt]   = useState(false)
  const [showEnginePrompt, setShowEnginePrompt] = useState(false)
  const autoFlipRef = useRef(autoFlip)
  useEffect(() => { 
    autoFlipRef.current = autoFlip
    console.log('AUTOFLIP REF UPDATED:', autoFlip)
  }, [autoFlip])
  const [castleRights, setCastleRights] = useState({
  wKingMoved: false,
  bKingMoved: false,

  wLeftRookMoved: false,
  wRightRookMoved: false,

  bLeftRookMoved: false,
  bRightRookMoved: false,
  })
  const [enPassantSquare, setEnPassantSquare] = useState(null)
  const [moveHistory,      setMoveHistory]      = useState([])
  const [promotionData, setPromotionData] = useState(null)
  const [showHistory,      setShowHistory]      = useState(false)
  const [highlightSquares, setHighlightSquares] = useState({})
  const [lastMove,         setLastMove]         = useState(null)
  const [capturedByWhite,  setCapturedByWhite]  = useState([])
  const [capturedByBlack,  setCapturedByBlack]  = useState([])
  const gameSavedRef = useRef(false) // guards against saving the same finished game twice

  // ---------------- Toast (save feedback) ----------------
  const [toast, setToast] = useState(null) // { message, type: 'success' | 'error' }
  const toastTimeoutRef = useRef(null)

  function showToast(message, type = 'success') {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToast({ message, type })
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000)
  }

  function dismissToast() {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToast(null)
  }

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  // Persist the game once it reaches a terminal state, for signed-in users.
  // Local and engine games only — the human player is assumed to be White in
  // both modes (local pass-and-play has no per-side login yet, and vs-engine
  // always seats the human as White), so results are recorded from White's
  // perspective. Revisit this once local games support picking your color.
  useEffect(() => {
    const isTerminal = gameStatus === 'checkmate' || gameStatus === 'stalemate' || gameStatus === 'timeout'
    if (!isTerminal) return
    if (!user) return
    if (gameMode !== 'local' && gameMode !== 'engine') return
    if (gameSavedRef.current) return

    let result, termination
    if (gameStatus === 'stalemate') {
      result = 'draw'
      termination = 'stalemate'
    } else {
      const loserColor = gameStatus === 'timeout' ? activeTimer : turn
      result = loserColor === 'w' ? 'loss' : 'win'
      termination = gameStatus === 'timeout' ? 'timeout' : 'checkmate'
    }

    gameSavedRef.current = true

    gameApi.saveGame({
      mode: gameMode,
      result,
      termination,
      engine_level: gameMode === 'engine' ? level : null,
      time_control_initial: timeControl.initial,
      time_control_increment: timeControl.increment,
      moves: moveHistory,
    }).then(() => {
      showToast('Game saved', 'success')
    }).catch(() => {
      // Non-fatal: keep playing even if the save fails (offline, server down, etc.)
      showToast('Save failed', 'error')
    })
  }, [gameStatus, user, gameMode, activeTimer, turn, level, timeControl, moveHistory])

  function onSquareClick({ square }) {
    const piece = position[square]
    if (piece && piece.pieceType[0] === turn) {
      setHighlightSquares(buildHighlights(square, position, lastMove, castleRights, enPassantSquare))
    } else {
      setHighlightSquares(buildHighlights(null, position, lastMove, castleRights, enPassantSquare))
    }
  }

function onPieceDrop({ sourceSquare, targetSquare }) {

  if (
    gameStatus === 'checkmate' ||
    gameStatus === 'stalemate' ||
    gameStatus === 'timeout'
  ) {
    return false
  }

  const newPosition = applyMove(sourceSquare, targetSquare, position, turn, enPassantSquare)
  if (!newPosition) return false

  if (gameMode === 'engine' && turn === 'b') {
    return false
  }

  const piece       = position[sourceSquare]

  const promotionRank = piece.pieceType[0] === 'w' ? '8' : '1'

  if (piece.pieceType[1] === 'P' && targetSquare[1] === promotionRank) {
    setPromotionData({ sourceSquare, targetSquare, color: piece.pieceType[0] })
    return false
  }

  if (piece.pieceType[1] === 'P') {
    const startRank = Number(sourceSquare[1])
    const endRank = Number(targetSquare[1])
    if (Math.abs(endRank - startRank) === 2) {
      const middleRank = (startRank + endRank) / 2
      setEnPassantSquare(sourceSquare[0] + middleRank)
    } else {
      setEnPassantSquare(null)
    }
  } else {
    setEnPassantSquare(null)
  }

  const rights = { ...castleRights }
  if (sourceSquare === 'e1') rights.wKingMoved = true
  if (sourceSquare === 'e8') rights.bKingMoved = true
  if (sourceSquare === 'a1') rights.wLeftRookMoved = true
  if (sourceSquare === 'h1') rights.wRightRookMoved = true
  if (sourceSquare === 'a8') rights.bLeftRookMoved = true
  if (sourceSquare === 'h8') rights.bRightRookMoved = true
  setCastleRights(rights)

  const type = piece.pieceType[1]
  const targetPiece = position[targetSquare]
  const notation = `${PIECE_SYMBOLS[type] || ''}${sourceSquare}${targetPiece ? 'x' : '→'}${targetSquare}`

  const lm = { from: sourceSquare, to: targetSquare }
  setMoveHistory(prev => [...prev, notation])

  if (targetPiece) {
    if (turn === 'w') {
      setCapturedByWhite(prev => [...prev, targetPiece.pieceType])
    } else {
      setCapturedByBlack(prev => [...prev, targetPiece.pieceType])
    }
  }

  setLastMove(lm)
  setHighlightSquares(buildHighlights(null, newPosition, lm, rights, enPassantSquare))
  setPosition(newPosition)

  const nextTurn = turn === 'w' ? 'b' : 'w'

  let newGameStatus = 'playing'
  if (isCheckmate(newPosition, nextTurn)) {
    newGameStatus = 'checkmate'
  } else if (isStalemate(newPosition, nextTurn)) {
    newGameStatus = 'stalemate'
  } else if (isCheck(newPosition, nextTurn)) {
    newGameStatus = 'check'
  }
  setGameStatus(newGameStatus)
  setTurn(nextTurn)

  // Apply increment to the player who just moved, before the clock switches sides
  if (timeControl.initial !== null && timeControl.increment) {
    if (turn === 'w') {
      setWhiteTime(prev => (prev === null ? prev : prev + timeControl.increment))
    } else {
      setBlackTime(prev => (prev === null ? prev : prev + timeControl.increment))
    }
  }

  if (gameMode === 'local' && autoFlipRef.current) {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')
  }

  if (gameMode === 'engine' && nextTurn === 'b' && newGameStatus !== 'checkmate' && newGameStatus !== 'stalemate') {
    setTimeout(() => {
      makeAIMove(
        newPosition,
        'b',
        level,
        setPosition,
        setTurn,
        setGameStatus,
        setMoveHistory,
        setLastMove,
        setHighlightSquares,
        setCapturedByWhite,
        setCapturedByBlack,
        rights,
        setCastleRights,
        setEnPassantSquare
      )
    }, 300)
  }

  return true
}
// function to handle promotion piece selection and 
// promotion move application after a pawn reaches thepromotion rank on the board
function promotePawn(pieceType) {

  if (!promotionData) return

  const { sourceSquare, targetSquare, color } = promotionData

  const next = { ...position }

  delete next[sourceSquare]

  next[targetSquare] = {
    pieceType: color + pieceType,
  }

  setPosition(next)

  setPromotionData(null)

  const nextTurn = turn === 'w' ? 'b' : 'w'

  let statusAfterPromotion = 'playing'
  if (isCheckmate(next, nextTurn)) {
    statusAfterPromotion = 'checkmate'
  } else if (isStalemate(next, nextTurn)) {
    statusAfterPromotion = 'stalemate'
  } else if (isCheck(next, nextTurn)) {
    statusAfterPromotion = 'check'
  }

  setGameStatus(statusAfterPromotion)
  setTurn(nextTurn)

  // Apply increment on promotion moves too
  if (timeControl.initial !== null && timeControl.increment) {
    if (turn === 'w') {
      setWhiteTime(prev => (prev === null ? prev : prev + timeControl.increment))
    } else {
      setBlackTime(prev => (prev === null ? prev : prev + timeControl.increment))
    }
  }

  if (gameMode === 'local' && autoFlipRef.current) {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')
  }

  if (gameMode === 'engine' && nextTurn === 'b' && statusAfterPromotion !== 'checkmate' && statusAfterPromotion !== 'stalemate') {
    setTimeout(() => {
      makeAIMove(
        next,
        'b',
        level,
        setPosition,
        setTurn,
        setGameStatus,
        setMoveHistory,
        setLastMove,
        setHighlightSquares,
        setCapturedByWhite,
        setCapturedByBlack,
        castleRights,
        setCastleRights,
        setEnPassantSquare
      )
    }, 300)
  }
}
function resetGame(mode) {
  gameSavedRef.current = false
  dismissToast()
  setPosition({ ...INITIAL_POSITION })
  setTurn('w')
  setGameStatus('playing')
  setMoveHistory([])
  setLastMove(null)
  setHighlightSquares({})
  setCapturedByWhite([])
  setCapturedByBlack([])
  setShowHistory(false)
  setBoardOrientation('white')
  setCastleRights({
    wKingMoved: false,
    bKingMoved: false,
    wLeftRookMoved: false,
    wRightRookMoved: false,
    bLeftRookMoved: false,
    bRightRookMoved: false,
  })
  setEnPassantSquare(null)

  if (mode === 'local') {
    setShowFlipPrompt(true)
  } else {
    setShowFlipPrompt(false)
  }

  if (mode === 'engine') {
    setShowEnginePrompt(true)
  } else {
    setShowEnginePrompt(false)
  }

  setTimerRunning(false)
  setWhiteTime(timeControl.initial)
  setBlackTime(timeControl.initial)
  setActiveTimer('w')
}

function startLocalGame(settings) {

  setAutoFlip(settings.autoFlip)
  setTimeControl(settings.timeControl)

  setWhiteTime(settings.timeControl.initial)
  setBlackTime(settings.timeControl.initial)
  setActiveTimer('w')

  setShowFlipPrompt(false)

  // Start the countdown, unless this is an unlimited-time game
  setTimerRunning(settings.timeControl.initial !== null)
}

function startEngineGame(settings) {

  setLevel(settings.level)
  setTimeControl(settings.timeControl)

  setWhiteTime(settings.timeControl.initial)
  setBlackTime(settings.timeControl.initial)
  setActiveTimer('w')

  setShowEnginePrompt(false)

  // Start the countdown, unless this is an unlimited-time game
  setTimerRunning(settings.timeControl.initial !== null)
}

  return (
    <GameContext.Provider value={{
  turn,
  gameStatus,
  position,
  moveHistory,
  showHistory,
  setShowHistory,
  highlightSquares,
  capturedByWhite,
  capturedByBlack,
  onSquareClick,
  onPieceDrop,
  resetGame,
  promotionData,
  promotePawn,
  gameMode,
  setGameMode,
  level,
  setLevel,
  boardOrientation,
  autoFlip,
  showFlipPrompt,
  startLocalGame,
  showEnginePrompt,
  startEngineGame,
  timeControl,
setTimeControl,

whiteTime,
setWhiteTime,

blackTime,
setBlackTime,

timerRunning,
setTimerRunning,

activeTimer,
setActiveTimer,

toast,
dismissToast,
}}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  return useContext(GameContext)
}