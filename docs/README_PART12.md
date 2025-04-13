# A Full Test Application Using Django and Angular (Part 12) - Angular Material Components - PART2

### Mat-Table and Mat-Sort

Now, we update our `library.component.html` template as follow:

```html
<h1>{{ title }}</h1>

<div class="library">
  <h2>Books</h2>

  <table *ngIf="books" mat-table [dataSource]="books" class="library-table" matSort matSortActive="ordering" matSortDirection="desc" (matSortChange)="handleSortEvent($event)">
    <!-- Title Column -->
    <ng-container matColumnDef="title">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
      <td mat-cell *matCellDef="let row">{{ row.title }}</td>
    </ng-container>

    <!-- Author Column -->
    <ng-container matColumnDef="author_name">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Author</th>
      <td mat-cell *matCellDef="let row">{{ row.author_name }}</td>
    </ng-container>

    <!-- Published Column -->
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
</div>
```

Here's an explanation of the `mat-table` and `mat-sort` components used in the code:

### `mat-table`

The `mat-table` component from Angular Material is used to display data in a tabular format. It provides features like sorting, pagination, and filtering.

- `[dataSource]="books"`: This binds the table's data source to the `books` array in the component. The `mat-table` will render a row for each object in this array.
- `class="library-table"`: This applies a CSS class to the table for styling purposes.
- `*ngIf="books"`: This ensures that the table is rendered only when the `books` array has data.

#### Columns Definition

Each column in the table is defined using `<ng-container matColumnDef="column_name">`.

- `matColumnDef`: Specifies the unique name for the column. This name is used to reference the column in the header and row definitions.
- `<th mat-header-cell *matHeaderCellDef>`: Defines the header cell for the column.
- `mat-header-cell`: Marks the element as a header cell.
- `*matHeaderCellDef`: Provides the content for the header cell.
- `mat-sort-header`: Enables sorting on this column.
- `<td mat-cell *matCellDef="let row">`: Defines the data cell for the column.
- `mat-cell`: Marks the element as a data cell.
- `*matCellDef="let row"`: Provides the content for the data cell. `row` represents the data for the current row.

#### Rows Definition

- `<tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>`: Defines the header row for the table.
- `mat-header-row`: Marks the element as a header row.
- `*matHeaderRowDef="displayedColumns"`: Specifies which columns to include in the header row. `displayedColumns` is an array in the component that lists the column names.
- `<tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>`: Defines the data rows for the table.
- `mat-row`: Marks the element as a data row.
- `*matRowDef="let row; columns: displayedColumns"`: Specifies which columns to include in the data rows. `row` represents the data for the current row, and `columns` is bound to the `displayedColumns` array.

### `mat-sort`

The `mat-sort` directive is used to add sorting functionality to the table.

- `matSort`: Enables sorting on the table.
- `matSortActive="ordering"`: Sets the column that should be sorted by default.
- `matSortDirection="desc"`: Sets the initial sorting direction (ascending or descending).
- `(matSortChange)="handleSortEvent($event)"`: Binds the `matSortChange` event to the `handleSortEvent` method in the component. This event is emitted when the user clicks on a sortable column header.

#### `matSortHeader`

- `mat-sort-header`: This directive is added to the header cells (`<th>`) to make them sortable. When the user clicks on a header cell with this directive, the `matSortChange` event is emitted.

In summary, `mat-table` is used to display data in a tabular format, and `mat-sort` is used to add sorting capabilities to the table columns. The `displayedColumns` array in the component defines the order and visibility of the columns.

Now, we need to update `library.component.ts`:

```typescript
import { Component, OnInit } from "@angular/core";
import { Book, LibraryService, PaginatedBookList, LibraryBooksListRequestParams } from "../../../core/api/v1";
import { DatePipe, NgIf } from "@angular/common";
import { PageEvent, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableModule } from "@angular/material/table";
import { Sort, MatSortModule, SortDirection } from "@angular/material/sort";

@Component({
  selector: "app-library",
  imports: [NgIf, MatPaginatorModule, MatTableModule, MatSortModule, DatePipe],
  templateUrl: "./library.component.html",
  styleUrl: "./library.component.scss",
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
 *
 */
export class LibraryComponent implements OnInit {
  title = "Library";
  books: Book[] = [];
  totalBooks = 0;
  pageSize = 5;
  pageIndex = 0;
  pageEvent: PageEvent | undefined;
  pageSizeOptions = [5, 10, 25];
  ordering = "title";
  displayedColumns: string[] = ["title", "author_name", "publication_date"];

  constructor(private readonly libraryService: LibraryService) {}

  ngOnInit(): void {
    this.getBooks();
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
  getBooks() {
    /**
     * Parameters for requesting a list of library books.
     *
     * @property page - The current page index incremented by 1 to match the API's 1-based pagination.
     * @property pageSize - The number of items to display per page.
     * @property ordering - The ordering criteria for the list of books.
     */
    const params: LibraryBooksListRequestParams = {
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
      ordering: this.ordering,
    };

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
}
```

