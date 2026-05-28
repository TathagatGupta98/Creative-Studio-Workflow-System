from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Studio, StudioMembership, JoinRequest, StudioInvite
from .services import create_registered_user

User = get_user_model()

class StudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studio
        fields = ['id', 'name', 'code_name', 'description', 'is_public', 'join_code', 'owner']
        read_only_fields = ['join_code', 'owner']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'is_public']

    def create(self, validated_data):
        return create_registered_user(validated_data)

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_public']

class StudioMembershipSerializer(serializers.ModelSerializer):
    studio_details = StudioSerializer(source='studio', read_only=True)
    
    class Meta:
        model = StudioMembership
        fields = ['id', 'studio', 'studio_details', 'roles', 'is_admin']

class UserSerializer(serializers.ModelSerializer):
    current_studio_details = StudioSerializer(source='current_studio', read_only=True)
    personal_workspace_details = StudioSerializer(source='personal_workspace', read_only=True)
    memberships = StudioMembershipSerializer(many=True, read_only=True)
    
    # We will compute role for the frontend to maintain some compatibility
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'bio', 'profile_picture', 'is_public', 'current_studio', 'current_studio_details', 'personal_workspace', 'personal_workspace_details', 'memberships', 'role']
        
    def validate_current_studio(self, value):
        # Ensure user can only switch to a studio they are a member of or their personal workspace
        user = self.context['request'].user
        if value and value != user.personal_workspace and not value.memberships.filter(user=user).exists():
            raise serializers.ValidationError("You are not a member of this studio.")
        return value
        
    def get_role(self, obj):
        if obj.current_studio:
            membership = obj.memberships.filter(studio=obj.current_studio).first()
            if membership and membership.roles:
                return membership.roles[0] # Return the first role to maintain frontend compatibility
        return 'DESIGNER'

class JoinRequestSerializer(serializers.ModelSerializer):
    user_details = UserListSerializer(source='user', read_only=True)
    studio_details = StudioSerializer(source='studio', read_only=True)

    class Meta:
        model = JoinRequest
        fields = ['id', 'user', 'user_details', 'studio', 'studio_details', 'status', 'created_at']

class StudioInviteSerializer(serializers.ModelSerializer):
    user_details = UserListSerializer(source='user', read_only=True)
    studio_details = StudioSerializer(source='studio', read_only=True)

    class Meta:
        model = StudioInvite
        fields = ['id', 'user', 'user_details', 'studio', 'studio_details', 'status', 'created_at']
