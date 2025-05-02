# A Full Test Application Using Django and Angular (Part 14) - Django Roles

In this chapter, we will address a crucial aspect of any modern web application: API security. Protecting our APIs is essential to ensure that only authorized users can access and modify data.

To achieve this goal, we will use **Keycloak**, an open-source solution for Identity and Access Management (IAM). Keycloak provides robust authentication and authorization features, simplifying the implementation of standard security mechanisms such as OAuth 2.0 and OpenID Connect.

The integration of Keycloak will take place on two fronts:

1.  **Frontend (Angular):** We will configure our Angular application to interact with Keycloak. This will allow users to authenticate via Keycloak and enable the Angular application to obtain access tokens for making secure calls to the backend APIs. We will use the `keycloak-angular` library to facilitate this integration.
2.  **Backend (Django):** We will protect our Django APIs so that a valid access token issued by Keycloak is required for every request. Django will be configured to validate these tokens and extract user and role information, enabling fine-grained access control based on the roles defined in Keycloak.

In the following steps, we will see in detail how to configure Keycloak, integrate the Angular client, and secure Django views.

## Keycloak Installation

Let's create a new schema on our Mysql (see part 3). Go on your terminal and login on your MySQL.

```bash
# mysql -h 127.0.0.1 -u root -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 1289
Server version: 8.3.0 MySQL Community Server - GPL

Copyright (c) 2000, 2024, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

Add new user `keycloak` and select a password:

```sql
mysql> CREATE USER keycloak@'%' IDENTIFIED BY 'keycloak';
Query OK, 0 rows affected (0,14 sec)
```

Create a new schema `keycloak`:

```sql
mysql> CREATE DATABASE keycloak;
Query OK, 1 row affected (0,01 sec)
```

Add acl on new schema to user `keycloak`:

```sql
mysql> GRANT ALL PRIVILEGES ON keycloak.* TO keycloak@'%';
Query OK, 0 rows affected (0,02 sec)
```

Reload the privileges on database:

```sql
mysql> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0,01 sec)
```

Now we install `keycloak`. To quickly set up a develpment environment of Keycloak using Docker, update our `docker-compose.yml` file with the following content:

```yaml
name: library
services:
  db:
    image: mysql
    container_name: mysql

    restart: always
    env_file:
      - path: ./environments/mysql.env
        required: true
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - backend

  keycloak:
    image: quay.io/keycloak/keycloak:latest
    container_name: keycloak
    command: start-dev
    networks:
      - backend
    depends_on:
      - db
    env_file:
      - path: ./environments/keycloak.env
        required: true
    ports:
      - "8080:8080"
    restart: unless-stopped

volumes:
  db_data: {}

networks:
  backend:
    driver: bridge
```

Define new environment file `environments/keycloak.env` as follow:

```bash
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=keycloak
KC_DB=mysql
KC_DB_URL_HOST=mysql
KC_DB_URL_DATABASE=keycloak
KC_DB_USERNAME=keycloak
KC_DB_PASSWORD=keycloak
```

Deploy keycloak running:

```bash
# docker-compose up -d

[+] Running 5/5
 ✔ keycloak Pulled                                                             10.6s
   ✔ 830112cfee05 Pull complete                                                 1.8s
   ✔ f79851aee01e Pull complete                                                 6.1s
   ✔ d36e3fd02231 Pull complete                                                 7.0s
   ✔ cc67d5854a75 Pull complete                                                 7.1s
[+] Running 3/3
 ✔ Network library_default  Created                                             0.1s
 ✔ Container mysql          Running                                             0.0s
 ✔ Container keycloak       Started                                             0.9s
