from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register),
    path('login/', views.login),
    path('me/', views.me),
    path('logout/', views.logout),

    # PROFILE
    path('profile/', views.profile),
    path('profile/update/', views.update_profile),
]