import chess

from .fen import create_board_from_fen, is_valid_fen, normalize_fen


def build_board(fen: str | None = None) -> chess.Board:
	return create_board_from_fen(fen)


def get_board_key(board: chess.Board) -> str:
	return board.fen()


def parse_uci_move(from_square: str, to_square: str, promotion: str | None = None) -> chess.Move:
	uci = f'{from_square}{to_square}'
	if promotion:
		uci += promotion.lower()[0]
	return chess.Move.from_uci(uci)


def is_legal_move(board: chess.Board, from_square: str, to_square: str, promotion: str | None = None) -> bool:
	move = parse_uci_move(from_square, to_square, promotion)
	return move in board.legal_moves


def apply_uci_move(board: chess.Board, from_square: str, to_square: str, promotion: str | None = None):
	move = parse_uci_move(from_square, to_square, promotion)
	if move not in board.legal_moves:
		return False, None

	board.push(move)
	return True, move


def validate_fen_and_move(fen: str, from_square: str, to_square: str, promotion: str | None = None):
	if not is_valid_fen(fen):
		return False, None, None

	board = build_board(normalize_fen(fen))
	success, move = apply_uci_move(board, from_square, to_square, promotion)
	if not success:
		return False, board, None

	return True, board, move
