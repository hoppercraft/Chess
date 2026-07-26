from rest_framework.test import APITestCase


class ValidateMoveTests(APITestCase):
	def test_validate_move_accepts_legal_move(self):
		response = self.client.post(
			'/api/engine/validate-move/',
			{
				'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
				'from': 'e2',
				'to': 'e4',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 200)
		self.assertTrue(response.data['legal'])
		self.assertIsInstance(response.data['new_fen'], str)

	def test_validate_move_rejects_illegal_move(self):
		response = self.client.post(
			'/api/engine/validate-move/',
			{
				'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
				'from': 'e2',
				'to': 'e5',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 200)
		self.assertFalse(response.data['legal'])
		self.assertIsNone(response.data['new_fen'])
