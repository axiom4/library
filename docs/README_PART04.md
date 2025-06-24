# A full test application using Django and Angular (Part 04) - Djago Rest framework

Now, let's create a new model for the book. We will create a new app called `library` and create a new model called `Book`.

Installing Django Rest Framework

```bash
# pip install djangorestframework django-filter django-cors-headers

Collecting djangorestframework
  Using cached djangorestframework-3.15.2-py3-none-any.whl.metadata (10 kB)
Collecting django-filter
  Using cached django_filter-25.1-py3-none-any.whl.metadata (5.1 kB)
Collecting django-cors-headers
  Using cached django_cors_headers-4.7.0-py3-none-any.whl.metadata (16 kB)
Requirement already satisfied: django>=4.2 in ./venv/lib/python3.13/site-packages (from djangorestframework) (5.1.6)
Requirement already satisfied: asgiref>=3.6 in ./venv/lib/python3.13/site-packages (from django-cors-headers) (3.8.1)
Requirement already satisfied: sqlparse>=0.3.1 in ./venv/lib/python3.13/site-packages (from django>=4.2->djangorestframework) (0.5.3)
Using cached djangorestframework-3.15.2-py3-none-any.whl (1.1 MB)
Using cached django_filter-25.1-py3-none-any.whl (94 kB)
Using cached django_cors_headers-4.7.0-py3-none-any.whl (12 kB)
Installing collected packages: djangorestframework, django-filter, django-cors-headers
Successfully installed django-cors-headers-4.7.0 django-filter-25.1 djangorestframework-3.15.2
```

Let's create our test application "`library`"

```bash
# ./manage.py startapp library
```

Modify django `settings.py` to enable `library`. We need update `INSTALLED_APPS` adding all dependencies:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    ...
    'rest_framework',
    'django_filters',
    'corsheaders',
    'library'
]
```

To enable `django-cors-headers` we need update `MIDDLEWARE` section adding `"corsheaders.middleware.CorsMiddleware"` before `"django.middleware.common.CommonMiddleware"`:

```python
MIDDLEWARE = [
    ...,
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    ...,
]
```

and add the following lines at the end of the file

```python
CORS_ORIGIN_ALLOW_ALL = False

CORS_ORIGIN_WHITELIST = (
  'http://localhost:8000',
  'http://localhost:4200',
)
```

## Create a new book model

To create new model we need edting `library/models.py` to add new class "`Book`"

```python
from django.db import models


class Book(models.Model):
    """
    Book model representing a book in the library.

    Attributes:
        title (CharField): The title of the book, with a maximum length of 100 characters.
        author (CharField): The author of the book, with a maximum length of 100 characters.
        publication_date (DateField): The publication date of the book.
        created_at (DateTimeField): The date and time when the book record was created.
        updated_at (DateTimeField): The date and time when the book record was last updated.

    Methods:
        __str__(): Returns the string representation of the book, which is its title.

    Meta:
        db_table (str): The name of the database table to use for this model ('books').
        indexes (list): A list of database indexes to create for this model, indexing the 'title' and 'author' fields.
    """

    title = models.CharField(max_length=100)
    author = models.CharField(max_length=100, null=True)
    publication_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'books'
        indexes = [
            models.Index(fields=['title', 'author']),
        ]
```

We will manage the Book model data through the BookAdmin class, let's create it.

```python
from django.contrib import admin

from django.contrib import admin
from .models import Book


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    """
    BookAdmin is a custom admin class for the Book model in the Django admin interface.

    Attributes:
        list_display (tuple): Specifies the fields to be displayed in the list view of the admin interface.
        search_fields (tuple): Specifies the fields to be searched in the admin interface.
        list_filter (tuple): Specifies the fields to be used for filtering in the admin interface.
    """
    list_display = ('title', 'author', 'publication_date',
                    'created_at', 'updated_at')
    search_fields = ('title', 'author')
    list_filter = ('author',)
```

To finish, use the commands `./manage.py makemigrations` and `./manage.py migrate` to synchronize the MySQL database schema and create the new `books` table.

### makemigrations

```bash
# ./manage.py makemigrations

Migrations for 'library':
  library/migrations/0001_initial.py
    + Create model Book
```

### migrate

```bash
# ./manage.py migrate

Operations to perform:
  Apply all migrations: admin, auth, contenttypes, library, sessions
Running migrations:
  Applying library.0001_initial... OK
