from rest_framework import viewsets
from library.models.book import Book
from library.serializers.book_serializer import BookSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter


class BookViewSet(viewsets.ModelViewSet):
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
