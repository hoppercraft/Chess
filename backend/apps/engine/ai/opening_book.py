import random

import chess


OPENING_BOOK = {
	chess.STARTING_FEN: ['e2e4', 'd2d4', 'c2c4', 'g1f3'],
	'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1': ['e7e5', 'c7c5', 'e7e6', 'c7c6'],
	'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2': ['c2c4', 'g1f3', 'e2e3'],
	'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1': ['c7c5', 'g8f6', 'e7e6'],
}


def get_book_move(board: chess.Board) -> chess.Move | None:
	moves = OPENING_BOOK.get(board.fen())
	if not moves:
		return None

	return chess.Move.from_uci(random.choice(moves))
