from django.db import transaction
from django.utils import timezone

from .models import Game
from .elo import apply_elo


@transaction.atomic
def save_game(user, data):
    game = Game.objects.create(**data)

    game.finished_at = timezone.now()
    game.save()

    update_user_stats(game)

    return game


def update_user_stats(game):
    white = game.white_player
    black = game.black_player

    # Always count games played
    white.games_played += 1
    if black:
        black.games_played += 1

    # ---------------------------
    # WIN / LOSS
    # ---------------------------
    if game.winner:

        if game.winner == white:
            white.games_won += 1

            if black:
                black.games_lost += 1
                apply_elo(white, black, draw=False)

        else:
            black.games_won += 1
            white.games_lost += 1
            apply_elo(black, white, draw=False)

    # ---------------------------
    # DRAW
    # ---------------------------
    elif game.termination == "DRAW":
        white.games_drawn += 1

        if black:
            black.games_drawn += 1
            apply_elo(white, black, draw=True)

    # Save users
    white.save()

    if black:
        black.save()