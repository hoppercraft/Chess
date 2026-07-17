import uuid
from django.conf import settings
from django.db import models


def generate_room_code():
    return uuid.uuid4().hex[:8]


class OnlineGame(models.Model):
    room_code = models.CharField(max_length=8, unique=True, default=generate_room_code)
    white_player = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='games_as_white', on_delete=models.CASCADE, null=True, blank=True)
    black_player = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='games_as_black', on_delete=models.CASCADE, null=True, blank=True)
    fen = models.CharField(max_length=100, default='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    status = models.CharField(max_length=20, default='waiting')
    winner = models.CharField(max_length=10, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Game(models.Model):
    MODE_CHOICES = [
        ('local', 'Local (pass and play)'),
        ('engine', 'vs Computer'),
        ('online', 'Online Multiplayer'),
    ]
    RESULT_CHOICES = [
        ('win', 'Win'),
        ('loss', 'Loss'),
        ('draw', 'Draw'),
    ]
    TERMINATION_CHOICES = [
        ('checkmate', 'Checkmate'),
        ('stalemate', 'Stalemate'),
        ('timeout', 'Timeout'),
        ('resignation', 'Resignation'),
    ]

    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='games')
    mode = models.CharField(max_length=10, choices=MODE_CHOICES)
    result = models.CharField(max_length=4, choices=RESULT_CHOICES)
    termination = models.CharField(max_length=12, choices=TERMINATION_CHOICES, default='checkmate')
    engine_level = models.PositiveSmallIntegerField(null=True, blank=True)
    time_control_initial = models.PositiveIntegerField(null=True, blank=True)
    time_control_increment = models.PositiveIntegerField(default=0)
    moves = models.JSONField(default=list, blank=True)
    total_moves = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'games'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.player.username} · {self.mode} · {self.result} ({self.created_at:%Y-%m-%d})"