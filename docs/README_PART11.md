# A Full Test Application Using Django and Angular (Part 11) - Angular Forms

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

Now, we move contents of `app.component.html` into `library.component.html`, replace the contents of `library.component.html` with the following:

```html
<!-- filepath: src/app/modules/library/components/library/library.component.html -->
<h1>{{ title }}</h1>

<h2>Books</h2>
<ul>
  <li *ngFor="let book of books"><strong>{{ book.title }} </strong> by {{ book.author_name }} - {{ book.year }} (<a routerLink="/library/books/{{ book.id }}">details</a>)</li>
</ul>
```

Move Contents of `app.component.ts` into `library.component.ts`, replace the contents of `library.component.ts` with the following:

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

and clean `app.component.ts` code:

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

Finally, replace content of `app.component.html` as follow:

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

To fix code we need imports some classes into our code.

In library.component.ts we import these classes:

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

In `app.component.ts` import:

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

Now we use angular-material ([https://material.angular.io](https://material.angular.io)) to manage the ui of our application.

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

Now we will use `<mat-paginator` (https://material.angular.io/components/paginator/overview) angular-material component to interate out pagination in frontend application.

Let's we will create a new method `getBooks()`, this method will be called when we need reloading the books list.

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
