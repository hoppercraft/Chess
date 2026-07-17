import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# This line MUST run before any Django-model-importing code below
django_asgi_app = get_asgi_application()

# Only NOW is it safe to import anything that touches Django models/apps
from channels.routing import ProtocolTypeRouter, URLRouter
from apps.games.middleware import JWTAuthMiddleware
from apps.games.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': JWTAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})