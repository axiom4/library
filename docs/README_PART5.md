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

## Angular OpenAPI integrations

To integrate the OpenAPI schema into your Angular project, you can use tools like `@openapitools/openapi-generator-cli` to generate an Angular service from the schema.

First, install the `@openapitools/openapi-generator-cli` package:

```bash
npm install @openapitools/openapi-generator-cli --save-dev

added 81 packages, and audited 1018 packages in 9s

162 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

This command adds `@openapitools/openapi-generator-cli` to your `package.json` file as a dev dependency.

```json
  "devDependencies": {
    ...
    "@openapitools/openapi-generator-cli": "^2.17.0",
    ...
  },
```

Then, generate the Angular service update `package.json` with this script:

```json
  "scripts": {
    ...
    "generate:api": "openapi-generator-cli generate  -p supportsES6=true,withInterfaces=true,useSingleRequestParameter=true -i http://127.0.0.1:8000/?format=openapi -g typescript-angular -o src/app/modules/core/api/v1"
  },
```

Finaly we generate api angular typescript models, interfaces and services by running the command `npm run generate:api`:

```bash
npm run generate:api

> testapp-web@0.0.0 generate:api
> openapi-generator-cli generate  -p supportsES6=true,withInterfaces=true,useSingleRequestParameter=true -i http://127.0.0.1:8000/?format=openapi -g typescript-angular -o src/app/modules/core/api/v1

Download 7.12.0 ...
Downloaded 7.12.0
Did set selected version to 7.12.0
[main] INFO  o.o.codegen.DefaultGenerator - Generating with dryRun=false
[main] INFO  o.o.c.ignore.CodegenIgnoreProcessor - Output directory (/Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1) does not exist, or is inaccessible. No file (.openapi-generator-ignore) will be evaluated.
[main] INFO  o.o.codegen.DefaultGenerator - OpenAPI Generator: typescript-angular (client)
[main] INFO  o.o.codegen.DefaultGenerator - Generator 'typescript-angular' is considered stable.
[main] INFO  o.o.c.l.AbstractTypeScriptClientCodegen - Warning: Environment variable 'TS_POST_PROCESS_FILE' is set but file post-processing is not enabled. To enable file post-processing, 'enablePostProcessFile' must be set to `true` (--enable-post-process-file for CLI).
[main] INFO  o.o.c.l.TypeScriptAngularClientCodegen - generating code for Angular 19.0.0 ...
[main] INFO  o.o.c.l.TypeScriptAngularClientCodegen -   (you can select the angular version by setting the additionalProperties (--additional-properties in CLI) ngVersion)
[main] INFO  o.o.codegen.utils.URLPathUtils - 'host' (OAS 2.0) or 'servers' (OAS 3.0) not defined in the spec. Default to [http://localhost] for server URL [http://localhost/]
[main] INFO  o.o.codegen.utils.URLPathUtils - 'host' (OAS 2.0) or 'servers' (OAS 3.0) not defined in the spec. Default to [http://localhost] for server URL [http://localhost/]
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/model/./book.ts
[main] INFO  o.o.codegen.utils.URLPathUtils - 'host' (OAS 2.0) or 'servers' (OAS 3.0) not defined in the spec. Default to [http://localhost] for server URL [http://localhost/]
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/api/library.service.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/api/library.serviceInterface.ts
[main] INFO  o.o.codegen.utils.URLPathUtils - 'host' (OAS 2.0) or 'servers' (OAS 3.0) not defined in the spec. Default to [http://localhost] for server URL [http://localhost/]
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/model/models.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/api/api.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/index.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/api.module.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/configuration.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/api.base.service.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/variables.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/encoder.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/param.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/.gitignore
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/git_push.sh
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/README.md
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/.openapi-generator-ignore
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/.openapi-generator/VERSION
[main] INFO  o.o.codegen.TemplateManager - writing file /Users/rgiannetto/Developer/TestApp/testapp_web/src/app/modules/core/api/v1/.openapi-generator/FILES
################################################################################
# Thanks for using OpenAPI Generator.                                          #
# Please consider donation to help us maintain this project 🙏                 #
# https://opencollective.com/openapi_generator/donate                          #
################################################################################
```

This command GET to django server url `http://localhost:8000/?format=openapi`:

```python
[01/Mar/2025 22:04:58] "GET /?format=openapi HTTP/1.1" 200 5105
```

This command created the Angular modules in the `src/app/modules/core/api/v1` directory.

![Angular Services](/docs/images/part5_3.png)

Now, whenever the Django REST services change, you can simply update the Angular services by running the command `npm run generate:api`.
