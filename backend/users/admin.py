from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Studio

@admin.register(Studio)
class StudioAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'role', 'studio', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'studio', 'bio', 'profile_picture')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'studio', 'bio', 'profile_picture')}),
    )

admin.site.register(User, CustomUserAdmin)
