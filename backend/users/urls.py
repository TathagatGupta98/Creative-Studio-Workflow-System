from django.urls import path
from .views import MeView, RegisterView, UserListView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("list/", UserListView.as_view(), name="user-list"),
    path("me/", MeView.as_view(), name="me"),
]
