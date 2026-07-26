import chess

from apps.engine.utils.constants import (
	ENDGAME_MATERIAL_THRESHOLD,
	KING_PST_EG,
	MATERIAL_VALUES,
	MATE_SCORE,
	PST_TABLES,
)


def get_pst_value(piece_type: int, square: int, color: bool, endgame: bool) -> int:
	table = PST_TABLES.get(piece_type)
	if table is None:
		return 0

	idx = chess.square_mirror(square) if color == chess.WHITE else square
	if piece_type == chess.KING and endgame:
		return KING_PST_EG[idx]
	return table[idx]


def is_endgame(board: chess.Board) -> bool:
	white_queen = board.pieces(chess.QUEEN, chess.WHITE)
	black_queen = board.pieces(chess.QUEEN, chess.BLACK)
	if not white_queen and not black_queen:
		return True

	white_material = sum(
		len(board.pieces(piece_type, chess.WHITE)) * MATERIAL_VALUES[piece_type]
		for piece_type in (chess.ROOK, chess.BISHOP, chess.KNIGHT)
	)
	black_material = sum(
		len(board.pieces(piece_type, chess.BLACK)) * MATERIAL_VALUES[piece_type]
		for piece_type in (chess.ROOK, chess.BISHOP, chess.KNIGHT)
	)
	return (white_material + black_material) < ENDGAME_MATERIAL_THRESHOLD


def evaluate_board(board: chess.Board, level: int) -> int:
	if board.is_checkmate():
		return -MATE_SCORE if board.turn == chess.WHITE else MATE_SCORE

	if board.is_stalemate() or board.is_insufficient_material() or board.is_seventyfive_moves() or board.is_fivefold_repetition():
		return 0

	score = 0
	endgame = is_endgame(board)

	for square in chess.SQUARES:
		piece = board.piece_at(square)
		if piece is None:
			continue

		value = MATERIAL_VALUES[piece.piece_type]
		pst_bonus = get_pst_value(piece.piece_type, square, piece.color, endgame) if level >= 2 else 0

		if piece.color == chess.WHITE:
			score += value + pst_bonus
		else:
			score -= value + pst_bonus

	if level >= 3:
		for color in (chess.WHITE, chess.BLACK):
			king_square = board.king(color)
			if king_square is None or board.has_castling_rights(color):
				continue

			king_file = chess.square_file(king_square)
			if king_file not in (3, 4):
				continue

			has_pawn_cover = any(
				(piece := board.piece_at(chess.square(king_file, rank))) is not None
				and piece.piece_type == chess.PAWN
				and piece.color == color
				for rank in range(8)
			)

			if not has_pawn_cover:
				score += -50 if color == chess.WHITE else 50

	return score
