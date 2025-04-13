# A Full Test Application Using Django and Angular (Part 11) - Angular Material Components

Run the following command to generate a new component called `Library`:

```bash
# ng generate component modules/library/components/Library
CREATE src/app/modules/library/components/library/library.component.scss (0 bytes)
CREATE src/app/modules/library/components/library/library.component.html (22 bytes)
CREATE src/app/modules/library/components/library/library.component.spec.ts (599 bytes)
CREATE src/app/modules/library/components/library/library.component.ts (219 bytes)
```

This will create the following files:

- `library.component.scss` (empty stylesheet)
- `library.component.html` (template file)
- `library.component.spec.ts` (test file)
- `library.component.ts` (TypeScript file)

Now, move the contents of `app.component.html` into `library.component.html`. Replace the contents of `library.component.html` with the following:

```html
<!-- filepath: src/app/modules/library/components/library/library.component.html -->
<h1>{{ title }}</h1>

<h2>Books</h2>
<ul>
  <li *ngFor="let book of books"><strong>{{ book.title }} </strong> by {{ book.author_name }} - {{ book.year }} (<a routerLink="/library/books/{{ book.id }}">details</a>)</li>
</ul>
```

Move the contents of `app.component.ts` into `library.component.ts`. Replace the contents of `library.component.ts` with the following:

```typescript
// filepath: src/app/modules/library/components/library/library.component.ts
import { Component, OnInit } from "@angular/core";
import { Book, LibraryService } from "../../../core/api/v1";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-library",
  imports: [],
  templateUrl: "./library.component.html",
  styleUrl: "./library.component.scss",
})
export class LibraryComponent implements OnInit {
  title = "Library";
  books: Book[] = [];

  constructor(private readonly libraryService: LibraryService) {}

  ngOnInit(): void {
    this.libraryService.libraryBooksList().subscribe({
      next: (data) => {
        this.books = data.results;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
```

Clean the `app.component.ts` code:

```typescript
// filepath: src/app/app.component.ts

import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
/**
 * The `AppComponent` serves as the root component of the Library application.
 * It initializes the application state and interacts with the `LibraryService`
 * to fetch and display a list of books.
 *
 * @implements {OnInit}
 */
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
```

Finally, replace the content of `app.component.html` as follows:

```html
<!-- filepath: src/app/app.component.html -->
<app-library></app-library>
<router-outlet></router-outlet>
```

We can see some dependency errors caused by the use of `standalone` components.

> ### What Are Standalone Components in Angular?
>
> Standalone components in Angular are a feature introduced to simplify the development process by allowing components, directives, and pipes to be self-contained. Unlike traditional Angular components, standalone components do not require inclusion in an Angular module (`NgModule`). Instead, they can directly declare their dependencies, making the application structure more modular and easier to maintain.
>
> #### Key Features of Standalone Components:
>
> - **Self-contained**: They can be used without being declared in an `NgModule`.
> - **Direct Dependency Declaration**: Dependencies like other components, directives, or pipes can be imported directly in the `imports` array of the component's metadata.
> - **Improved Modularity**: They reduce the need for boilerplate code and simplify the application structure.
>
> #### Example of a Standalone Component:
>
> ```typescript
> // filepath: src/app/example/example.component.ts
> import { Component } from "@angular/core";
>
> @Component({
>   selector: "app-example",
>   standalone: true, // Mark the component as standalone
>   template: `<h1>Hello, Standalone Component!</h1>`,
>   styles: [
>     `
>       h1 {
>         color: blue;
>       }
>     `,
>   ],
> })
> export class ExampleComponent {}
> ```
>
> Standalone components are particularly useful for building reusable libraries or simplifying small applications.

To fix the code, we need to import some classes into our code.

In `library.component.ts`, import these classes:

```typescript
// ... code
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-library',
  imports: [NgFor, RouterLink],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
})
// ... code
```

In `app.component.ts`, import:

```typescript
// ... code
import { LibraryComponent } from './modules/library/components/library/library.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LibraryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
// ... code
```