The selected code represents the `LibraryComponent` in an Angular application, which is responsible for displaying a paginated and sortable list of books. This component interacts with the `LibraryService` to fetch data from an API and uses Angular Material components for pagination (`mat-paginator`) and sorting (`mat-sort`).

### Key Features of the Code

1. **Pagination Handling**:

- The `handlePageEvent` method is triggered when the user interacts with the paginator. It updates the `pageSize` and `pageIndex` properties and fetches the updated list of books by calling the `getBooks` method.

2. **Sorting Handling**:

- The `handleSortEvent` method has been added to handle sorting events triggered by the user. It updates the `ordering` property based on the selected column and sort direction. The `ordering` parameter is then used in the API request to fetch the sorted list of books.

3. **API Request Parameters**:

- The `getBooks` method constructs the request parameters, including `page`, `pageSize`, and the newly added `ordering` parameter. These parameters are passed to the `libraryBooksList` method of the `LibraryService` to fetch the data.

4. **Dynamic Table Columns**:

- The `displayedColumns` array defines the columns displayed in the Angular Material table (`mat-table`). These include `title`, `author_name`, and `publication_date`.

5. **Component Metadata**:

- The `@Component` decorator specifies the component's selector, template, styles, and imported Angular Material modules (`MatPaginatorModule`, `MatTableModule`, `MatSortModule`) and utilities like `DatePipe`.

### Newly Added Features

- **`handleSortEvent` Method**:

  - This method processes the sorting event emitted by the `mat-sort` directive. It determines the active column and sort direction, updates the `ordering` property, and resets the `pageIndex` to 0 before fetching the updated data.

  ```typescript
  handleSortEvent(e: Sort) {
    const sortDirection: SortDirection = e.direction;
    let sortActive = e.active;

    if (sortActive === 'publication_date') {
      sortActive = 'publication_date';
    } else if (sortActive === 'author_name') {
      sortActive = 'author';
    } else if (sortActive === 'title') {
      sortActive = 'title';
    }

    if (sortDirection === 'desc') {
      this.ordering = `${sortActive}`;
    } else {
      this.ordering = `-${sortActive}`;
    }

    this.pageIndex = 0;
    this.getBooks();
  }
  ```

- **`ordering` Parameter**:

  - The `ordering` property is included in the API request to specify the sorting criteria. It dynamically changes based on the user's interaction with the table headers.

  ```typescript
  const params: LibraryBooksListRequestParams = {
    page: this.pageIndex + 1,
    pageSize: this.pageSize,
    ordering: this.ordering,
  };
  ```

### Summary

This component demonstrates how to integrate Angular Material's table, paginator, and sort functionalities to create a dynamic and user-friendly interface for displaying and managing a list of books. The addition of the `handleSortEvent` method and the `ordering` parameter enhances the component's ability to handle sorting, providing a more interactive and efficient user experience.

Finaly, we update `style.scss` to optimize library rendering:

```scss
html,
body {
  height: 100%;
}
body {
  margin: 0;
  font-family: Roboto, "Helvetica Neue", sans-serif;
} /* You can add global styles to this file, and also import other style files */

h1 {
  color: #333;
  text-align: center;
}

a {
  color: red;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

a:visited {
  color: red;
}

.book {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 10px;
  padding: 10px;
}

.not_found {
  color: #fff;
  background-color: rgba(255, 0, 0, 0.65);
  font-style: italic;
  text-align: center;
}

.library {
  display: block;
  justify-content: center;
  align-items: left;
  width: 1200px;
  margin: 0 auto;
  border: #333 solid 1px;
  border-radius: 5px;
  padding: 20px;
  background-color: #f9f9f9;
}
```

![Library Mat-Table](/docs/images/part12_1.png)

Now you are using the Mat-Table, and you can sort the table columns.
