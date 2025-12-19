from django.urls import path
from .views import (
    AppointmentAvailabilityView,
    AppointmentBookView,
    AppointmentListView,
    AppointmentDetailView,
    LocationListView,
    LocationDetailView,
)

urlpatterns = [
    path(
        "availability/",
        AppointmentAvailabilityView.as_view(),
        name="appointment-availability",
    ),
    path("book/", AppointmentBookView.as_view(), name="appointment-book"),
    path("upcoming/", AppointmentListView.as_view(), name="appointment-list"),
    path(
        "<uuid:appointment_id>/",
        AppointmentDetailView.as_view(),
        name="appointment-detail",
    ),
    path("locations/", LocationListView.as_view(), name="location-list"),
    path(
        "locations/<uuid:location_id>/",
        LocationDetailView.as_view(),
        name="location-detail",
    ),
]
