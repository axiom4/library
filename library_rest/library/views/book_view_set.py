from rest_framework import viewsets
from library.models.book import Book
from library.serializers.book_serializer import BookSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter


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
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['title', 'author', 'publication_date']
    search_fields = ['title']
    ordering_fields = ['title', 'author', 'publication_date']
    ordering = ['title']
