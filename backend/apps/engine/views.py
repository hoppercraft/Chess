from rest_framework              import status
from rest_framework.decorators  import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response    import Response


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

    NOTE: Stub — returns null until the minimax/alpha-beta module is complete.
    """
    fen   = request.data.get('fen', '')
    depth = request.data.get('depth', 3)

    if not fen:
        return Response({'message': 'fen is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # TODO: wire up apps/engine/ai/minimax.py here
    return Response({'from': None, 'to': None, 'score': None, 'note': 'Engine not yet implemented.'})