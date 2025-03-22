# A full test application using Django and Angular (Part 10) - Advanced Django Filters

`django-filters` is a powerful library for Django that simplifies the process of filtering querysets based on user input. It provides a declarative way to define filters for your models and integrates seamlessly with Django views and forms.

### Key Features:

- **Declarative Syntax**: Define filters in a class-based manner, similar to Django forms.
- **Integration with Django Views**: Easily integrate with generic views like `ListView` or `APIView`.
- **Support for Complex Lookups**: Allows filtering using advanced lookups such as `icontains`, `gte`, `lte`, etc.
- **Custom Filters**: Create custom filter types for specific use cases.
- **Extensibility**: Combine with other Django REST Framework filters like `OrderingFilter` and `SearchFilter` for advanced functionality.

### Example Usage:

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

### Using `filterset_fields`:

Instead of defining a custom `FilterSet` class, you can use the `filterset_fields` property for simple filtering needs. This property allows you to specify the fields to filter directly in the view.

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

  - The `filterset_fields` property automatically generates filters for the specified fields.
  - By default, it uses exact matches for filtering. For example:
    - `?title=example` filters books with the exact title "example".
    - `?published_date=2023-01-01` filters books published on January 1, 2023.

- **Advanced Lookups**:
  - To enable advanced lookups (e.g., `icontains`, `gte`), you need to define a custom `FilterSet` class as shown earlier.

#### When to Use:

- Use `filterset_fields` for simple filtering needs where exact matches are sufficient.
- Use a custom `FilterSet` class for more complex filtering requirements, such as case-insensitive searches or range filters.

### Integration with ModelViewSet:

You can also integrate `django-filters` with a `ModelViewSet` for more complex APIs:

```python
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.viewsets import ModelViewSet
from myapp.models import Book
from myapp.filters import BookFilter
from myapp.serializers import BookSerializer

class BookViewSet(ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = BookFilter
```

This approach allows you to use the same filtering logic in a `ModelViewSet`, enabling both list and detail views with filtering capabilities.

### OrderingFilter and SearchFilter:

In addition to `django-filters`, Django REST Framework provides `OrderingFilter` and `SearchFilter` for sorting and searching querysets.

#### OrderingFilter:

`OrderingFilter` allows users to sort querysets based on specific fields. For example:

```python
from rest_framework.filters import OrderingFilter

class BookViewSet(ModelViewSet):
    # ...existing code...
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ['title', 'published_date']  # Fields available for ordering
    ordering = ['title']  # Default ordering
```

- **Usage**: Users can sort books by title or published date using query parameters like:
  - `?ordering=title` (ascending order by title)
  - `?ordering=-published_date` (descending order by published date)
- **Default Ordering**: The `ordering` attribute specifies the default sorting if no query parameter is provided.

#### SearchFilter:

`SearchFilter` enables users to perform simple searches across specified fields. For example:

```python
from rest_framework.filters import SearchFilter

class BookViewSet(ModelViewSet):
    # ...existing code...
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['title', 'author__name']  # Fields to search
```

- **Usage**: Users can search for books by title or author name using a query parameter like:
  - `?search=keyword`
- **Field Lookups**: Supports lookups like `icontains` for partial matches.

#### Combining Filters:

You can combine `DjangoFilterBackend`, `OrderingFilter`, and `SearchFilter` for a comprehensive filtering experience:

```python
from rest_framework.filters import OrderingFilter, SearchFilter

class BookViewSet(ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = BookFilter
    ordering_fields = ['title', 'published_date']
    ordering = ['title']
    search_fields = ['title', 'author__name']
```

- **Comprehensive Functionality**: This setup provides:
  - Filtering by specific fields (`django-filters`)
  - Sorting by multiple fields (`OrderingFilter`)
  - Searching across related fields (`SearchFilter`)
- **Example Query**:
  - `?search=python&ordering=-published_date` filters books with "python" in the title or author name and sorts them by published date in descending order.
