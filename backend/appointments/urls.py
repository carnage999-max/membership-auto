from django.urls import path
from .views import AppointmentAvailabilityView, AppointmentBookView, AppointmentListView

urlpatterns = [
    path("availability/", AppointmentAvailabilityView.as_view(), name="appointment-availability"),
    path("book/", AppointmentBookView.as_view(), name="appointment-book"),
    path("upcoming/", AppointmentListView.as_view(), name="appointment-list"),
]

