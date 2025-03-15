# A full test application using Django and Angular (Part 9) - Angular Forms

Now, we need to update angular rest client to operate with new django backend. So, we run `npm run generate:api`command.

After generating the client, we see that the only interface that has changed is `Book`.

```typescript
export interface Book {
  readonly id?: number;
  title: string;
  author?: number | null;
  publication_date: string;
  readonly created_at?: string;
  readonly updated_at?: string;
}
```

The type of the `author` property was changed from `string` to `number` and the `author` object was never mapped. So, we need to modify the `library` Django rest application to export a new OpenAPI object.

## The Django rest `author` service

Let's we will create the serializer for the `author` model. Create a new file `serializers/author_serializers.py`

```python
# serializers/author_serializers.py

from rest_framework import serializers
from library.models import Author


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = [
            'id',
            'first_name',
            'last_name',
            'date_of_birth',
            'date_of_death'
        ]
```

Add new serializer into `__init__.py`:

```python
# serializers/__init__.py

from .author_serializer import AuthorSerializer
from .book_serializer import BookSerializer
```

Now we need to create `AuthorViewSet` class, so we create `views/author_view_set.py`:

```python
# views/author_view_set.py

from rest_framework import viewsets
from library.models import Author
from library.serializers import AuthorSerializer

class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
```

and add them into out `views/__init__.py`:

```python
# views/__init__.py

from .author_view_set import AuthorViewSet
from .book_view_set import BookViewSet
```

Finally, we add our `AuthorViewSet` into library router inside `urls.py` to export the new `authors` rest service.

```python
# library/urls.py

from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'books', views.BookViewSet)
router.register(r'authors', views.AuthorViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

Now we have the new `authors`rest service:

![authors service](/docs/images/part9_1.png)

We can display `authors` json data navigating into url: `http://localhost:8000/library/authors`:

![authors data](/docs/images/part9_2.png)

We can also see the new `Author` object inside the OpenAPI `yaml` schema:

```yaml
Author:
  type: object
  properties:
    id:
      type: integer
      readOnly: true
    first_name:
      type: string
      maxLength: 100
    last_name:
      type: string
      maxLength: 100
    date_of_birth:
      type: string
      format: date
      nullable: true
    date_of_death:
      type: string
      format: date
      nullable: true
  required:
    - first_name
    - last_name
```
