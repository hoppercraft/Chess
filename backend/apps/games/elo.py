import math

K = 32


def expected_score(rating_a, rating_b):
    return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))


def apply_elo(player1, player2, result):
    """
    Updates ELO ratings.

    result:
        1   -> player1 wins
        0   -> draw
       -1   -> player2 wins
    """

    expected1 = expected_score(player1.rating, player2.rating)
    expected2 = expected_score(player2.rating, player1.rating)

    if result == 1:
        score1 = 1
        score2 = 0

    elif result == -1:
        score1 = 0
        score2 = 1

    else:
        score1 = 0.5
        score2 = 0.5

    player1.rating = round(player1.rating + K * (score1 - expected1))
    player2.rating = round(player2.rating + K * (score2 - expected2))

    player1.save(update_fields=["rating"])
    player2.save(update_fields=["rating"])