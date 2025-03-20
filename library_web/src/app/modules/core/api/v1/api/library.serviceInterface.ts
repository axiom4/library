/**
 * Test App API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { HttpHeaders }                                       from '@angular/common/http';

import { Observable }                                        from 'rxjs';

import { Author } from '../model/models';
import { Book } from '../model/models';


import { Configuration }                                     from '../configuration';


export interface LibraryAuthorsCreateRequestParams {
    author: Author;
}

export interface LibraryAuthorsDestroyRequestParams {
    id: number;
}

export interface LibraryAuthorsPartialUpdateRequestParams {
    id: number;
    author: Author;
}

export interface LibraryAuthorsRetrieveRequestParams {
    id: number;
}

export interface LibraryAuthorsUpdateRequestParams {
    id: number;
    author: Author;
}

export interface LibraryBooksCreateRequestParams {
    book: Book;
}

export interface LibraryBooksDestroyRequestParams {
    id: number;
}

export interface LibraryBooksListRequestParams {
    author?: number;
    ordering?: string;
    publicationDate?: string;
    search?: string;
    title?: string;
}

export interface LibraryBooksPartialUpdateRequestParams {
    id: number;
    book: Book;
}

export interface LibraryBooksRetrieveRequestParams {
    id: number;
}

export interface LibraryBooksUpdateRequestParams {
    id: number;
    book: Book;
}


export interface LibraryServiceInterface {
    defaultHeaders: HttpHeaders;
    configuration: Configuration;

    /**
     * 
     * AuthorViewSet is a viewset for handling CRUD operations on Author model.  Attributes:     queryset (QuerySet): A queryset containing all Author objects.     serializer_class (Serializer): The serializer class used to serialize and deserialize Author objects.
* @param requestParameters
     */
    libraryAuthorsCreate(requestParameters: LibraryAuthorsCreateRequestParams, extraHttpRequestParams?: any): Observable<Author>;

    /**
     * 
     * AuthorViewSet is a viewset for handling CRUD operations on Author model.  Attributes:     queryset (QuerySet): A queryset containing all Author objects.     serializer_class (Serializer): The serializer class used to serialize and deserialize Author objects.
* @param requestParameters
     */
    libraryAuthorsDestroy(requestParameters: LibraryAuthorsDestroyRequestParams, extraHttpRequestParams?: any): Observable<{}>;

    /**
     * 
     * AuthorViewSet is a viewset for handling CRUD operations on Author model.  Attributes:     queryset (QuerySet): A queryset containing all Author objects.     serializer_class (Serializer): The serializer class used to serialize and deserialize Author objects.
*/
    libraryAuthorsList(extraHttpRequestParams?: any): Observable<Array<Author>>;

    /**
     * 
     * AuthorViewSet is a viewset for handling CRUD operations on Author model.  Attributes:     queryset (QuerySet): A queryset containing all Author objects.     serializer_class (Serializer): The serializer class used to serialize and deserialize Author objects.
* @param requestParameters
     */
    libraryAuthorsPartialUpdate(requestParameters: LibraryAuthorsPartialUpdateRequestParams, extraHttpRequestParams?: any): Observable<Author>;

    /**
     * 
     * AuthorViewSet is a viewset for handling CRUD operations on Author model.  Attributes:     queryset (QuerySet): A queryset containing all Author objects.     serializer_class (Serializer): The serializer class used to serialize and deserialize Author objects.
* @param requestParameters
     */
    libraryAuthorsRetrieve(requestParameters: LibraryAuthorsRetrieveRequestParams, extraHttpRequestParams?: any): Observable<Author>;

    /**
     * 
     * AuthorViewSet is a viewset for handling CRUD operations on Author model.  Attributes:     queryset (QuerySet): A queryset containing all Author objects.     serializer_class (Serializer): The serializer class used to serialize and deserialize Author objects.
* @param requestParameters
     */
    libraryAuthorsUpdate(requestParameters: LibraryAuthorsUpdateRequestParams, extraHttpRequestParams?: any): Observable<Author>;

    /**
     * 
     * A viewset for viewing and editing book instances.  This viewset provides &#x60;list&#x60;, &#x60;create&#x60;, &#x60;retrieve&#x60;, &#x60;update&#x60; and &#x60;destroy&#x60; actions for the Book model.  Attributes:   queryset (QuerySet): The set of Book instances to be retrieved.   serializer_class (BookSerializer): The serializer class to be used for serializing and deserializing Book instances.
* @param requestParameters
     */
    libraryBooksCreate(requestParameters: LibraryBooksCreateRequestParams, extraHttpRequestParams?: any): Observable<Book>;

    /**
     * 
     * A viewset for viewing and editing book instances.  This viewset provides &#x60;list&#x60;, &#x60;create&#x60;, &#x60;retrieve&#x60;, &#x60;update&#x60; and &#x60;destroy&#x60; actions for the Book model.  Attributes:   queryset (QuerySet): The set of Book instances to be retrieved.   serializer_class (BookSerializer): The serializer class to be used for serializing and deserializing Book instances.
* @param requestParameters
     */
    libraryBooksDestroy(requestParameters: LibraryBooksDestroyRequestParams, extraHttpRequestParams?: any): Observable<{}>;

    /**
     * 
     * A viewset for viewing and editing book instances.  This viewset provides &#x60;list&#x60;, &#x60;create&#x60;, &#x60;retrieve&#x60;, &#x60;update&#x60; and &#x60;destroy&#x60; actions for the Book model.  Attributes:   queryset (QuerySet): The set of Book instances to be retrieved.   serializer_class (BookSerializer): The serializer class to be used for serializing and deserializing Book instances.
* @param requestParameters
     */
    libraryBooksList(requestParameters: LibraryBooksListRequestParams, extraHttpRequestParams?: any): Observable<Array<Book>>;

    /**
     * 
     * A viewset for viewing and editing book instances.  This viewset provides &#x60;list&#x60;, &#x60;create&#x60;, &#x60;retrieve&#x60;, &#x60;update&#x60; and &#x60;destroy&#x60; actions for the Book model.  Attributes:   queryset (QuerySet): The set of Book instances to be retrieved.   serializer_class (BookSerializer): The serializer class to be used for serializing and deserializing Book instances.
* @param requestParameters
     */
    libraryBooksPartialUpdate(requestParameters: LibraryBooksPartialUpdateRequestParams, extraHttpRequestParams?: any): Observable<Book>;

    /**
     * 
     * A viewset for viewing and editing book instances.  This viewset provides &#x60;list&#x60;, &#x60;create&#x60;, &#x60;retrieve&#x60;, &#x60;update&#x60; and &#x60;destroy&#x60; actions for the Book model.  Attributes:   queryset (QuerySet): The set of Book instances to be retrieved.   serializer_class (BookSerializer): The serializer class to be used for serializing and deserializing Book instances.
* @param requestParameters
     */
    libraryBooksRetrieve(requestParameters: LibraryBooksRetrieveRequestParams, extraHttpRequestParams?: any): Observable<Book>;

    /**
     * 
     * A viewset for viewing and editing book instances.  This viewset provides &#x60;list&#x60;, &#x60;create&#x60;, &#x60;retrieve&#x60;, &#x60;update&#x60; and &#x60;destroy&#x60; actions for the Book model.  Attributes:   queryset (QuerySet): The set of Book instances to be retrieved.   serializer_class (BookSerializer): The serializer class to be used for serializing and deserializing Book instances.
* @param requestParameters
     */
    libraryBooksUpdate(requestParameters: LibraryBooksUpdateRequestParams, extraHttpRequestParams?: any): Observable<Book>;

}
