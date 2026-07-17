from rest_framework import serializers

from .models import Game


class GameSerializer(serializers.ModelSerializer):
    """Read-only representation of a saved game, used for history/detail views."""

    class Meta:
        model = Game
        fields = (
            'id', 'mode', 'result', 'termination', 'engine_level',
            'time_control_initial', 'time_control_increment',
            'moves', 'total_moves', 'created_at',
        )
        read_only_fields = fields


class SaveGameSerializer(serializers.ModelSerializer):
    """Write serializer used when a finished game is posted from the client."""

    class Meta:
        model = Game
        fields = (
            'mode', 'result', 'termination', 'engine_level',
            'time_control_initial', 'time_control_increment', 'moves',
        )

    def validate(self, data):
        if data.get('mode') == 'engine' and data.get('engine_level') is None:
            raise serializers.ValidationError({'engine_level': 'Required for engine games.'})
        return data
