from django.urls import path
from .views import VehicleListCreateView, VehicleLinkDongleView, TelematicsUploadView

urlpatterns = [
    path("", VehicleListCreateView.as_view(), name="vehicle-list-create"),
    path("<uuid:id>/link-dongle/", VehicleLinkDongleView.as_view(), name="vehicle-link-dongle"),
]

# Telematics URL pattern (matches OpenAPI spec: /telematics/{vehicleId})
telematics_urlpatterns = [
    path("<uuid:vehicleId>/", TelematicsUploadView.as_view(), name="telematics-upload"),
]

