from django.db import models


class Author(models.Model):
    """
    Represents an author in the library.

    Attributes:
        first_name (str): The first name of the author.
        last_name (str): The last name of the author.
        citizenship (str): The author's country of citizenship.
        date_of_birth (date): The author's date of birth (optional).
        date_of_death (date): The author's date of death (optional).

    Methods:
        __str__(): Returns a string representation of the author in the format 'Last Name, First Name'.

    Meta:
        db_table: Specifies the table name in the database as 'authors'.
        indexes: Defines an index on the 'last_name' and 'first_name' fields for faster lookups.
    """
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    citizenship = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    date_of_death = models.DateField(null=True, blank=True)

    def __str__(self):
        return f'{self.last_name}, {self.first_name}'

    class Meta:
        db_table = 'authors'
        indexes = [
            models.Index(fields=['last_name', 'first_name']),
        ]
