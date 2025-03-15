from django.contrib import admin
from library.models.book import Author


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    """
    AuthorAdmin is a custom admin class for the Author model in the Django admin interface.

    Attributes:
        list_display (tuple): Specifies the fields to be displayed in the list view of the admin interface.
        search_fields (tuple): Specifies the fields to be searched in the admin interface.
        list_filter (tuple): Specifies the fields to be used for filtering in the admin interface.
    """
    list_display = (
        'first_name',
        'last_name',
        'citizenship',
        'date_of_birth',
        'date_of_death'
    )
    search_fields = ('first_name', 'last_name')
    list_filter = ('citizenship',)
