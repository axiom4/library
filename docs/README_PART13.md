# A Full Test Application Using Django and Angular (Part 13) - Forms Control

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

## Adding MatDialog

To handle the addition of new books, we'll use Angular Material's `MatDialog` to open a modal window containing our `AddNewBookComponent`.

First, ensure `MatDialogModule` is imported. If `LibraryComponent` is part of an NgModule, add `MatDialogModule` to the `imports` array of that module. If `LibraryComponent` is standalone, add `MatDialogModule` to its `imports` array.

Next, inject `MatDialog` into the `LibraryComponent`'s constructor and implement the `openAddBookDialog` method.

```typescript
// src/app/modules/library/components/library/library.component.ts
import { Component, OnInit } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { BooksListComponent } from "../books-list/books-list.component";
import { MatDialog } from "@angular/material/dialog"; // Import MatDialog and MatDialogModule
import { AddNewBookComponent } from "../add-new-book/add-new-book.component"; // Import the component for the dialog

@Component({
  selector: "app-library",
  imports: [BooksListComponent, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: "./library.component.html",
  styleUrl: "./library.component.scss",
})
export class LibraryComponent implements OnInit {
  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}

  /**
   * Opens a dialog window containing the AddNewBookComponent.
   * Configures the dialog's width.
   */
  openAddBookDialog(): void {
    const dialogRef = this.dialog.open(AddNewBookComponent, {
      width: "700px",
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
      if (result) {
        console.log("Dialog result:", result);
      }
    });
  }
}
```

Now, when the "Add New Book" button is clicked, the `openAddBookDialog` method will be called, which uses the `MatDialog` service to open the `AddNewBookComponent` in a modal dialog.

We also need to make sure `AddNewBookComponent` is prepared to be used within a dialog. For now, its default template is sufficient. We will populate its template and logic in the next steps.

## Implementing the Add New Book Form

Let's implement the form within `AddNewBookComponent` to capture the details of a new book and handle the submission.

First, update the component's TypeScript file (`add-new-book.component.ts`) to use Angular's `ReactiveFormsModule` for form handling, inject necessary services like `MatDialogRef` and `LibraryService`, and define the form submission logic.

```typescript
// src/app/modules/library/components/add-new-book/add-new-book.component.ts
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { BookRequest, LibraryBooksCreateRequestParams, LibraryService } from "../../../core/api/v1"; // Adjust path as needed
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, MatNativeDateModule, NativeDateAdapter } from "@angular/material/core";
import { CommonModule } from "@angular/common";
import { MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions } from "@angular/material/dialog";

@Component({
  selector: "app-add-new-book",
  standalone: true, // Assuming standalone component
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
  ],
  templateUrl: "./add-new-book.component.html",
  styleUrls: ["./add-new-book.component.scss"],
})
export class AddNewBookComponent implements OnInit {
  addBookForm!: FormGroup;

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<AddNewBookComponent>, private libraryService: LibraryService) {}

  ngOnInit(): void {
    this.addBookForm = this.fb.group({
      title: ["", Validators.required],
      author: ["", Validators.required],
      publication_date: ["", Validators.required],
    });
  }

  /**
   * Handles the form submission. If the form is valid, it formats the data,
   * calls the library service to create the book, and closes the dialog on success.
   */
  onSubmit(): void {
    console.log("Form submitted:", this.addBookForm.value);
    if (this.addBookForm.valid) {
      // Ensure date is formatted correctly if needed by the API (e.g., YYYY-MM-DD)
      const formattedDate = this.formatDate(this.addBookForm.value.publication_date);

      const bookRequest: BookRequest = {
        title: this.addBookForm.value.title,
        author: this.addBookForm.value.author,
        publication_date: formattedDate,
      };

      const bookData: LibraryBooksCreateRequestParams = {
        bookRequest: bookRequest,
      };

      this.libraryService.libraryBooksCreate(bookData).subscribe({
        next: (response) => {
          console.log("Book added successfully", response);
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error("Error adding book:", error);
        },
      });
    } else {
      this.addBookForm.markAllAsTouched();
    }
  }

  /**
   * Closes the dialog without submitting the form.
   */
  onCancel(): void {
    this.dialogRef.close(); // Close dialog without passing any data
  }

  /**
   * Helper function to format a Date object into 'YYYY-MM-DD' string format.
   * @param date - The date to format.
   * @returns The formatted date string.
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }
}
```

Next, update the HTML template (`add-new-book.component.html`) to include the form fields and buttons.

```html
<!-- src/app/modules/library/components/add-new-book/add-new-book.component.html -->
<h2 mat-dialog-title>Add New Book</h2>
<mat-dialog-content>
  <form [formGroup]="addBookForm" id="addBookForm">
    <!-- Title Field -->
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Title</mat-label>
      <input matInput formControlName="title" placeholder="Enter book title" required />
      <mat-error *ngIf="addBookForm.get('title')?.hasError('required')"> Title is required </mat-error>
    </mat-form-field>

    <!-- Author Field -->
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Author</mat-label>
      <input matInput formControlName="author" placeholder="Enter author name" required />
      <mat-error *ngIf="addBookForm.get('author')?.hasError('required')"> Author is required </mat-error>
    </mat-form-field>

    <!-- Publication Date Field -->
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Publication Date</mat-label>
      <input matInput [matDatepicker]="picker" formControlName="publication_date" placeholder="Choose a date" required />
      <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker #picker></mat-datepicker>
      <mat-error *ngIf="addBookForm.get('publication_date')?.hasError('required')"> Publication Date is required </mat-error>
    </mat-form-field>
  </form>
</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button (click)="onCancel()">Cancel</button>
  <!-- Bind the form submission to the form element's submit event -->
  <button mat-raised-button color="primary" type="submit" form="addBookForm" [disabled]="!addBookForm.valid" (click)="onSubmit()">Add Book</button>
</mat-dialog-actions>
```

Add some basic styling for the form fields:

```scss
// src/app/modules/library/components/add-new-book/add-new-book.component.scss
.full-width {
  width: 100%;
  margin-top: 1rem;
}

/* Ensure mat-dialog-content has enough space */
mat-dialog-content {
  padding-top: 20px;
}
```

This is the result.

![Add New Book Form](/docs/images/part13_2.png)

Now, we can add a new book. We will use "The Restaurant at the End of the Universe" by "Adams, Douglas" published on "1 October 1980".

![Add New Book Form Issue](/docs/images/part13_3.png)

When we try to insert the book, we notice that something is wrong, so we open our browser's debugger and check what is happening.

![Add New Book Request Debug](/docs/images/part13_4.png)

### The error

> "Incorrect type. Expected pk value, received str." this is the error.

The error "Incorrect type. Expected pk value, received str." indicates that the API expects a primary key (pk) value for the `author` field, but it received a string (str). This is because the book insertion request expects the `author` object to be referenced by its unique ID, not by name. To associate the book with the correct author, it is necessary to send the ID of the existing author in the database.

To fix this issue we use the `autocomplete` component of angular-material to find an `Author`and return his `id` into the object.

First, we need to allow our application to filter authors, so let's modify our `AuthorViewSet` object as follows:

```python
from rest_framework import viewsets
from library.models import Author
from library.serializers import AuthorSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from library.pagination import LibraryPagination


class AuthorViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Author instances.

    This viewset provides the following features:
    - Lists, retrieves, creates, updates, and deletes Author objects.
    - Supports filtering by 'first_name', 'last_name', and 'citizenship'.
    - Allows searching by 'first_name' and 'last_name'.
    - Supports ordering by 'first_name' and 'last_name', with default ordering by 'last_name' then 'first_name'.
    - Uses a custom pagination class (LibraryPagination).

    Attributes:
        queryset (QuerySet): The queryset of Author objects.
        serializer_class (Serializer): The serializer class for Author objects.
        filter_backends (list): The list of filter backends for filtering, ordering, and searching.
        search_fields (list): Fields to enable search functionality.
        ordering_fields (list): Fields that can be used for ordering results.
        ordering (list): Default ordering for the queryset.
        filterset_fields (list): Fields that can be used for filtering results.
        pagination_class (Pagination): The pagination class to use for paginating results.
    """

    queryset = Author.objects.all()
    serializer_class = AuthorSerializer

    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]

    search_fields = ['first_name', 'last_name']
    ordering_fields = ['first_name', 'last_name']
    ordering = ['last_name', 'first_name']
    filterset_fields = ['first_name', 'last_name', 'citizenship']
    pagination_class = LibraryPagination
```

