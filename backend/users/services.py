from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils.text import slugify

from .models import Studio, StudioMembership

User = get_user_model()


def _build_unique_username(base_value):
    candidate = slugify(base_value or '') or 'google-user'
    max_length = User._meta.get_field('username').max_length
    candidate = candidate[:max_length]

    if not User.objects.filter(username=candidate).exists():
        return candidate

    suffix = 1
    while True:
        suffix_text = f'-{suffix}'
        trimmed_candidate = candidate[: max_length - len(suffix_text)]
        username = f'{trimmed_candidate}{suffix_text}'
        if not User.objects.filter(username=username).exists():
            return username
        suffix += 1


def ensure_user_workspace(user):
    if user.personal_workspace_id and user.current_studio_id:
        return user

    with transaction.atomic():
        workspace = user.personal_workspace

        if workspace is None:
            workspace = Studio.objects.create(
                name=f"{user.username}'s Workspace",
                code_name=f'{user.username}_workspace',
                is_public=False,
                owner=user,
            )
            user.personal_workspace = workspace

        if user.current_studio_id is None:
            user.current_studio = workspace

        user.save(update_fields=['personal_workspace', 'current_studio'])

        StudioMembership.objects.get_or_create(
            user=user,
            studio=workspace,
            defaults={'roles': ['STUDIO_ADMIN'], 'is_admin': True},
        )

    return user


def create_registered_user(validated_data):
    password = validated_data.pop('password')
    user = User.objects.create_user(password=password, **validated_data)
    ensure_user_workspace(user)
    return user


def upsert_google_user(google_profile):
    email = (google_profile.get('email') or '').strip().lower()
    google_sub = google_profile.get('sub')

    if not email or not google_sub:
        raise ValueError('Google profile must include an email and sub.')

    user = User.objects.filter(google_sub=google_sub).first()

    if user is None:
        user = User.objects.filter(email__iexact=email).first()

    if user is None:
        username = _build_unique_username(email.split('@')[0] or google_sub)
        user = User(
            username=username,
            email=email,
            first_name=google_profile.get('given_name', '') or '',
            last_name=google_profile.get('family_name', '') or '',
            google_sub=google_sub,
        )
        user.set_unusable_password()
        user.save()
    else:
        update_fields = []
        if not user.google_sub:
            user.google_sub = google_sub
            update_fields.append('google_sub')
        if email and user.email != email:
            user.email = email
            update_fields.append('email')
        if google_profile.get('given_name') and user.first_name != google_profile.get('given_name'):
            user.first_name = google_profile.get('given_name')
            update_fields.append('first_name')
        if google_profile.get('family_name') and user.last_name != google_profile.get('family_name'):
            user.last_name = google_profile.get('family_name')
            update_fields.append('last_name')
        if update_fields:
            user.save(update_fields=update_fields)

    ensure_user_workspace(user)
    return user