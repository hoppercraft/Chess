from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/", include("apps.accounts.urls")),
    # Alias: pages/Profile.jsx in the frontend currently calls
    # /api/accounts/me/ directly instead of going through /api/auth/, as
    # the rest of the app does. Serving both prefixes means that page
    # works without needing a frontend change.
    path("api/accounts/", include("apps.accounts.urls")),

    path("api/games/", include("apps.games.urls")),

    path("api/engine/", include("apps.engine.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)