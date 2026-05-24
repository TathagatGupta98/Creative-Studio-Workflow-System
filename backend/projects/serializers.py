from rest_framework import serializers
from .models import Project, Task, Tag, Comment, Attachment, Notification

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = [
            "id",
            "name"
        ]

class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source="author.username")

    class Meta:
        model = Comment
        fields = [
            "id",
            "task",
            "author",
            "author_username",
            "content",
            "created_at",
        ]
        read_only_fields = ["author"]

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = [
            "id",
            "task",
            "name",
            "url",
            "created_at",
        ]

class NotificationSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "user_username",
            "task",
            "message",
            "is_read",
            "created_at",
        ]
        read_only_fields = ["user", "task"]

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.ReadOnlyField(source="assigned_to.username")

    tags = serializers.SlugRelatedField(
        many=True, 
        slug_field='name', 
        queryset=Tag.objects.all()
    )

    comments = CommentSerializer(many=True, read_only=True)

    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "project",
            "title",
            "description",
            "assigned_to",
            "assigned_to_username",
            "status",
            "deadline",
            "created_at",
            "updated_at",
            "priority",
            "tags",
            "comments",
            "attachments",
            "notifications",
        ]


class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source="owner.username")
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "description",
            "studio",
            "owner",
            "status",
            "tasks",
            "created_at",
            "updated_at",
        ]
