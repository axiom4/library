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

### Explanation of the `BookViewSet` Class:

The `BookViewSet` class is a `ModelViewSet` that provides a complete set of actions (`list`, `create`, `retrieve`, `update`, and `destroy`) for managing `Book` instances. Here's a breakdown of its components:

- **`queryset`**: Specifies the set of `Book` objects to be retrieved from the database. In this case, it retrieves all books using `Book.objects.all()`.

- **`serializer_class`**: Defines the serializer used to convert `Book` instances to and from JSON. The `BookSerializer` handles the serialization and deserialization logic.

- **`filter_backends`**: Lists the filtering backends applied to the view. Here, it includes:

  - `DjangoFilterBackend` for filtering based on specific fields.
  - Optionally, `OrderingFilter` for sorting results.
  - Optionally, `SearchFilter` for searching across fields.

- **`filterset_fields`**: Specifies the fields available for filtering. For example:

  - `?title=example` filters books with the exact title "example".
  - `?published_date=2023-01-01` filters books published on January 1, 2023.

- **`search_fields`**: Defines the fields that can be searched using the `SearchFilter`. For example:

  - `?search=python` searches for books with "python" in the title or author name.

- **`ordering_fields`**: Lists the fields available for sorting. For example:

  - `?ordering=title` sorts books by title in ascending order.
  - `?ordering=-published_date` sorts books by published date in descending order.

- **`ordering`**: Specifies the default ordering applied to the queryset if no `ordering` parameter is provided.

#### Full code of `BookViewSet`:

```python
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.viewsets import ModelViewSet
from myapp.models import Book
from myapp.serializers import BookSerializer

class BookViewSet(ModelViewSet):
    """
    BookViewSet is a viewset for managing Book objects in the library system.

    This viewset provides CRUD operations and supports filtering, searching,
    and ordering of Book objects.

    Attributes:
      queryset (QuerySet): The base queryset for retrieving all Book objects.
      serializer_class (Serializer): The serializer class used for serializing
        and deserializing Book objects.
      filter_backends (list): A list of filter backends used for filtering,
        searching, and ordering.
      filterset_fields (list): Fields that can be used for filtering the queryset.
        - 'title': Filter by the title of the book.
        - 'author': Filter by the author of the book.
        - 'publication_date': Filter by the publication date of the book.
      search_fields (list): Fields that can be used for searching.
        - 'title': Search by the title of the book.
        - 'author__name': Search by the name of the author.
      ordering_fields (list): Fields that can be used for ordering the results.
        - 'title': Order by the title of the book.
        - 'author': Order by the author of the book.
        - 'publication_date': Order by the publication date of the book.
      ordering (list): Default ordering for the queryset.
        - 'title': Results are ordered by the title of the book by default.
    """
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['title', 'author', 'publication_date']
    search_fields = ['title', 'author__name']
    ordering_fields = ['title', 'author', 'publication_date']
    ordering = ['title']
```

This setup provides a robust and flexible API for managing books, with support for filtering, searching, and sorting.
