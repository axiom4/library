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
