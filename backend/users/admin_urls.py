"""
Admin API URLs for Membership Auto Admin Dashboard
"""

from django.urls import path
from . import admin_views

urlpatterns = [
    # Authentication
    path("auth/login/", admin_views.admin_login, name="admin_login"),
    path("auth/verify/", admin_views.verify_admin_token, name="verify_admin_token"),
    # Analytics Dashboard
    path(
        "analytics/dashboard/",
        admin_views.dashboard_analytics,
        name="dashboard_analytics",
    ),
    path("analytics/revenue/", admin_views.revenue_analytics, name="revenue_analytics"),
    path("analytics/members/", admin_views.member_analytics, name="member_analytics"),
    # Member Management
    path("members/", admin_views.list_members, name="list_members"),
    path("members/<uuid:member_id>/", admin_views.member_detail, name="member_detail"),
    path(
        "members/<uuid:member_id>/subscription/",
        admin_views.update_subscription,
        name="update_subscription",
    ),
    path(
        "members/<uuid:member_id>/history/",
        admin_views.member_service_history,
        name="member_service_history",
    ),
    # Vehicle Management
    path("vehicles/", admin_views.list_vehicles, name="list_vehicles"),
    path(
        "vehicles/<uuid:vehicle_id>/", admin_views.vehicle_detail, name="vehicle_detail"
    ),
    path(
        "vehicles/<uuid:vehicle_id>/health/",
        admin_views.vehicle_health,
        name="vehicle_health",
    ),
    # Appointment Management
    path("appointments/", admin_views.list_appointments, name="list_appointments"),
    path(
        "appointments/<uuid:appointment_id>/",
        admin_views.appointment_detail,
        name="appointment_detail",
    ),
    path(
        "appointments/<uuid:appointment_id>/status/",
        admin_views.update_appointment_status,
        name="update_appointment_status",
    ),
    path(
        "appointments/<uuid:appointment_id>/assign/",
        admin_views.assign_appointment,
        name="assign_appointment",
    ),
    # Offers Management
    path("offers/", admin_views.list_offers, name="list_offers"),
    path("offers/create/", admin_views.create_offer, name="create_offer"),
    path("offers/<uuid:offer_id>/", admin_views.offer_detail, name="offer_detail"),
    path(
        "offers/<uuid:offer_id>/update/", admin_views.update_offer, name="update_offer"
    ),
    path(
        "offers/<uuid:offer_id>/delete/", admin_views.delete_offer, name="delete_offer"
    ),
    # Chat Management
    path("chat/threads/", admin_views.list_chat_threads, name="list_chat_threads"),
    path(
        "chat/threads/<uuid:thread_id>/",
        admin_views.chat_thread_detail,
        name="chat_thread_detail",
    ),
    path(
        "chat/threads/<uuid:thread_id>/assign/",
        admin_views.assign_chat_thread,
        name="assign_chat_thread",
    ),
    # Referral Management
    path("referrals/", admin_views.list_referrals, name="list_referrals"),
    path("referrals/stats/", admin_views.referral_stats, name="referral_stats"),
    # Location Management
    path("locations/", admin_views.list_locations, name="list_locations"),
    path(
        "locations/<uuid:location_id>/",
        admin_views.location_detail,
        name="location_detail",
    ),
    # Service Schedule Management
    path(
        "service-schedules/",
        admin_views.list_service_schedules,
        name="list_service_schedules",
    ),
    path(
        "service-schedules/<uuid:schedule_id>/",
        admin_views.service_schedule_detail,
        name="service_schedule_detail",
    ),
]
