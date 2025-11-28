from django.urls import path
from .views import ReferralMeView, ReferralApplyView

urlpatterns = [
    path("me/", ReferralMeView.as_view(), name="referral-me"),
    path("apply/", ReferralApplyView.as_view(), name="referral-apply"),
]