```

You can then access the Keycloak admin console at [http://127.0.0.1:8080](http://127.0.0.1:8080).

![Keycloak Login Page](/docs/images/part14_1.png)

## Configuring Keycloak

A **realm** in Keycloak is an isolated space for managing users, roles, groups, and clients. Each realm is independent: users, roles, and configurations in one realm are not visible or accessible from another. This allows you to manage multiple applications or environments (such as development, testing, and production) within the same Keycloak instance, keeping data and configurations separate.

A realm is useful for:

- Separating users and permissions between different applications or environments.
- Centrally managing authentication and authorization for a specific group of applications.
- Applying security policies and configurations tailored to each context.

### Creating a New Realm: `library-realm`

To organize users, roles, and clients for your application, you need to create a new realm in Keycloak. Follow these steps:

1. **Log in to the Keycloak Admin Console**  
   Open [http://127.0.0.1:8080](http://127.0.0.1:8080) in your browser and log in using the admin credentials you set in the environment file (`KEYCLOAK_ADMIN` and `KEYCLOAK_ADMIN_PASSWORD`).

2. **Create the Realm**

- In the left sidebar, click on `Manage realms` at the top.
- Click `Create realm` button.
- Enter `library-realm` as the **Realm Name**.
- Optionally, add a description.
- Click **Create**.

![New Keycloak Realm](/docs/images/part14_2.png)

Your new realm `library-realm` is now ready. You can now proceed to configure clients, roles, and users within this realm for your Django and Angular applications.

### Creating a new client: `library-web`

A **client** in Keycloak represents an application or service that interacts with the Keycloak server to authenticate users and obtain security tokens. Clients can be frontend applications (like Angular or React apps), backend services, or any system that needs to use Keycloak for authentication and authorization. Defining a client allows Keycloak to manage how users log in to your application, what permissions they have, and how tokens are issued.

#### Steps to Create a New Client: `library-web`

To allow your frontend application to authenticate users via Keycloak, you need to create a new public client:

1. **Navigate to Clients**

- In the Keycloak Admin Console, ensure you are in the `library-realm`.
- In the left sidebar, click on **Clients**.

2. **Create the Client**

- Click the `Create client` button.

In `Genereral Settings`:

- For `Client type`, select `OpenID Connect`.
- Enter `library-web` as the `Client ID`.
- Enter `Library Web`as the `Client Name`.
- Click **Next**.

![New Client](/docs/images/part14_3.png)

In `Capability config`:

- Set `Client Authentication` to `off`.
- In `Authentication Flow` select only `Standard Flow.
- Click **Next**.

![New Client](/docs/images/part14_4.png)

In `Login settings`:

- Set `Valid redirect URIs` to `*`.
- Set `Web origins` to `*`.
- Click **Save**.

![New Client](/docs/images/part14_5.png)

Your `library-web` client is now configured. This client will allow your Angular frontend to redirect users to Keycloak for authentication and receive tokens for secure API calls.

## Configure Keycloack-Angular

To integrate our Angular 19 frontend application with Keycloak using the `keycloak-angular` library and the `library-web` client, follow these steps. This guide uses the new Angular standalone APIs and `app.config.ts` for configuration, and demonstrates how to create an Angular guard to protect authenticated routes.

### 1. Install Dependencies

Install the required packages:

```bash
# npm install keycloak-angular keycloak-js


added 100 packages, and audited 1119 packages in 2s

183 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### 2. Add keycloak enviroments in `enviroments.development.ts`

Edit `enviroments.development.ts` and add keycloak config:

```typescript
export const environment = {
  production: false,
  api_url: "http://127.0.0.1:8000",

  keycloak: {
    url: "http://127.0.0.1:8080",
    realm: "library-realm",
    client_id: "library-web",
  },
};
```

### 3. Configure Keycloak in `app.config.ts`

Update your `app.config.ts` file to initialize Keycloak during app startup:

**Add new `provideKeycloakAngular`**

```typescript
// app.config.ts
export const provideKeycloakAngular = () =>
  provideKeycloak({
    config: {
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.client_id,
    },
    initOptions: {
      onLoad: "check-sso",
      silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
    },
    features: [
      withAutoRefreshToken({
        onInactivityTimeout: "logout",
        sessionTimeout: 60 * 60 * 1000, // 1 hour
      }),
    ],
    providers: [AutoRefreshTokenService, UserActivityService],
  });
```

This code defines a function called `provideKeycloakAngular` that sets up authentication in an Angular application using Keycloak, an identity and access management solution.

- **provideKeycloak**: This function initializes Keycloak with the provided configuration.
- **config**: Contains Keycloak connection details, such as the server URL, realm, and client ID. These values are pulled from the application's environment settings.
- **initOptions**: Sets options for how Keycloak should initialize.
  - `onLoad: "check-sso"` tells Keycloak to check if the user is already logged in (Single Sign-On).
  - `silentCheckSsoRedirectUri` specifies a URL used for silent SSO checks, allowing the app to verify login status without redirecting the user.
- **features**:
  - `withAutoRefreshToken` enables automatic refreshing of the authentication token.
    - `onInactivityTimeout: "logout"` logs the user out after inactivity.
    - `sessionTimeout: 60 * 60 * 1000` sets the session timeout to 1 hour.
- **providers**: Registers services (`AutoRefreshTokenService`, `UserActivityService`) that help manage token refresh and user activity.

**Import new provider**

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloakAngular(),
    // ... existing code ...
  ],
};
```

