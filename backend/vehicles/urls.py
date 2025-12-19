from django.urls import path
from .views import (
    VehicleListCreateView,
    VehicleDetailView,
    VehicleLinkDongleView,
    TelematicsUploadView,
    FuelLogListCreateView,
    FuelLogDetailView,
)

urlpatterns = [
    path("", VehicleListCreateView.as_view(), name="vehicle-list-create"),
    path("<uuid:id>/", VehicleDetailView.as_view(), name="vehicle-detail"),
    path(
        "<uuid:id>/link-dongle/",
        VehicleLinkDongleView.as_view(),
        name="vehicle-link-dongle",
    ),
    path("fuel-logs/", FuelLogListCreateView.as_view(), name="fuel-log-list-create"),
    path("fuel-logs/<uuid:pk>/", FuelLogDetailView.as_view(), name="fuel-log-detail"),
]

# Telematics URL pattern (matches OpenAPI spec: /telematics/{vehicleId})
telematics_urlpatterns = [
    path("<uuid:vehicleId>/", TelematicsUploadView.as_view(), name="telematics-upload"),
]
