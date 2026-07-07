from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers

from apps.games.models import User
from .models import Profile


# ---------------------------
# REGISTER SERIALIZER
# ---------------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label="Confirm password")

    class Meta:
        model = User
        fields = ("username", "email", "password", "password2")

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        validated_data["email"] = validated_data["email"].strip().lower()

        # Wrapped in a transaction so a Profile creation failure can't leave
        # behind an orphaned User with no profile (which would then also be
        # unable to register again, since the username/email are taken).
        with transaction.atomic():
            user = User.objects.create_user(**validated_data)

            Profile.objects.get_or_create(
                user=user,
                defaults={"display_name": user.username}
            )

        return user


# ---------------------------
# USER SERIALIZER (for /me, auth)
# ---------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "rating",
            "games_played",
            "games_won",
            "games_lost",
            "games_drawn",
            "created_at",
        )
        read_only_fields = fields


# ---------------------------
# PROFILE SERIALIZER
# ---------------------------
class ProfileSerializer(serializers.ModelSerializer):

    user = UserSerializer(read_only=True)

    # The single source of truth for rating is User.rating, which is what
    # actually gets updated by the Elo calculation after each game. Profile
    # has its own legacy `rating` column that isn't touched by game results,
    # so exposing that here would silently drift out of sync with reality.
    # We source this field from the related user instead, and keep it
    # read-only so a player can't set their own rating via profile update.
    rating = serializers.IntegerField(source="user.rating", read_only=True)

    win_rate = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = (
            "user",
            "display_name",
            "avatar_url",
            "rating",
            "bio",
            "win_rate",
        )

    def get_win_rate(self, obj):
        user = obj.user

        if user.games_played == 0:
            return 0.0

        return round((user.games_won / user.games_played) * 100, 2)