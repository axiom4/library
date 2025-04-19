# A Full Test Application Using Django and Angular (Part 13) - Forms Security

Now we will insert a form that will allow us to create new books and add them to our library collection.

First, let's create two new components:

**BookListComponent**

```bash
# ng generate component modules/library/components/BooksList

CREATE src/app/modules/library/components/books-list/books-list.component.scss (0 bytes)
CREATE src/app/modules/library/components/books-list/books-list.component.html (25 bytes)
CREATE src/app/modules/library/components/books-list/books-list.component.spec.ts (614 bytes)
CREATE src/app/modules/library/components/books-list/books-list.component.ts (230 bytes)
```

**AddNewBookComponent**

```bash
# ng generate component modules/library/components/AddNewBook

CREATE src/app/modules/library/components/add-new-book/add-new-book.component.scss (0 bytes)
CREATE src/app/modules/library/components/add-new-book/add-new-book.component.html (27 bytes)
CREATE src/app/modules/library/components/add-new-book/add-new-book.component.spec.ts (622 bytes)
CREATE src/app/modules/library/components/add-new-book/add-new-book.component.ts (237 bytes)
```

Next, let's reorganize our code. We consider moving the common structure, like a `<div class="library">`, to the main `app.component.html`. This ensures consistent layout across different views managed by the router.

```html
<!-- src/app/app.component.html -->
<h1>{{ title }}</h1>

<div class="library">
  <app-library></app-library>
  <router-outlet></router-outlet>
</div>
```

Next, we need to add the corresponding method in our `app.component.ts` to handle the button's click event.

```typescript
// src/app/app.component.ts

import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { LibraryComponent } from "./modules/library/components/library/library.component";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  imports: [RouterOutlet, LibraryComponent, MatButtonModule, MatIconModule],
})
/**
 * The `AppComponent` serves as the root component of the Library application.
 * It initializes the application state and interacts with the `LibraryService`
 * to fetch and display a list of books.
 *
 * @implements {OnInit}
 */
export class AppComponent implements OnInit {
  title = "Library";

  constructor() {}

  ngOnInit(): void {}
}
```

Now, we move all contents of our `library` component into `books-list` component:

```html
<mat-form-field class="search-form-field">
  <mat-label>Search</mat-label>
  <input matInput type="text" placeholder="Search for books" [(ngModel)]="searchText" (ngModelChange)="onSearchInputChange($event)" />
  @if (searchText) {
  <button matSuffix mat-icon-button aria-label="Clear" (click)="clearFilter()">
    <mat-icon>close</mat-icon>
  </button>
  }
</mat-form-field>

<table *ngIf="books" mat-table [dataSource]="books" class="library-table" matSort matSortActive="ordering" matSortDirection="desc" (matSortChange)="handleSortEvent($event)">
  <!-- Title Column -->
  <ng-container matColumnDef="title">
    <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
    <td mat-cell *matCellDef="let row">{{ row.title }}</td>
  </ng-container>

  <!-- State Column -->
  <ng-container matColumnDef="author_name">
    <th mat-header-cell *matHeaderCellDef mat-sort-header>Author</th>
    <td mat-cell *matCellDef="let row">{{ row.author_name }}</td>
  </ng-container>

  <!-- Created Column -->
  <ng-container matColumnDef="publication_date">
    <th mat-header-cell *matHeaderCellDef mat-sort-header>Published</th>
    <td mat-cell *matCellDef="let row">{{ row.publication_date | date }}</td>
  </ng-container>

  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
</table>
<mat-paginator
  #paginator
  [pageSize]="pageSize"
  [pageSizeOptions]="pageSizeOptions"
  [length]="totalBooks"
  [pageIndex]="pageIndex"
  (page)="handlePageEvent($event)"
  aria-label="Select page"
>
</mat-paginator>
```