In `public`directory add new file `silent-check-sso.html`:

```html
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Silent SSO Check</title>
  </head>
  <body>
    <script>
      parent.postMessage(location.href, location.origin);
    </script>
  </body>
</html>
```

### 4. Create an Auth Guard

Generate an Angular guard to protect authenticated routes:

```bash
# ng generate guard  Auth
? Which type of guard would you like to create? (Select CanActivate)
❯◉ CanActivate
 ◯ CanActivateChild
 ◯ CanDeactivate
 ◯ CanMatch

✔ Which type of guard would you like to create? CanActivate
CREATE src/app/auth.guard.spec.ts (461 bytes)
CREATE src/app/auth.guard.ts (128 bytes)
```

```typescript
// auth.guard.ts
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AuthGuardData, createAuthGuard } from "keycloak-angular";

const isAccessAllowed = async (route: ActivatedRouteSnapshot, _: RouterStateSnapshot, authData: AuthGuardData): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;

  if (authenticated) {
    return true;
  }

  return false;
};

export const authGuard: CanActivateFn = createAuthGuard<CanActivateFn>(isAccessAllowed);
```

This code defines a custom authentication guard for an Angular application using the `keycloak-angular` library. The purpose of an authentication guard is to control access to certain routes based on the user's authentication status.

**Key parts:**

1. **Imports:**

   - `ActivatedRouteSnapshot`, `CanActivateFn`, `RouterStateSnapshot`, and `UrlTree` are imported from Angular's router module.
   - `AuthGuardData` and `createAuthGuard` are imported from `keycloak-angular`, which helps integrate Keycloak authentication.

2. **isAccessAllowed Function:**

   - This asynchronous function receives the current route, router state, and authentication data.
   - It destructures `authenticated` and `grantedRoles` from `authData`.
   - If the user is authenticated (`authenticated` is true), it returns `true`, allowing access to the route.
   - Otherwise, it returns `false`, denying access.

3. **authGuard Export:**
   - `authGuard` is created by passing the `isAccessAllowed` function to `createAuthGuard`.
   - This guard can be used in Angular route definitions to protect routes and ensure only authenticated users can access them.

The guard currently only checks if the user is authenticated. Later, we restrict access based on user roles adding logic to `grantedRoles`.

### 4. Protect Routes in Your Router

Apply the guard to routes that require authentication:

```typescript
// app.routes.ts
import { Routes } from "@angular/router";
import { AuthGuard } from "./auth.guard";

export const routes: Routes = [
  {
    path: "protected",
    loadComponent: () => import("./protected/protected.component").then((m) => m.ProtectedComponent),
    canActivate: [AuthGuard],
  },
  // ...other routes
];
```

## Use Keycloak in our Components

Now we update our app to manage authentication using keycloak and evaluate user roles.

First, we update our app routing, to make this, we move inside `library` components all app logic.

Edit `library.component.html` and update it as follow:

```html
<h2>Books</h2>

<app-books-list></app-books-list>

<hr />
<div class="library-footer">
  <a mat-raised-button color="primary" (click)="openAddBookDialog()"> <mat-icon>add</mat-icon> Add New Book </a>
</div>

<app-library-notification></app-library-notification>
```

Formally, we move `LibraryNotification` in this component, so, we need to update imports of our `library.component.ts`:

```typescript
// ... existing code ...
import { LibraryNotificationComponent } from '../library-notification/library-notification.component';

@Component({
  selector: 'app-library',
  imports: [
    MatButtonModule,
    MatIconModule,
    BooksListComponent,
    LibraryNotificationComponent,
  ],
// ... existing code ...
```

<!-- ### 5. Use Keycloak in Your Components

You can now inject `KeycloakService` into your components to access user information, roles, and tokens.

```typescript
import { Component } from "@angular/core";
import { KeycloakService } from "keycloak-angular";

@Component({
  selector: "app-profile",
  template: `<div *ngIf="username">Welcome, {{ username }}</div>`,
})
export class ProfileComponent {
  username = "";

  constructor(private keycloak: KeycloakService) {
    this.username = this.keycloak.getUsername();
  }
}
````

With this setup, your Angular 19 application is integrated with Keycloak using the `keycloak-angular` library and the `library-web` client. Authenticated routes are protected with a guard, and user authentication is managed seamlessly. -->
