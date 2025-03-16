from rest_framework import viewsets
from library.models import Author
from library.serializers import AuthorSerializer


class AuthorViewSet(viewsets.ModelViewSet):
    """
    AuthorViewSet is a viewset for handling CRUD operations on Author model.

    Attributes:
        queryset (QuerySet): A queryset containing all Author objects.
        serializer_class (Serializer): The serializer class used to serialize and deserialize Author objects.
    """
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
