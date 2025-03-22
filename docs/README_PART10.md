# A Full Test Application Using Django and Angular (Part 10) - Advanced Django Filters

This document provides a comprehensive guide to using advanced filtering techniques in Django applications with the help of the `django-filters` library. It also explains how to integrate filtering, searching, and ordering functionalities into Django REST Framework views and viewsets.

## Overview of `django-filters`

`django-filters` is a powerful library that simplifies the process of filtering querysets based on user input. It provides a declarative way to define filters for your models and integrates seamlessly with Django views and forms. This makes it an essential tool for building APIs with advanced filtering capabilities.

### Key Features:

- **Declarative Syntax**: Define filters in a class-based manner, similar to Django forms.
- **Integration with Django Views**: Easily integrate with generic views like `ListView` or `APIView`.
- **Support for Complex Lookups**: Allows filtering using advanced lookups such as `icontains`, `gte`, `lte`, etc.
- **Custom Filters**: Create custom filter types for specific use cases.
- **Extensibility**: Combine with other Django REST Framework filters like `OrderingFilter` and `SearchFilter` for advanced functionality.

---

## Example Usage of `django-filters`

Below is an example of how to use `django-filters` to filter a queryset of books based on their title and publication date.

```python
from django_filters import rest_framework as filters
from myapp.models import Book

class BookFilter(filters.FilterSet):
    title = filters.CharFilter(lookup_expr='icontains')  # Case-insensitive title search
    published_date = filters.DateFilter(lookup_expr='gte')  # Filter books published after a specific date

    class Meta:
        model = Book
        fields = ['title', 'published_date']
```

This filter can then be applied in a view:

```python
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.generics import ListAPIView
from myapp.models import Book
from myapp.filters import BookFilter

class BookListView(ListAPIView):
    queryset = Book.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_class = BookFilter
```

This setup allows users to filter books by title (case-insensitive) and published date (greater than or equal to a specific date).

---

## Using `filterset_fields`

For simpler use cases, you can use the `filterset_fields` property directly in your views or viewsets. This eliminates the need to define a custom `FilterSet` class.

#### Example:

```python
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.viewsets import ModelViewSet
from myapp.models import Book
from myapp.serializers import BookSerializer

class BookViewSet(ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['title', 'published_date']  # Fields to filter
```

- **How It Works**:

  - Automatically generates filters for the specified fields.
  - Uses exact matches by default (e.g., `?title=example`).

- **When to Use**:
  - Ideal for simple filtering needs.
  - For advanced lookups (e.g., `icontains`, `gte`), define a custom `FilterSet` class.

---

## OrderingFilter and SearchFilter

In addition to `django-filters`, Django REST Framework provides two powerful filters: `OrderingFilter` and `SearchFilter`. These filters allow you to add sorting and searching capabilities to your APIs.

### OrderingFilter

`OrderingFilter` enables users to sort querysets based on specific fields.

#### Example:

```python
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.viewsets import ModelViewSet
from myapp.models import Book
from myapp.serializers import BookSerializer

class BookViewSet(ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ['title', 'published_date']  # Fields available for ordering
    ordering = ['title']  # Default ordering
```

- **Usage**:
  - Users can sort books by title or published date using query parameters like:
    - `?ordering=title` (ascending order by title)
    - `?ordering=-published_date` (descending order by published date)
- **Default Ordering**:
  - The `ordering` attribute specifies the default sorting if no query parameter is provided.

---

### SearchFilter

`SearchFilter` allows users to perform simple searches across specified fields.

#### Example:

```python
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.viewsets import ModelViewSet
from myapp.models import Book
from myapp.serializers import BookSerializer

class BookViewSet(ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['title', 'author__name']  # Fields to search
```

- **Usage**:
  - Users can search for books by title or author name using a query parameter like:
    - `?search=python`
- **Field Lookups**:
  - Supports lookups like `icontains` for partial matches.

---

### Combining Filters, Ordering, and Search

You can combine `DjangoFilterBackend`, `OrderingFilter`, and `SearchFilter` to create a comprehensive API with advanced filtering, searching, and sorting capabilities.

#### Example Query:

- `?search=python&ordering=-published_date`:
  - Filters books with "python" in the title or author name.
  - Sorts results by publication date in descending order.

---

This document provides a detailed guide to implementing advanced filtering, searching, and ordering in Django applications. By leveraging `django-filters` and Django REST Framework's built-in filters, you can create powerful and flexible APIs tailored to your application's needs.

#### Example:

```python
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.viewsets import ModelViewSet
from myapp.models import Book
from myapp.serializers import BookSerializer

class BookViewSet(ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['title', 'author', 'publication_date']
    search_fields = ['title', 'author__name']
    ordering_fields = ['title', 'author', 'publication_date']
    ordering = ['title']
```

- **Comprehensive Functionality**:
  - Filtering by specific fields (`django-filters`).
  - Sorting by multiple fields (`OrderingFilter`).
  - Searching across related fields (`SearchFilter`).

#### Example Query:

- `?search=python&ordering=-published_date`:
  - Filters books with "python" in the title or author name.
  - Sorts results by publication date in descending order.

---

## Explanation of the `BookViewSet` Class

The `BookViewSet` class is a `ModelViewSet` that provides CRUD operations and additional functionalities such as filtering, searching, and ordering. Here's a breakdown of its components:

- **`queryset`**: Retrieves all `Book` objects from the database.
- **`serializer_class`**: Specifies the serializer for converting `Book` instances to and from JSON.
- **`filter_backends`**: Includes backends for filtering (`DjangoFilterBackend`), searching (`SearchFilter`), and ordering (`OrderingFilter`).
- **`filterset_fields`**: Defines fields available for filtering.
- **`search_fields`**: Specifies fields for search queries.
- **`ordering_fields`**: Lists fields available for sorting.
- **`ordering`**: Sets the default ordering.

![Filter View](/docs/images/part10_1.png)

#### Full Code of `BookViewSet`:

```python
from rest_framework import viewsets
from library.models.book import Book
from library.serializers.book_serializer import BookSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter


class BookViewSet(viewsets.ModelViewSet):
    """
    BookViewSet is a viewset for managing Book objects in the library application.

    This viewset provides CRUD operations and additional functionalities such as
    filtering, searching, and ordering.

    Attributes:
      queryset (QuerySet): A queryset containing all Book objects.
      serializer_class (Serializer): The serializer class used for serializing and
        deserializing Book objects.
      filter_backends (list): A list of filter backends used for filtering, searching,
        and ordering the queryset.
      filterset_fields (list): A list of fields that can be used for filtering the
        queryset.
      search_fields (list): A list of fields that can be used for performing search
        queries.
      ordering_fields (list): A list of fields that can be used for ordering the
        queryset.
      ordering (list): The default ordering applied to the queryset.
    """

    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['title', 'author', 'publication_date']
    search_fields = ['title', 'author__last_name', 'author__first_name']
    ordering_fields = ['title', 'author', 'publication_date']
    ordering = ['title']
```

![Filter Console](/docs/images/part10_2.png)

---

## Recreating OpenAPI client

Now we recreate OpenAPI client using `npm run generate:api`.
