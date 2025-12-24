from django.urls import path
from . import views
from .contact import send_contact_message
from .password_reset import forgot_password, reset_password

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("refresh/", views.refresh_token, name="refresh"),
    path("profile/", views.profile, name="profile"),
    path("change-password/", views.change_password, name="change_password"),
    path("savings/", views.savings, name="savings"),
    path("contact/", send_contact_message, name="contact"),
    path("forgot-password/", forgot_password, name="forgot_password"),
    path("reset-password/", reset_password, name="reset_password"),
]
