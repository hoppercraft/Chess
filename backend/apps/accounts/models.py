from django.conf import settings
from django.db import models


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    display_name = models.CharField(max_length=50, blank=True)
    avatar_url = models.URLField(blank=True, null=True)

    rating = models.IntegerField(default=1200)

    bio = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} Profile"

    @property
    def games_played(self):
        return self.user.games_played

    @property
    def games_won(self):
        return self.user.games_won

    @property
    def games_lost(self):
        return self.user.games_lost

    @property
    def games_drawn(self):
        return self.user.games_drawn

    @property
    def win_rate(self):
        if self.user.games_played == 0:
            return 0
        return round((self.user.games_won / self.user.games_played) * 100, 1)