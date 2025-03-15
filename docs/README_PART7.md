# A full test application using Django and Angular (Part 7) - Angular Routes

To create a new Angular module named "Library", you can use the following command:

````bash
# ng generate module modules/Library --routing

CREATE src/app/modules/library/library-routing.module.ts (250 bytes)
CREATE src/app/modules/library/library.module.ts (284 bytes)```
````

This command generates a new Angular module named "Library" inside the `src/app/modules` directory. The `--routing` flag tells the Angular CLI to also generate a routing module for the new module. This is useful for creating feature modules with their own dedicated routes.

Now, we will create a new component named "Book" inside the Library module, you can use the following command:

```bash
# ng generate component modules/Library/components/Book --module modules/Library
CREATE src/app/modules/Library/components/book/book.component.scss (0 bytes)
CREATE src/app/modules/Library/components/book/book.component.html (19 bytes)
CREATE src/app/modules/Library/components/book/book.component.spec.ts (578 bytes)
CREATE src/app/modules/Library/components/book/book.component.ts (207 bytes)
```

This command generates a new component named "Book" inside the `src/app/modules/library/components` directory.

Now, we will update the `app.component` to include a "Details" link for each book.

Let's import the `routerLink` directive into `app.component.ts`. To do this, you need to import the directive from the `@angular/router` module:

```typescript
import { RouterLink, RouterOutlet } from "@angular/router";
```

and add it to the imports of the `@Component`:

```typescript
imports: [RouterOutlet, NgFor, RouterLink],
```

The `routerLink` directive is an Angular directive that enables navigation to different routes within your application. It's an alternative to using the `<a href="...">` tag, providing Angular's routing capabilities.

`RouterLink` allows you to create dynamic links based on your application's state. In the example, `routerLink="/library/books/{{ book.id }}"` creates a link to a specific book's details page, where `book.id` is dynamically inserted into the URL.

`RouterOutlet` is a directive that marks the location in the template where the router should display the view for that route.

> ### What are Directives?
>
> Directives are classes that add behavior to existing elements in the DOM.
> They can modify the appearance, behavior, and layout of DOM elements.
>
> There are three types of directives in Angular:
>
> - Components: Directives with a template.
> - Structural directives: Directives that change the DOM layout by adding, removing, or replacing elements.
> - Attribute directives: Directives that change the appearance or behavior of an element, component, or another directive.

Let's update the `app.component.html` template by adding an `<a routerLink="/library/books/{{ book.id }}">details</a>` tag.

```html
<h1>{{ title }}</h1>

<h2>Books</h2>
<ul>
  <li *ngFor="let book of books">{{ book.title }} by {{ book.author }} (<a routerLink="/library/books/{{ book.id }}">details</a>)</li>
</ul>

<router-outlet></router-outlet>
```

The `<router-outlet>` directive is a placeholder where the router displays the routed views. The router-outlet is a component that acts as a placeholder in the template. The router displays the templates of the active route in the outlet. It is a fundamental part of Angular routing.

## Module Lazy Loading

Lazy Loading is a design pattern that defers the initialization of an object until the point at which it is needed.

In the context of Angular, Lazy Loading is a technique that allows you to load Angular modules only when they are required, rather than loading them all upfront. This can significantly improve the initial loading time of your application, especially for large applications with many modules.

### Benefits of Lazy Loading:

- **Reduced initial load time:** By loading modules on demand, the initial bundle size is smaller, resulting in faster startup times.
- **Improved performance:** Lazy loading reduces the amount of code that the browser needs to parse and compile initially.
- **Better user experience:** Users can start interacting with the application sooner, as they don't have to wait for all modules to load.

## How to implement Lazy Loading in Angular:

1.  **Create a feature module:** Create a separate module for the feature you want to load lazily. This module should contain the components, services, and other dependencies required for that feature.

2.  **Configure the route:** In your application's routing configuration, define a route that uses the `loadChildren` property to specify the path to the lazy-loaded module. Use a dynamic import.

In our application, modify `app.routes.ts` by inserting the following route:

```typescript
const routes: Routes = [
  {
    path: "library",
    loadChildren: () => import("./modules/library/library.module").then((m) => m.LibraryModule),
  },
];
```

3.  **Remove eager loading:** Ensure that the lazy-loaded module is not imported in the `AppModule` or any other eagerly loaded module.

4.  **Configure the build:** Ensure that your build process is configured to create separate bundles for lazy-loaded modules. The Angular CLI handles this automatically when you use the `loadChildren` property in your routing configuration.

Now, when the user navigates to the `/library` route, Angular will load the `LibraryModule` and its dependencies on demand.

> #### Important considerations:
>
> - **Preloading:** You can use the `PreloadAllModules` or `CustomPreloadingStrategy` to preload lazy-loaded modules in the background
> - after the initial application has loaded. This can improve the perceived performance of your application.
> - **Routing configuration:** Make sure that your routing configuration is correct and that the paths to your lazy-loaded modules are accurate.
> - **Module dependencies:** Ensure that all dependencies required by the lazy-loaded module are also included in the module's bundle.

Now, let's create the route for the `Book` component within the Library module's routing.

This is content of our `library-routing.module.ts`:

```typescript
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BookComponent } from "./components/book/book.component";

