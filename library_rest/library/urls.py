from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'books', views.BookViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
