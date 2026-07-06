from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.register, name='auth-register'),
    path('login/',    views.login,    name='auth-login'),
    path('me/',       views.me,       name='auth-me'),
    path('logout/',   views.logout,   name='auth-logout'),
    path('refresh/',  TokenRefreshView.as_view(), name='auth-refresh'),
]