const routes: Routes = [{ path: "books/:id", component: BookComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LibraryRoutingModule {}
```

In the route configuration `path: "books/:id"`, the `:id` is a route parameter. It's a placeholder that allows you to capture a dynamic value from the URL. When a user navigates to a URL like `/library/books/123`, the value `123` will be associated with the `id` parameter. You can then access this value within the `BookComponent` to, for example, fetch the details of the book with ID 123.

## The Book Component

Let's update `book.component.ts`:

```typescript
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-book",
  imports: [],
  templateUrl: "./book.component.html",
  styleUrl: "./book.component.scss",
})
export class BookComponent implements OnInit {
  bookId: number | undefined;

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.bookId = this.route.snapshot.params["id"];
  }
}
```

Inside the `BookComponent`, the `ActivatedRoute` service is used to access information about the current route, including route parameters.

Here's a breakdown:

- **`ActivatedRoute`:** This service provides access to information about the current route, such as the URL, parameters, and data associated with the route.

- **`constructor(private readonly route: ActivatedRoute) {}`:** This injects the `ActivatedRoute` service into the component. The `private readonly` syntax is a shorthand for declaring a private, read-only property and assigning the injected service to it.

- **`ngOnInit(): void { this.bookId = this.route.snapshot.params["id"]; }`:** This is the `ngOnInit` lifecycle hook, which is called once the component is initialized. Inside this hook, the `bookId` property is assigned the value of the `id` parameter from the route.

  - **`this.route.snapshot`:** This provides a snapshot of the route at the time the component was created. It's a simple way to access the route parameters without subscribing to changes.

  - **`.params["id"]`:** This accesses the value of the `id` parameter from the route. The `params` property is an object that contains all the route parameters.

In summary, the `BookComponent` retrieves the `id` parameter from the current route using the `ActivatedRoute` service and assigns it to the `bookId` property. This allows the component to dynamically display information about the book with the specified ID.

Let's update the `book.component.html` template as follows:

```html
<p>Book ID: {{ bookId }}</p>
```

Now, let's open our app, select first book and see what happens:

![Angular App](/docs/images/part7_1.png)

Let's select another book:

![Angular App](/docs/images/part7_2.png)

The book object is not updated when the route changes because the `ActivatedRoute` snapshot is used to retrieve the `bookId` in the `ngOnInit` lifecycle hook. The snapshot only provides the initial value of the route parameters when the component is first created. It does not reflect subsequent changes to the route parameters.

To update the `BookComponent` when the route changes, you need to subscribe to the `params` observable of the `ActivatedRoute`. This allows you to listen for changes to the route parameters and update the `bookId` accordingly.

Here's how you can modify the `BookComponent` to subscribe to the `params` observable:

```typescript
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: "app-book",
  imports: [],
  templateUrl: "./book.component.html",
  styleUrl: "./book.component.scss",
})
export class BookComponent implements OnInit, OnDestroy {
  bookId: number | undefined;
  private routeSubscription: Subscription | undefined;

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe((params) => {
      this.bookId = params["id"];
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}
```

> ### Key changes:
>
> - **Import `Subscription`:** Import the `Subscription` class from the `rxjs` library.
>
> - **`routeSubscription` property:** A `routeSubscription` property is added to store the subscription to the `params` observable.
>
> - **`ngOnInit` method:** Inside the `ngOnInit` method, the `route.params.subscribe` method is used to subscribe to the `params` observable. The callback function is executed whenever the route parameters change. Inside the callback function, the `bookId` property is updated with the new value of the `id` parameter.
>
> - **`ngOnDestroy` method:** The `ngOnDestroy` lifecycle hook is implemented to unsubscribe from the `params` observable when the component is destroyed. This prevents memory leaks.

By subscribing to the `params` observable, the `BookComponent` will now be updated whenever the route changes, ensuring that the correct book ID is displayed.

> ### RxJS Subscription Explained
>
> In the provided code, `Subscription` from RxJS is used to manage the asynchronous stream of route parameter changes. Let's break down how it works:
>
> - **What is RxJS?** RxJS (Reactive Extensions for JavaScript) is a library for reactive programming using Observables, making it easier to compose asynchronous or callback-based code.
>
> - **Observables:** An Observable represents a stream of data that can be observed over time. In this case, `this.route.params` is an Observable that emits new values whenever the route parameters change.
>
> - **`subscribe()`:** The `subscribe()` method is used to listen to the values emitted by an Observable. It takes a callback function as an argument, which is executed every time the Observable emits a new value.
>
> - **`Subscription`:** When you call `subscribe()`, it returns a `Subscription` object. This object represents the ongoing subscription to the Observable.
>
> - **Why is `Subscription` important?** Observables can emit values indefinitely. If you don't unsubscribe from an Observable when you no longer need to listen to it, it can lead to memory leaks. The `Subscription` object allows you to unsubscribe from the Observable, stopping the flow of data and preventing memory leaks.
>
> - **`unsubscribe()`:** The `unsubscribe()` method is called on the `Subscription` object to stop listening to the Observable. In the `ngOnDestroy` lifecycle hook, `this.routeSubscription.unsubscribe()` is called to unsubscribe from the `route.params` Observable when the `BookComponent` is destroyed.
>
> In summary, `Subscription` is a crucial part of RxJS that allows you to manage the lifecycle of Observables and prevent memory leaks by unsubscribing when you no longer need to listen to a stream of data.

### Retrieve book data

Now, we will use `OpenAPI LibraryService` to retrieve book data.

Let's go!

Instatiate `LibraryService` in `constructor()`:

```typescript
import { LibraryService } from '../../../core/api/v1';
...
  constructor(
    private readonly route: ActivatedRoute,
    private readonly libraryService: LibraryService
  ) {}
```

Add `book: Book | undefined;` properties to the `BookComponent` object.

```typescript
import { Book, LibraryService } from '../../../core/api/v1';
...

@Component({
  selector: 'app-book',
  imports: [],
  templateUrl: './book.component.html',
  styleUrl: './book.component.scss',
})
export class BookComponent implements OnInit, OnDestroy {
  bookId: number | undefined;
  private routeSubscription: Subscription | undefined;
  book: Book | undefined;

  ...
}
```

Let's create a `getBook(id: number)`method:

```typescript
  getBook(id: number): void {
    const book_params: RetrieveBookRequestParams = {
      id: String(this.bookId),
    };

    if (this.bookId) {
      this.visible = false;
      this.libraryService.retrieveBook(book_params).subscribe({
        next: (book) => {
          this.book = book;
          console.log(this.book);
          this.visible = true;
        },
        error: (err) => {
          console.error(err);
          this.book = undefined;
          this.visible = true;
        },
      });
    }
  }
```

Update `routeSubscription` to load `Book` data:

```typescript
  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe((params) => {
      this.bookId = params['id'];
      if (this.bookId) this.getBook(this.bookId);
    });
  }
```

This is the entire class:

```typescript
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { Book, LibraryService, RetrieveBookRequestParams } from "../../../core/api/v1";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-book",
  imports: [NgIf],
  templateUrl: "./book.component.html",
  styleUrl: "./book.component.scss",
})
export class BookComponent implements OnInit, OnDestroy {
  bookId: number | undefined;
  private routeSubscription: Subscription | undefined;
  book: Book | undefined;
  visible = false;

