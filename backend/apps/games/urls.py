from django.urls import path, re_path
from . import views, consumers

urlpatterns = [
    path("", views.create_game, name="game-create"),
    path("my/", views.my_games, name="game-my"),
    path("<int:pk>/", views.game_detail, name="game-detail"),
]

websocket_urlpatterns = [
    re_path(
        r"ws/game/(?P<room_code>\w+)/$",
        consumers.GameConsumer.as_asgi(),
    ),
]