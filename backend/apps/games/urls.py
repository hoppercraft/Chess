from django.urls import path
from . import views

urlpatterns = [
    path('',        views.create_game,  name='game-create'),
    path('my',      views.my_games,     name='game-my'),
    path('<int:pk>',views.game_detail,  name='game-detail'),
]

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<room_code>\w+)/$', consumers.GameConsumer.as_asgi()),
]