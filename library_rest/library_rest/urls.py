from django.contrib import admin
from django.urls import include, path
from rest_framework import permissions
from rest_framework.schemas import get_schema_view

from .permissions import AccessListPermission
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

schema_url_patterns = [
    path('library/', include('library.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('schema', SpectacularAPIView().as_view(), name='schema'),
    path('',
         SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
] + schema_url_patterns
