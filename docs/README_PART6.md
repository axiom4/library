# A full test application using Django and Angular (Part 6) - Angular OpenAPI service integration

Let's start by creating the environment files that will allow us to customize our Angular application.

Angular environments allow you to configure your application for different deployment scenarios, such as development, testing, and production. They enable you to specify different API endpoints, feature flags, or any other configuration settings that vary between environments.

To add environments using the Angular CLI:

```bash
ng generate environments

CREATE src/environments/environment.ts (31 bytes)
CREATE src/environments/environment.development.ts (31 bytes)
UPDATE angular.json (3009 bytes)
```

> ### explain
>
> 1.  By default, Angular CLI creates two environment files: `environment.ts` and `environment.developments.ts` in the `src/environments/` directory.
> 2.  To add a new environment, you can create a new file, for example, `environment.staging.ts`, and duplicate the content of one of the existing files.
> 3.  Modify the content of the new environment file to reflect the settings for your new environment.
> 4.  To use the new environment, you need to configure the `angular.json` file. Add a new configuration under the `projects.[your-project-name].architect.build.configurations` section.
> 5.  Run the application using the new environment: `ng build --configuration=staging`

Now, let's update the `environment.development.ts` file to include the `api_url` property. This URL will be used to configure the OpenAPI client for your development environment.

```typescript
// src/environments/environment.development.ts

export const environment = {
  production: false,
  api_url: "http://localhost:8000", // Replace with your development API URL
};
```

In this snippet:

- We define the `api_url` property within the `environment` object.
- Set its value to your development API endpoint (e.g., `http://localhost:8000`). Make sure to replace this with the actual URL of your Django development backend.

This `apiBaseUrl` will be used later when configuring the OpenAPI client to point to your development backend.

Next, update the `app.config.ts` file to instantiate and configure the OpenAPI client, using the `api_url` as its endpoint.

```typescript
// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { ApiModule, Configuration, ConfigurationParameters } from "./modules/core/api/v1";
import { environment } from "../environments/environment.development";
import { provideHttpClient, withFetch } from "@angular/common/http";

export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    basePath: environment.api_url,
  };
  return new Configuration(params);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(ApiModule.forRoot(apiConfigFactory)),
    provideHttpClient(withFetch()),
  ],
};
```

In this snippet:

- We import `Configuration, ConfigurationParameters` from `./modules/core/api/v1`. Make sure this path is correct based on where your OpenAPI generated client is located.
- We define a factory function `apiConfigFactory` that returns a new `Configuration` object. This function uses the `environment.api_url` to set the `basePath` for the API client.
- We provide the `ApiModule` using `importProvidersFrom` and configure it with the `apiConfigFactory`. This ensures that the OpenAPI client is properly initialized with the correct base URL.
- We also instantiate the `HttpClient` using `provideHttpClient(withFetch())`. This is necessary for the OpenAPI client to make HTTP requests.

Now, the OpenAPI client is configured with the `api_url`, and you can inject the generated services in your components.

Now, let's modify the `app.component.ts` to load books using the OpenAPI client. First, inject the `BooksService` into the `AppComponent` constructor. Then, call the `booksList` method to retrieve the list of books and display them in the template.

```typescript
// src/app/app.component.ts
import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Book, LibraryService } from "./modules/core/api/v1";

@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  title = "Library";
  books: Book[] = [];

  constructor(private readonly libraryService: LibraryService) {}

  ngOnInit(): void {
    this.libraryService.listBooks().subscribe({
      next: (books) => {
        this.books = books;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
```

In this snippet:

- We import `LibraryService` and `Book` from `./modules/core/api/v1`. Adjust the paths according to your project structure.
- We inject `LibraryService` in the constructor.
- In the `ngOnInit` lifecycle hook, we call `this.libraryService.listBooks()` to retrieve the list of books.
- We subscribe to the observable returned by `listBooks()` and update the `books` array with the retrieved data.
- We handle any errors that may occur during the API call.

Finally, update the `app.component.html` file to display the list of books.

```html
<!-- src/app/app.component.html -->
<h1>{{ title }}</h1>

<h2>Books</h2>
<ul>
  <li *ngFor="let book of books">{{ book.title }} by {{ book.author }}</li>
</ul>

<router-outlet></router-outlet>
```

In this snippet:

- We use the `*ngFor` directive to iterate over the `books` array and display each book's title and author in a list item.

Now, when you run your Angular application, it should retrieve the list of books from your Django backend using the OpenAPI generated client and display them in the `AppComponent`.

Now add a simplem stylesheet in `style.scss`

```css
body {
  background-color: #f0f0f0;
  font-family: sans-serif;
  margin: 0;
}

h1 {
  color: #333;
  text-align: center;
}
```

Finally, run the Angular application using the `ng serve` command:

```bash
ng serve
Component HMR has been enabled.
If you encounter application reload issues, you can manually reload the page to bypass HMR and/or disable this feature with the `--no-hmr` command line option.
Please consider reporting any issues you encounter here: https://github.com/angular/angular-cli/issues

Initial chunk files | Names         |  Raw size
polyfills.js        | polyfills     |  90.20 kB |
main.js             | main          |  23.78 kB |
styles.css          | styles        | 219 bytes |

                    | Initial total | 114.20 kB

Application bundle generation complete. [1.272 seconds]

Watch mode enabled. Watching for file changes...
NOTE: Raw file sizes do not reflect development server per-request transformations.
  ➜  Local:   http://localhost:4200/
  ➜  press h + enter to show help
```

This command starts the Angular development server, compiles the application, and makes it available at `http://localhost:4200/` (or another port if 4200 is already in use).

Open your browser and go to the indicated address to view the running application. You should see the title "Library" and the list of books retrieved from your Django backend.

> ### Explanation
>
> 1.  `ng serve` is an Angular CLI command that starts a local development server.
> 2.  The development server watches for changes to the project files and automatically recompiles the application, updating the browser in real time.
> 3.  This allows you to develop and test the application interactively and quickly.
> 4.  The `ng serve` command accepts several options to customize the behavior of the development server, such as the port, host, and build type.
> 5.  For example, you can use the command `ng serve --port 4300` to start the server on port 4300 instead of 4200.

Open your browser and connect to your Angular page `http://localhost:4200`.

![Angular App](/docs/images/part6_1.png)

You can see from the browser's developer console that a GET call is made to the URL `http://localhost:8000/library/books`, and the entire list of books loaded on our Django application is returned.
