from rest_framework import viewsets
from library.models.book import Book
from library.serializers.book_serializer import BookSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from library.pagination import LibraryPagination
from library_rest.decorators import keycloak_role_required


class BookViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Book instances.

    This viewset provides the following features:
    - List, retrieve, create, update, and delete operations for Book objects.
    - Filtering by 'title', 'author', and 'publication_date'.
    - Searching by 'title', 'author__last_name', and 'author__first_name'.
    - Ordering by 'title', 'author', and 'publication_date' (default ordering by 'title').
    - Pagination using the custom LibraryPagination class.
    - Access to the list endpoint is restricted to users with the 'view-books' Keycloak role.

    Attributes:
      queryset (QuerySet): The queryset of all Book objects.
      serializer_class (Serializer): The serializer class for Book objects.
      filter_backends (list): The list of filter backends for filtering, searching, and ordering.
      filterset_fields (list): Fields available for filtering.
      search_fields (list): Fields available for search.
      ordering_fields (list): Fields available for ordering.
      ordering (list): Default ordering.
      pagination_class (Pagination): The pagination class used for paginating results.

    Methods:
      list(request, *args, **kwargs): Returns a paginated list of books, restricted by 'view-books' role.
    """

    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['title', 'author', 'publication_date']
    search_fields = ['title', 'author__last_name', 'author__first_name']
    ordering_fields = ['title', 'author', 'publication_date']
    ordering = ['title']
    pagination_class = LibraryPagination

    @keycloak_role_required("view-books")
    def list(self, request):
        """
        Lists all book instances.

        This method overrides the default `list` method to enforce that the requesting user
        has the "view-books" role via the `keycloak_role_required` decorator. If the user
        has the required role, it returns a list of all books; otherwise, access is denied.

        Args:
          request: The HTTP request object.
          *args: Additional positional arguments.
          **kwargs: Additional keyword arguments.

        Returns:
          Response: A DRF Response object containing the serialized list of books or an error message.
        """
        return super().list(request)
