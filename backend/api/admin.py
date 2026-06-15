from django.contrib import admin
from .models import Game, Move


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('id', 'player', 'status', 'created_at', 'updated_at')
    search_fields = ('id', 'player__username')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Move)
class MoveAdmin(admin.ModelAdmin):
    list_display = ('id', 'game', 'move_number', 'played_by', 'uci_move', 'created_at')
    list_filter = ('played_by',)
    search_fields = ('game__id', 'uci_move')
from django.contrib import admin

# Register your models here.
