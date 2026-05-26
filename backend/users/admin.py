from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Studio, StudioMembership, JoinRequest, StudioInvite

@admin.register(Studio)
class StudioAdmin(admin.ModelAdmin):
    list_display = ['name', 'code_name', 'owner', 'created_at']

@admin.register(StudioMembership)
class StudioMembershipAdmin(admin.ModelAdmin):
    list_display = ['user', 'studio', 'is_admin', 'created_at']

@admin.register(JoinRequest)
class JoinRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'studio', 'status', 'created_at']

@admin.register(StudioInvite)
class StudioInviteAdmin(admin.ModelAdmin):
    list_display = ['user', 'studio', 'status', 'created_at']

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'current_studio', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('current_studio', 'personal_workspace', 'is_public', 'bio', 'profile_picture')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('current_studio', 'personal_workspace', 'is_public', 'bio', 'profile_picture')}),
    )

admin.site.register(User, CustomUserAdmin)
