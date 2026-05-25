from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Project, Task, Tag, Comment, Attachment, Notification

User = get_user_model()

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = [
            "id",
            "name"
        ]

class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source="author.username")
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "task",
            "author",
            "author_username",
            "content",
            "parent",
            "replies",
            "created_at",
        ]
        read_only_fields = ["author"]

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []

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

class ProjectMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
        ]

class TagListField(serializers.SlugRelatedField):
    def to_internal_value(self, data):
        if not isinstance(data, str):
            self.fail('invalid')

        name = data.strip()
        if not name:
            self.fail('invalid')

        tag, _ = Tag.objects.get_or_create(name=name)
        return tag

class TaskSerializer(serializers.ModelSerializer):
    assignees = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        required=True,
    )
    assignees_details = ProjectMemberSerializer(source="assignees", many=True, read_only=True)

    tags = TagListField(
        many=True,
        slug_field='name',
        queryset=Tag.objects.all(),
        required=False,
        allow_empty=True,
    )

    comments = serializers.SerializerMethodField()
    comments_count = serializers.IntegerField(source="comments.count", read_only=True)

    attachments = AttachmentSerializer(many=True, read_only=True)

    notifications = NotificationSerializer(many=True, read_only=True)

    def get_comments(self, obj):
        # Only return top-level comments; replies are nested within them
        top_level_comments = obj.comments.filter(parent__isnull=True)
        return CommentSerializer(top_level_comments, many=True).data

    def validate_assignees(self, value):
        if not value:
            raise serializers.ValidationError("At least one assignee is required.")
        return value

    class Meta:
        model = Task
        fields = [
            "id",
            "project",
            "title",
            "description",
            "assignees",
            "assignees_details",
            "status",
            "deadline",
            "created_at",
            "updated_at",
            "priority",
            "tags",
            "comments",
            "comments_count",
            "attachments",
            "notifications",
        ]


class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source="owner.username")
    tasks = TaskSerializer(many=True, read_only=True)
    members = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        required=False,
    )
    members_details = ProjectMemberSerializer(source="members", many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "description",
            "studio",
            "owner",
            "members",
            "members_details",
            "status",
            "tasks",
            "created_at",
            "updated_at",
        ]
