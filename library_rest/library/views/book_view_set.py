# file: library_rest/library/views/book_view_set.py

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
    - Access to endpoints is restricted by Keycloak roles.

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
      retrieve(request, pk=None, *args, **kwargs): Retrieves a book by pk, restricted by 'view-books' role.
      create(request, *args, **kwargs): Creates a new book, restricted by 'create-book' role.
      update(request, pk=None, *args, **kwargs): Updates a book, restricted by 'create-book' role.
      destroy(request, pk=None, *args, **kwargs): Deletes a book, restricted by 'create-book' role.
      partial_update(request, pk=None, *args, **kwargs): Partially updates a book, restricted by 'create-book' role.
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

        Returns:
          Response: A DRF Response object containing the serialized list of books or an error message.
        """
        return super().list(request)

    @keycloak_role_required("view-books")
    def retrieve(self, request, pk=None):
        """
        Retrieves a specific book instance by its primary key (pk).

        This method overrides the default `retrieve` method to enforce that the requesting user
        has the "view-books" role via the `keycloak_role_required` decorator. If the user
        has the required role, it returns the details of the specified book; otherwise, access is denied.

        Args:
          request: The HTTP request object.
          pk: The primary key of the book instance to retrieve.

        Returns:
          Response: A DRF Response object containing the serialized book details or an error message.
        """
        return super().retrieve(request, pk)

    @keycloak_role_required("create-book")
    def create(self, request):
        """
        Creates a new book instance.

        This method overrides the default `create` method to enforce that the requesting user
        has the "create-book" role via the `keycloak_role_required` decorator. If the user
        has the required role, it creates a new book; otherwise, access is denied.

        Args:
          request: The HTTP request object containing the book data.

        Returns:
          Response: A DRF Response object containing the serialized book details or an error message.
        """
        return super().create(request)

    @keycloak_role_required("create-book")
    def update(self, request, pk=None):
        """
        Updates an existing book instance.

        This method overrides the default `update` method to enforce that the requesting user
        has the "create-book" role via the `keycloak_role_required` decorator. If the user
        has the required role, it updates the specified book; otherwise, access is denied.

        Args:
          request: The HTTP request object containing the updated book data.
          pk: The primary key of the book instance to update.

        Returns:
          Response: A DRF Response object containing the serialized book details or an error message.
        """
        return super().update(request, pk)

    @keycloak_role_required("create-book")
    def destroy(self, request, pk=None):
        """
        Deletes a specific book instance by its primary key (pk).

        This method overrides the default `destroy` method to enforce that the requesting user
        has the "create-book" role via the `keycloak_role_required` decorator. If the user
        has the required role, it deletes the specified book; otherwise, access is denied.

        Args:
          request: The HTTP request object.
          pk: The primary key of the book instance to delete.

        Returns:
          Response: A DRF Response object indicating success or failure of the deletion.
        """
        return super().destroy(request, pk)

    @keycloak_role_required("create-book")
    def partial_update(self, request, pk=None):
        """
        Partially updates an existing book instance.

        This method overrides the default `partial_update` method to enforce that the requesting user
        has the "create-book" role via the `keycloak_role_required` decorator. If the user
        has the required role, it partially updates the specified book; otherwise, access is denied.

        Args:
          request: The HTTP request object containing the updated book data.
          pk: The primary key of the book instance to update.

        Returns:
          Response: A DRF Response object containing the serialized book details or an error message.
        """
        return super().partial_update(request, pk)
