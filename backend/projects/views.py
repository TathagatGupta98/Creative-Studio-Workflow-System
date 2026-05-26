from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, mixins, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project, Task, Comment, Attachment, Notification
from .filters import TaskFilter
from .serializers import ProjectSerializer, TaskSerializer, CommentSerializer, AttachmentSerializer, NotificationSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically assign the project to the user's studio
        project = serializer.save(owner=self.request.user, studio=self.request.user.studio)
        project.members.add(self.request.user)

    def get_queryset(self):
        # Users only see projects from their own studio
        user = self.request.user
        if user.studio:
            return self.queryset.filter(
                Q(studio=user.studio) | Q(owner=user) | Q(members=user)
            ).distinct()
        return self.queryset.filter(
            Q(owner=user) | Q(members=user)
        ).distinct()


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    # /api/tasks/?search=design&tag=branding
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = TaskFilter
    search_fields = ['title', 'description', 'project__title']

    def _create_assignment_notifications(self, task, assignees, actor):
        recipients = assignees.exclude(id=actor.id) if actor else assignees
        if not recipients.exists():
            return

        message = f'You were assigned to task "{task.title}".'
        notifications = [
            Notification(user=user, task=task, message=message)
            for user in recipients
        ]
        Notification.objects.bulk_create(notifications)

    def perform_create(self, serializer):
        task = serializer.save()
        self._create_assignment_notifications(task, task.assignees.all(), self.request.user)

    def perform_update(self, serializer):
        task = self.get_object()
        before_ids = set(task.assignees.values_list('id', flat=True))
        updated_task = serializer.save()
        after_ids = set(updated_task.assignees.values_list('id', flat=True))
        added_ids = after_ids - before_ids
        if added_ids:
            new_assignees = updated_task.assignees.filter(id__in=added_ids)
            self._create_assignment_notifications(updated_task, new_assignees, self.request.user)

    def get_queryset(self):
        # Users see tasks from projects in their studio
        user = self.request.user
        if user.studio:
            return self.queryset.filter(
                Q(project__studio=user.studio) | Q(project__owner=user) | Q(project__members=user)
            ).distinct()
        return self.queryset.filter(
            Q(project__owner=user) | Q(project__members=user)
        ).distinct()


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)
        task = comment.task
        
        # Get all people to notify: assignees + parent comment author
        recipient_ids = set(task.assignees.values_list('id', flat=True))
        if comment.parent:
            recipient_ids.add(comment.parent.author.id)
        
        # Exclude the person who made the comment
        recipient_ids.discard(self.request.user.id)
        
        if recipient_ids:
            message = f'New comment on "{task.title}" by {self.request.user.username}.'
            if comment.parent:
                message = f'{self.request.user.username} replied to a comment on "{task.title}".'
            
            from django.contrib.auth import get_user_model
            User = get_user_model()
            recipients = User.objects.filter(id__in=recipient_ids)
            
            notifications = [
                Notification(user=user, task=task, message=message)
                for user in recipients
            ]
            Notification.objects.bulk_create(notifications)

    def get_queryset(self):
        user = self.request.user
        if user.studio:
            return self.queryset.filter(
                Q(task__project__studio=user.studio)
                | Q(task__project__owner=user)
                | Q(task__project__members=user)
            ).distinct()
        return self.queryset.filter(
            Q(task__project__owner=user) | Q(task__project__members=user)
        ).distinct()


class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.studio:
            return self.queryset.filter(
                Q(task__project__studio=user.studio)
                | Q(task__project__owner=user)
                | Q(task__project__members=user)
            ).distinct()
        return self.queryset.filter(
            Q(task__project__owner=user) | Q(task__project__members=user)
        ).distinct()


class NotificationViewSet(mixins.ListModelMixin,
                          mixins.UpdateModelMixin,
                          mixins.RetrieveModelMixin,
                          mixins.DestroyModelMixin,
                          viewsets.GenericViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users only see their own notifications
        return self.queryset.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'all notifications marked as read'})
