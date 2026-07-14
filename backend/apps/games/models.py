from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
import uuid


class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra):
        extra.setdefault('is_staff', True)
        extra.setdefault('is_superuser', True)
        return self.create_user(email, username, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=40, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Simple stats — kept denormalised for fast profile reads
    games_played = models.PositiveIntegerField(default=0)
    games_won = models.PositiveIntegerField(default=0)
    games_lost = models.PositiveIntegerField(default=0)
    games_drawn = models.PositiveIntegerField(default=0)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username


def generate_room_code():
    return uuid.uuid4().hex[:8]


class OnlineGame(models.Model):
    room_code = models.CharField(
        max_length=8,
        unique=True,
        default=generate_room_code,
    )

    white_player = models.ForeignKey(
        User,
        related_name='games_as_white',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    black_player = models.ForeignKey(
        User,
        related_name='games_as_black',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    fen = models.CharField(
        max_length=100,
        default='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    )

    status = models.CharField(
        max_length=20,
        default='waiting'
    )  # waiting, active, finished

    winner = models.CharField(
        max_length=10,
        null=True,
        blank=True
    )  # white, black, draw

    created_at = models.DateTimeField(auto_now_add=True)


class Game(models.Model):
    MODE_CHOICES = [
        ('local', 'Local (pass and play)'),
        ('engine', 'vs Computer'),
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

    player = models.ForeignKey(
        'games.User',
        on_delete=models.CASCADE,
        related_name='games',
    )

    mode = models.CharField(max_length=10, choices=MODE_CHOICES)
    result = models.CharField(max_length=4, choices=RESULT_CHOICES)
    termination = models.CharField(
        max_length=12,
        choices=TERMINATION_CHOICES,
        default='checkmate'
    )

    # Only set for mode='engine'
    engine_level = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
    )

    # Seconds; null initial = unlimited clock
    time_control_initial = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    time_control_increment = models.PositiveIntegerField(default=0)

    moves = models.JSONField(default=list, blank=True)
    total_moves = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'games'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.player.username} · {self.mode} · {self.result} ({self.created_at:%Y-%m-%d})"