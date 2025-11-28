from django.urls import path
from .views import FilePresignView

urlpatterns = [
    path("presign/", FilePresignView.as_view(), name="file-presign"),
]

