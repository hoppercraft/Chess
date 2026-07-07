from rest_framework import serializers
from .models import Game
from apps.games.models import User


# =========================
# SAVE GAME (frontend → backend)
# =========================
class SaveGameSerializer(serializers.ModelSerializer):

    # white_player is always the authenticated request user (set in the
    # view/service layer), never something the client gets to choose --
    # otherwise a client could attribute a saved game to any other account.
    white_player = serializers.PrimaryKeyRelatedField(read_only=True, required=False)

    class Meta:
        model = Game
        fields = (
            "white_player",
            "black_player",
            "winner",
            "mode",
            "status",
            "termination",
            "moves",
            "move_count",
            "initial_fen",
            "final_fen",
            "time_control",
            "increment",
            "white_time_remaining",
            "black_time_remaining",
        )

    def validate(self, data):
        if data.get("mode") == "ONLINE" and not data.get("black_player"):
            raise serializers.ValidationError("Online games require black player")

        if not data.get("moves"):
            raise serializers.ValidationError("Game must contain moves")

        return data


# =========================
# FULL GAME DETAIL (replay / view)
# =========================
class GameSerializer(serializers.ModelSerializer):

    white_player = serializers.StringRelatedField()
    black_player = serializers.StringRelatedField()
    winner = serializers.StringRelatedField()

    class Meta:
        model = Game
        fields = (
            "id",
            "white_player",
            "black_player",
            "winner",
            "mode",
            "status",
            "termination",
            "moves",
            "move_count",
            "initial_fen",
            "final_fen",
            "time_control",
            "increment",
            "white_time_remaining",
            "black_time_remaining",
            "created_at",
            "finished_at",
        )


# =========================
# GAME LIST (profile/history page)
# =========================
class GameListSerializer(serializers.ModelSerializer):

    opponent = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = (
            "id",
            "opponent",
            "mode",
            "status",
            "winner",
            "created_at",
        )

    def get_opponent(self, obj):
        request = self.context.get("request")

        if not request:
            return "Unknown"

        if obj.white_player == request.user:
            return obj.black_player.username if obj.black_player else "AI"

        return obj.white_player.username