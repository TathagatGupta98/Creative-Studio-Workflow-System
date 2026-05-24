from django.contrib.auth.models import AbstractUser
from django.db import models

class Studio(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    ROLE_CHOICES = [
        ('STUDIO_ADMIN', 'Studio Admin'),
        ('PROJECT_LEAD', 'Project Lead'),
        ('DESIGNER', 'Designer'),
        ('WRITER', 'Writer'),
        ('REVIEWER', 'Reviewer'),
        ('CLIENT_VIEWER', 'Client Viewer'),
    ]
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='DESIGNER',
    )
    studio = models.ForeignKey(
        Studio, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='members'
    )
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()}) - {self.studio.name if self.studio else 'No Studio'}"
