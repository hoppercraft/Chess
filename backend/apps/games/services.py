from django.db import transaction
from django.db.models import F
from django.utils import timezone

from .models import Game, User
from .elo import apply_elo

# Terminations that count as a draw when there's no winner.
DRAW_TERMINATIONS = {Game.Termination.DRAW, Game.Termination.STALEMATE}


@transaction.atomic
def save_game(user, data):
    """
    Persist a finished game and update both players' stats/rating.

    `user` is always the authenticated request user, and is trusted as the
    white_player instead of whatever (if anything) the client sent -- a
    client should never be able to attribute a saved game to someone else.
    """
    data = dict(data)
    data["white_player"] = user

    game = Game.objects.create(**data)

    if game.status == Game.GameStatus.FINISHED and not game.finished_at:
        game.finished_at = timezone.now()
        game.save(update_fields=["finished_at"])

    update_user_stats(game)

    return game


def update_user_stats(game):
    """
    Update games_played/won/lost/drawn counters and Elo ratings for both
    players in a finished game.

    Both user rows are locked with select_for_update() for the duration of
    the update so that two games finishing concurrently for the same
    player can't race each other and clobber a stat update. The counters
    themselves are updated with F() expressions so the read-modify-write
    happens atomically at the database level rather than in Python.
    """
    if game.status != Game.GameStatus.FINISHED:
        # Only finished games affect stats/rating.
        return

    with transaction.atomic():
        user_ids = [game.white_player_id]
        if game.black_player_id:
            user_ids.append(game.black_player_id)

        locked_users = {
            u.id: u
            for u in User.objects.select_for_update().filter(id__in=user_ids)
        }

        white = locked_users.get(game.white_player_id)
        black = locked_users.get(game.black_player_id) if game.black_player_id else None

        if white is None:
            # White player row is gone (deleted account, etc.) -- nothing to update.
            return

        # ---------------------------
        # Games played always increments for anyone who took part.
        # ---------------------------
        white.games_played = F("games_played") + 1
        if black:
            black.games_played = F("games_played") + 1

        is_draw = False

        # ---------------------------
        # WIN / LOSS
        # ---------------------------
        if game.winner_id:
            if game.winner_id == white.id:
                white.games_won = F("games_won") + 1
                if black:
                    black.games_lost = F("games_lost") + 1
            elif black and game.winner_id == black.id:
                black.games_won = F("games_won") + 1
                white.games_lost = F("games_lost") + 1
            # else: winner isn't one of the two recorded players -- nothing
            # sensible to attribute a win/loss to, so we skip that part but
            # still record games_played above.

        # ---------------------------
        # DRAW
        # ---------------------------
        elif game.termination in DRAW_TERMINATIONS:
            is_draw = True
            white.games_drawn = F("games_drawn") + 1
            if black:
                black.games_drawn = F("games_drawn") + 1

        # else: finished with no winner and no recognized draw termination
        # (e.g. ABANDONED). We still count games_played, but intentionally
        # don't guess at win/loss/draw or touch Elo for it.

        update_fields = ["games_played", "games_won", "games_lost", "games_drawn"]
        white.save(update_fields=update_fields)
        if black:
            black.save(update_fields=update_fields)

        # Elo only makes sense for two-player games with a definitive
        # result (win or draw).
        if black:
            if game.winner_id == white.id:
                apply_elo(white, black, result=1)
            elif game.winner_id == black.id:
                apply_elo(white, black, result=-1)
            elif is_draw:
                apply_elo(white, black, result=0)
