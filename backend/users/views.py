from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from rest_framework import generics, viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    UserListSerializer, 
    StudioSerializer, 
    JoinRequestSerializer, 
    StudioInviteSerializer,
    StudioMembershipSerializer
)
from .models import Studio, JoinRequest, StudioMembership, StudioInvite
from .services import upsert_google_user
from projects.models import Notification

User = get_user_model()

class StudioViewSet(viewsets.ModelViewSet):
    queryset = Studio.objects.all()
    serializer_class = StudioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can see public studios or studios they are members of
        user = self.request.user
        return Studio.objects.filter(models.Q(is_public=True) | models.Q(memberships__user=user)).distinct()
        
    def perform_create(self, serializer):
        studio = serializer.save(owner=self.request.user)
        StudioMembership.objects.create(
            user=self.request.user,
            studio=studio,
            roles=['STUDIO_ADMIN'],
            is_admin=True
        )
        # Update user's current studio to the new one to prevent abrupt logout/refresh issues
        self.request.user.current_studio = studio
        self.request.user.save()

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        studio = self.get_object()
        
        # Prevent joining if already a member
        if studio.memberships.filter(user=request.user).exists() or studio.owner == request.user:
            return Response({"error": "You are already a member or owner of this studio."}, status=status.HTTP_400_BAD_REQUEST)

        code = request.data.get('join_code')
        
        if not studio.is_public and studio.join_code != code:
            return Response({"error": "Invalid join code for private studio."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create a join request
        jr, created = JoinRequest.objects.get_or_create(user=request.user, studio=studio)
        if not created:
            return Response({"message": "Join request already exists."}, status=status.HTTP_200_OK)
            
        # Notify studio owner and admins
        admins = User.objects.filter(models.Q(memberships__studio=studio, memberships__is_admin=True) | models.Q(id=studio.owner.id)).distinct()
        notifications = [
            Notification(user=admin, studio=studio, message=f"{request.user.username} requested to join '{studio.name}'.")
            for admin in admins
        ]
        Notification.objects.bulk_create(notifications)
            
        return Response({"message": "Join request submitted."}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def invite_user(self, request, pk=None):
        studio = self.get_object()
        # Only admins can invite
        if not studio.memberships.filter(user=request.user, is_admin=True).exists() and studio.owner != request.user:
            return Response({"error": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
            
        target_user_id = request.data.get('user_id')
        try:
            target_user = User.objects.get(id=target_user_id)
            if not target_user.is_public:
                return Response({"error": "This user has a private account and cannot be invited."}, status=status.HTTP_400_BAD_REQUEST)
                
            invite, created = StudioInvite.objects.get_or_create(user=target_user, studio=studio)
            if not created:
                 return Response({"message": "Invitation already sent."}, status=status.HTTP_200_OK)
                 
            # Notify user
            Notification.objects.create(
                user=target_user,
                studio=studio,
                message=f"Studio '{studio.name}' invited you to join."
            )
            return Response({"message": "Invitation sent."}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

class JoinRequestViewSet(viewsets.ModelViewSet):
    queryset = JoinRequest.objects.all()
    serializer_class = JoinRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admins can see requests for their studios, users can see their own requests
        return JoinRequest.objects.filter(
            models.Q(user=user) | 
            models.Q(studio__owner=user) | 
            models.Q(studio__memberships__user=user, studio__memberships__is_admin=True)
        ).distinct()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        jr = self.get_object()
        # Check if user is admin of the studio
        if not jr.studio.memberships.filter(user=request.user, is_admin=True).exists() and jr.studio.owner != request.user:
            return Response({"error": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
            
        jr.status = 'APPROVED'
        jr.save()
        
        roles = request.data.get('roles', ['DESIGNER'])
        is_admin = 'STUDIO_ADMIN' in roles
        
        StudioMembership.objects.create(
            user=jr.user,
            studio=jr.studio,
            roles=roles,
            is_admin=is_admin
        )
        return Response({"message": "Approved and added to studio."})
        
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        jr = self.get_object()
        if not jr.studio.memberships.filter(user=request.user, is_admin=True).exists() and jr.studio.owner != request.user:
            return Response({"error": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
            
        jr.status = 'REJECTED'
        jr.save()
        return Response({"message": "Request rejected."})

class StudioInviteViewSet(viewsets.ModelViewSet):
    queryset = StudioInvite.objects.all()
    serializer_class = StudioInviteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return StudioInvite.objects.filter(user=user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        invite = self.get_object()
        if invite.user != request.user:
             return Response({"error": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
             
        invite.status = 'ACCEPTED'
        invite.save()
        
        StudioMembership.objects.create(
            user=request.user,
            studio=invite.studio,
            roles=['DESIGNER']
        )
        return Response({"message": "Invitation accepted."})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        invite = self.get_object()
        if invite.user != request.user:
             return Response({"error": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
             
        invite.status = 'REJECTED'
        invite.save()
        return Response({"message": "Invitation rejected."})

class StudioMembershipViewSet(viewsets.ModelViewSet):
    queryset = StudioMembership.objects.all()
    serializer_class = StudioMembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admins can see memberships of their studio
        return StudioMembership.objects.filter(
            models.Q(studio__owner=user) | 
            models.Q(studio__memberships__user=user, studio__memberships__is_admin=True) |
            models.Q(user=user)
        ).distinct()

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Ensure only studio owner can kick/change other admins
        # Or admin can change roles of non-admins
        studio = instance.studio
        is_owner = studio.owner == request.user
        is_admin = studio.memberships.filter(user=request.user, is_admin=True).exists()
        
        if not (is_owner or is_admin):
            return Response({"error": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
            
        # Protect owner
        if instance.user == studio.owner:
             return Response({"error": "Cannot modify studio owner."}, status=status.HTTP_400_BAD_REQUEST)

        # Protect admins from other admins (only owner can touch admins)
        if instance.is_admin and not is_owner:
             return Response({"error": "Only studio owner can modify other admins."}, status=status.HTTP_403_FORBIDDEN)

        return super().partial_update(request, *args, **kwargs)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    authentication_classes = []


class GoogleAuthView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        id_token_value = request.data.get('id_token') or request.data.get('credential')
        if not id_token_value:
            return Response({'error': 'Missing Google ID token.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            google_profile = google_id_token.verify_oauth2_token(
                id_token_value,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError:
            return Response({'error': 'Invalid Google ID token.'}, status=status.HTTP_400_BAD_REQUEST)

        if not google_profile.get('email_verified'):
            return Response({'error': 'Google email is not verified.'}, status=status.HTTP_400_BAD_REQUEST)

        user = upsert_google_user(google_profile)
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user, context={'request': request}).data,
            },
            status=status.HTTP_200_OK,
        )

class UserListView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        query = self.request.query_params.get('query', '')
        
        if self.request.query_params.get('scope') == 'all':
            # Only return PUBLIC users when searching globally
            qs = User.objects.filter(is_public=True)
            if query:
                qs = qs.filter(username__icontains=query)
            return qs.order_by('username')
            
        if user.current_studio:
            return User.objects.filter(memberships__studio=user.current_studio).order_by('username')
        return User.objects.filter(id=user.id)

class MeView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
