from django.urls import path
from . import views

urlpatterns = [
    path("", views.parking_spots, name="parking_spots"),
    path("active/", views.active_spot, name="active_spot"),
    path("clear/", views.clear_active_spot, name="clear_active_spot"),
    path("<int:pk>/", views.parking_spot_detail, name="parking_spot_detail"),
]
