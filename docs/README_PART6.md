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

Now, let's update the `environment.development.ts` file to include the `apiBaseUrl` property. This URL will be used to configure the OpenAPI client for your development environment.

```typescript
// src/environments/environment.development.ts

export const environment = {
  production: false,
  apiBaseUrl: "http://localhost:8000", // Replace with your development API URL
};
```

In this snippet:

- We define the `apiBaseUrl` property within the `environment` object.
- Set its value to your development API endpoint (e.g., `http://localhost:8000`). Make sure to replace this with the actual URL of your Django development backend.

This `apiBaseUrl` will be used later when configuring the OpenAPI client to point to your development backend.
