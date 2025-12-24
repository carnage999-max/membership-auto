"""
URL configuration for membership_auto project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from vehicles.urls import telematics_urlpatterns

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls")),
    path("api/users/", include("users.urls")),
    path("api/vehicles/", include("vehicles.urls")),
    path(
        "api/telematics/", include(telematics_urlpatterns)
    ),  # For /telematics/{vehicleId}
    path("api/appointments/", include("appointments.urls")),
    path("api/offers/", include("offers.urls")),
    path("api/referrals/", include("referrals.urls")),
    path("api/chat/", include("chat.urls")),
    path("api/files/", include("files.urls")),
    path("api/services/", include("services.urls")),
    path("api/parking/", include("parking.urls")),
    path("api/vehicle-health/", include("vehicle_health.urls")),
    path("api/payments/", include("payments.urls")),
    # Admin API endpoints
    path("api/admin/", include("users.admin_urls")),
    path("api/admin/", include("settings.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]
