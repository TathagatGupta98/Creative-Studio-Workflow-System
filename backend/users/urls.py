from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MeView, RegisterView, UserListView, StudioViewSet, JoinRequestViewSet, StudioInviteViewSet, StudioMembershipViewSet

router = DefaultRouter()
router.register(r'studios', StudioViewSet)
router.register(r'join-requests', JoinRequestViewSet)
router.register(r'studio-invites', StudioInviteViewSet)
router.register(r'memberships', StudioMembershipViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("register/", RegisterView.as_view(), name="register"),
    path("list/", UserListView.as_view(), name="user-list"),
    path("me/", MeView.as_view(), name="me"),
]