```typescript
import { Component, OnInit } from "@angular/core";
import { Book, LibraryService, PaginatedBookList, LibraryBooksListRequestParams } from "../../../core/api/v1";
import { DatePipe, NgIf } from "@angular/common";
import { PageEvent, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableModule } from "@angular/material/table";
import { Sort, MatSortModule, SortDirection } from "@angular/material/sort";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { debounceTime, Subject } from "rxjs";

@Component({
  selector: "app-books-list",
  imports: [NgIf, MatPaginatorModule, MatTableModule, MatSortModule, DatePipe, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: "./books-list.component.html",
  styleUrl: "./books-list.component.scss",
})
/**
 * The `LibraryComponent` is responsible for displaying a paginated and sortable list of books
 * in the library. It interacts with the `LibraryService` to fetch data and provides functionality
 * for handling user interactions such as pagination and sorting.
 *
 * @remarks
 * This component uses Angular Material's table and pagination components to display and manage
 * the list of books. It maintains the current state of pagination, sorting, and the list of books
 * retrieved from the API.
 *
 * @property {string} title - The title of the component, displayed in the UI.
 * @property {Book[]} books - The array of books currently displayed in the table.
 * @property {number} totalBooks - The total number of books available in the library.
 * @property {number} pageSize - The number of books displayed per page.
 * @property {number} pageIndex - The current page index (0-based).
 * @property {PageEvent | undefined} pageEvent - The latest pagination event triggered by the user.
 * @property {number[]} pageSizeOptions - The available options for the number of books per page.
 * @property {string} ordering - The current sorting order for the list of books.
 * @property {string[]} displayedColumns - The columns displayed in the table.
 *
 * @method ngOnInit - Lifecycle hook that initializes the component and fetches the initial list of books.
 * @method handlePageEvent - Handles pagination events and updates the list of books accordingly.
 * @method handleSortEvent - Handles sorting events and updates the list of books based on the selected criteria.
 * @method getBooks - Fetches a paginated and sorted list of books from the library service.
 * @method onSearchInputChange - Emits the new search text to the searchSubject.
 * @method performSearch - Executes the search logic based on the current search text.
 */
export class BooksListComponent implements OnInit {
  books: Book[] = [];
  totalBooks = 0;
  pageSize = 5;
  pageIndex = 0;
  pageEvent: PageEvent | undefined;
  pageSizeOptions = [5, 10, 25];
  ordering = "title";
  displayedColumns: string[] = ["title", "author_name", "publication_date"];
  searchText = "";
  private searchSubject = new Subject<string>();

  constructor(private readonly libraryService: LibraryService) {}

  /**
   * Lifecycle hook that is called after the component's view has been initialized.
   * Initializes the component by fetching the list of books and setting up a subscription
   * to handle search input with a debounce time of 300ms. When a search term is emitted,
   * it updates the search text, resets the page index, and fetches the filtered list of books.
   */
  ngOnInit(): void {
    this.getBooks();
    this.searchSubject.pipe(debounceTime(300)).subscribe((searchText) => {
      this.searchText = searchText;
      this.pageIndex = 0;
      this.getBooks();
    });
  }

  /**
   * Handles pagination events triggered by the user.
   * Updates the current page size and index based on the event,
   * and fetches the updated list of books accordingly.
   *
   * @param e - The pagination event containing the new page size and index.
   */
  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;

    this.getBooks();
  }

  /**
   * Handles the sorting event triggered by the user.
   * Updates the sorting order and resets the page index before fetching the updated list of books.
   *
   * @param e - The sorting event containing the active sorting field and direction.
   * @param e.active - The field by which the data should be sorted (e.g., 'publication_date', 'author_name', 'title').
   * @param e.direction - The direction of sorting ('asc' for ascending, 'desc' for descending).
   */
  handleSortEvent(e: Sort) {
    const sortDirection: SortDirection = e.direction;
    let sortActive = e.active;

    if (sortActive === "publication_date") {
      sortActive = "publication_date";
    } else if (sortActive === "author_name") {
      sortActive = "author";
    } else if (sortActive === "title") {
      sortActive = "title";
    }

    if (sortDirection === "desc") {
      this.ordering = `${sortActive}`;
    } else {
      this.ordering = `-${sortActive}`;
    }

    this.pageIndex = 0;
    this.getBooks();
  }

  /**
   * Fetches a paginated list of books from the library service based on the current
   * page index, page size, and ordering criteria. Updates the component's `books`
   * and `totalBooks` properties with the retrieved data.
   *
   * @remarks
   * This method constructs the request parameters and calls the `libraryBooksList`
   * method of the `libraryService`. It handles the response by populating the
   * `books` array with the results and updating the `totalBooks` count. Errors
   * during the API call are logged to the console.
   *
   * @returns void
   */
  /**
   * Fetches a paginated list of library books based on the current search and pagination criteria.
   *
   * This method constructs the request parameters, including pagination, ordering, and optional search text,
   * and sends a request to the library service to retrieve the list of books. The results are then assigned
   * to the component's `books` property, and the total number of books is updated.
   *
   * @remarks
   * - The `page` parameter is adjusted to match the API's 1-based pagination.
   * - If a search text is provided, it is included in the request parameters.
   *
   * @throws Will log an error to the console if the API request fails.
   */
  getBooks() {
    /**
     * Parameters for requesting a list of library books.
     *
     * @property page - The current page index incremented by 1 to match the API's 1-based pagination.
     * @property pageSize - The number of items to display per page.
     * @property ordering - The ordering criteria for the list of books.
     * @property search - The search text to filter the list of books (optional).
     */
    let params: LibraryBooksListRequestParams = {
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
      ordering: this.ordering,
    };

    if (this.searchText !== "") {
      params["search"] = this.searchText;
    }

    this.libraryService.libraryBooksList(params).subscribe({
      next: (data: PaginatedBookList) => {
        console.log(data);
        this.books = data.results || [];
        this.totalBooks = data.total_records || 0;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  /**
   * Emits the new search text to the searchSubject.
   *
   * @param value - The new search text entered by the user.
   */
  onSearchInputChange(value: string): void {
    this.searchSubject.next(value);
  }

  /**
   * Clears the current search filter by resetting the search text and page index.
   * After clearing the filter, it fetches the updated list of books.
   */
  clearFilter(): void {
    this.searchText = "";
    this.pageIndex = 0;
    this.getBooks();
  }
}
```

Finally, we update `library` component.

```html
<h2>Books</h2>

<app-books-list></app-books-list>

<hr />
<div class="library-footer">
  <a mat-raised-button color="primary" (click)="openAddBookDialog()"> <mat-icon>add</mat-icon> Add New Book </a>
</div>
```

```typescript
import { Component, OnInit } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { BooksListComponent } from "../books-list/books-list.component";

@Component({
  selector: "app-library",
  imports: [BooksListComponent, MatButtonModule, MatIconModule],
  templateUrl: "./library.component.html",
  styleUrl: "./library.component.scss",
})
export class LibraryComponent implements OnInit {
  ngOnInit(): void {}

  openAddBookDialog() {
    // Logic to open the dialog for adding a new book
  }
}
```

and `style.scss` adding:

```scss
.library-footer {
  margin: 20px 0 0 0;
  width: 100%;
  text-align: right;
}
```

This is the result:

![App](/docs/images/part13_1.png)
