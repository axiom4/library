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

`RouterLink` allows you to create dynamic links based on your application's state. In the example, `routerLink="/books/{{ book.id }}"` creates a link to a specific book's details page, where `book.id` is dynamically inserted into the URL.

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

Let's update the `app.component.html` template by adding an `<a routerLink="/books/{{ book.id }}">details</a>` tag.

```html
<h1>{{ title }}</h1>

<h2>Books</h2>
<ul>
  <li *ngFor="let book of books">{{ book.title }} by {{ book.author }} (<a routerLink="/books/{{ book.id }}">details</a>)</li>
</ul>

<router-outlet></router-outlet>
```
