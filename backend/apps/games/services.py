from django.db import transaction

from .models import Game


@transaction.atomic
def save_game(user, validated_data):
    """Persist a finished game for `user` and update their win/loss/draw stats."""
    moves = validated_data.get('moves') or []

    game = Game.objects.create(
        player=user,
        mode=validated_data['mode'],
        result=validated_data['result'],
        termination=validated_data.get('termination', 'checkmate'),
        engine_level=validated_data.get('engine_level'),
        time_control_initial=validated_data.get('time_control_initial'),
        time_control_increment=validated_data.get('time_control_increment', 0),
        moves=moves,
        total_moves=len(moves),
    )

    _update_stats(user, game.result)

    return game


def _update_stats(user, result):
    user.games_played += 1
    if result == 'win':
        user.games_won += 1
    elif result == 'loss':
        user.games_lost += 1
    else:
        user.games_drawn += 1
    user.save(update_fields=['games_played', 'games_won', 'games_lost', 'games_drawn'])

    # Keep the accounts.Profile counters (used for the public-facing profile)
    # in sync too, if the user has one.
    profile = getattr(user, 'profile', None)
    if profile is not None:
        profile.games_played += 1
        if result == 'win':
            profile.games_won += 1
        elif result == 'loss':
            profile.games_lost += 1
        else:
            profile.games_drawn += 1
        profile.save(update_fields=['games_played', 'games_won', 'games_lost', 'games_drawn'])
