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
