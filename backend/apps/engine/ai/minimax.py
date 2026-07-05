import random
import chess

MATE_SCORE = 100000

MATERIAL_VALUES = {
    chess.PAWN: 100,
    chess.KNIGHT: 320,
    chess.BISHOP: 330,
    chess.ROOK: 500,
    chess.QUEEN: 900,
    chess.KING: 0,
}

PAWN_PST = [
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5,  5, 10, 25, 25, 10,  5,  5,
    0,  0,  0, 20, 20,  0,  0,  0,
    5, -5,-10,  0,  0,-10, -5,  5,
    5, 10, 10,-20,-20, 10, 10,  5,
    0,  0,  0,  0,  0,  0,  0,  0,
]

KNIGHT_PST = [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
]

BISHOP_PST = [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
]

ROOK_PST = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0,
]

KING_PST_MG = [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
    20, 20,  0,  0,  0,  0, 20, 20,
    20, 30, 10,  0,  0, 10, 30, 20,
]

KING_PST_EG = [
    -50,-40,-30,-20,-20,-30,-40,-50,
    -30,-20,-10,  0,  0,-10,-20,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-30,  0,  0,  0,  0,-30,-30,
    -50,-30,-30,-30,-30,-30,-30,-50,
]

PST_TABLES = {
    chess.PAWN: PAWN_PST,
    chess.KNIGHT: KNIGHT_PST,
    chess.BISHOP: BISHOP_PST,
    chess.ROOK: ROOK_PST,
    chess.KING: KING_PST_MG,
}

def get_pst_value(piece_type: int, square: int, color: bool, endgame: bool) -> int:
    table = PST_TABLES.get(piece_type)
    if table is None:
        return 0
    if color == chess.WHITE:
        idx = chess.square_mirror(square)
    else:
        idx = square
    if piece_type == chess.KING and endgame:
        return KING_PST_EG[idx]
    return table[idx]

def is_endgame(piece_map: dict[int, chess.Piece]) -> bool:
    white_queen = False
    black_queen = False
    white_material = 0
    black_material = 0

    for piece in piece_map.values():
        if piece.piece_type == chess.QUEEN:
            if piece.color == chess.WHITE:
                white_queen = True
            else:
                black_queen = True
        elif piece.piece_type in (chess.ROOK, chess.BISHOP, chess.KNIGHT):
            if piece.color == chess.WHITE:
                white_material += MATERIAL_VALUES[piece.piece_type]
            else:
                black_material += MATERIAL_VALUES[piece.piece_type]

    if not white_queen and not black_queen:
        return True

    return (white_material + black_material) < 1300

def evaluate_board(board: chess.Board, level: int) -> int:
    if board.is_checkmate():
        return -MATE_SCORE if board.turn == chess.WHITE else MATE_SCORE
    if board.is_stalemate() or board.is_insufficient_material() or board.is_seventyfive_moves() or board.is_fivefold_repetition():
        return 0

    score = 0
    piece_map = board.piece_map()
    endgame = is_endgame(piece_map)

    for square, piece in piece_map.items():
        value = MATERIAL_VALUES[piece.piece_type]
        pst_bonus = 0
        if level >= 2:
            pst_bonus = get_pst_value(piece.piece_type, square, piece.color, endgame)
        if piece.color == chess.WHITE:
            score += value + pst_bonus
        else:
            score -= value + pst_bonus

    if level >= 3:
        for color in [chess.WHITE, chess.BLACK]:
            king_square = board.king(color)
            if king_square is not None:
                if not board.has_castling_rights(color):
                    king_file = chess.square_file(king_square)
                    if king_file in [3, 4]:
                        pawns_on_file = False
                        for rank in range(8):
                            sq = chess.square(king_file, rank)
                            p = board.piece_at(sq)
                            if p and p.piece_type == chess.PAWN and p.color == color:
                                pawns_on_file = True
                                break
                        if not pawns_on_file:
                            penalty = 50
                            if color == chess.WHITE:
                                score -= penalty
                            else:
                                score += penalty

    return score

def mvv_lva_score(board: chess.Board, move: chess.Move) -> int:
    victim = board.piece_at(move.to_square)
    if victim is None:
        return 0
    attacker = board.piece_at(move.from_square)
    if attacker is None:
        return 0
    victim_value = MATERIAL_VALUES[victim.piece_type]
    attacker_value = MATERIAL_VALUES[attacker.piece_type]
    return victim_value * 10 - attacker_value

def order_moves(board: chess.Board, moves: list) -> list:
    def move_score(move):
        if board.is_capture(move):
            return 10000 + mvv_lva_score(board, move)
        if board.gives_check(move):
            return 5000
        return 0
    return sorted(moves, key=move_score, reverse=True)

def quiescence_search(board: chess.Board, alpha: int, beta: int) -> int:
    stand_pat = evaluate_board(board, 4)
    if stand_pat >= beta:
        return beta
    if stand_pat > alpha:
        alpha = stand_pat

    moves = [m for m in board.legal_moves if board.is_capture(m) or board.gives_check(m)]
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
    if depth == 0:
        if level == 4:
            return quiescence_search(board, alpha, beta)
        return evaluate_board(board, level)

    if board.is_checkmate():
        return -MATE_SCORE if maximizing_player else MATE_SCORE
    if board.is_stalemate() or board.is_insufficient_material() or board.is_seventyfive_moves() or board.is_fivefold_repetition():
        return 0

    moves = order_moves(board, list(board.legal_moves))

    if maximizing_player:
        max_eval = -MATE_SCORE
        for move in moves:
            board.push(move)
            eval_score = alpha_beta(board, depth - 1, alpha, beta, False, level)
            board.pop()
            max_eval = max(max_eval, eval_score)
            alpha = max(alpha, eval_score)
            if beta <= alpha:
                break
        return max_eval
    else:
        min_eval = MATE_SCORE
        for move in moves:
            board.push(move)
            eval_score = alpha_beta(board, depth - 1, alpha, beta, True, level)
            board.pop()
            min_eval = min(min_eval, eval_score)
            beta = min(beta, eval_score)
            if beta <= alpha:
                break
        return min_eval

def select_engine_move(board: chess.Board, level: int) -> chess.Move:
    legal_moves = list(board.legal_moves)
    if not legal_moves:
        return None

    if level == 1:
        if random.random() < 0.35:
            return random.choice(legal_moves)
        depth = 1
    elif level == 2:
        if random.random() < 0.15:
            return random.choice(legal_moves)
        depth = 2
    elif level == 3:
        depth = 3
    else:
        depth = 4

    maximizing = board.turn == chess.WHITE
    best_move = None
    best_score = -MATE_SCORE if maximizing else MATE_SCORE
    alpha = -MATE_SCORE
    beta = MATE_SCORE

    moves = order_moves(board, legal_moves)

    for move in moves:
        board.push(move)
        if maximizing:
            score = alpha_beta(board, depth - 1, alpha, beta, False, level)
        else:
            score = alpha_beta(board, depth - 1, alpha, beta, True, level)
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

    return best_move if best_move else random.choice(legal_moves)