Let's rebuild our rest client using `npm run generate:api`.

### Use Mat-Autocomplete

```html
<!-- Author Field -->
<mat-form-field appearance="outline" class="full-width">
  <mat-label>Author</mat-label>
  <input matInput formControlName="author" placeholder="Enter author name" required [matAutocomplete]="auto" />
  <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn">
    @for (author of filteredOptions | async; track author.id) {
    <mat-option [value]="author"> {{ author.first_name }} {{ author.last_name }} </mat-option>
    }
  </mat-autocomplete>
  <mat-error *ngIf="addBookForm.get('author')?.hasError('required')"> Author is required </mat-error>
</mat-form-field>
```

This code defines an Angular Material form field for selecting an author. Here’s a breakdown:

- `<mat-form-field appearance="outline" class="full-width">`: Creates a styled input field that spans the full width of its container.
- `<mat-label>Author</mat-label>`: Sets the label for the input field.
- `<input matInput formControlName="author" ...>`: Binds the input to the `author` form control, making it part of a reactive form. The `required` attribute ensures the field must be filled.
- `[matAutocomplete]="auto"`: Connects the input to a Material autocomplete dropdown.
- `<mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn">`: Defines the autocomplete panel, using a custom display function (`displayFn`) to show selected values.
- `@for (author of filteredOptions | async; track author.id) { ... }`: Iterates over the filtered list of authors (asynchronously), using each author's `id` for tracking.
- `<mat-option [value]="author"> ... </mat-option>`: Displays each author as an option, showing their first and last name.
- `<mat-error *ngIf="addBookForm.get('author')?.hasError('required')"> ... </mat-error>`: Shows an error message if the author field is left empty.

This setup provides a user-friendly way to select an author from a filtered list, with validation and clear feedback.

```typescript
filteredOptions: Observable<Author[]> | undefined;
```

The line declares a TypeScript property named `filteredOptions`. This property can either hold an `Observable` that emits arrays of Author objects, or it can be `undefined`. In Angular applications, such a property is commonly used to store the results of a filter operation, for example, when implementing autocomplete functionality. The use of `Observable` allows the UI to reactively update as the data changes over time.

```typescript
  ngOnInit(): void {
    const authorControl = new FormControl('', Validators.required);

    this.addBookForm = this.fb.group({
      title: ['', Validators.required],
      author: authorControl,
      publication_date: ['', Validators.required],
    });

    this.filteredOptions = authorControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) => {
        if (typeof value === 'string') {
          return this._filter(value);
        }
        return [[]];
      })
    );
  }
```

This code defines the `ngOnInit` lifecycle hook in an Angular component. Here’s what happens step by step:

1. **FormControl Initialization:**  
   A new `FormControl` named `authorControl` is created for the author field, with a required validator to ensure the field is not left empty.

2. **Form Group Creation:**  
   The `addBookForm` form group is initialized using Angular's `FormBuilder` (`this.fb.group`). It contains three fields:

   - `title`: A required text field.
   - `author`: The previously created `authorControl`.
   - `publication_date`: Another required text field.

3. **Autocomplete Filtering:**  
   The `filteredOptions` observable is set up to provide filtered autocomplete options for the author field.
   - It listens to value changes on `authorControl`.
   - On each change, it starts with an empty string and uses `switchMap` to call the `_filter` method if the value is a string.
   - If the value is not a string, it returns an empty array.

**Key Points:**

- This setup is typical for implementing an autocomplete input in Angular forms.
- Validators ensure that required fields are filled.
- The use of observables allows for reactive updates to the autocomplete options as the user types.

```typescript
  displayFn(author: Author): string {
    return author ? author.first_name + ' ' + author.last_name : '';
  }
```

The `displayFn` function takes an `Author` object as input and returns a string. If the `author` exists (is not null or undefined), it concatenates the `first_name` and `last_name` properties with a space in between, effectively displaying the author's full name. If the `author` is not provided, it returns an empty string. This function is useful for formatting author information for display purposes.

```typescript
  private _filter(name: string): Observable<Author[]> {
    const params: LibraryAuthorsListRequestParams = {
      search: name,
      pageSize: 3,
    };

    return this.libraryService
      .libraryAuthorsList(params)
      .pipe(
        map((data) => (data && Array.isArray(data.results) ? data.results : []))
      );
  }
```

The `_filter` method is a private function that takes a string parameter `name` and returns an `Observable` of an array of `Author` objects. Here’s a breakdown of how it works:

1. **Parameter Preparation:**  
   It creates a `params` object of type `LibraryAuthorsListRequestParams`, setting the `search` property to the provided `name` and limiting the `pageSize` to 3. This means the method will only request up to 3 authors matching the search term.

2. **Service Call:**  
   It calls `libraryService.libraryAuthorsList(params)`, which is expected to return an observable containing the results of the author search.

3. **Result Mapping:**  
   The method uses the `pipe` and `map` operators from RxJS to process the response. It checks if the response (`data`) exists and if `data.results` is an array. If so, it returns `data.results`; otherwise, it returns an empty array.

**Key Points:**

- This method is useful for implementing features like autocomplete or search suggestions, where you want to fetch a small, filtered list of authors based on user input.
- The use of observables allows the method to handle asynchronous data streams, which is common in Angular applications.

**Potential Gotchas:**

- If `libraryService.libraryAuthorsList` does not return an object with a `results` array, the method will always return an empty array.
- The method is private, so it can only be used within the class where it is defined.

Here the full code:

```html
<!-- src/app/modules/library/components/add-new-book/add-new-book.component.html -->
<h2 mat-dialog-title>Add New Book</h2>
<mat-dialog-content>
  <form [formGroup]="addBookForm" id="addBookForm">
    <!-- Title Field -->
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Title</mat-label>
      <input matInput formControlName="title" placeholder="Enter book title" required />
      <mat-error *ngIf="addBookForm.get('title')?.hasError('required')"> Title is required </mat-error>
    </mat-form-field>

    <!-- Author Field -->
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Author</mat-label>
      <input matInput formControlName="author" placeholder="Enter author name" required [matAutocomplete]="auto" />
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn">
        @for (author of filteredOptions | async; track author.id) {
        <mat-option [value]="author"> {{ author.first_name }} {{ author.last_name }} </mat-option>
        }
      </mat-autocomplete>
      <mat-error *ngIf="addBookForm.get('author')?.hasError('required')"> Author is required </mat-error>
    </mat-form-field>

    <!-- Publication Date Field -->
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Publication Date</mat-label>
      <input matInput [matDatepicker]="picker" formControlName="publication_date" placeholder="Choose a date" required />
      <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker #picker></mat-datepicker>
      <mat-error *ngIf="addBookForm.get('publication_date')?.hasError('required')"> Publication Date is required </mat-error>
    </mat-form-field>
  </form>
</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button (click)="onCancel()">Cancel</button>
  <!-- Bind the form submission to the form element's submit event -->
  <button mat-raised-button color="primary" type="submit" form="addBookForm" [disabled]="!addBookForm.valid" (click)="onSubmit()">Add Book</button>
</mat-dialog-actions>
```

