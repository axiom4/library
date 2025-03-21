# Generated by Django 5.1.7 on 2025-03-15 09:48

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0002_author'),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name='book',
            name='books_title_e8b1ad_idx',
        ),
        migrations.AlterField(
            model_name='book',
            name='author',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='books', to='library.author'),
        ),
        migrations.AddIndex(
            model_name='book',
            index=models.Index(fields=['title'], name='books_title_7a737c_idx'),
        ),
    ]
