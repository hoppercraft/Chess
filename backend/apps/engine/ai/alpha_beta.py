import chess

from apps.engine.ai.evaluation import evaluate_board
from apps.engine.ai.move_ordering import order_moves
from apps.engine.ai.transposition import lookup, store
from apps.engine.utils.constants import MATE_SCORE


def quiescence_search(board: chess.Board, alpha: int, beta: int) -> int:
	stand_pat = evaluate_board(board, 4)
	if stand_pat >= beta:
		return beta
	if stand_pat > alpha:
		alpha = stand_pat

	moves = [move for move in board.legal_moves if board.is_capture(move) or board.gives_check(move)]
	moves = order_moves(board, moves)

	for move in moves:
		board.push(move)
		score = -quiescence_search(board, -beta, -alpha)
		board.pop()

		if score >= beta:
			return beta
		if score > alpha:
			alpha = score

	return alpha


def alpha_beta(board: chess.Board, depth: int, alpha: int, beta: int, maximizing_player: bool, level: int) -> int:
	cached = lookup(board, depth, level)
	if cached is not None:
		return cached.score

	if depth == 0:
		score = quiescence_search(board, alpha, beta) if level == 4 else evaluate_board(board, level)
		store(board, depth, score, level=level)
		return score

	if board.is_checkmate():
		score = -MATE_SCORE if maximizing_player else MATE_SCORE
		store(board, depth, score, level=level)
		return score

	if board.is_stalemate() or board.is_insufficient_material() or board.is_seventyfive_moves() or board.is_fivefold_repetition():
		store(board, depth, 0, level=level)
		return 0

	moves = order_moves(board, list(board.legal_moves))

	if maximizing_player:
		best_score = -MATE_SCORE
		for move in moves:
			board.push(move)
			score = alpha_beta(board, depth - 1, alpha, beta, False, level)
			board.pop()
			best_score = max(best_score, score)
			alpha = max(alpha, score)
			if beta <= alpha:
				break
		store(board, depth, best_score, level=level)
		return best_score

	best_score = MATE_SCORE
	for move in moves:
		board.push(move)
		score = alpha_beta(board, depth - 1, alpha, beta, True, level)
		board.pop()
		best_score = min(best_score, score)
		beta = min(beta, score)
		if beta <= alpha:
			break

	store(board, depth, best_score, level=level)
	return best_score