```

Let's connect to our Django admin page and manage the new table.

![Books admin](/docs/images/part04_1.png)

We will add the following books:

| title                                | author                    | publication_date |
| ------------------------------------ | ------------------------- | ---------------- |
| Foundation                           | Isaac Asimov              | 1951-01-01       |
| The Lord of the Rings                | John Ronald Reuel Tolkien | 1954-07-29       |
| The Hitchhiker's Guide to the Galaxy | Douglas Adams             | 1979-10-12       |
| The Hobbit                           | John Ronald Reuel Tolkien | 1937-09-21       |
| Pinocchio                            | Carlo Collodi             | 1883-01-01       |
| Crime and Punishment                 | Fyodor Dostoevsky         | 1866-01-01       |
| The Idiot                            | Fyodor Dostoevsky         | 1868-01-01       |

![Books admin](/docs/images/part04_2.png)

To create a serializer for the Book model, you'll need to create a `serializers.py` file inside the `library` app directory. This file will define the serializer class that handles the conversion of Book model instances to JSON format and vice versa.

First, create a `serializers.py` file in the `library` directory, then, add the following code:

```python
from rest_framework import serializers
from .models import Book


class BookSerializer(serializers.ModelSerializer):
    """
        Serializer for the Book model.

        Serializes Book objects into JSON and deserializes JSON into Book objects.

        Attributes:
            Meta (class): A nested class that configures the serializer.
                model (Book): The Book model to serialize.
                fields (list): The fields of the Book model to include in the serialized representation.
    """
    class Meta:
        model = Book
        fields = ['id', 'title', 'author',
                  'publication_date', 'created_at', 'updated_at']
```

This code defines a `BookSerializer` class that inherits from `serializers.ModelSerializer`. The `Meta` class specifies the model to be serialized (`Book`) and the fields to include in the serialized output. It includes `id` field and all fields defined in the Book model.

Now that you have the serializer, you need to create a ViewSet to handle the API endpoints for the Book model. A ViewSet provides a set of actions (e.g., list, create, retrieve, update, destroy) for a model.

Create a `views.py` file inside the `library` app directory (if it doesn't already exist) and add the following code:

```python
from rest_framework import viewsets
from .models import Book
from .serializers import BookSerializer


class BookViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing book instances.

    This viewset provides `list`, `create`, `retrieve`, `update` and `destroy` actions for the Book model.

    Attributes:
      queryset (QuerySet): The set of Book instances to be retrieved.
      serializer_class (BookSerializer): The serializer class to be used for serializing and deserializing Book instances.
    """
    queryset = Book.objects.all()
    serializer_class = BookSerializer
```

This code defines a `BookViewSet` class that inherits from `viewsets.ModelViewSet`. It specifies the queryset (all Book objects ordered by title) and the serializer class (`BookSerializer`).

Next, you need to configure the URL patterns for the API endpoints. Create a `urls.py` file inside the `library` app directory and add the following code:

```python
from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'books', views.BookViewSet)

urlpatterns = [
  path('', include(router.urls)),
]
```

This code uses a `DefaultRouter` to automatically generate the URL patterns for the ViewSet. It registers the `BookViewSet` with the router, which will create URLs like `/books/` (for listing and creating books) and `/books/{pk}/` (for retrieving, updating, and deleting a specific book).

The `trailing_slash=False` argument in the `routers.DefaultRouter()` constructor is used to remove the trailing slash from the end of the URL patterns generated by the router.

By default, Django REST Framework's `DefaultRouter` generates URL patterns with a trailing slash. For example, the URL for listing books would be `/books/` instead of `/books`.

Setting `trailing_slash=False` removes this trailing slash, resulting in cleaner URLs that are often preferred in modern web development. For example, the URL for listing books would become `/books`.

### Publish the books service

Finally, include the `library` app's URLs in the main `urls.py` file of your Django project. Edit the main `urls.py` (e.g., `library/urls.py`) to include the library URLs:

```python
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
  path('admin/', admin.site.urls),
  path('library/', include('library.urls')),
  path('api-auth/', include('rest_framework.urls'))
]
```

This includes the URL patterns defined in `library/urls.py` under the `/api/` path. It also includes the default login and logout views for use with the browsable API.

Now, you can run your Django development server and access the API endpoints for the Book model. For example, you can go to `http://localhost:8000/library/books/` to see a list of all books in JSON format, or use the browsable API to interact with the endpoints.

![Books admin](/docs/images/part04_3.png)

### Api authetication

The `path('api-auth/', include('rest_framework.urls'))` line includes the default login and logout views for use with the browsable API provided by Django REST Framework. This is particularly useful during development as it allows you to easily authenticate and test your API endpoints directly from the browser.

By including `rest_framework.urls`, you automatically get the following URLs:

- `login/`: A login view that allows users to authenticate via the browsable API.
- `logout/`: A logout view that allows users to end their session via the browsable API.

These views use Django's authentication system, so you'll need to have users created in your Django project (e.g., via the admin interface) to be able to log in.
