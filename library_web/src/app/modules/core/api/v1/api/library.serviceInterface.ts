/**
 * Library App API
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
     * BookViewSet is a viewset for managing Book objects in the library application.  This viewset provides CRUD operations and additional functionalities such as filtering, searching, and ordering.  Attributes:   queryset (QuerySet): A queryset containing all Book objects.   serializer_class (Serializer): The serializer class used for serializing and     deserializing Book objects.   filter_backends (list): A list of filter backends used for filtering, searching,     and ordering the queryset.   filterset_fields (list): A list of fields that can be used for filtering the     queryset.   search_fields (list): A list of fields that can be used for performing search     queries.   ordering_fields (list): A list of fields that can be used for ordering the     queryset.   ordering (list): The default ordering applied to the queryset.
* @param requestParameters
     */
    libraryBooksCreate(requestParameters: LibraryBooksCreateRequestParams, extraHttpRequestParams?: any): Observable<Book>;

    /**
     * 
     * BookViewSet is a viewset for managing Book objects in the library application.  This viewset provides CRUD operations and additional functionalities such as filtering, searching, and ordering.  Attributes:   queryset (QuerySet): A queryset containing all Book objects.   serializer_class (Serializer): The serializer class used for serializing and     deserializing Book objects.   filter_backends (list): A list of filter backends used for filtering, searching,     and ordering the queryset.   filterset_fields (list): A list of fields that can be used for filtering the     queryset.   search_fields (list): A list of fields that can be used for performing search     queries.   ordering_fields (list): A list of fields that can be used for ordering the     queryset.   ordering (list): The default ordering applied to the queryset.
* @param requestParameters
     */
    libraryBooksDestroy(requestParameters: LibraryBooksDestroyRequestParams, extraHttpRequestParams?: any): Observable<{}>;

    /**
     * 
     * BookViewSet is a viewset for managing Book objects in the library application.  This viewset provides CRUD operations and additional functionalities such as filtering, searching, and ordering.  Attributes:   queryset (QuerySet): A queryset containing all Book objects.   serializer_class (Serializer): The serializer class used for serializing and     deserializing Book objects.   filter_backends (list): A list of filter backends used for filtering, searching,     and ordering the queryset.   filterset_fields (list): A list of fields that can be used for filtering the     queryset.   search_fields (list): A list of fields that can be used for performing search     queries.   ordering_fields (list): A list of fields that can be used for ordering the     queryset.   ordering (list): The default ordering applied to the queryset.
*/
    libraryBooksList(extraHttpRequestParams?: any): Observable<Array<Book>>;

    /**
     * 
     * BookViewSet is a viewset for managing Book objects in the library application.  This viewset provides CRUD operations and additional functionalities such as filtering, searching, and ordering.  Attributes:   queryset (QuerySet): A queryset containing all Book objects.   serializer_class (Serializer): The serializer class used for serializing and     deserializing Book objects.   filter_backends (list): A list of filter backends used for filtering, searching,     and ordering the queryset.   filterset_fields (list): A list of fields that can be used for filtering the     queryset.   search_fields (list): A list of fields that can be used for performing search     queries.   ordering_fields (list): A list of fields that can be used for ordering the     queryset.   ordering (list): The default ordering applied to the queryset.
* @param requestParameters
     */
    libraryBooksPartialUpdate(requestParameters: LibraryBooksPartialUpdateRequestParams, extraHttpRequestParams?: any): Observable<Book>;

    /**
     * 
     * BookViewSet is a viewset for managing Book objects in the library application.  This viewset provides CRUD operations and additional functionalities such as filtering, searching, and ordering.  Attributes:   queryset (QuerySet): A queryset containing all Book objects.   serializer_class (Serializer): The serializer class used for serializing and     deserializing Book objects.   filter_backends (list): A list of filter backends used for filtering, searching,     and ordering the queryset.   filterset_fields (list): A list of fields that can be used for filtering the     queryset.   search_fields (list): A list of fields that can be used for performing search     queries.   ordering_fields (list): A list of fields that can be used for ordering the     queryset.   ordering (list): The default ordering applied to the queryset.
* @param requestParameters
     */
    libraryBooksRetrieve(requestParameters: LibraryBooksRetrieveRequestParams, extraHttpRequestParams?: any): Observable<Book>;

    /**
     * 
     * BookViewSet is a viewset for managing Book objects in the library application.  This viewset provides CRUD operations and additional functionalities such as filtering, searching, and ordering.  Attributes:   queryset (QuerySet): A queryset containing all Book objects.   serializer_class (Serializer): The serializer class used for serializing and     deserializing Book objects.   filter_backends (list): A list of filter backends used for filtering, searching,     and ordering the queryset.   filterset_fields (list): A list of fields that can be used for filtering the     queryset.   search_fields (list): A list of fields that can be used for performing search     queries.   ordering_fields (list): A list of fields that can be used for ordering the     queryset.   ordering (list): The default ordering applied to the queryset.
* @param requestParameters
     */
    libraryBooksUpdate(requestParameters: LibraryBooksUpdateRequestParams, extraHttpRequestParams?: any): Observable<Book>;

}
