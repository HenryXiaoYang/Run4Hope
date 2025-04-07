from django.urls import path

from Run4Hope import views

urlpatterns = [
    path("", views.index, name="home"),
    path("index/", views.index, name="index"),
    path("add_runner/", views.add_runner, name="add_runner"),
    path("add_volunteer/", views.add_volunteer, name="add_volunteer"),
    path("delete_runner/<uuid:pk>/", views.delete_runner, name="delete_runner"),
    path("edit_runner/<uuid:pk>/", views.edit_runner, name="edit_runner"),
    path("delete_volunteer/<str:pk>/", views.delete_volunteer, name="delete_volunteer"),
    path("logout/", views.logout_view, name="logout"),
    path("increment_laps/<uuid:pk>/", views.increment_laps, name="increment_laps"),
    path("decrement_laps/<uuid:pk>/", views.decrement_laps, name="decrement_laps"),
    path("toggle_favorite/<uuid:pk>/", views.toggle_favorite, name="toggle_favorite"),
]
