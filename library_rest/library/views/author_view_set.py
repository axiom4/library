from rest_framework import viewsets
from library.models import Author
from library.serializers import AuthorSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from library.pagination import LibraryPagination


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
    """

    queryset = Author.objects.all()
    serializer_class = AuthorSerializer

    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]

    search_fields = ['first_name', 'last_name']
    ordering_fields = ['first_name', 'last_name']
    ordering = ['last_name', 'first_name']
    filterset_fields = ['first_name', 'last_name', 'citizenship']
    pagination_class = LibraryPagination
