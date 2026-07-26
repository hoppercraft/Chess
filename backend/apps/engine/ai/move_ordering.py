import chess

from apps.engine.utils.constants import MATERIAL_VALUES


def mvv_lva_score(board: chess.Board, move: chess.Move) -> int:
	victim = board.piece_at(move.to_square)
	attacker = board.piece_at(move.from_square)
	if victim is None or attacker is None:
		return 0

	victim_value = MATERIAL_VALUES[victim.piece_type]
	attacker_value = MATERIAL_VALUES[attacker.piece_type]
	return victim_value * 10 - attacker_value


def order_moves(board: chess.Board, moves: list[chess.Move]) -> list[chess.Move]:
	def score(move: chess.Move) -> int:
		if board.is_capture(move):
			return 10000 + mvv_lva_score(board, move)
		if board.gives_check(move):
			return 5000
		return 0

	return sorted(moves, key=score, reverse=True)
