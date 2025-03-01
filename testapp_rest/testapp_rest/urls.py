from django.contrib import admin
from django.urls import include, path
from rest_framework import permissions
from rest_framework.schemas import get_schema_view

schema_url_patterns = [
    path('library/', include('library.urls')),
]

schema_view = get_schema_view(
    title="Test App API",
    description="Test description",
    version="1.0.0",
    urlconf='library.urls',
    patterns=schema_url_patterns,
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path(
        "",
        schema_view,
        name="openapi-schema",
    ),
] + schema_url_patterns
