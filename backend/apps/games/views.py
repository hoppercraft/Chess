from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Game
from .serializers import GameSerializer, SaveGameSerializer
from .services import GameService


# =========================
# CREATE / SAVE GAME
# =========================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_game(request):
    """Save a finished game to the database."""

    serializer = SaveGameSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    game = GameService.save_game(serializer.validated_data)

    return Response(
        GameSerializer(game).data,
        status=status.HTTP_201_CREATED
    )


# =========================
# USER GAME HISTORY
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_games(request):
    """Return authenticated user's game history."""

    games = Game.objects.filter(
        white_player=request.user
    ).select_related(
        'white_player',
        'black_player',
        'winner'
    ).order_by('-created_at')

    return Response({
        'games': GameSerializer(games, many=True).data
    })


# =========================
# SINGLE GAME DETAIL (REPLAY)
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def game_detail(request, pk):
    """Fetch a single game by id."""

    try:
        game = Game.objects.select_related(
            'white_player',
            'black_player',
            'winner'
        ).get(pk=pk, white_player=request.user)

    except Game.DoesNotExist:
        return Response(
            {'message': 'Not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response(GameSerializer(game).data)