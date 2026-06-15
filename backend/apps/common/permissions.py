from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """Allow access only if request.user owns the object (obj.user or obj.white_player)."""
    def has_object_permission(self, request, view, obj):
        owner = getattr(obj, 'user', None) or getattr(obj, 'white_player', None)
        return owner == request.user