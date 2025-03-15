# A full test application using Django and Angular (Part 8) - Upgrade Django Schema

In this section, we will upgrade our Django backend to organize the classes into different directories and create relational models.

## Code Refactoring

First, let's refactor our code by moving each class to a dedicated file. Within the `library` application, let's create the following directories:

```bash
library/admin
library/models
library/serializers
library/tests
library/views
```

For each directory, we move the reference python module; `admin.py` will be placed inside the `admin` directory, `models.py` inside `models`, etc. This is the result:

```bash
library

    admin
        admin.py

    models
        models.py

    serializers
        serializers.py

    views
        views.py
```

Now, we will rename the modules and update the code to manage the correct directory structure.

Let's rename `models.py` to `book.py`.

The `Book` model code, having no dependencies within our project, will not need modifications.

```python
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
```

Inside the `models` directory, let's create an `__init__.py` file with the following content:

```python
from .book import Book
```

The `__init__.py` file is used to make the `models` directory a Python package. It also imports the `Book` model, making it easily accessible from other parts of the application by importing the `models` package.

Now let's update our `admin.py` class as well, rename it to `book_admin.py`, update the imports:

```python
# book_admin.py

from django.contrib import admin

from django.contrib import admin
from library.models.book import Book


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    """
    BookAdmin is a custom admin class for the Book model in the Django admin interface.

    Attributes:
        list_display (tuple): Specifies the fields to be displayed in the list view of the admin interface.
        search_fields (tuple): Specifies the fields to be searched in the admin interface.
        list_filter (tuple): Specifies the fields to be used for filtering in the admin interface.
    """
    list_display = ('title', 'author', 'publication_date',
                    'created_at', 'updated_at')
    search_fields = ('title', 'author')
    list_filter = ('author',)
```

Create the `admin/__init__.py` file:

```python
# admin/__init__.py
from .book_admin import BookAdmin
```

Let's go to our Django administration page and verify that our code is working correctly.

Once we have completed our checks, let's reorganize the other classes.

Rename `serializers.py` in `serializers/book_serializer.py`. Update imports:

```python
# serializers/book_serializer.py

from rest_framework import serializers
from library.models.book import Book


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
```

Create `serializers/__init__.py`:

```python
# serializers/__init__.py

from .book_serializer import BookSerializer
```

Finally, let's perform the same refactoring on the `BookViewSet` class.

Rename `views.py` in `views/book_view_set.py`. Update imports:

```python
# views/book_view_set.py

from rest_framework import viewsets
from library.models.book import Book
from library.serializers.book_serializer import BookSerializer


class BookViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing book instances.

    This viewset provides `list`, `create`, `retrieve`, `update` and `destroy` actions for the Book model.

    Attributes:
      queryset (QuerySet): The set of Book instances to be retrieved.
      serializer_class (BookSerializer): The serializer class to be used for serializing and deserializing Book instances.
    """
    queryset = Book.objects.all()
    serializer_class = BookSerializer
```

Create `views/__init__.py`:

```python
# views/__init__.py

from .book_view_set import BookViewSet
```

This is the final result:

```bash
library
    __init__.py

    admin
        __init__.py
        book_admin.py

    apps.py

    migrations
        0001_initial.py
        __init__.py

    models
        __init__.py
        book.py

    serializers
        __init__.py
        book_serializer.py

    tests.py
    urls.py

    views
        __init__.py
        book_view_set.py
```

Let's test our rest service:

![Rest service](/docs/images/part8_1.png)

## Extending Django Model

Let's we generate a new model `Author` in `models/author.py`file:

```python
# models/author.py

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
```

Add import of new model on top of `__init__.py` file:

```python
from .author import Author
from .book import Book
```

Generate migrations class and update MySQL schema:

```bash
# ./manage.py makemigrations

Migrations for 'library':
  library/migrations/0002_author.py
    + Create model Author

# ./manage.py migrate

Operations to perform:
  Apply all migrations: admin, auth, contenttypes, library, sessions
Running migrations:
  Applying library.0002_author... OK
```

Go to MySQL `library_db`database and show `authors` table:

```mysql
mysql> desc authors;
+---------------+--------------+------+-----+---------+----------------+
| Field         | Type         | Null | Key | Default | Extra          |
+---------------+--------------+------+-----+---------+----------------+
| id            | bigint       | NO   | PRI | NULL    | auto_increment |
| first_name    | varchar(100) | NO   |     | NULL    |                |
| last_name     | varchar(100) | NO   | MUL | NULL    |                |
| citizenship   | varchar(100) | NO   |     | NULL    |                |
| date_of_birth | date         | YES  |     | NULL    |                |
| date_of_death | date         | YES  |     | NULL    |                |
+---------------+--------------+------+-----+---------+----------------+
6 rows in set (0.01 sec)
```

Now that we have created our `Author` model, we can modify the `Book` class and create a relationship between the two objects.
