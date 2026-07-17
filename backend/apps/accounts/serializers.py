from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User, Profile


class RegisterSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True, validators=[validate_password])
	password2 = serializers.CharField(write_only=True, label='Confirm password')

	class Meta:
		model = User
		fields = ('username', 'email', 'password', 'password2')

	def validate(self, data):
		if data['password'] != data['password2']:
			raise serializers.ValidationError({'password': 'Passwords do not match.'})
		return data	

	def create(self, validated_data):
		validated_data.pop('password2')
		validated_data['email'] = validated_data['email'].strip().lower()

		user = User.objects.create_user(**validated_data)
		Profile.objects.get_or_create(user=user, defaults={'display_name': user.username})
		return user


class UserSerializer(serializers.ModelSerializer):
    games_played = serializers.IntegerField(source='profile.games_played', read_only=True)
    games_won = serializers.IntegerField(source='profile.games_won', read_only=True)
    games_lost = serializers.IntegerField(source='profile.games_lost', read_only=True)
    games_drawn = serializers.IntegerField(source='profile.games_drawn', read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'games_played',
            'games_won',
            'games_lost',
            'games_drawn',
            'created_at',
        )
        read_only_fields = fields