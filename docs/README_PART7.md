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
