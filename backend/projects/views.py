from rest_framework import viewsets, permissions, mixins, filters
from .models import Project, Task, Comment, Attachment, Notification
from .serializers import ProjectSerializer, TaskSerializer, CommentSerializer, AttachmentSerializer, NotificationSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically assign the project to the user's studio
        serializer.save(owner=self.request.user, studio=self.request.user.studio)

    def get_queryset(self):
        # Users only see projects from their own studio
        if self.request.user.studio:
            return self.queryset.filter(studio=self.request.user.studio)
        return self.queryset.filter(owner=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    # /api/tasks/?search=design
    filter_backends = [filters.DjangoFilterBackend]
    search_fields = ['project', 'description']

    def get_queryset(self):
        # Users see tasks from projects in their studio
        if self.request.user.studio:
            return self.queryset.filter(project__studio=self.request.user.studio)
        return self.queryset.filter(project__owner=self.request.user)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        if self.request.user.studio:
            return self.queryset.filter(task__project__studio=self.request.user.studio)
        return self.queryset.filter(task__project__owner=self.request.user)


class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.studio:
            return self.queryset.filter(task__project__studio=self.request.user.studio)
        return self.queryset.filter(task__project__owner=self.request.user)


class NotificationViewSet(mixins.ListModelMixin, 
                          mixins.UpdateModelMixin, 
                          mixins.RetrieveModelMixin, 
                          viewsets.GenericViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users only see their own notifications
        return self.queryset.filter(user=self.request.user).order_by('-created_at')
