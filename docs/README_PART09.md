# A full test application using Django and Angular (Part 09) - Advanced Django Serializer

Now, we need to update angular rest client to operate with new django backend. So, we run `npm run generate:api`command.

After generating the client, we see that the only interface that has changed is `Book`.

```typescript
export interface Book {
  readonly id?: number;
  title: string;
  author?: number | null;
  publication_date: string;
  readonly created_at?: string;
  readonly updated_at?: string;
}
```

The type of the `author` property was changed from `string` to `number` and the `author` object was never mapped. So, we need to modify the `library` Django rest application to export a new OpenAPI object.

## The Django rest `author` service

Let's we will create the serializer for the `author` model. Create a new file `serializers/author_serializers.py`

```python
# serializers/author_serializers.py

from rest_framework import serializers
from library.models import Author


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = [
            'id',
            'first_name',
            'last_name',
            'date_of_birth',
            'date_of_death'
        ]
```

Add new serializer into `__init__.py`:

```python
# serializers/__init__.py

from .author_serializer import AuthorSerializer
from .book_serializer import BookSerializer
```

Now we need to create `AuthorViewSet` class, so we create `views/author_view_set.py`:

```python
# views/author_view_set.py

from rest_framework import viewsets
from library.models import Author
from library.serializers import AuthorSerializer

class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
```

and add them into out `views/__init__.py`:

```python
# views/__init__.py

from .author_view_set import AuthorViewSet
from .book_view_set import BookViewSet
```

Finally, we add our `AuthorViewSet` into library router inside `urls.py` to export the new `authors` rest service.

```python
# library/urls.py

from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'books', views.BookViewSet)
router.register(r'authors', views.AuthorViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

Now we have the new `authors`rest service:

![authors service](/docs/images/part09_1.png)

We can display `authors` json data navigating into url: `http://localhost:8000/library/authors`:

![authors data](/docs/images/part09_2.png)

We can also see the new `Author` object inside the OpenAPI `yaml` schema:

```yaml
Author:
  type: object
  properties:
    id:
      type: integer
      readOnly: true
    first_name:
      type: string
      maxLength: 100
    last_name:
      type: string
      maxLength: 100
    date_of_birth:
      type: string
      format: date
      nullable: true
    date_of_death:
      type: string
      format: date
      nullable: true
  required:
    - first_name
    - last_name
```

Now, we can regenerate angular OpenAPI rest client and can verify the presence of the interface `Author`and the update of the `library.service`.

```typescript
export interface Author {
  readonly id?: number;
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  date_of_death?: string | null;
}
```

Let's go to examine the `books.ts`interface, we can see `author` contains the MySQL `id` of table `authors`.

```typescript
export interface Book {
  readonly id?: number;
  title: string;
  author?: number; // `id` to authors table
  publication_date: string;
  readonly year?: string;
  readonly created_at?: string;
  readonly updated_at?: string;
}
```

Now, if we open our application on browser, we can see that the `author` values ​​are set with the `id` of the respective author from the `authors` table.

![Author Error](/docs/images/part09_3.png)

We modify our `Serializers` to handle our `author`'s data.

Update `BookSerializer`as follow:

```python
# library/serializers/book_serializer.py

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
        write_only=True, queryset=Author.objects.all(), required=False
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
```

The BookSerializer is a class that inherits from serializers.HyperlinkedModelSerializer. This type of serializer is provided by the Django REST Framework and is used to convert Book model instances to a data type such as JSON, and vice versa. It also creates hyperlinked relationships between entities.

Here's a breakdown:

HyperlinkedModelSerializer: This base class provides a shortcut for creating serializers that include hyperlinks to related resources. It automatically generates the url field.