```typescript
// src/app/modules/library/components/add-new-book/add-new-book.component.ts
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { Author, BookRequest, LibraryAuthorsListRequestParams, LibraryBooksCreateRequestParams, LibraryService } from "../../../core/api/v1"; // Adjust path as needed
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatAutocompleteModule } from "@angular/material/autocomplete";

import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, MatNativeDateModule, NativeDateAdapter } from "@angular/material/core";
import { CommonModule } from "@angular/common";
import { MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions } from "@angular/material/dialog";
import { filter, map, Observable, startWith, switchMap } from "rxjs";

@Component({
  selector: "app-add-new-book",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatAutocompleteModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
  ],
  templateUrl: "./add-new-book.component.html",
  styleUrls: ["./add-new-book.component.scss"],
})
/**
 * Component for adding a new book to the library.
 *
 * This component provides a form for entering book details, including title, author, and publication date.
 * It features an autocomplete input for selecting authors, which fetches matching authors from the backend as the user types.
 * Upon form submission, the component validates the input, formats the data as required by the API, and sends a request to create the new book.
 * The dialog is closed upon successful creation or cancellation.
 *
 * @remarks
 * - Uses Angular Reactive Forms for form handling and validation.
 * - Integrates with the `LibraryService` to fetch authors and create books.
 * - Utilizes Angular Material Dialog for modal functionality.
 * - Implements an autocomplete feature for author selection.
 *
 * @see LibraryService
 */
export class AddNewBookComponent implements OnInit {
  addBookForm!: FormGroup;
  filteredOptions: Observable<Author[]> | undefined;

  /**
   * Initializes a new instance of the AddNewBookComponent.
   *
   * @param fb - The FormBuilder service used to create and manage reactive forms.
   * @param dialogRef - Reference to the dialog opened for adding a new book.
   * @param libraryService - Service for interacting with the library's data and operations.
   */
  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<AddNewBookComponent>, private libraryService: LibraryService) {}

  /**
   * Initializes the add book form and sets up the filtered options for the author autocomplete.
   *
   * - Creates a reactive form group with controls for title, author, and publication date.
   * - Sets up an observable (`filteredOptions`) that listens to changes in the author input,
   *   and filters the available author options accordingly.
   * - Uses `startWith` to initialize the filter and `switchMap` to handle asynchronous filtering logic.
   */
  ngOnInit(): void {
    const authorControl = new FormControl("", Validators.required);

    this.addBookForm = this.fb.group({
      title: ["", Validators.required],
      author: authorControl,
      publication_date: ["", Validators.required],
    });

    this.filteredOptions = authorControl.valueChanges.pipe(
      startWith(""),
      switchMap((value) => {
        if (typeof value === "string") {
          return this._filter(value);
        }
        return [[]];
      })
    );
  }

  /**
   * Formats an Author object into a display string.
   *
   * @param author - The Author object to format.
   * @returns The author's full name as a string, or an empty string if the author or first name is not provided.
   */
  displayFn(author: Author): string {
    return author ? author.first_name + " " + author.last_name : "";
  }

  /**
   * Filters authors based on the provided name by querying the library service.
   *
   * @param name - The search string used to filter authors.
   * @returns An Observable emitting an array of Author objects matching the search criteria.
   */
  private _filter(name: string): Observable<Author[]> {
    const params: LibraryAuthorsListRequestParams = {
      search: name,
      pageSize: 3,
    };

    return this.libraryService.libraryAuthorsList(params).pipe(map((data) => (data && Array.isArray(data.results) ? data.results : [])));
  }

  /**
   * Handles the form submission. If the form is valid, it formats the data,
   * calls the library service to create the book, and closes the dialog on success.
   */
  onSubmit(): void {
    console.log("Form submitted:", this.addBookForm.value);
    if (this.addBookForm.valid) {
      // Ensure dte is formatted correctly if needed by the API (e.g., YYYY-MM-DD)
      const formattedDate = this.formatDate(this.addBookForm.value.publication_date);

      const bookRequest: BookRequest = {
        title: this.addBookForm.value.title,
        author: this.addBookForm.value.author.id,
        publication_date: formattedDate,
      };

      const bookData: LibraryBooksCreateRequestParams = {
        bookRequest: bookRequest,
      };

      this.libraryService.libraryBooksCreate(bookData).subscribe({
        next: (response) => {
          console.log("Book added successfully", response);
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error("Error adding book:", error);
        },
      });
    } else {
      this.addBookForm.markAllAsTouched();
    }
  }

  /**
   * Closes the dialog without submitting the form.
   */
  onCancel(): void {
    this.dialogRef.close(); // Close dialog without passing any data
  }

  /**
   * Helper function to format a Date object into 'YYYY-MM-DD' string format.
   * @param date - The date to format.
   * @returns The formatted date string.
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }
}
```

![Autocomplete](/docs/images/part13_5.png)

Now, let's try to insert out book.

We can see that the book has been added correctly, however, there are still two problems to solve:

1.  There is no message that allows us to understand if the book has been inserted correctly.
2.  The list of books does not update at the end of the insertion task.

## Add Notification Alert

We add a new component `LibraryNotificationComponent`:

```bash
# ng generate component modules/library/components/LibraryNotification

CREATE src/app/modules/library/components/library-notification/library-notification.component.scss (0 bytes)
CREATE src/app/modules/library/components/library-notification/library-notification.component.html (35 bytes)
CREATE src/app/modules/library/components/library-notification/library-notification.component.spec.ts (684 bytes)
CREATE src/app/modules/library/components/library-notification/library-notification.component.ts (270 bytes)
```

Now we create a new interface to manage the notification messages.

```bash
# ng generate interface  modules/library/models/LibraryNotification

CREATE src/app/modules/library/models/library-notification.ts (41 bytes)
```

Update `LibraryNotification` interface as follow:

```typescript
export interface LibraryNotification {
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number; // Duration in milliseconds
}
```

Generate a new service `LibraryNotificationService`:

```bash
# ng generate service  modules/library/services/LibraryNotification

CREATE src/app/modules/library/services/library-notification.service.spec.ts (423 bytes)
CREATE src/app/modules/library/services/library-notification.service.ts (148 bytes)
```

Now, edt service as follow:

```typescript
import { BehaviorSubject, Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { LibraryNotification } from "../models/library-notification";

@Injectable({
  providedIn: "root",
})
/**
 * Service for managing and emitting library notifications.
 *
 * This service uses a BehaviorSubject to hold and update a list of LibraryNotification objects.
 * It provides methods to add, retrieve, and remove notifications, and exposes an observable
 * stream of notifications for components to subscribe to.
 */
export class LibraryNotificationService {
  private notification_list$: BehaviorSubject<LibraryNotification[]> = new BehaviorSubject<LibraryNotification[]>([]);

  notification_list: Observable<LibraryNotification[]> = this.notification_list$.asObservable();

  constructor() {}

  /**
   * Adds a new notification to the list and emits the updated array.
   * @param notification - The notification to add.
   */
  notify(notification: LibraryNotification) {
    // console.log('Notification:', notification);
    this.notification_list$.next([...this.notification_list$.value, notification]);
  }

  /**
   * Retrieves the first notification from the notification stream.
   * @returns {LibraryNotification} The first notification in the stream.
   */
  getNotification(): LibraryNotification {
    return this.notification_list$.value[0];
  }

  /**
   * Removes a notification from the list and emits the updated array.
   * @param notification - The notification to remove.
   */
  removeNotification(notification: LibraryNotification) {
    const notifications = this.notification_list$.value.filter((n) => n !== notification);
    this.notification_list$.next(notifications);
  }
}
```

The selected code is a service written in TypeScript for an Angular application. It's designed to manage and emit notifications within a library. Let's break down the code section by section:

**1. Imports:**

```typescript
import { BehaviorSubject, Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { LibraryNotification } from "../models/library-notification";
```

- `BehaviorSubject` and `Observable` from `rxjs`: These are part of the Reactive Extensions for JavaScript (RxJS) library, which is heavily used in Angular for handling asynchronous data streams. `BehaviorSubject` is a type of `Observable` that holds a current value and emits it to new subscribers.
- `Injectable` from `@angular/core`: This decorator marks the class as a service that can be injected into other components or services using Angular's dependency injection system.
- `LibraryNotification` from `'../models/library-notification'`: This imports a custom type or class definition for a notification object. It's assumed that `LibraryNotification` is defined in a separate file and has properties relevant to the notification (e.g., message, type, etc.).

**2. `@Injectable` Decorator:**

```typescript
@Injectable({
  providedIn: 'root',
})
```

- `@Injectable`: As mentioned above, this marks the class as available for dependency injection.
- `providedIn: 'root'`: This configures the service to be a singleton, meaning Angular will create only one instance of this service for the entire application. It's available at the root injector level.

**3. Class Definition: `LibraryNotificationService`**

```typescript
export class LibraryNotificationService {
  // ... class members ...
}
```

- This defines the service class itself. The `export` keyword makes it available for use in other parts of the application.

**4. `notification_list$` (BehaviorSubject):**

```typescript
private notification_list$: BehaviorSubject<LibraryNotification[]> =
    new BehaviorSubject<LibraryNotification[]>([]);
```

