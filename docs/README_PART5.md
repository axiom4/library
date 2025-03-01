# A full test application using Django and Angular (Part 5) - OpenAPI integration

Now, let's configure OpenAPI schema to integrate apps.

First, install the necessary packages:

```bash
pip install PyYAML uritemplate inflection markdown

Collecting PyYAML
  Using cached PyYAML-6.0.2-cp313-cp313-macosx_11_0_arm64.whl.metadata (2.1 kB)
Collecting uritemplate
  Using cached uritemplate-4.1.1-py2.py3-none-any.whl.metadata (2.9 kB)
Collecting inflection
  Using cached inflection-0.5.1-py2.py3-none-any.whl.metadata (1.7 kB)
Collecting markdown
  Using cached Markdown-3.7-py3-none-any.whl.metadata (7.0 kB)
Using cached PyYAML-6.0.2-cp313-cp313-macosx_11_0_arm64.whl (171 kB)
Using cached uritemplate-4.1.1-py2.py3-none-any.whl (10 kB)
Using cached inflection-0.5.1-py2.py3-none-any.whl (9.5 kB)
Using cached Markdown-3.7-py3-none-any.whl (106 kB)
Installing collected packages: uritemplate, PyYAML, markdown, inflection
Successfully installed PyYAML-6.0.2 inflection-0.5.1 markdown-3.7 uritemplate-4.1.1
```

Then, update `urls.py` in the main app directory (`testapp_rest`):

````python
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

Now, you can access the OpenAPI schema at the root of your API. This schema describes all available endpoints and data structures.

To export the schema in OpenAPI format, you can use the following command:

```bash
curl http://localhost:8000/?format=openapi > openapi.yaml
````

This command fetches the schema from the root URL (`/`) and saves it to a file named `openapi.yaml`. You can then use this file with tools like Swagger UI or Postman to explore and test your API.

You can also access the OpenAPI schema directly in your browser by navigating to the root URL of your API (e.g., `http://localhost:8000/`). The schema will be displayed in a human-readable format.

![OpenAPI View](/docs/images/part5_1.png)

## Securing the OpenAPI schema

To enhance security, you might want to restrict access to the OpenAPI schema to specific IP addresses or user groups. You can achieve this by creating a custom permission class.

First, create a file named `permissions.py` inside your main app directory (`testapp_rest`):

```python
from rest_framework import permissions
from django.conf import settings


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class AccessListPermission(permissions.BasePermission):
    """
    Allows access only to specific IP addresses.
    """

    def has_permission(self, request, view):
        allowed_ips = getattr(settings, 'ACCESS_LIST', [])
        ip_address = request.META.get('REMOTE_ADDR')
        return ip_address in allowed_ips
```

Then, update your `settings.py` file to include the `ACCESS_LIST` setting:

```python
ACCESS_LIST = ['127.0.0.1', '::1']  # Add the IP addresses that are allowed to access the schema
```

Finally, update `urls.py` to use the new permission class:

```python
from django.contrib import admin
from django.urls import include, path
from rest_framework import permissions
from rest_framework.schemas import get_schema_view
from .permissions import AccessListPermission  # Import the custom permission

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
  permission_classes=(AccessListPermission,),  # Use the custom permission
)

urlpatterns = [
  path('admin/', admin.site.urls),
  path('api-auth/', include('rest_framework.urls')),
  path("", schema_view, name="openapi-schema"),
] + schema_url_patterns
```

With these changes, only requests originating from the specified IP addresses will be able to access the OpenAPI schema.

![Access List schema protection](/docs/images/part5_2.png)
