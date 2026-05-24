from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Studio

User = get_user_model()

class UserAccountTests(TestCase):
    def setUp(self):
        self.studio = Studio.objects.create(name="Test Studio")

    def test_create_user_with_role(self):
        user = User.objects.create_user(
            username="projectlead",
            password="password123",
            role="PROJECT_LEAD",
            studio=self.studio
        )
        self.assertEqual(user.role, "PROJECT_LEAD")
        self.assertEqual(user.studio, self.studio)
        self.assertEqual(str(user), "projectlead (Project Lead) - Test Studio")

    def test_default_role(self):
        user = User.objects.create_user(
            username="defaultuser",
            password="password123"
        )
        # Default in model is DESIGNER
        self.assertEqual(user.role, "DESIGNER")
        self.assertEqual(str(user), "defaultuser (Designer) - No Studio")

    def test_superuser_creation(self):
        admin = User.objects.create_superuser(
            username="admin",
            password="password123",
            email="admin@example.com"
        )
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_staff)
