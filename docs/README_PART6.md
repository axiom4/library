# A full test application using Django and Angular (Part 6) - Angular OpenAPI services

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