- `private notification_list$: BehaviorSubject<LibraryNotification[]>`: This declares a private `BehaviorSubject` named `notification_list$`.
  - `BehaviorSubject<LibraryNotification[]>`: It's designed to hold an array of `LibraryNotification` objects. The `$` suffix is a convention to indicate that this is an Observable.
  - `new BehaviorSubject<LibraryNotification[]>([])`: It's initialized with an empty array (`[]`), meaning the initial value of the notification stream is an empty list of notifications.

**5. `notification_list` (Observable):**

```typescript
notification_list: Observable<LibraryNotification[]> = this.notification$.asObservable();
```

- `notification_list: Observable<LibraryNotification[]>`: This declares a public `Observable` named `notification_list`.
  - `this.notification_list$.asObservable()`: It's created by calling `.asObservable()` on the `notification_list$` BehaviorSubject. This returns a read-only Observable that components can subscribe to. Subscribers will receive updates whenever the `notification_list$` BehaviorSubject emits a new value. Critically, components can't directly call `.next()` on this `Observable` to emit new values; only the service can do that through the `notification_list$` BehaviorSubject.

**6. `constructor()`:**

```typescript
constructor() {}
```

- This is the constructor of the service. It's currently empty, but you could inject other services here if this service needed to depend on them.

**7. `notify()` Method:**

```typescript
notify(notification: LibraryNotification) {
    // console.log('Notification:', notification);
    this.notification_list$.next([...this.notification_list$.value, notification]);
  }
```

- `notify(notification: LibraryNotification)`: This method is used to add a new notification to the stream.
  - `this.notification_list$.next([...this.notification_list$.value, notification])`: This is the core logic for emitting a new notification.
    - `this.notification_list$.value`: This gets the current array of notifications from the `BehaviorSubject`.
    - `[...this.notification_list$.value, notification]`: This uses the spread operator (`...`) to create a new array containing all the existing notifications plus the new `notification` added to the end. **Important:** This creates a _new_ array, which is crucial for change detection in Angular. If you were to modify the existing array directly, Angular might not detect the change and update the UI.
    - `this.notification_list$.next(...)`: This emits the new array to all subscribers of the `notification_list` Observable.

**8. `getNotification()` Method:**

```typescript
getNotification(): LibraryNotification {
    return this.notification_list$.value[0];
  }
```

- `getNotification(): LibraryNotification`: This method retrieves the _first_ notification from the current array of notifications.
  - `return this.notification_list$.value[0]`: It accesses the first element (index 0) of the `notification_list$.value` array and returns it.
  - **Important:** This method has a potential issue: If the `notification_list$.value` array is empty, accessing index 0 will result in an error (`undefined`). A safer implementation would include a check to ensure the array is not empty before attempting to access the first element.

**9. `removeNotification()` Method:**

```typescript
removeNotification(notification: LibraryNotification) {
    const notifications = this.notification$.value.filter(
      (n) => n !== notification
    );
    this.notification_list$.next(notifications);
  }
```

- `removeNotification(notification: LibraryNotification)`: This method removes a specific notification from the stream.
  - `this.notification_list$.value.filter((n) => n !== notification)`: This uses the `filter` method to create a _new_ array containing only the notifications that are _not_ equal to the `notification` being removed. It uses strict equality (`!==`) for comparison.
  - `this.notification_list$.next(notifications)`: This emits the new filtered array to all subscribers of the `notification` Observable.

**Key Concepts and Potential Improvements:**

- **Immutability:** The service correctly uses immutable operations (spread operator and `filter`) to create new arrays when adding or removing notifications. This is important for change detection in Angular and helps prevent unexpected side effects.
- **RxJS:** The use of `BehaviorSubject` and `Observable` allows for a reactive approach to managing notifications. Components can subscribe to the `notification` Observable and automatically receive updates whenever the notification list changes.
- **Error Handling:** The `getNotification()` method should include error handling to prevent errors when the notification array is empty. Consider returning `undefined` or throwing an error.
- **Notification IDs:** For more robust notification management, especially when removing notifications, consider adding a unique ID to each `LibraryNotification` object. This would allow you to remove specific notifications based on their ID, rather than relying on object equality, which can be problematic.
- **Alternative to `BehaviorSubject`:** Depending on the specific requirements, a `Subject` or `ReplaySubject` might be more appropriate than a `BehaviorSubject`. A `Subject` doesn't hold a current value, while a `ReplaySubject` can replay a certain number of past emissions to new subscribers.

Now we update `LibraryNotification` component as follow

```typescript
import { Component, OnDestroy, OnInit } from "@angular/core";
import { LibraryNotificationService } from "../../services/library-notification.service";
import { LibraryNotification } from "../../models/library-notification";
import { Subject, takeUntil } from "rxjs";
import { NgClass, NgIf } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatDividerModule } from "@angular/material/divider";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressBarModule } from "@angular/material/progress-bar";

@Component({
  selector: "app-library-notification",
  imports: [NgIf, NgClass, MatIconModule, MatDividerModule, MatButtonModule, MatProgressBarModule],
  templateUrl: "./library-notification.component.html",
  styleUrl: "./library-notification.component.scss",
})
/**
 * `LibraryNotificationComponent` is responsible for displaying and managing library notifications.
 * It subscribes to the `LibraryNotificationService` to receive notifications and displays them to the user.
 * The component automatically removes notifications after a specified duration.
 * It also provides a method to manually close notifications.
 *
 * Implements `OnInit` and `OnDestroy` lifecycle hooks for initialization and cleanup.
 */
export class LibraryNotificationComponent implements OnInit, OnDestroy {
  /**
   * The `notification` property holds the current notification object.
   * It is initialized to null, indicating that there is no notification by default.
   *
   * @type {LibraryNotification | undefined}
   */
  notification: LibraryNotification | undefined;
  private destroyStream$ = new Subject<void>();

  constructor(private readonly libraryNotificationService: LibraryNotificationService) {}
  /**
   * The `ngOnInit` lifecycle hook is called after the component has been initialized.
   * It is used to perform any necessary initialization tasks, such as subscribing
   * to services or fetching data.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    console.log("LibraryNotificationComponent initialized");
    this.events();
  }

  /**
   * @description This method subscribes to the notification stream from the library notification service.
   * When notifications are received, it updates the component's notification property and sets a timeout to remove the notification after its specified duration.
   * If there are no notifications, it clears the component's notification property.
   * The subscription is automatically unsubscribed when the component is destroyed.
   * @async
   * @returns {Promise<void>}
   */
  async events() {
    this.libraryNotificationService.notification_list.pipe(takeUntil(this.destroyStream$)).subscribe(async (notifications) => {
      if (notifications.length > 0) {
        const notification = this.libraryNotificationService.getNotification();
        this.notification = notification;
        if (this.notification) {
          await new Promise((resolve) =>
            setTimeout(() => {
              this.libraryNotificationService.removeNotification(notification);
              resolve(undefined);
            }, notification.duration)
          );
        }
      } else {
        this.notification = undefined;
      }
    });
  }

  /**
   * Closes the current notification by removing it from the library notification service.
   * This function checks if a notification exists and then calls the service to remove it.
   */
  closeNotification() {
    if (this.notification) {
      this.libraryNotificationService.removeNotification(this.notification);
    }
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * It completes the `destroyStream$` Subject, signaling all subscribers to unsubscribe.
   */
  ngOnDestroy() {
    this.destroyStream$.complete();
  }
}
```

### Explanation:

- **Imports:** The code imports necessary modules from Angular core, RxJS, Angular common, and Angular Material. These modules provide functionalities for creating components, handling asynchronous operations, and using pre-built UI elements.
- **Component Decorator:** The `@Component` decorator is used to define the component's metadata, such as its selector, template URL, style URL, and any required modules.
- **Class Definition:** The `LibraryNotificationComponent` class is defined, implementing the `OnInit` and `OnDestroy` interfaces.
- **Properties:**
  - `notification`: This property holds the current notification object of type `LibraryNotification` or `undefined`.
  - `destroyStream$`: This is a `Subject` used to manage the component's lifecycle and unsubscribe from observables when the component is destroyed.
- **Constructor:** The constructor injects the `LibraryNotificationService`, which is used to manage the library notifications.
- **ngOnInit:** This lifecycle hook is called when the component is initialized. It calls the `events()` method to subscribe to the notification stream.
- **events():** This method subscribes to the `notification_list` stream from the `LibraryNotificationService`. When notifications are received, it updates the component's `notification` property and sets a timeout to remove the notification after its specified duration.
- **closeNotification():** This method is called when the user manually closes the notification. It removes the current notification from the `LibraryNotificationService`.
- **ngOnDestroy:** This lifecycle hook is called when the component is destroyed. It completes the `destroyStream$` Subject, signaling all subscribers to unsubscribe and prevent memory leaks.

