from dataclasses import dataclass

import chess


@dataclass(slots=True)
class TranspositionEntry:
	depth: int
	score: int
	best_move: chess.Move | None = None
	level: int = 0


_TRANSPOSITION_TABLE: dict[str, TranspositionEntry] = {}


def make_key(board: chess.Board, level: int = 0) -> str:
	return f'{board.fen()}|{level}'


def lookup(board: chess.Board, depth: int, level: int = 0) -> TranspositionEntry | None:
	entry = _TRANSPOSITION_TABLE.get(make_key(board, level))
	if entry is None or entry.depth < depth:
		return None
	return entry


def store(board: chess.Board, depth: int, score: int, best_move: chess.Move | None = None, level: int = 0) -> None:
	_TRANSPOSITION_TABLE[make_key(board, level)] = TranspositionEntry(
		depth=depth,
		score=score,
		best_move=best_move,
		level=level,
	)


def clear() -> None:
	_TRANSPOSITION_TABLE.clear()
