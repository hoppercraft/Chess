import chess

from .constants import DEFAULT_FEN


def normalize_fen(fen: str) -> str:
	return ' '.join(fen.split())


def is_valid_fen(fen: str) -> bool:
	try:
		chess.Board(normalize_fen(fen))
	except ValueError:
		return False
	return True


def create_board_from_fen(fen: str | None = None) -> chess.Board:
	if not fen:
		return chess.Board(DEFAULT_FEN)
	return chess.Board(normalize_fen(fen))


def board_to_fen(board: chess.Board) -> str:
	return board.fen()