In essence, this component is designed to display library notifications, manage their display duration, and allow users to manually close them. It utilizes Angular's component lifecycle hooks and RxJS observables to handle asynchronous operations and manage the component's state.

```html
<div *ngIf="notification" [ngClass]="notification.type" class="notification">
  <div class="notification-header">
    <ng-container *ngIf="notification.type === 'error'">
      <mat-icon>error</mat-icon>
    </ng-container>
    <ng-container *ngIf="notification.type === 'success'">
      <mat-icon>check_circle</mat-icon>
    </ng-container>
    <ng-container *ngIf="notification.type === 'info'">
      <mat-icon>info</mat-icon>
    </ng-container>
    <ng-container *ngIf="notification.type === 'warning'">
      <mat-icon>warning</mat-icon>
    </ng-container>
    &nbsp;
    <span>{{ notification.type }}</span>
    <button class="close-btn" mat-icon-button (click)="closeNotification()">
      <mat-icon>close</mat-icon>
    </button>
  </div>
  <mat-divider></mat-divider>
  <div class="notification-content">
    <div [innerHTML]="notification.message"></div>
  </div>
  <mat-progress-bar mode="indeterminate"></mat-progress-bar>
</div>
```

The provided code snippet is an Angular template that displays a notification message to the user. Here's a breakdown:

- **`*ngIf="notification"`**: This directive checks if the `notification` object exists. If it does, the entire notification container is rendered; otherwise, it's hidden.
- **`[ngClass]="notification.type"`**: This dynamically adds a CSS class to the main `div` based on the `notification.type` property (e.g., 'error', 'success', 'info', 'warning'). This allows you to style the notification based on its type.
- **`class="notification"`**: This is a standard CSS class to style the notification container.
- **`notification-header`**: This `div` contains the header of the notification, including an icon, the notification type, and a close button.
- **`*ngIf="notification.type === 'error'"` (and similar for other types)**: These directives conditionally render a `mat-icon` (from Angular Material) based on the `notification.type`. Each type gets a different icon (error, check_circle, info, warning).
- **`&nbsp;`**: This adds a non-breaking space for visual separation between the icon and the notification type text.
- **`<span>{{ notification.type }}</span>`**: This displays the type of notification as text.
- **`(click)="closeNotification()"`**: This binds the click event of the close button to the `closeNotification()` method in the component, allowing the user to dismiss the notification.
- **`<mat-divider>`**: This is an Angular Material component that displays a horizontal line to visually separate the header from the content.
- **`notification-content`**: This `div` contains the actual notification message.
- **`<div>{{ notification.message }}</div>`**: This displays the notification message.
- **`<mat-progress-bar mode="indeterminate">`**: This is an Angular Material progress bar that indicates an ongoing process. `mode="indeterminate"` means the progress bar will show a looping animation without a specific value.

In essence, this template creates a reusable notification component that can display different types of messages with appropriate styling and icons. The `notification` object likely contains properties like `type` (e.g., 'error', 'success') and `message` (the text to display). The `closeNotification()` method would handle removing the `notification` object, thus hiding the notification.

Finally, we update `style.scss`:

```scss
@use "@angular/material" as mat;

:root {
  @include mat.divider-overrides(
    (
      color: white,
    )
  );
  @include mat.progress-bar-overrides(
    (
      active-indicator-color: rgb(188, 180, 180),
      track-color: white,
    )
  );
}

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

.library h2 {
  display: inline-block;
  text-align: left;
  color: #333;
  width: 200px;
}

.search-form-field {
  float: right;
  width: 250px;
}

.library-footer {
  margin: 20px 0 0 0;
  width: 100%;
  text-align: right;
}

.full-width {
  width: 100%;
  margin-top: 1rem;
}

/* Ensure mat-dialog-content has enough space */
mat-dialog-content {
  padding-top: 20px;
}

.notification {
  position: fixed;
  bottom: 1em;
  right: 1em;
  width: 300px;
  padding: 20px;
  background-color: #f44336;
  color: white;
  z-index: 100000;
  border-radius: 10px;
  border: 1px solid black;
  box-shadow: 0 2px 4px 0x0c0c0c85;
  transition: opacity 0.3s ease-in-out;
}
.notification.success {
  background-color: #4caf50;
}
.notification.error {
  background-color: #f44336;
}
.notification.info {
  background-color: #2196f3;
}
.notification.warning {
  background-color: #ffaa29;
}

.notification-header {
  font-weight: bold;
  font-size: 1.2em;
  display: flex;
  height: 30px;
  text-shadow: 1px 1px 1px #0c0c0c85;
}

.notification-header .close-btn {
  top: 5px;
  right: 5px;
  cursor: pointer;
  position: absolute;
  color: white;
}

.notification-header .close-btn:hover {
  color: white;
}

.notification-content {
  margin: 1em 0;
  min-height: 50px;
  text-shadow: 1px 1px 1px #0c0c0c85;
}
```

Finally, we need to add `<app-library-notification></app-library-notification>` in `app.component.html` template:

```html
<h1>{{ title }}</h1>

<div class="library">
  <app-library></app-library>
  <router-outlet></router-outlet>
</div>
<app-library-notification></app-library-notification>
```

Now we can update `onSubmit()` method in `AddNewBookComponent` to manage notification:

```typescript
  /**
   * Handles the form submission. If the form is valid, it formats the data,
   * calls the library service to create the book, and closes the dialog on success.
   */
  onSubmit(): void {
    console.log('Form submitted:', this.addBookForm.value);
    if (this.addBookForm.valid) {
      // Ensure date is formatted correctly if needed by the API (e.g., YYYY-MM-DD)
      const formattedDate = this.formatDate(
        this.addBookForm.value.publication_date
      );

      const bookRequest: BookRequest = {
        title: this.addBookForm.value.title,
        author: this.addBookForm.value.author.id,
        publication_date: formattedDate,
      };

      const bookData: LibraryBooksCreateRequestParams = {
        bookRequest: bookRequest,
      };

      this.libraryService.libraryBooksCreate(bookData).subscribe({
        next: (response) => {
          console.log('Book added successfully', response);
          this.libraryNotificationService.notify({
            message: 'Book added successfully',
            type: 'success',
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          const errorMessage = error?.error || {};

          let errorMessageString = '<br><br>';

          for (const key in errorMessage) {
            errorMessageString += `<strong>${key}</strong>: ${errorMessage[key][0]}<br><br>`;
          }

          // Handle error response
          this.libraryNotificationService.notify({
            message: 'Error adding book \n' + errorMessageString,
            type: 'error',
            duration: 3000,
          });
        },
      });
    } else {
      this.addBookForm.markAllAsTouched();
    }
  }
```

**Explanation:**

1.  **`this.libraryService.libraryBooksCreate(bookData).subscribe({ ... });`**

    - This line initiates the process of creating a new book.
    - `this.libraryService.libraryBooksCreate(bookData)`: This part calls a method (`libraryBooksCreate`) on a `libraryService` object. It passes `bookData` as an argument, which presumably contains the information needed to create the new book (title, author, etc.). This method likely returns an Observable (from RxJS).
    - `.subscribe({...})`: This is the crucial part that handles the asynchronous nature of the API call. `subscribe` is used to listen for the results of the `libraryBooksCreate` method (the Observable). It takes an object with `next` and `error` functions.

2.  **`next: (response) => { ... }`**

    - This function is executed if the API call is successful.
    - `console.log('Book added successfully', response);`: Logs a success message to the console, along with the API response data.
    - `this.libraryNotificationService.notify({ ... });`: Calls a `notify` method on a `libraryNotificationService` to display a success message to the user.
      - `message`: The message to display ("Book added successfully").
      - `type`: The type of notification ("success"). This might determine the styling of the notification (e.g., green color).
      - `duration`: How long the notification should be displayed (3000 milliseconds = 3 seconds).
    - `this.dialogRef.close(true);`: Closes a dialog or modal window, passing `true` to indicate that the operation was successful.

