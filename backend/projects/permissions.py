from rest_framework import permissions
from users.models import StudioMembership

class IsStudioAdminOrLead(permissions.BasePermission):
    """
    Grants write access (create/delete) only to:
    1. The studio owner.
    2. Members whose membership explicitly contains the STUDIO_ADMIN or PROJECT_LEAD roles.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        studio = request.user.current_studio
        if not studio:
            return False
            
        # Studio owner bypasses
        if studio.owner == request.user:
            return True
            
        membership = StudioMembership.objects.filter(user=request.user, studio=studio).first()
        if membership:
            return any(role in ['STUDIO_ADMIN', 'PROJECT_LEAD'] for role in membership.roles)
        return False


class HasStudioWriteAccess(permissions.BasePermission):
    """
    Grants write access (create/update/delete) to all membership roles EXCEPT CLIENT_VIEWER.
    Used for comments, attachments, and non-destructive task status updates.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        studio = request.user.current_studio
        if not studio:
            return False
            
        # Studio owner bypasses
        if studio.owner == request.user:
            return True
            
        membership = StudioMembership.objects.filter(user=request.user, studio=studio).first()
        if membership:
            # Client Viewers are strictly read-only
            return 'CLIENT_VIEWER' not in membership.roles
        return False
