from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Studio

User = get_user_model()

class StudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studio
        fields = ['id', 'name', 'description']

class UserSerializer(serializers.ModelSerializer):
    studio_details = StudioSerializer(source='studio', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'studio', 'studio_details', 'bio', 'profile_picture']