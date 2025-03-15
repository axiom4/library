from django.db import models


class Author(models.Model):
    """
    Model representing an author.

    Attributes:
        first_name (CharField): The first name of the author.
        last_name (CharField): The last name of the author.
        citizenship (CharField): The citizenship of the author.
        date_of_birth (DateField): The birth date of the author. Can be null or blank.
        date_of_death (DateField): The death date of the author. Can be null or blank.

    Methods:
        __str__(): Returns a string representation of the author in the format 'last_name, first_name'.

    Meta:
        db_table (str): The name of the database table.
        indexes (list): A list of database indexes for the model.
        ordering (list): The default ordering for the model.
        verbose_name_plural (str): The plural name for the model.
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
        ordering = ['last_name', 'first_name']
        verbose_name_plural = 'Authors'
