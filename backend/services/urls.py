from django.urls import path
from . import views

urlpatterns = [
    path("types/", views.service_types, name="service_types"),
    path("schedules/", views.service_schedules, name="service_schedules"),
    path(
        "schedules/<str:pk>/",
        views.service_schedule_detail,
        name="service_schedule_detail",
    ),
    path(
        "schedules/<str:pk>/complete/", views.complete_service, name="complete_service"
    ),
    path("recommendations/", views.recommendations, name="recommendations"),
]
