import { useState } from 'react'
import { Chessboard } from 'react-chessboard'

export default function App() {
  const [turn,setTurn] = useState('w')
  const [castle, setCastle] = useState({
  wK: false, wQ: false,
  bK: false, bQ: false
  })
  const [position, setPosition] = useState({
   a8: { pieceType: 'bR' }, b8: { pieceType: 'bN' }, c8: { pieceType: 'bB' }, d8: { pieceType: 'bQ' },
  e8: { pieceType: 'bK' }, f8: { pieceType: 'bB' }, g8: { pieceType: 'bN' }, h8: { pieceType: 'bR' },
  a7: { pieceType: 'bP' }, b7: { pieceType: 'bP' }, c7: { pieceType: 'bP' }, d7: { pieceType: 'bP' },
  e7: { pieceType: 'bP' }, f7: { pieceType: 'bP' }, g7: { pieceType: 'bP' }, h7: { pieceType: 'bP' },

  a2: { pieceType: 'wP' }, b2: { pieceType: 'wP' }, c2: { pieceType: 'wP' }, d2: { pieceType: 'wP' },
  e2: { pieceType: 'wP' }, f2: { pieceType: 'wP' }, g2: { pieceType: 'wP' }, h2: { pieceType: 'wP' },
  a1: { pieceType: 'wR' }, b1: { pieceType: 'wN' }, c1: { pieceType: 'wB' }, d1: { pieceType: 'wQ' },
  e1: { pieceType: 'wK' }, f1: { pieceType: 'wB' }, g1: { pieceType: 'wN' }, h1: { pieceType: 'wR' },
  })


  function rankIndex(square){
    return parseInt(square[1],10)
  }

  function fileIndex(square){
    return square.charCodeAt(0) - 'a'.charCodeAt(0)
  }

  //react-chessboard function to handle drag and drop functionality of chess pieces
  function onPieceDrop({sourceSquare,targetSquare }) {
    if (!targetSquare) {
      return false
    }

    const piece = position[sourceSquare]
    if (!piece){
      return false
    }

    if (piece.pieceType[0] !== turn){
      return false
    }

    const targetPiece = position[targetSquare]
    if(targetPiece && targetPiece.pieceType[0] === turn){
      return false
    }

    //Hardcoded Piece Logic
    const pieceType = piece.pieceType[1]
    const pieceColor = piece.pieceType[0]

    
    const fileDiff = fileIndex(targetSquare) - fileIndex(sourceSquare)
    const rankDiff = rankIndex(targetSquare) - rankIndex(sourceSquare)

    const isDiagonal = Math.abs(fileDiff) === Math.abs(rankDiff) && fileDiff !== 0
    const isStraight = fileDiff === 0 || rankDiff === 0


    function toSquare(file,rank){
      if(file < 0 || file > 7 || rank < 1 || rank > 8){
        return null
      }

      return String.fromCharCode('a'.charCodeAt(0) + file) + rank
    }

    function isPathClear(source, target, position) {
      const fileDiff = fileIndex(target) - fileIndex(source)
      const rankDiff = rankIndex(target) - rankIndex(source)

      const fileStep = fileDiff === 0 ? 0 : fileDiff / Math.abs(fileDiff)
      const rankStep = rankDiff === 0 ? 0 : rankDiff / Math.abs(rankDiff)

      let file = fileIndex(source) + fileStep
      let rank = rankIndex(source) + rankStep

      while(file !== fileIndex(target) || rank !== rankIndex(target)) {
        const square = toSquare(file,rank)
        if(position[square]){
          return false
        }
        file += fileStep
        rank += rankStep
      }
      return true
    }
    
    //Move logic for pawn
    if(pieceType === 'P') {
      const direction = pieceColor === 'w'?1:-1
      const isInSameFile = fileDiff === 0

      const startPos = piece.pieceType[0] === 'w'?2:7
      const isAtStart = rankIndex(sourceSquare) === startPos
      
      const middleRank = rankIndex(sourceSquare) + direction
      const middleSquare = sourceSquare[0] + middleRank
      const ismiddleEmpty = !position[middleSquare]


      const isForward = isInSameFile && rankDiff === direction && !targetPiece
      const isDoubleForward = isAtStart && ismiddleEmpty && isInSameFile && rankDiff === direction * 2 && !targetPiece
      const isCapture = Math.abs(fileDiff) === 1 && targetPiece && rankDiff === direction

      if(!isForward && !isCapture &&!isDoubleForward){
        return false
      }
    }else if(pieceType === "R"){
      if(!isStraight) {
        return false
      }
      if(!isPathClear(sourceSquare,targetSquare,position)){
        return false
      }
    }else if (pieceType === "B"){
      if(!isDiagonal){
        return false
      }
      if(!isPathClear(sourceSquare,targetSquare,position)){
        return false
      }
    }else if (pieceType === "N"){
      const isLegal = Math.abs(fileDiff) === 1 && Math.abs(rankDiff) === 2 || Math.abs(rankDiff) === 1 && Math.abs(fileDiff) === 2
      if(!isLegal){
        return false
      }
    }else if(pieceType === "Q"){
      if(!isDiagonal && !isStraight){
        return false
      }

      if(!isPathClear(sourceSquare,targetSquare,position)){
        return false
      }
    }else if (pieceType === 'K') {
      const isKingMove = Math.abs(fileDiff) <= 1 && Math.abs(rankDiff) <= 1 && !(fileDiff === 0 && rankDiff === 0)

      const isCastleKingSide = pieceColor === 'w' && sourceSquare === 'e1' &&
      targetSquare === 'g1' && !castle.wK && !castle.wQ && !position.f1 && !position.g1

      const isCastleQueenSide = pieceColor === 'w' && sourceSquare === 'e1' &&targetSquare === 'c1' && !castle.wK && !castle.wQ && !position.d1 && !position.c1 && !position.b1

      const isBlackCastleKingSide = pieceColor === 'b' && sourceSquare === 'e8' &&targetSquare === 'g8' && !castle.bK && !castle.bQ && !position.f8 && !position.g8

      const isBlackCastleQueenSide =pieceColor === 'b' && sourceSquare === 'e8' &&targetSquare === 'c8' && !castle.bK && !castle.bQ && !position.d8 && !position.c8 && !position.b8

  if (!isKingMove && !isCastleKingSide && !isCastleQueenSide && !isBlackCastleKingSide && !isBlackCastleQueenSide) {
    return false
  }
}

    if (pieceType === 'K') setCastle(c => ({ ...c, [turn + 'K']: true }))
    if (pieceType === 'R') {
      if (sourceSquare === 'a1') setCastle(c => ({ ...c, wQ: true }))
      if (sourceSquare === 'h1') setCastle(c => ({ ...c, wK: true }))
      if (sourceSquare === 'a8') setCastle(c => ({ ...c, bQ: true }))
      if (sourceSquare === 'h8') setCastle(c => ({ ...c, bK: true }))
    }

    setPosition((prev) => {
      const next = {...prev }
      const movingPiece= next[sourceSquare]
      if (!movingPiece) {
        return prev
      }
      //castling rook move
      if (pieceType === 'K' && sourceSquare === 'e1' && targetSquare === 'g1') {
        next.f1 = next.h1
        delete next.h1
      } else if (pieceType === 'K' && sourceSquare === 'e1' && targetSquare === 'c1') {
        next.d1 = next.a1
        delete next.a1
      } else if (pieceType === 'K' && sourceSquare === 'e8' && targetSquare === 'g8') {
        next.f8 = next.h8
        delete next.h8
      } else if (pieceType === 'K' && sourceSquare === 'e8' && targetSquare === 'c8') {
        next.d8 = next.a8
        delete next.a8
      }

      delete next[sourceSquare]
      next[targetSquare] = piece
      return next
    })

    setTurn((prevTurn) =>(
      prevTurn === 'w' ? 'b':'w'
    ))

    return true
  }

  return (
    <div style={{width:480,height:480,margin:"24px auto"}}>
      <div>{turn === 'w' ? "White to Move":"Black to Move"}</div>
      <Chessboard options={{position,onPieceDrop,allowDragging: true}} />
    </div>
  )
}

