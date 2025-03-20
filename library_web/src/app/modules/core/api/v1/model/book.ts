/**
 * Test App API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


/**
 * BookSerializer is a HyperlinkedModelSerializer for the Book model.  Fields:     url (HyperlinkedIdentityField): URL for the book detail view.     author_name (StringRelatedField): Name of the author, read-only.     author_url (HyperlinkedRelatedField): URL for the author detail view, read-only.     author (PrimaryKeyRelatedField): Primary key of the author, write-only, optional.     year (SerializerMethodField): Year of publication, read-only.     id (IntegerField): Primary key of the book.     title (CharField): Title of the book.     publication_date (DateField): Publication date of the book.     created_at (DateTimeField): Timestamp when the book was created.     updated_at (DateTimeField): Timestamp when the book was last updated.  Methods:     get_year(obj): Returns the year of the publication date.
 */
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

