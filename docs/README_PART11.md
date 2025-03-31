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
