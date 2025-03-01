# A full test application using Django and Angular (Part 4) - Djago Rest framework

Now, let's create a new model for the book. We will create a new app called `library` and create a new model called `Book`.

Installing Django Rest Framework

```bash
pip install djangorestframework markdown django-filter django-cors-headers PyYAML uritemplate

Collecting djangorestframework
  Using cached djangorestframework-3.15.2-py3-none-any.whl.metadata (10 kB)
Collecting markdown
  Using cached Markdown-3.7-py3-none-any.whl.metadata (7.0 kB)
Collecting django-filter
  Using cached django_filter-25.1-py3-none-any.whl.metadata (5.1 kB)
Collecting django-cors-headers
  Using cached django_cors_headers-4.7.0-py3-none-any.whl.metadata (16 kB)
Collecting PyYAML
  Using cached PyYAML-6.0.2-cp313-cp313-macosx_11_0_arm64.whl.metadata (2.1 kB)
Collecting uritemplate
  Using cached uritemplate-4.1.1-py2.py3-none-any.whl.metadata (2.9 kB)
Requirement already satisfied: django>=4.2 in ./venv/lib/python3.13/site-packages (from djangorestframework) (5.1.6)
Requirement already satisfied: asgiref>=3.6 in ./venv/lib/python3.13/site-packages (from django-cors-headers) (3.8.1)
Requirement already satisfied: sqlparse>=0.3.1 in ./venv/lib/python3.13/site-packages (from django>=4.2->djangorestframework) (0.5.3)
Using cached djangorestframework-3.15.2-py3-none-any.whl (1.1 MB)
Using cached Markdown-3.7-py3-none-any.whl (106 kB)
Using cached django_filter-25.1-py3-none-any.whl (94 kB)
Using cached django_cors_headers-4.7.0-py3-none-any.whl (12 kB)
Using cached PyYAML-6.0.2-cp313-cp313-macosx_11_0_arm64.whl (171 kB)
Using cached uritemplate-4.1.1-py2.py3-none-any.whl (10 kB)
Installing collected packages: uritemplate, PyYAML, markdown, djangorestframework, django-filter, django-cors-headers
Successfully installed PyYAML-6.0.2 django-cors-headers-4.7.0 django-filter-25.1 djangorestframework-3.15.2 markdown-3.7 uritemplate-4.1.1
```

Let's create our test application "**library**"

```bash
./manage.py startapp library
```

Modify django **settings.py** to enable **library**. We need update **INSTALLED_APPS** adding all dependencies:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    ...
    'djangorestframework',
    'django_filters',
    'corsheaders',
    'library'
]
```

To enable **django-cors-headers** we need update **MIDDLEWARE** section adding **"corsheaders.middleware.CorsMiddleware"** before **"django.middleware.common.CommonMiddleware"**:

```python
MIDDLEWARE = [
    ...,
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    ...,
]
```

and add the following lines at the end of the file

```python
CORS_ORIGIN_ALLOW_ALL = False

CORS_ORIGIN_WHITELIST = (
  'http://localhost:8000',
  'http://localhost:4200',
)
```

## Create a new book model

To create new model we need edting **library/models.py** to add new class "**Book**"

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

    title = models.CharField(max_length=100, )
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
