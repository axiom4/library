from rest_framework import serializers
from .models import Book


class BookSerializer(serializers.ModelSerializer):
    """
        Serializer for the Book model.

        Serializes Book objects into JSON and deserializes JSON into Book objects.

        Attributes:
            Meta (class): A nested class that configures the serializer.
                model (Book): The Book model to serialize.
                fields (list): The fields of the Book model to include in the serialized representation.
    """
    class Meta:
        model = Book
        fields = ['id', 'title', 'author',
                  'publication_date', 'created_at', 'updated_at']