Now, we can run our app.

## Angular Material

Now we use Angular Material ([https://material.angular.io](https://material.angular.io)) to manage the UI of our application.

### What is Angular Material?

Angular Material is a UI component library for Angular that provides a set of pre-built, customizable, and accessible UI components following the Material Design guidelines. It helps developers build consistent and visually appealing user interfaces, enhancing the overall user experience.

### How to Add Angular Material to the `library` Project

Here's a detailed guide on how to add Angular Material to your project:

#### Install Angular Material

Run the following command in your project directory:

```bash
ng add @angular/material

✔ Determining Package Manager
  › Using package manager: npm
✔ Searching for compatible package version
  › Found compatible package version: @angular/material@19.2.7.
✔ Loading package information from registry
✔ Confirming installation
✔ Installing package
✔ Choose a prebuilt theme name, or "custom" for a custom theme: Azure/Blue
[Preview: https://material.angular.io?theme=azure-blue]
✔ Set up global Angular Material typography styles? No
UPDATE package.json (1374 bytes)
✔ Packages installed successfully.
UPDATE angular.json (3071 bytes)
UPDATE src/index.html (528 bytes)
UPDATE src/styles.scss (705 bytes)
```

This command will:

- **Install Angular Material, Angular CDK (Component Dev Kit), and Angular Animations**: These are the core dependencies required for using Angular Material components.
- **Ask you to choose a pre-built theme or set up a custom theme**: Angular Material comes with several pre-built themes (e.g., Indigo/Pink, Deep Purple/Amber) that you can choose from. You can also create a custom theme to match your application's branding.
- **Configure your project with the necessary dependencies and settings**: The `ng add` command automatically updates your `package.json`, `angular.json`, and other configuration files to include the required dependencies and settings for Angular Material.

#### Use Angular Material Components in Your Templates

Now you can use Angular Material components in your templates. For example, to add a Material button:

```html
<!-- filepath: src/app/app.component.html (or relevant template) -->
<button mat-raised-button color="primary">Click me!</button>
```

Here, `mat-raised-button` is a directive that styles the button according to Material Design, and `color="primary"` applies the primary color from your selected theme.

**Note:** For standalone components, ensure you import `MatButtonModule` in the component's `imports` array where you are using the `mat-raised-button`.

To use the `mat-raised-button` in `app.component.ts`, you need to import the `MatButtonModule`:

```typescript
// filepath: src/app/app.component.ts
import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { LibraryComponent } from "./modules/library/components/library/library.component";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, LibraryComponent, MatButtonModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
```

#### Configure a Theme (Optional)

To customize the look and feel of your application, you can configure a theme for Angular Material. If you selected a pre-built theme during the installation process, it is already applied to your project. However, you can create a custom theme by following these steps:

1. **Create a Custom Theme File**:
   Create a new SCSS file (e.g., `src/styles/custom-theme.scss`) and define your custom theme:

```scss
@use "@angular/material" as mat;

$primary: mat.define-palette(mat.$indigo-palette);
$accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);
$warn: mat.define-palette(mat.$red-palette);

$theme: mat.define-light-theme(
  (
    color: (
      primary: $primary,
      accent: $accent,
      warn: $warn,
    ),
  )
);

@include mat.all-component-themes($theme);
```

2. **Update `angular.json`**:
   Add the custom theme file to the `styles` array in your `angular.json` file:

```json
"styles": [
  "src/styles.scss",
  "src/styles/custom-theme.scss"
]
```

3. **Use the Custom Theme**:
   The custom theme will now be applied to all Angular Material components in your application.

By configuring a theme, you can ensure that your application aligns with your brand's design guidelines while leveraging the power of Angular Material.

By following these steps and examples, you can easily integrate Angular Material into your `library` project and start using its powerful and customizable UI components.

## Library Books Pagination

Now we will use `<mat-paginator` ([https://material.angular.io/components/paginator/overview](https://material.angular.io/components/paginator/overview)) Angular Material component to iterate our pagination in the frontend application.

Let's create a new method `getBooks()`. This method will be called when we need to reload the books list.

```typescript
import { Component, OnInit } from "@angular/core";
import { Book, LibraryService, PaginatedBookList, LibraryBooksListRequestParams } from "../../../core/api/v1";
import { NgFor } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-library",
  imports: [NgFor, RouterLink],
  templateUrl: "./library.component.html",
  styleUrl: "./library.component.scss",
})
export class LibraryComponent implements OnInit {
  books: Book[] = [];
  totalBooks = 0;
  pageSize = 5;
  pageIndex = 0;

  constructor(private readonly libraryService: LibraryService) {}

  ngOnInit(): void {
    this.getBooks();
  }

  getBooks() {
    const params: LibraryBooksListRequestParams = {
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
    };

    this.libraryService.libraryBooksList(params).subscribe({
      next: (data: PaginatedBookList) => {
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

This code defines an Angular component called `LibraryComponent` that displays a paginated list of books fetched from a library service.

**Imports:**

- `Component` and `OnInit` from `@angular/core` are used for defining the component and its lifecycle.
- `Book`, `LibraryService`, `PaginatedBookList`, and `LibraryBooksListRequestParams` from `../../../core/api/v1` are types and services related to the library API. It's assumed that this path points to a file defining these interfaces and the service.
- `NgFor` from `@angular/common` is used for iterating over the books in the template.
- `RouterLink` from `@angular/router` is used for creating links to book details (presumably).

**Component Decorator:**

- `@Component` is a decorator that defines the component's metadata:
  - `selector`: `app-library` is the selector used to include this component in other templates.
  - `imports`: Specifies the modules/components required by this component. `NgFor` is essential for rendering lists, and `RouterLink` for navigation.
  - `templateUrl`: `./library.component.html` specifies the HTML template file for this component.
  - `styleUrl`: `./library.component.scss` specifies the SCSS stylesheet file for this component.

**Component Class:**

- `LibraryComponent` is the main class for the component.
  - `books`: `Book[]` is an array to store the books fetched from the service. It's initialized as an empty array.
  - `totalBooks`: `number` stores the total number of books in the library (used for pagination).
  - `pageSize`: `number` defines the number of books to display per page (default is 5).
  - `pageIndex`: `number` represents the current page number (starts from 0).

**Constructor:**

- `constructor(private readonly libraryService: LibraryService)` injects the `LibraryService` into the component. `LibraryService` is presumably responsible for making API calls to fetch book data. The `readonly` keyword ensures that the `libraryService` can only be initialized in the constructor.

**`ngOnInit` Lifecycle Hook:**

- `ngOnInit(): void` is a lifecycle hook that is called after the component is initialized. It calls the `getBooks()` method to fetch the initial list of books.

**`getBooks` Method:**

- `getBooks()` is responsible for fetching books from the `LibraryService`.
  - It creates a `params` object of type `LibraryBooksListRequestParams` to hold the pagination parameters. Note that the `page` parameter is `this.pageIndex + 1` because the API likely expects page numbers to start from 1, while `pageIndex` in the component starts from 0.
  - It calls the `libraryService.libraryBooksList(params)` method to make the API request.
  - It subscribes to the Observable returned by `libraryBooksList()` to handle the response.
    - `next`: This function is called when the API request is successful. It receives the `PaginatedBookList` data.
      - `console.log(data)`: Logs the entire response data to the console (useful for debugging).
      - `this.books = data.results || []`: Assigns the `results` array from the response to the `this.books` array. The `|| []` is a safety check to ensure that `this.books` is always an array, even if `data.results` is null or undefined.
      - `this.totalBooks = data.total_records || 0`: Assigns the `total_records` from the response to the `this.totalBooks` property. The `|| 0` is a safety check to ensure that `this.totalBooks` is always a number, even if `data.total_records` is null or undefined.
    - `error`: This function is called if the API request fails. It logs the error to the console.

In summary, this component fetches a paginated list of books from a library API and displays them in a template. It handles pagination by passing `page` and `pageSize` parameters to the API. It also includes error handling to log any API request failures.

Now we are ready to add our `mat-paginator` component. Let's add the following to the end of our `library.component.html`:

```html
<mat-paginator
  #paginator
  [pageSize]="pageSize"
  [pageSizeOptions]="[5, 10, 25, 100]"
  [length]="totalBooks"
  [pageIndex]="pageIndex"
  (page)="handlePageEvent($event)"
  aria-label="Select page"
>
</mat-paginator>
```

> ### Code Explain
>
> The code snippet represents an Angular Material paginator component. Let's break down its attributes:
>
> - `mat-paginator`: This is the main directive that identifies the element as a Material paginator.
> - `#paginator`: This creates a template reference variable named `paginator`, allowing you to access this paginator instance in your component's TypeScript code or other parts of the template.
> - `[pageSize]="pageSize"`: This binds the `pageSize` property of the paginator to a component variable called `pageSize`. `pageSize` determines how many items are displayed on each page.
> - `[pageSizeOptions]="[5, 10, 25, 100]"`: This provides an array of options for the user to select the number of items per page. In this case, the user can choose to display 5, 10, 25, or 100 items per page.
> - `[length]="totalBooks"`: This binds the `length` property to a component variable called `totalBooks`. `length` represents the total number of items being paginated, which is used to calculate the total number of pages.
> - `[pageIndex]="pageIndex"`: This binds the `pageIndex` property to a component variable called `pageIndex`. `pageIndex` represents the current page number (starting from 0).
> - `(page)="handlePageEvent($event)"`: This binds the `page` event of the paginator to a component method called `handlePageEvent`. The `page` event is emitted whenever the user navigates to a different page. The `$event` object contains information about the page event, such as the new page index and page size.
> - `aria-label="Select page"`: This provides an ARIA label for accessibility, which is read by screen readers to help users understand the purpose of the paginator.

Finally, let's complete our code by adding the class method `handlePageEvent($event)`. This method will be called by `mat-paginator` every time a new action is performed.

```typescipt
  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;

    this.getBooks();
  }
```

Let's also add the properties necessary for the operation of our component:

```typescript
pageSize = 5;
pageIndex = 0;
pageEvent: PageEvent | undefined;
pageSizeOptions = [5, 10, 25];
```

Di seguito il codice completo per il nostro componente `library.component`:

```html
<!-- file: library.component.html -->

<h1>{{ title }}</h1>

<h2>Books</h2>
<ul>
  <li *ngFor="let book of books"><strong>{{ book.title }}</strong> by {{ book.author_name }} - {{ book.year }} (<a routerLink="/library/books/{{ book.id }}">details</a>)</li>
</ul>
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
// file: library.component.ts

import { Component, OnInit } from "@angular/core";
import { Book, LibraryService, PaginatedBookList, LibraryBooksListRequestParams } from "../../../core/api/v1";
import { NgFor } from "@angular/common";
import { RouterLink } from "@angular/router";
import { PageEvent, MatPaginatorModule } from "@angular/material/paginator";

@Component({
  selector: "app-library",
  imports: [NgFor, RouterLink, MatPaginatorModule],
  templateUrl: "./library.component.html",
  styleUrl: "./library.component.scss",
})
export class LibraryComponent implements OnInit {
  title = "Library";
  books: Book[] = [];
  totalBooks = 0;
  pageSize = 5;
  pageIndex = 0;
  pageEvent: PageEvent | undefined;
  pageSizeOptions = [5, 10, 25];

  constructor(private readonly libraryService: LibraryService) {}

  ngOnInit(): void {
    this.getBooks();
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;

    this.getBooks();
  }

  getBooks() {
    const params: LibraryBooksListRequestParams = {
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
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

Let's run our application now:

![Application with paginator](/docs/images/part11_1.png)

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

![Library Mat-Table](/docs/images/part11_2.png)

Now you are using the Mat-Table, and you can sort the table columns.
