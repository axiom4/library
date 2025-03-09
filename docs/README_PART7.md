# A full test application using Django and Angular (Part 7) - Generate Angular Modules

To create a new Angular module named "Library", you can use the following command:

````bash
ng generate module modules/Library --routing

CREATE src/app/modules/library/library-routing.module.ts (250 bytes)
CREATE src/app/modules/library/library.module.ts (284 bytes)```
````

This command generates a new Angular module named "Library" inside the `src/app/modules` directory. The `--routing` flag tells the Angular CLI to also generate a routing module for the new module. This is useful for creating feature modules with their own dedicated routes.

Now, we will create a new component named "Book" inside the Library module, you can use the following command:

```bash
ng generate component modules/Library/components/Book --module modules/Library
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

> **What are Directives?**
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
