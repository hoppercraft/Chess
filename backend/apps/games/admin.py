from django.contrib import admin

from .models import Game


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('id', 'player', 'mode', 'result', 'termination', 'total_moves', 'created_at')
    list_filter = ('mode', 'result', 'termination')
    search_fields = ('player__username', 'player__email')
