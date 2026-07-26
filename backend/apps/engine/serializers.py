from rest_framework import serializers


class FenRequestSerializer(serializers.Serializer):
	fen = serializers.CharField()


class FenMoveRequestSerializer(serializers.Serializer):
	fen = serializers.CharField()
	from_square = serializers.CharField(source='from')
	to_square = serializers.CharField(source='to')
	promotion = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class BestMoveRequestSerializer(serializers.Serializer):
	fen = serializers.CharField()
	depth = serializers.IntegerField(required=False, default=3, min_value=1, max_value=4)
