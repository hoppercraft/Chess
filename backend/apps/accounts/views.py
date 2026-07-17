from rest_framework              import status
from rest_framework.decorators  import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response    import Response
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User

from .serializers import RegisterSerializer, UserSerializer


def _tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {
        'token':   str(refresh.access_token),
        'refresh': str(refresh),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(
        {'user': UserSerializer(user).data, **_tokens_for(user)},
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email    = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'message': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.check_password(password):
        return Response({'message': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({'message': 'Account disabled.'}, status=status.HTTP_403_FORBIDDEN)

    return Response({'user': UserSerializer(user).data, **_tokens_for(user)})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({'user': UserSerializer(request.user).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    # Stateless JWT — client discards the token; optionally blacklist refresh
    try:
        refresh = request.data.get('refresh')
        if refresh:
            token = RefreshToken(refresh)
            token.blacklist()
    except Exception:
        pass
    return Response({'message': 'Logged out.'})