from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


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

    games_played = models.PositiveIntegerField(default=0)
    games_won = models.PositiveIntegerField(default=0)
    games_lost = models.PositiveIntegerField(default=0)
    games_drawn = models.PositiveIntegerField(default=0)

    rating = models.IntegerField(default=1200)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username


# =========================
# GAME MODEL (SEPARATE)
# =========================

class Game(models.Model):



    class GameMode(models.TextChoices):
        LOCAL = "LOCAL", "Local"
        AI = "AI", "AI"
        ONLINE = "ONLINE", "Online"

    class GameStatus(models.TextChoices):
        ONGOING = "ONGOING", "Ongoing"
        FINISHED = "FINISHED", "Finished"
        ABANDONED = "ABANDONED", "Abandoned"

    class Termination(models.TextChoices):
        CHECKMATE = "CHECKMATE", "Checkmate"
        STALEMATE = "STALEMATE", "Stalemate"
        RESIGNATION = "RESIGNATION", "Resignation"
        TIMEOUT = "TIMEOUT", "Timeout"
        DRAW = "DRAW", "Draw"

    white_player = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="white_games"
    )

    black_player = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="black_games"
    )

    winner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="games_won_set"
    )

    mode = models.CharField(
        max_length=10,
        choices=GameMode.choices,
        default=GameMode.LOCAL
    )

    status = models.CharField(
        max_length=10,
        choices=GameStatus.choices,
        default=GameStatus.ONGOING
    )

    termination = models.CharField(
        max_length=20,
        choices=Termination.choices,
        null=True,
        blank=True
    )

    moves = models.JSONField(default=list)
    move_count = models.PositiveIntegerField(default=0)

    initial_fen = models.TextField(default="startpos")
    final_fen = models.TextField(null=True, blank=True)

    time_control = models.IntegerField(default=600)
    increment = models.IntegerField(default=0)

    white_time_remaining = models.IntegerField(null=True, blank=True)
    black_time_remaining = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Game {self.id}"