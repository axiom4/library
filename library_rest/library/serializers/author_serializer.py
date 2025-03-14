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
