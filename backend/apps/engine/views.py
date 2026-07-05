import random

import chess
from rest_framework              import status
from rest_framework.decorators  import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response    import Response

from apps.engine.ai.minimax import select_engine_move


@api_view(['POST'])
@permission_classes([AllowAny])
def random_move(request):
    """
    Return a random legal move for the given FEN position.
    Body: { fen: str }
    Returns: { move: "e2e4" } in UCI format
    """
    fen = request.data.get('fen', '')

    if not fen:
        return Response({'message': 'fen is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        board = chess.Board(fen)
    except ValueError:
        return Response({'message': 'Invalid FEN string.'}, status=status.HTTP_400_BAD_REQUEST)

    legal_moves = list(board.legal_moves)
    if not legal_moves:
        return Response({'move': None, 'note': 'No legal moves available (checkmate/stalemate).'})

    move = random.choice(legal_moves)
    return Response({'move': move.uci()})


@api_view(['POST'])
@permission_classes([AllowAny])
def validate_move(request):
    """
    Validate a move server-side.
    Body: { fen: str, from: str, to: str }
    Returns: { legal: bool, new_fen: str|null }

    NOTE: Full server-side move validation will be implemented when the
    AI engine (minimax/alpha-beta) module is complete. For now the frontend
    handles all move validation locally.
    """
    fen  = request.data.get('fen', '')
    from_ = request.data.get('from', '')
    to   = request.data.get('to', '')

    if not all([fen, from_, to]):
        return Response({'message': 'fen, from, and to are required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Placeholder — always returns legal=True until engine is wired up
    return Response({'legal': True, 'new_fen': None})


@api_view(['POST'])
@permission_classes([AllowAny])
def best_move(request):
    """
    Return the engine's best move for a given FEN position.
    Body: { fen: str, depth: int (optional, default 3) }
    Returns: { from: str, to: str, score: float }

    Maps frontend level to depth: Level 1=depth 1, Level 2=depth 2, Level 3=depth 3, Level 4=depth 4
    """
    fen   = request.data.get('fen', '')
    depth = request.data.get('depth', 3)

    if not fen:
        return Response({'message': 'fen is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        board = chess.Board(fen)
    except ValueError:
        return Response({'message': 'Invalid FEN string.'}, status=status.HTTP_400_BAD_REQUEST)

    # Map depth to level (frontend sends depth: 1=2, 2=3, 3=4, 4=4)
    # But our minimax uses level directly, so map depth back to level
    depth_to_level = {1: 1, 2: 2, 3: 3, 4: 4}
    level = depth_to_level.get(depth, 3)

    move = select_engine_move(board, level)
    if not move:
        legal = list(board.legal_moves)
        if not legal:
            return Response({'from': None, 'to': None, 'score': 0, 'note': 'No legal moves'})
        move = random.choice(legal)

    uci = move.uci()
    return Response({
        'from': uci[:2],
        'to': uci[2:4],
        'score': 0,
    })