3.  **`error: (error) => { ... }`**

    - This function is executed if the API call fails.
    - `const errorMessage = error?.error || {};`: Extracts the error message from the `error` object. It uses the optional chaining operator (`?.`) to safely access the `error` property, and the `|| {}` to provide a default empty object if `error?.error` is null or undefined.
    - The code then iterates through the keys of the `errorMessage` object and constructs an HTML string (`errorMessageString`) to display the error messages in a formatted way. It assumes the error message is an object where each key represents a field with an error, and the value is an array containing the error message for that field.
    - `this.libraryNotificationService.notify({ ... });`: Displays an error notification to the user.
      - `message`: The error message to display. It includes the formatted `errorMessageString` to show detailed error information.
      - `type`: The type of notification ("error"). This might determine the styling of the notification (e.g., red color).
      - `duration`: How long the notification should be displayed (3000 milliseconds).

**In Summary:**

The code handles the asynchronous creation of a book via an API. It displays a success notification if the book is created successfully and an error notification if the creation fails, including detailed error messages from the API. The dialog is closed after either a success or failure.

Now, we can add the book `Hunger Games` by `Suzanne Collins` published on `14th September 2008`.

![Notification Error](/docs/images/part13_6.png)

We correctly obtained an error related to the fact that the author does not yet exist in our database. This functionality will be addressed later; however, we successfully tested our notification.

## Refresh Books List

Generate new service:

```bash
# ng generate service  modules/library/services/LibraryBooksListUpdate
CREATE src/app/modules/library/services/library-books-list-update.service.spec.ts (440 bytes)
CREATE src/app/modules/library/services/library-books-list-update.service.ts (151 bytes)
```

Add as follow:

```typscript
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LibraryBooksListUpdateService {
  private booksListUpdate: Subject<void> = new Subject<void>();
  booksListUpdate$ = this.booksListUpdate.asObservable();

  constructor() {}

  updateBooksList() {
    this.booksListUpdate.next();
  }
}
```

**Explanation:**

- **Imports:**
  - `Injectable` from `@angular/core`: This decorator marks the class as one that can be injected with dependencies.
  - `Subject` from `rxjs`: A `Subject` is a special type of Observable that allows values to be multicasted to many Observers. It's used here as a way to signal updates to the books list.
- **`@Injectable` Decorator:**
  - `@Injectable({ providedIn: 'root' })`: This makes the service available throughout the entire application. The `root` setting means Angular will create a single, shared instance of the service.
- **`LibraryBooksListUpdateService` Class:**
  - This service is designed to manage updates to a list of library books.
  - `private booksListUpdate: Subject<void> = new Subject<void>();`:
    - `booksListUpdate` is a private `Subject`. It's of type `void` because we're not sending any specific data with the update, just a notification that an update has occurred.
    - `Subject<void>`: A Subject that doesn't carry any data.
    - `private`: This ensures that only the service itself can directly trigger updates.
  - `booksListUpdate$ = this.booksListUpdate.asObservable();`:
    - `booksListUpdate$` is a public Observable that components can subscribe to.
    - `.asObservable()`: This converts the `Subject` into an `Observable`, preventing external components from directly calling `next()` on the Subject (which would allow them to trigger updates). This enforces the principle that only the service itself should initiate updates.
  - `constructor() {}`: An empty constructor. No dependencies are injected in this example.
  - `updateBooksList() { this.booksListUpdate.next(); }`:
    - This method is the public API for triggering an update to the books list.
    - `this.booksListUpdate.next()`: This emits a notification to all subscribers of the `booksListUpdate$` Observable, signaling that the books list has been updated.

**In essence, this service provides a centralized way to notify components that the library books list has changed, allowing them to refresh their data.**

Update `ngInit()` methos in `BooksListComponent`:

```typescript
  ngOnInit(): void {
    this.getBooks();
    this.searchSubject.pipe(debounceTime(300)).subscribe((searchText) => {
      this.searchText = searchText;
      this.pageIndex = 0;
      this.getBooks();
    });

    this.booksListUpdateService.booksListUpdate$.subscribe(() => {
      this.searchText = '';
      this.pageIndex = 0;
      this.getBooks();
    });
  }
```

- `this.booksListUpdateService.booksListUpdate$.subscribe(() => { ... });`: This subscribes to an observable `booksListUpdate$` from a service called `booksListUpdateService`.
  - `() => { ... }`: This is the callback function that executes when the `booksListUpdate$` observable emits a value.
  - `this.searchText = '';`: It clears the `searchText`, likely to reset the search.
  - `this.pageIndex = 0;`: It resets the `pageIndex` to 0.
  - `this.getBooks();`: It calls the `getBooks` method again to refresh the book list, possibly after an update or modification.

In summary, the `ngOnInit` method initializes the component by fetching books, setting up a debounced search functionality, and subscribing to a book list update service to refresh the list when changes occur.

In `LibraryComponent`update:

```typescript
  openAddBookDialog(): void {
    const dialogRef = this.dialog.open(AddNewBookComponent, {
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      if (result) {
        this.booksListUpdateService.updateBooksList();
        console.log('Dialog result:', result);
      }
    });
  }
```

The `openAddBookDialog` function is responsible for opening a dialog box (likely a modal) that allows the user to add a new book. Let's break it down step by step:

1.  **Opening the Dialog:**

    - `this.dialog.open(AddNewBookComponent, { width: '700px' });`
      - This line uses the `dialog` service (presumably from Angular Material or a similar UI library) to open a dialog.
      - `AddNewBookComponent` is the component that will be displayed inside the dialog. It likely contains the form and logic for adding a new book.
      - `{ width: '700px' }` is a configuration object that sets the width of the dialog to 700 pixels.
      - The `dialog.open` method returns a reference to the opened dialog (`dialogRef`).

2.  **Handling Dialog Closure:**

    - `dialogRef.afterClosed().subscribe((result) => { ... });`
      - This sets up a subscription to the `afterClosed()` observable of the dialog reference. This observable emits a value when the dialog is closed (either by submitting the form or canceling).
      - The `result` parameter inside the `subscribe` callback contains the data passed back from the dialog when it's closed. This could be the new book data, or `undefined` if the dialog was canceled.

3.  **Post-Dialog Logic:**

    - `console.log('The dialog was closed');`
      - A simple console log to indicate that the dialog has been closed.
    - `if (result) { ... }`
      - This checks if the `result` is truthy (i.e., not `null`, `undefined`, or an empty object). This implies that the user likely submitted the form successfully.
    - `this.booksListUpdateService.updateBooksList();`
      - If a `result` exists, this line calls a method on `booksListUpdateService` to refresh the list of books. This likely fetches the updated list from a backend or updates the local list with the newly added book.
    - `console.log('Dialog result:', result);`
      - Logs the `result` to the console, allowing you to inspect the data returned from the dialog.

In essence, this function opens a dialog, and when the dialog is closed, it updates the book list if the dialog returned a valid result.

## Add New Author

Now udpate our `AddNewBookComponent` to manage the provisioning of new authors. Let's create a new component called `AddNewAuthorComponent`:

```bash
# ng generate component modules/library/components/AddNewAuthor
CREATE src/app/modules/library/components/add-new-author/add-new-author.component.scss (0 bytes)
CREATE src/app/modules/library/components/add-new-author/add-new-author.component.html (29 bytes)
CREATE src/app/modules/library/components/add-new-author/add-new-author.component.spec.ts (636 bytes)
CREATE src/app/modules/library/components/add-new-author/add-new-author.component.ts (245 bytes)
```

Update `add-new-author.component.html` as follow:

```html
<mat-card class="add-author-card">
  <form class="add-author-form" [formGroup]="addAuthorForm">
    <mat-card-header>
      <mat-card-title>Add New Author</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>First Name</mat-label>
        <input formControlName="first_name" matInput placeholder="First Name" required />
        <mat-error *ngIf="addAuthorForm.get('first_name')?.hasError('required')"> First Name is required </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Last Name</mat-label>
        <input formControlName="last_name" matInput placeholder="Last Name" required />
        <mat-error *ngIf="addAuthorForm.get('last_name')?.hasError('required')"> Last Name is required </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Cityzenship</mat-label>
        <input formControlName="citizenship" matInput placeholder="Cityzenship" required />
        <mat-error *ngIf="addAuthorForm.get('citizenship')?.hasError('required')"> Cityzenship </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Date of Birth</mat-label>
        <input matInput formControlName="date_of_birth" [matDatepicker]="picker_birth" placeholder="Choose a date" required />
        <mat-datepicker-toggle matSuffix [for]="picker_birth"></mat-datepicker-toggle>
        <mat-datepicker #picker_birth></mat-datepicker>
        <mat-error *ngIf="addAuthorForm.get('date_of_birth')?.hasError('required')"> Date of Birth is required </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Date of Death</mat-label>
        <input matInput formControlName="date_of_death" [matDatepicker]="picker_death" placeholder="Choose a date" />
        <mat-datepicker-toggle matSuffix [for]="picker_death"></mat-datepicker-toggle>
        <mat-datepicker #picker_death></mat-datepicker>
      </mat-form-field>
    </mat-card-content>

    <mat-card-actions>
      <button (click)="onCancel()" mat-button type="button">Cancel</button>
      <button mat-raised-button color="primary" type="submit" (click)="onSubmit()" [disabled]="!addAuthorForm.valid">Save</button>
    </mat-card-actions>
  </form>
</mat-card>
```

The code is an Angular component template that defines a form for adding a new author. It uses Angular Material components for the UI elements and defines a reusable form component for adding author information, leveraging Angular Material for a consistent and visually appealing user interface. The form includes validation to ensure that required fields are filled in before submission.

In our `style.scss` we add:

```scss
.add-author-card {
  margin-top: 20px;
}
```

Finally , we update `add-new-author.component.ts` as follow:

```typescript
import { AuthorRequest } from "./../../../core/api/v1/model/authorRequest";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";

import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, MatNativeDateModule, NativeDateAdapter } from "@angular/material/core";
import { FormGroup, Validators, ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { NgIf } from "@angular/common";
import { Author, LibraryAuthorsCreateRequestParams, LibraryBooksCreateRequestParams, LibraryService } from "../../../core/api/v1";
import { LibraryNotificationService } from "../../services/library-notification.service";

@Component({
  selector: "app-add-new-author",
  templateUrl: "./add-new-author.component.html",
  styleUrl: "./add-new-author.component.scss",
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, ReactiveFormsModule, NgIf],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
  ],
})
export class AddNewAuthorComponent implements OnInit {
  addAuthorForm!: FormGroup;
  @Output() authorAdded: EventEmitter<Author> = new EventEmitter();
  @Output() authorCancelled: EventEmitter<void> = new EventEmitter();

  constructor(private fb: FormBuilder, private readonly libraryService: LibraryService, private readonly libraryNotificationService: LibraryNotificationService) {}

  ngOnInit() {
    this.addAuthorForm = this.fb.group({
      first_name: ["", Validators.required],
      last_name: ["", Validators.required],
      citizenship: ["", Validators.required],
      date_of_birth: ["", Validators.required],
      date_of_death: [""],
    });
  }

  onSubmit() {
    if (this.addAuthorForm.valid) {
      const authorValue: Author = this.addAuthorForm.value;

      let AuthorRequest: AuthorRequest = {
        first_name: authorValue.first_name,
        last_name: authorValue.last_name,
        citizenship: authorValue.citizenship,
        date_of_birth: this.formatDate(this.addAuthorForm.value.date_of_birth),
        date_of_death: this.addAuthorForm.value.date_of_death ? this.formatDate(this.addAuthorForm.value.date_of_death) : undefined,
      };

      const params: LibraryAuthorsCreateRequestParams = {
        authorRequest: AuthorRequest,
      };

      this.libraryService.libraryAuthorsCreate(params).subscribe({
        next: (author) => {
          console.log("Author added successfully:", author);
          this.libraryNotificationService.notify({
            message: "Author added successfully",
            type: "success",
            duration: 3000,
          });

          this.authorAdded.emit(author);
          this.addAuthorForm.reset();
        },
        error: (error) => {
          console.error("Error adding author:", error);
          const errorMessage = error?.error || {};

          let errorMessageString = "<br><br>";

          for (const key in errorMessage) {
            errorMessageString += `<strong>${key}</strong>: ${errorMessage[key][0]}<br><br>`;
          }

          // Handle error response
          this.libraryNotificationService.notify({
            message: "Error adding author \n" + errorMessageString,
            type: "error",
            duration: 3000,
          });
        },
      });
    } else {
      this.addAuthorForm.markAllAsTouched();
      console.log("Form is invalid");
    }
  }

  onCancel() {
    this.authorCancelled.emit();
    this.addAuthorForm.reset();
  }

  /**
   * Helper function to format a Date object into 'YYYY-MM-DD' string format.
   * @param date - The date to format.
   * @returns The formatted date string.
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }
}
```

The provided code defines an Angular component named `AddNewAuthorComponent`, which is designed to handle the creation of new authors in a library system. This component uses Angular Material for its UI elements and Angular Reactive Forms for form handling and validation.

### Key Features:

1. **Form Initialization**:

   - The `addAuthorForm` is initialized in the `ngOnInit` lifecycle hook using `FormBuilder`. It contains fields for `first_name`, `last_name`, `citizenship`, `date_of_birth`, and `date_of_death`.
   - Validators are applied to ensure that required fields are filled before submission.

2. **Event Emitters**:

   - The component defines two `@Output` properties: `authorAdded` and `authorCancelled`. These emit events when an author is successfully added or the form is canceled, allowing parent components to react accordingly.

   The selected line of code defines an Angular `@Output` property named `authorAdded`. This property is an instance of `EventEmitter`, which is a class provided by Angular to facilitate communication between a child component and its parent component.

   ### Explanation:

   1. **`@Output` Decorator**:

   - The `@Output` decorator marks the `authorAdded` property as an output property of the component. This means that the component can emit events through this property, and parent components can listen for these events using Angular's event binding syntax (e.g., `(authorAdded)="onAuthorAdded($event)"`).

   2. **`EventEmitter`**:

   - The `EventEmitter` is a generic class provided by Angular. In this case, it is parameterized with the `Author` type, indicating that the events emitted by this property will carry data of type `Author`.

   3. **Purpose**:

   - The `authorAdded` property is used to notify the parent component when a new author has been successfully added. The emitted event will typically include the newly created `Author` object as its payload, allowing the parent component to update its state or perform additional actions (e.g., refreshing a list of authors).

   4. **Initialization**:

   - The `authorAdded` property is initialized as a new instance of `EventEmitter`. This allows the component to call the `emit()` method on this property to send events to the parent component.

   This line of code is part of a child component's API, enabling it to communicate with its parent component. By emitting events through the `authorAdded` property, the child component can inform the parent component about the successful addition of a new author, facilitating seamless interaction between the two components.

3. **Form Submission**:

   - The `onSubmit` method is triggered when the form is submitted. It validates the form and constructs an `AuthorRequest` object with the form data.
   - The `libraryService.libraryAuthorsCreate` method is called to send the data to the backend API. If the request is successful, a success notification is displayed, and the `authorAdded` event is emitted with the newly created author. If the request fails, an error notification is displayed with detailed error messages.

The `AddNewAuthorComponent` provides a user-friendly form with validation, integrates with a backend API for data submission, and uses notifications to inform the user of the operation's success or failure. The use of event emitters ensures that the component can seamlessly communicate with its parent components.

Now we update `AddNewBookComponent` to manage a new author. Updating `Author Field`:

```html
<!-- Author Field -->
<mat-form-field appearance="outline" class="full-width">
  <mat-label>Author</mat-label>
  <input matInput formControlName="author" placeholder="Enter author name" required [matAutocomplete]="auto" />
  <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn">
    @for (author of filteredOptions | async; track author.id) {
    <mat-option [value]="author"> {{ author.first_name }} {{ author.last_name }} </mat-option>
    }
  </mat-autocomplete>
  <mat-hint align="end">
    <strong>
      <a mat-button (click)="toggleNewAuthor()"> @if (!newAuthor) { Add new author } @else { Select existing author } </a>
    </strong>
  </mat-hint>
  <mat-error *ngIf="addBookForm.get('author')?.hasError('required')"> Author is required </mat-error>
</mat-form-field>

<div *ngIf="newAuthor">
  <app-add-new-author (authorCancelled)="onAuthorCancelled()" (authorAdded)="onAuthorAdded($event)"></app-add-new-author>
</div>
```

