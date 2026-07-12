from rest_framework              import status
from rest_framework.decorators  import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response    import Response

from .models       import Game
from .serializers  import GameSerializer, SaveGameSerializer
from .services     import save_game


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_game(request):
    """Save a finished game to the database and update the player's stats."""
    serializer = SaveGameSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    game = save_game(request.user, serializer.validated_data)
    return Response(GameSerializer(game).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_games(request):
    """Return the authenticated user's game history (most recent first)."""
    games = Game.objects.filter(player=request.user)
    return Response({'games': GameSerializer(games, many=True).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def game_detail(request, pk):
    """Fetch a single game by id."""
    try:
        game = Game.objects.get(pk=pk, player=request.user)
    except Game.DoesNotExist:
        return Response({'message': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(GameSerializer(game).data)