  constructor(private readonly route: ActivatedRoute, private readonly libraryService: LibraryService) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe((params) => {
      this.bookId = params["id"];
      if (this.bookId) this.getBook(this.bookId);
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  getBook(id: number): void {
    const book_params: RetrieveBookRequestParams = {
      id: String(this.bookId),
    };

    if (this.bookId) {
      this.visible = false;
      this.libraryService.retrieveBook(book_params).subscribe({
        next: (book) => {
          this.book = book;
          console.log(this.book);
          this.visible = true;
        },
        error: (err) => {
          console.error(err);
          this.book = undefined;
          this.visible = true;
        },
      });
    }
  }
}
```

Now let's modify our Book template:

```html
<div *ngIf="book && visible; else elseBlock" class="book">
  <h2>{{ book.title }}</h2>
  <p><b>Book ID:</b> {{ bookId }}</p>
  <p><b>Author:</b> {{ book.author }}</p>
  <p><b>Published:</b> {{ book.publication_date }}</p>
</div>
<ng-template #elseBlock>
  <div *ngIf="visible" class="book not_found">BookId {{ bookId }} not found</div>
</ng-template>
```

This code is an HTML template for displaying book information.

It uses Angular's `*ngIf` directive to conditionally render content based on whether the `book` property is defined.

- If `book` is truthy (i.e., it has a value), the content within the first `div` element is displayed. This includes the book's title, ID, author, and publication date.
- If `book` is falsy (e.g., `null` or `undefined`), the content within the `ng-template` with the `#elseBlock` reference is displayed. This shows a "BookId not found" message.

The `book` and `not_found` classes are used for styling the elements, let's add them to our `style.scss`:

```css
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
```

This code defines the styles for the book component.

`.book`: This CSS class defines the general styling for a book container. It sets the background color to white, adds a border, rounds the corners, adds a subtle shadow, and provides some padding and margin.

`.not_found`: This CSS class is used when a book is not found. It sets the text color to white, the background color to a semi-transparent red, applies italic font style, and centers the text.

Now we can view our application:

![Angular App](/docs/images/part7_3.png)

let's try to insert an incorrect id:

![Angular App](/docs/images/part7_4.png)

#### A Little Fix

If we access the URL: `http://localhost:4200/library/books` or any other non-existent URL, we will see the following error in the browser's debug console:

> `ERROR Error: NG04002: Cannot match any routes. URL Segment: 'library/books'`

To fix this, we can insert the following route into `app.routes.ts`: `{ path: "**", redirectTo: "", pathMatch: "full" }`:

```typescript
import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "library",
    loadChildren: () => import("./modules/library/library.module").then((m) => m.LibraryModule),
  },
  { path: "**", redirectTo: "", pathMatch: "full" },
];
```

Now the application works correctly.
