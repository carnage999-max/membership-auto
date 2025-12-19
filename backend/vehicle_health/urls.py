from django.urls import path
from . import views

urlpatterns = [
    path("", views.vehicle_health_list, name="vehicle_health_list"),
    path(
        "<uuid:vehicle_id>/", views.vehicle_health_detail, name="vehicle_health_detail"
    ),
    path("alerts/", views.health_alerts, name="health_alerts"),
    path("alerts/<int:pk>/resolve/", views.resolve_alert, name="resolve_alert"),
    path("dtc/", views.dtc_codes, name="dtc_codes"),
    path("dtc/<int:pk>/clear/", views.clear_dtc, name="clear_dtc"),
    path(
        "recommendations/",
        views.maintenance_recommendations,
        name="maintenance_recommendations",
    ),
]