- `url = serializers.HyperlinkedIdentityField(view_name='book-detail', read_only=True)`:

  This field represents the URL for the detail view of a `Book` instance.

  - `view_name='book-detail'` specifies that the URL should be generated using the view named `'book-detail'` (you'll need a corresponding URL pattern and view defined in your Django project).

  - `read_only=True` indicates that this field is only used for serialization (output) and cannot be used to set the value during deserialization (input).

- `author_name = serializers.StringRelatedField(source='author', read_only=True)`:

  This field displays the string representation of the related `Author` model.

  - `source='author'` specifies that the value for this field should be retrieved from the author attribute of the `Book` model. This assumes your `Book` model has a foreign key relationship to an `Author` model.
  - `read_only=True` means this field is only for output.

- `author_url = serializers.HyperlinkedRelatedField(view_name='author-detail', read_only=True, source='author')`:

  This field represents the URL for the detail view of the related Author instance.

  - `view_name='author-detail'` specifies the view to use for generating the URL.
  - `read_only=True` indicates that this field is only for serialization.
  - `source='author'` specifies that the value for this field should be retrieved from the author attribute of the Book model.

- `author = serializers.PrimaryKeyRelatedField(write_only=True, queryset=Author.objects.all(), required=False)`:

  This field allows you to set the author relationship when creating or updating a Book.

  - `write_only=True` means this field is only used for deserialization (input). It won't be included in the serialized output.
  - `queryset=Author.objects.all()` specifies the set of Author objects to choose from when setting the author.
  - `required=False` makes the author field optional during creation/update.

- `year = serializers.SerializerMethodField(read_only=True)`:

  This field allows you to define a custom method to retrieve the value for the field.

  - `read_only=True` indicates that this field is only for serialization.

  - `def get_year(self, obj)`: return obj.publication_date.year:

          This method defines how to retrieve the value for the year field. It takes the Book object as input and returns the year of the publication_date.

- `class Meta`:

  This inner class defines metadata for the serializer.
  model = Book specifies that this serializer is for the Book model.

  - `fields = [...]` lists the fields from the Book model that should be included in the serialization. It includes all the fields defined above, as well as `id, title, publication_date, created_at, and updated_at`.

In summary, the `BookSerializer` provides a way to convert Book model instances to and from `JSON` (or other formats). It includes fields for the book's title, author (with hyperlinked relationships), publication date, and other relevant information. It also defines a custom field (year) to extract the year from the publication date. The Meta class specifies the model and fields to be serialized.

Let's also update our `AuthorSerializer` to implement the `HyperlinkedModelSerializer` class.

```python
# library/serializers/author_serializer.py

from rest_framework import serializers
from library.models import Author


class AuthorSerializer(serializers.HyperlinkedModelSerializer):
    """
    AuthorSerializer is a HyperlinkedModelSerializer for the Author model.
    Fields:
        url (HyperlinkedIdentityField): A hyperlink to the detail view of the author.
        id (IntegerField): The unique identifier for the author.
        first_name (CharField): The first name of the author.
        last_name (CharField): The last name of the author.
        citizenship (CharField): The citizenship of the author.
        date_of_birth (DateField): The birth date of the author.
        date_of_death (DateField): The death date of the author (if applicable).
    Meta:
        model (Model): The model that is being serialized.
        fields (list): The list of fields to be included in the serialization.
    """

    url = serializers.HyperlinkedIdentityField(
        view_name='author-detail',
        read_only=True
    )

    class Meta:
        model = Author
        fields = [
            'id',
            'url',
            'first_name',
            'last_name',
            'citizenship',
            'date_of_birth',
            'date_of_death'
        ]
```

Let's regenerate the REST client by running the command `npm run generate:api`.

```typescript
export interface Book {
  readonly id: number;
  readonly url: string;
  title: string;
  readonly author_name: string;
  readonly author_url: string;
  author?: number;
  publication_date: string;
  readonly year: string;
  readonly created_at: string;
  readonly updated_at: string;
}
```

Our `Book` interface now exports the field `readonly author_name?: string`.

Finally, we can update our `app.component.html` and `book.component.html` templates to include `author_name` and `year` fields:

- `app.component.html`:

  ```html
  <h1>{{ title }}</h1>

  <h2>Books</h2>
  <ul>
    <li *ngFor="let book of books"><strong>{{ book.title }}</strong> by {{ book.author_name }} - {{ book.year }} (<a routerLink="/library/books/{{ book.id }}">details</a>)</li>
  </ul>

  <router-outlet></router-outlet>
  ```

- `book.component.html`:

  ```html
  <div *ngIf="book && visible; else elseBlock" class="book">
    <h2>{{ book.title }}</h2>
    <p><b>Book ID:</b> {{ bookId }}</p>
    <p><b>Author:</b> {{ book.author_name }}</p>
    <p><b>Published:</b> {{ book.publication_date }}</p>
  </div>
  <ng-template #elseBlock>
    <div *ngIf="visible" class="book not_found">BookId {{ bookId }} not found</div>
  </ng-template>
  ```

This is the result:

![App Result](/docs/images/part09_4.png)
