from django.db import models

from library.models.author import Author


class Book(models.Model):
    """
    Represents a book in the library.

    Attributes:
        title (str): The title of the book.
        author (Author): The author of the book.
        publication_date (date): The date the book was published.
        created_at (datetime): The date and time the book was created.
        updated_at (datetime): The date and time the book was last updated.

    Meta:
        db_table (str): The name of the database table for books.
        indexes (list): A list of indexes for the table, including one for the title field.
    """

    title = models.CharField(max_length=100)
    author = models.ForeignKey(
        Author,
        on_delete=models.CASCADE,
        related_name='books',
        null=True
    )
    publication_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title + '(' + str(self.publication_date.year) + ')'

    class Meta:
        db_table = 'books'
        indexes = [
            models.Index(fields=['title', 'author']),
        ]
