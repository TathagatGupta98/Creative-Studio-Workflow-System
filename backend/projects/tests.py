from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Project, Task, Tag, Comment, Attachment, Notification
from users.models import Studio

User = get_user_model()

class ModelTests(TestCase):
    def setUp(self):
        # Create a Studio
        self.studio = Studio.objects.create(
            name="Alpha Studio",
            description="A test studio"
        )
        
        # Create a Studio Admin
        self.admin_user = User.objects.create_user(
            username="admin_user",
            password="password123",
            role="STUDIO_ADMIN",
            studio=self.studio
        )
        
        # Create a Designer
        self.designer = User.objects.create_user(
            username="designer_user",
            password="password123",
            role="DESIGNER",
            studio=self.studio
        )

    def test_studio_creation(self):
        self.assertEqual(self.studio.name, "Alpha Studio")
        self.assertEqual(self.studio.members.count(), 2)

    def test_user_roles(self):
        self.assertEqual(self.admin_user.role, "STUDIO_ADMIN")
        self.assertEqual(self.designer.role, "DESIGNER")
        self.assertEqual(self.admin_user.studio, self.studio)

    def test_project_creation(self):
        project = Project.objects.create(
            title="Campaign X",
            description="A big campaign",
            owner=self.admin_user,
            studio=self.studio
        )
        self.assertEqual(project.title, "Campaign X")
        self.assertEqual(project.studio, self.studio)
        self.assertEqual(self.admin_user.projects.count(), 1)

    def test_task_workflow(self):
        project = Project.objects.create(
            title="Campaign X",
            owner=self.admin_user,
            studio=self.studio
        )
        tag = Tag.objects.create(name="Urgent")
        
        task = Task.objects.create(
            project=project,
            title="Design Logo",
            status="DRAFT",
            priority="HIGH"
        )
        task.assignees.add(self.designer)
        task.tags.add(tag)
        
        self.assertEqual(task.status, "DRAFT")
        self.assertEqual(task.assignees.count(), 1)
        self.assertEqual(task.assignees.first(), self.designer)
        self.assertEqual(task.tags.count(), 1)
        
        # Update status
        task.status = "REVIEW"
        task.save()
        self.assertEqual(Task.objects.get(id=task.id).status, "REVIEW")

    def test_comments_and_attachments(self):
        project = Project.objects.create(title="P1", owner=self.admin_user, studio=self.studio)
        task = Task.objects.create(project=project, title="T1")
        task.assignees.add(self.admin_user)
        
        comment = Comment.objects.create(
            task=task,
            author=self.admin_user,
            content="Great start!"
        )
        attachment = Attachment.objects.create(
            task=task,
            name="logo.png",
            url="http://example.com/logo.png"
        )
        
        self.assertEqual(task.comments.count(), 1)
        self.assertEqual(task.attachments.count(), 1)
        self.assertEqual(comment.author, self.admin_user)

    def test_notifications(self):
        project = Project.objects.create(title="P1", owner=self.admin_user, studio=self.studio)
        task = Task.objects.create(project=project, title="T1")
        task.assignees.add(self.designer)
        
        notification = Notification.objects.create(
            user=self.designer,
            task=task,
            message="You have been assigned to T1"
        )
        
        self.assertEqual(self.designer.notifications.count(), 1)
        self.assertFalse(notification.is_read)

class StudioAPITests(APITestCase):
    def setUp(self):
        self.studio1 = Studio.objects.create(name="Studio 1")
        self.studio2 = Studio.objects.create(name="Studio 2")
        
        self.user1 = User.objects.create_user(username="u1", password="p1", studio=self.studio1)
        self.user2 = User.objects.create_user(username="u2", password="p2", studio=self.studio2)
        
        self.project1 = Project.objects.create(title="S1 Project", owner=self.user1, studio=self.studio1)
        self.project2 = Project.objects.create(title="S2 Project", owner=self.user2, studio=self.studio2)

    def test_studio_isolation_list(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get("/api/projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "S1 Project")

    def test_studio_isolation_create(self):
        self.client.force_authenticate(user=self.user2)
        response = self.client.post("/api/projects/", {"title": "New S2 Project"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        project = Project.objects.get(title="New S2 Project")
        self.assertEqual(project.studio, self.studio2)

class CommentThreadingTests(APITestCase):
    def setUp(self):
        self.studio = Studio.objects.create(name="Studio 1")
        self.user = User.objects.create_user(username="u1", password="p1", studio=self.studio)
        self.project = Project.objects.create(title="P1", owner=self.user, studio=self.studio)
        self.task = Task.objects.create(project=self.project, title="T1")
        self.client.force_authenticate(user=self.user)

    def test_threaded_comments(self):
        # Create a top-level comment
        response = self.client.post("/api/projects/comments/", {
            "task": self.task.id,
            "content": "Top level comment"
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        parent_id = response.data["id"]

        # Create a reply
        response = self.client.post("/api/projects/comments/", {
            "task": self.task.id,
            "content": "Reply to comment",
            "parent": parent_id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        reply_id = response.data["id"]
        self.assertEqual(response.data["parent"], parent_id)

        # Check task serializer
        response = self.client.get(f"/api/projects/tasks/{self.task.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should have 2 total comments but only 1 top-level comment in the 'comments' list
        self.assertEqual(response.data["comments_count"], 2)
        self.assertEqual(len(response.data["comments"]), 1)
        
        # The top-level comment should have 1 reply
        top_level_comment = response.data["comments"][0]
        self.assertEqual(top_level_comment["id"], parent_id)
        self.assertEqual(len(top_level_comment["replies"]), 1)
        self.assertEqual(top_level_comment["replies"][0]["id"], reply_id)

    def test_notification_on_reply(self):
        # Create another user to reply to
        other_user = User.objects.create_user(username="u2", password="p2", studio=self.studio)
        
        # u1 creates a comment
        comment = Comment.objects.create(task=self.task, author=self.user, content="Original")
        
        # u2 replies to u1's comment
        self.client.force_authenticate(user=other_user)
        self.client.post("/api/projects/comments/", {
            "task": self.task.id,
            "content": "Reply by u2",
            "parent": comment.id
        })
        
        # u1 should have a notification
        self.assertEqual(self.user.notifications.count(), 1)
        notification = self.user.notifications.first()
        self.assertIn("u2 replied to a comment", notification.message)
