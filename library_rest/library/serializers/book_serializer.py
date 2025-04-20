from rest_framework import serializers

from library.models.book import Book
from library.serializers.author_serializer import AuthorSerializer
from library.models.author import Author


class BookSerializer(serializers.HyperlinkedModelSerializer):
    """
    BookSerializer is a HyperlinkedModelSerializer for the Book model.

    Fields:
        url (HyperlinkedIdentityField): URL for the book detail view.
        author_name (StringRelatedField): Name of the author, read-only.
        author_url (HyperlinkedRelatedField): URL for the author detail view, read-only.
        author (PrimaryKeyRelatedField): Primary key of the author, write-only, optional.
        year (SerializerMethodField): Year of publication, read-only.
        id (IntegerField): Primary key of the book.
        title (CharField): Title of the book.
        publication_date (DateField): Publication date of the book.
        created_at (DateTimeField): Timestamp when the book was created.
        updated_at (DateTimeField): Timestamp when the book was last updated.

    Methods:
        get_year(obj): Returns the year of the publication date.
    """

    url = serializers.HyperlinkedIdentityField(
        view_name='book-detail', read_only=True
    )

    author_name = serializers.StringRelatedField(
        source='author', read_only=True
    )

    author_url = serializers.HyperlinkedRelatedField(
        view_name='author-detail', read_only=True, source='author'
    )

    author = serializers.PrimaryKeyRelatedField(
        write_only=True, queryset=Author.objects.all()
    )

    year = serializers.SerializerMethodField(read_only=True)

    def get_year(self, obj) -> int:
        return obj.publication_date.year

    class Meta:
        model = Book
        fields = [
            'id',
            'url',
            'title',
            'author_name',
            'author_url',
            'author',
            'publication_date',
            'year',
            'created_at',
            'updated_at'
        ]