This code add a button that permit us to show `app-add-new-author` component.

Now, let's add new methos in `.ts`:

```typescript
toggleNewAuthor(): void {
  // Logic to add a new author
  // This could involve opening another dialog or navigating to an author creation page
  console.log('Add new author clicked');
  this.newAuthor = !this.newAuthor; // Toggle the new author form visibility

  if (this.newAuthor) {
    this.authorControl.setValue(''); // Clear the author control value
    this.authorControl.disable(); // Enable the author control when adding a new author
  } else {
    this.authorControl.enable(); // Disable the author control when adding a new author
  }
}

onAuthorCancelled() {
  this.newAuthor = false; // Reset the new author form visibility
  this.authorControl.enable(); // Re-enable the author control
}

onAuthorAdded(author: Author) {
  console.log('Author added:', author);
  this.newAuthor = false; // Reset the new author form visibility
  this.addBookForm.controls['author'].setValue(author);

  this.authorControl.enable(); // Re-enable the author control
}
```

This is the full code of `add-new-book.component.ts`:

```typescript
// src/app/modules/library/components/add-new-book/add-new-book.component.ts
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { Author, BookRequest, LibraryAuthorsListRequestParams, LibraryBooksCreateRequestParams, LibraryService } from "../../../core/api/v1"; // Adjust path as needed
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatAutocompleteModule } from "@angular/material/autocomplete";

import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, MatNativeDateModule, NativeDateAdapter } from "@angular/material/core";
import { CommonModule, NgIf } from "@angular/common";
import { MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions } from "@angular/material/dialog";
import { map, Observable, startWith, switchMap } from "rxjs";
import { LibraryNotificationService } from "../../services/library-notification.service";
import { AddNewAuthorComponent } from "../add-new-author/add-new-author.component";

@Component({
  selector: "app-add-new-book",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatAutocompleteModule,
    AddNewAuthorComponent,
    NgIf,
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
  ],
  templateUrl: "./add-new-book.component.html",
  styleUrls: ["./add-new-book.component.scss"],
})
/**
 * Component for adding a new book to the library.
 *
 * This component provides a form for entering book details, including title, author, and publication date.
 * It features an autocomplete input for selecting authors, which fetches matching authors from the backend as the user types.
 * Upon form submission, the component validates the input, formats the data as required by the API, and sends a request to create the new book.
 * The dialog is closed upon successful creation or cancellation.
 *
 * @remarks
 * - Uses Angular Reactive Forms for form handling and validation.
 * - Integrates with the `LibraryService` to fetch authors and create books.
 * - Utilizes Angular Material Dialog for modal functionality.
 * - Implements an autocomplete feature for author selection.
 *
 * @see LibraryService
 */
export class AddNewBookComponent implements OnInit {
  addBookForm!: FormGroup;
  filteredOptions: Observable<Author[]> | undefined;
  newAuthor = false;
  authorControl = new FormControl("", Validators.required);

  /**
   * Initializes a new instance of the AddNewBookComponent.
   *
   * @param fb - The FormBuilder service used to create and manage reactive forms.
   * @param dialogRef - Reference to the dialog opened for adding a new book.
   * @param libraryService - Service for interacting with the library's data and operations.
   */
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddNewBookComponent>,
    private libraryService: LibraryService,
    private libraryNotificationService: LibraryNotificationService
  ) {}

  /**
   * Initializes the add book form and sets up the filtered options for the author autocomplete.
   *
   * - Creates a reactive form group with controls for title, author, and publication date.
   * - Sets up an observable (`filteredOptions`) that listens to changes in the author input,
   *   and filters the available author options accordingly.
   * - Uses `startWith` to initialize the filter and `switchMap` to handle asynchronous filtering logic.
   */
  ngOnInit(): void {
    this.addBookForm = this.fb.group({
      title: ["", Validators.required],
      author: this.authorControl,
      publication_date: ["", Validators.required],
    });

    this.filteredOptions = this.authorControl.valueChanges.pipe(
      startWith(""),
      switchMap((value) => {
        if (typeof value === "string") {
          return this._filter(value);
        }
        return [[]];
      })
    );
  }

  /**
   * Formats an Author object into a display string.
   *
   * @param author - The Author object to format.
   * @returns The author's full name as a string, or an empty string if the author or first name is not provided.
   */
  displayFn(author: Author): string {
    return author ? author.first_name + " " + author.last_name : "";
  }

  /**
   * Filters authors based on the provided name by querying the library service.
   *
   * @param name - The search string used to filter authors.
   * @returns An Observable emitting an array of Author objects matching the search criteria.
   */
  private _filter(name: string): Observable<Author[]> {
    const params: LibraryAuthorsListRequestParams = {
      search: name,
      pageSize: 3,
    };

    return this.libraryService.libraryAuthorsList(params).pipe(map((data) => (data && Array.isArray(data.results) ? data.results : [])));
  }

  /**
   * Handles the form submission. If the form is valid, it formats the data,
   * calls the library service to create the book, and closes the dialog on success.
   */
  onSubmit(): void {
    console.log("Form submitted:", this.addBookForm.value);

    if (this.addBookForm.valid) {
      // Ensure date is formatted correctly if needed by the API (e.g., YYYY-MM-DD)
      const formattedDate = this.formatDate(this.addBookForm.value.publication_date);

      const bookRequest: BookRequest = {
        title: this.addBookForm.value.title,
        author: this.addBookForm.value.author ? this.addBookForm.value.author.id : null,
        publication_date: formattedDate,
      };

      const bookData: LibraryBooksCreateRequestParams = {
        bookRequest: bookRequest,
      };

      this.libraryService.libraryBooksCreate(bookData).subscribe({
        next: (response) => {
          console.log("Book added successfully", response);
          this.libraryNotificationService.notify({
            message: "Book added successfully",
            type: "success",
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          const errorMessage = error?.error || {};

          let errorMessageString = "<br><br>";

          for (const key in errorMessage) {
            errorMessageString += `<strong>${key}</strong>: ${errorMessage[key][0]}<br><br>`;
          }

          // Handle error response
          this.libraryNotificationService.notify({
            message: "Error adding book \n" + errorMessageString,
            type: "error",
            duration: 3000,
          });
        },
      });
    } else {
      this.addBookForm.markAllAsTouched();
    }
  }

  /**
   * Closes the dialog without submitting the form.
   */
  onCancel(): void {
    this.dialogRef.close(); // Close dialog without passing any data
  }

  /**
   * Helper function to format a Date object into 'YYYY-MM-DD' string format.
   * @param date - The date to format.
   * @returns The formatted date string.
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }

  toggleNewAuthor(): void {
    // Logic to add a new author
    // This could involve opening another dialog or navigating to an author creation page
    console.log("Add new author clicked");
    this.newAuthor = !this.newAuthor; // Toggle the new author form visibility

    if (this.newAuthor) {
      this.authorControl.setValue(""); // Clear the author control value
      this.authorControl.disable(); // Enable the author control when adding a new author
    } else {
      this.authorControl.enable(); // Disable the author control when adding a new author
    }
  }

  onAuthorCancelled() {
    this.newAuthor = false; // Reset the new author form visibility
    this.authorControl.enable(); // Re-enable the author control
  }

  onAuthorAdded(author: Author) {
    console.log("Author added:", author);
    this.newAuthor = false; // Reset the new author form visibility
    this.addBookForm.controls["author"].setValue(author);

    this.authorControl.enable(); // Re-enable the author control
  }
}
```

Finally we can add our "The Hunger Games" book:

![Final Form](/docs/images/part13_7.png)

Before concluding, let's use our `LibraryNotification` class to display a notification in case of an error during the request for the list of books.

Update `getBooks()` method in `BookListComponent` as follow:

```typescript
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

    if (this.searchText !== '') {
      params['search'] = this.searchText;
    }

    this.libraryService.libraryBooksList(params).subscribe({
      next: (data: PaginatedBookList) => {
        console.log(data);
        this.books = data.results || [];
        this.totalBooks = data.total_records || 0;
      },
      error: (err) => {
        const errorMessage = err?.error || {};

        let errorMessageString = '<br><br>' + errorMessage.detail;

        // Handle error response
        this.libraryNotificationService.notify({
          message: 'Error get book list \n' + errorMessageString,
          type: 'error',
          duration: 3000,
        });
      },
    });
  }
```

That's all.
