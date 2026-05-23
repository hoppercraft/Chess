from django.conf import settings
from django.db import models
import uuid


# Note: use Django's built-in user model for players: `django.contrib.auth.models.User`


class Game(models.Model):
	"""
	Core Game state anchored by a UUID. `current_fen` is the source of truth
	for the board position.
	"""
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='games')
	current_fen = models.CharField(max_length=100)
	status = models.CharField(max_length=32, default='active')
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return f"Game {self.id} ({self.player}) - {self.status}"


class Move(models.Model):
	"""
	Every move played in a game. Storing `fen_after_move` makes replay and
	analysis trivial without recomputing the whole move list.
	"""
	PLAYED_BY_CHOICES = [
		('human', 'Human'),
		('ai', 'AI'),
	]

	id = models.BigAutoField(primary_key=True)
	game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='moves')
	move_number = models.IntegerField()
	played_by = models.CharField(max_length=8, choices=PLAYED_BY_CHOICES)
	uci_move = models.CharField(max_length=10)
	fen_after_move = models.CharField(max_length=100)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = (('game', 'move_number'),)
		ordering = ['game', 'move_number']

	def __str__(self):
		return f"{self.game.id} #{self.move_number} {self.uci_move} by {self.played_by}"

