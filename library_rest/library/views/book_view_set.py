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
    # filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    # filterset_fields = ['title', 'author', 'publication_date']
    # search_fields = ['title', 'author__last_name', 'author__first_name']
    # ordering_fields = ['title', 'author', 'publication_date']
    # ordering = ['title']
