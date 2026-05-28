import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

def generate_join_code():
    return uuid.uuid4().hex[:8].upper()

class Studio(models.Model):
    name = models.CharField(max_length=255)
    code_name = models.CharField(max_length=50, unique=True, null=True, blank=True)
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=True)
    join_code = models.CharField(max_length=20, unique=True, default=generate_join_code)
    owner = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, related_name='owned_studios')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code_name})"

class User(AbstractUser):
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.URLField(max_length=500, blank=True, null=True)
    is_public = models.BooleanField(default=True)
    google_sub = models.CharField(max_length=255, unique=True, null=True, blank=True)
    personal_workspace = models.OneToOneField(Studio, on_delete=models.SET_NULL, null=True, blank=True, related_name='workspace_owner')
    current_studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True, related_name='current_users')

    def __str__(self):
        return self.username

class StudioMembership(models.Model):
    ROLE_CHOICES = [
        ('STUDIO_ADMIN', 'Studio Admin'),
        ('PROJECT_LEAD', 'Project Lead'),
        ('DESIGNER', 'Designer'),
        ('WRITER', 'Writer'),
        ('REVIEWER', 'Reviewer'),
        ('CLIENT_VIEWER', 'Client Viewer'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships')
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='memberships')
    roles = models.JSONField(default=list) # List of role strings
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'studio')

    def __str__(self):
        return f"{self.user.username} in {self.studio.name}"

class JoinRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='join_requests')
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='join_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'studio')

class StudioInvite(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
    ]
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='invites')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invites')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'studio')
