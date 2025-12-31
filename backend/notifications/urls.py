from django.urls import path
from . import views

urlpatterns = [
    path("devices/register/", views.register_device, name="register_device"),
    path("devices/unregister/", views.unregister_device, name="unregister_device"),
    path("devices/", views.list_devices, name="list_devices"),
    path("history/", views.notification_history, name="notification_history"),
    path("test/", views.send_test_notification, name="send_test_notification"),
]
