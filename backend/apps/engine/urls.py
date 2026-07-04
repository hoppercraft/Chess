from django.urls import path
from .views import random_move, validate_move, best_move

urlpatterns = [
    path('random-move/', random_move, name='random_move'),
    path('validate-move/', validate_move, name='validate_move'),
    path('best-move/', best_move, name='best_move'),
]