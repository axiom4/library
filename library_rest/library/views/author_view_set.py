# file: library_rest/library/views/author_view_set.py

from rest_framework import viewsets
from library.models import Author
from library.serializers import AuthorSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from library.pagination import LibraryPagination
from library_rest.decorators import keycloak_role_required


class AuthorViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Author instances.

    This viewset provides the following features:
    - Lists, retrieves, creates, updates, and deletes Author objects.
    - Supports filtering by 'first_name', 'last_name', and 'citizenship'.
    - Allows searching by 'first_name' and 'last_name'.
    - Supports ordering by 'first_name' and 'last_name', with default ordering by 'last_name' then 'first_name'.
    - Uses a custom pagination class (LibraryPagination).

    Attributes:
        queryset (QuerySet): The queryset of Author objects.
        serializer_class (Serializer): The serializer class for Author objects.
        filter_backends (list): The list of filter backends for filtering, ordering, and searching.
        search_fields (list): Fields to enable search functionality.
        ordering_fields (list): Fields that can be used for ordering results.
        ordering (list): Default ordering for the queryset.
        filterset_fields (list): Fields that can be used for filtering results.
        pagination_class (Pagination): The pagination class to use for paginating results.

    Methods:
        list(request, *args, **kwargs): Returns a paginated list of authors.
        retrieve(request, pk=None, *args, **kwargs): Retrieves a specific author by primary key (pk).
        create(request, *args, **kwargs): Creates a new author instance.
        update(request, pk=None, *args, **kwargs): Updates an existing author instance.
        destroy(request, pk=None, *args, **kwargs): Deletes an author instance by primary key (pk).
        partial_update(request, pk=None, *args, **kwargs): Partially updates an existing author instance.
    """

    queryset = Author.objects.all()
    serializer_class = AuthorSerializer

    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]

    search_fields = ['first_name', 'last_name']
    ordering_fields = ['first_name', 'last_name']
    ordering = ['last_name', 'first_name']
    filterset_fields = ['first_name', 'last_name', 'citizenship']
    pagination_class = LibraryPagination

    @keycloak_role_required("view-books")
    def list(self, request):
        """
        Lists all author instances.

        This method overrides the default `list` method to provide a custom implementation
        for listing author instances. It returns a paginated list of authors.

        Args:
            request: The HTTP request object.

        Returns:
            Response: A DRF Response object containing the serialized list of authors.
        """
        return super().list(request)

    @keycloak_role_required("view-books")
    def retrieve(self, request, pk=None):
        """
        Retrieves a specific author instance.

        This method overrides the default `retrieve` method to provide a custom implementation
        for retrieving an author instance by its primary key (pk).

        Args:
            request: The HTTP request object.
            pk: The primary key of the author instance to retrieve.

        Returns:
            Response: A DRF Response object containing the serialized author instance.
        """
        return super().retrieve(request, pk)

    @keycloak_role_required("create-author")
    def create(self, request):
        """
        Creates a new book instance.

        This method overrides the default `create` method to enforce that the requesting user
        has the "create-author" role via the `keycloak_role_required` decorator. If the user
        has the required role, it creates a new book; otherwise, access is denied.

        Args:
          request: The HTTP request object containing the book data.

        Returns:
          Response: A DRF Response object containing the serialized book details or an error message.
        """
        return super().create(request)

    @keycloak_role_required("create-author")
    def update(self, request, pk=None):
        """
        Updates an existing book instance.

        This method overrides the default `update` method to enforce that the requesting user
        has the "create-author" role via the `keycloak_role_required` decorator. If the user
        has the required role, it updates the specified book; otherwise, access is denied.

        Args:
          request: The HTTP request object containing the updated book data.
          pk: The primary key of the book instance to update.

        Returns:
          Response: A DRF Response object containing the serialized book details or an error message.
        """
        return super().update(request, pk)

    @keycloak_role_required("create-author")
    def destroy(self, request, pk=None):
        """
        Deletes a specific book instance by its primary key (pk).

        This method overrides the default `destroy` method to enforce that the requesting user
        has the "create-author" role via the `keycloak_role_required` decorator. If the user
        has the required role, it deletes the specified book; otherwise, access is denied.

        Args:
          request: The HTTP request object.
          pk: The primary key of the book instance to delete.

        Returns:
          Response: A DRF Response object indicating success or failure of the deletion.
        """
        return super().destroy(request, pk)

    @keycloak_role_required("create-author")
    def partial_update(self, request, pk=None):
        """
        Partially updates an existing book instance.

        This method overrides the default `partial_update` method to enforce that the requesting user
        has the "create-author" role via the `keycloak_role_required` decorator. If the user
        has the required role, it partially updates the specified book; otherwise, access is denied.

        Args:
          request: The HTTP request object containing the updated book data.
          pk: The primary key of the book instance to update.

        Returns:
          Response: A DRF Response object containing the serialized book details or an error message.
        """
        return super().partial_update(request, pk)
