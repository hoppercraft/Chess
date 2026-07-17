import json

import chess
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from .models import OnlineGame


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope["url_route"]["kwargs"]["room_code"]
        self.room_group_name = f"game_{self.room_code}"
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close()
            return

        game = await self.get_or_create_game()
        self.color = await self.assign_player(game)

        if self.color is None:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        subprotocols = self.scope.get("subprotocols", [])
        accepted = subprotocols[0] if subprotocols else None
        await self.accept(subprotocol=accepted)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "game_state",
                "fen": game.fen,
                "status": game.status,
            },
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data.get("type") == "move":
            await self.handle_move(data)

    async def handle_move(self, data):
        game = await self.get_game()
        board = chess.Board(game.fen)

        turn_color = "white" if board.turn == chess.WHITE else "black"

        if turn_color != self.color:
            await self.send(
                text_data=json.dumps({
                    "type": "error",
                    "message": "Not your turn."
                })
            )
            return

        try:
            move = board.parse_uci(data["move"])

            if move not in board.legal_moves:
                raise ValueError()

            board.push(move)

        except (ValueError, chess.InvalidMoveError):
            await self.send(
                text_data=json.dumps({
                    "type": "error",
                    "message": "Illegal move."
                })
            )
            return

        await self.save_fen(game, board.fen())

        status = "active"
        winner = None

        if board.is_checkmate():
            status = "finished"
            winner = "white" if turn_color == "black" else "black"

        elif (
            board.is_stalemate()
            or board.is_insufficient_material()
        ):
            status = "finished"
            winner = "draw"

        if status == "finished":
            await self.finish_game(game, winner)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "game_state",
                "fen": board.fen(),
                "status": status,
                "winner": winner,
            },
        )

    async def game_state(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def get_or_create_game(self):
        game, _ = OnlineGame.objects.get_or_create(
            room_code=self.room_code
        )
        return game

    @database_sync_to_async
    def get_game(self):
        return OnlineGame.objects.get(
            room_code=self.room_code
        )

    @database_sync_to_async
    def assign_player(self, game):
        if game.white_player_id == self.user.id:
            return "white"

        if game.black_player_id == self.user.id:
            return "black"

        if game.white_player_id is None:
            game.white_player = self.user
            game.status = "waiting"
            game.save()
            return "white"

        if game.black_player_id is None:
            game.black_player = self.user
            game.status = "active"
            game.save()
            return "black"

        return None

    @database_sync_to_async
    def save_fen(self, game, fen):
        game.fen = fen
        game.save()

    @database_sync_to_async
    def finish_game(self, game, winner):
        game.status = "finished"
        game.winner = winner
        game.save()