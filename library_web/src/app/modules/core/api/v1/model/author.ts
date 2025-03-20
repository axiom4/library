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
 * AuthorSerializer is a HyperlinkedModelSerializer for the Author model. Fields:     url (HyperlinkedIdentityField): A hyperlink to the detail view of the author.     id (IntegerField): The unique identifier for the author.     first_name (CharField): The first name of the author.     last_name (CharField): The last name of the author.     citizenship (CharField): The citizenship of the author.     date_of_birth (DateField): The birth date of the author.     date_of_death (DateField): The death date of the author (if applicable). Meta:     model (Model): The model that is being serialized.     fields (list): The list of fields to be included in the serialization.
 */
export interface Author { 
    readonly id: number;
    readonly url: string;
    first_name: string;
    last_name: string;
    citizenship: string;
    date_of_birth?: string | null;
    date_of_death?: string | null;
}

