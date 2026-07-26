import random

import chess

from apps.engine.ai.alpha_beta import alpha_beta
from apps.engine.ai.move_ordering import order_moves
from apps.engine.ai.opening_book import get_book_move
from apps.engine.ai.transposition import clear
from apps.engine.utils.constants import ENGINE_LEVEL_DEPTHS, ENGINE_RANDOM_MOVE_PROBABILITIES, MATE_SCORE


def select_engine_move(board: chess.Board, level: int) -> chess.Move | None:
    legal_moves = list(board.legal_moves)
    if not legal_moves:
        return None

    book_move = get_book_move(board)
    if book_move is not None and book_move in legal_moves:
        return book_move

    clear()

    random_chance = ENGINE_RANDOM_MOVE_PROBABILITIES.get(level, 0.0)
    if random_chance and random.random() < random_chance:
        return random.choice(legal_moves)

    depth = ENGINE_LEVEL_DEPTHS.get(level, 3)
    maximizing = board.turn == chess.WHITE
    best_move = None
    best_score = -MATE_SCORE if maximizing else MATE_SCORE
    alpha = -MATE_SCORE
    beta = MATE_SCORE

    for move in order_moves(board, legal_moves):
        board.push(move)
        score = alpha_beta(board, depth - 1, alpha, beta, not maximizing, level)
        board.pop()

        if maximizing:
            if score > best_score:
                best_score = score
                best_move = move
            alpha = max(alpha, best_score)
        else:
            if score < best_score:
                best_score = score
                best_move = move
            beta = min(beta, best_score)

        if beta <= alpha:
            break
