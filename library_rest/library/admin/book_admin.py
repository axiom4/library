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
