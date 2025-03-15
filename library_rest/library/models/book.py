from django.db import models


class Book(models.Model):
    """
    Book model representing a book in the library.

    Attributes:
        title (CharField): The title of the book, with a maximum length of 100 characters.
        author (CharField): The author of the book, with a maximum length of 100 characters.
        publication_date (DateField): The publication date of the book.
        created_at (DateTimeField): The date and time when the book record was created.
        updated_at (DateTimeField): The date and time when the book record was last updated.

    Methods:
        __str__(): Returns the string representation of the book, which is its title.

    Meta:
        db_table (str): The name of the database table to use for this model ('books').
        indexes (list): A list of database indexes to create for this model, indexing the 'title' and 'author' fields.
    """

    title = models.CharField(max_length=100)
    author = models.CharField(max_length=100)
    publication_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'books'
        indexes = [
            models.Index(fields=['title', 'author']),
        ]
