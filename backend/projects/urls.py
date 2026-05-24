from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet, 
    TaskViewSet, 
    CommentViewSet, 
    AttachmentViewSet, 
    NotificationViewSet
)

router = DefaultRouter()
router.register(r"tasks", TaskViewSet)
router.register(r"comments", CommentViewSet)
router.register(r"attachments", AttachmentViewSet)
router.register(r"notifications", NotificationViewSet)
router.register(r"", ProjectViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
