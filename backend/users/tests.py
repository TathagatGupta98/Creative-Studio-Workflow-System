from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Studio, StudioMembership
from .services import ensure_user_workspace

User = get_user_model()

class UserAccountTests(TestCase):
    def setUp(self):
        self.studio = Studio.objects.create(name="Test Studio", code_name="test_studio")

    def test_create_user_with_membership(self):
        user = User.objects.create_user(
            username="projectlead",
            password="password123",
        )
        # Add to studio
        membership = StudioMembership.objects.create(
            user=user,
            studio=self.studio,
            roles=["PROJECT_LEAD"]
        )
        user.current_studio = self.studio
        user.save()
        
        # Verify membership
        self.assertEqual(user.memberships.count(), 1)
        self.assertEqual(user.current_studio, self.studio)
        self.assertIn("PROJECT_LEAD", user.memberships.first().roles)
        self.assertEqual(str(user), "projectlead")

    def test_ensure_user_workspace(self):
        user = User.objects.create_user(
            username="testuser",
            password="password123"
        )
        # ensure_user_workspace should create personal workspace and set current_studio
        ensure_user_workspace(user)
        self.assertIsNotNone(user.personal_workspace)
        self.assertEqual(user.current_studio, user.personal_workspace)
        self.assertEqual(user.memberships.count(), 1)
        membership = user.memberships.first()
        self.assertEqual(membership.studio, user.personal_workspace)
        self.assertIn("STUDIO_ADMIN", membership.roles)

    def test_superuser_creation(self):
        admin = User.objects.create_superuser(
            username="admin",
            password="password123",
            email="admin@example.com"
        )
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_staff)
