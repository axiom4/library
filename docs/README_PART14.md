# A Full Test Application Using Django and Angular (Part 14) - Keycloak Integration

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

Now update `app.component.html` as follow:

```html
<h1>{{ title }}</h1>

<div class="library">
  <router-outlet></router-outlet>
</div>
```

We remove `<app-library>` and `<app-library-notification>`. Update `app.component.ts`:

```typescript
import { Component, effect, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import Keycloak from "keycloak-js";
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType, typeEventArgs, ReadyArgs } from "keycloak-angular";
import { inject } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  imports: [RouterOutlet],
})
/**
 * The `AppComponent` serves as the root component of the Library application.
 * It initializes the application state and interacts with the `LibraryService`
 * to fetch and display a list of books.
 *
 * @implements {OnInit}
 */
export class AppComponent implements OnInit {
  title = "Library";
  authenticated = false;
  keycloakStatus: string | undefined;
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  constructor() {
    effect(() => {
      const keycloakEvent = this.keycloakSignal();

      console.log("Keycloak event:", keycloakEvent);

      this.keycloakStatus = keycloakEvent.type;

      if (this.keycloakStatus === KeycloakEventType.Ready) {
        this.authenticated = typeEventArgs<ReadyArgs>(keycloakEvent.args);
        console.log("Keycloak is ready:", this.authenticated);
      } else if (this.keycloakStatus === KeycloakEventType.AuthLogout) {
        this.authenticated = false;
      } else {
        console.log("Keycloak status:", this.keycloakStatus);
      }
    });
  }

  ngOnInit(): void {
    if (!this.keycloak.authenticated) {
      this.keycloak.login().then(() => {
        if (this.keycloak.authenticated && this.keycloak.token) {
          console.log("Keycloak token:", this.keycloak.token);

          this.authenticated = true;
        }
      });
    } else {
      if (this.keycloak.token) {
        console.log("Keycloak token:", this.keycloak.token);
      }
    }
  }
}
```

This code manages authentication using Keycloak.

**Key points:**

- **Properties:**

  - `title`: Sets the component title to "Library".
  - `authenticated`: Tracks if the user is logged in.
  - `keycloakStatus`: Stores the current Keycloak event type.
  - `keycloak` and `keycloakSignal`: Injected services for interacting with Keycloak and listening to its events.

- **Constructor:**

  - Sets up a reactive `effect` that listens for Keycloak events.
  - Updates `keycloakStatus` and `authenticated` based on the event type:
    - If Keycloak is "Ready", it checks if the user is authenticated.
    - If the user logs out, it sets `authenticated` to `false`.
    - Logs other event statuses for debugging.

- **ngOnInit():**

  - On component initialization, checks if the user is authenticated.
  - If not, it triggers the Keycloak login process.
  - After login, if authentication and a token are present, it sets `authenticated` to `true` and logs the token.

This updates ensures that the user is authenticated with Keycloak when the app starts, reacts to authentication events. It uses Angular's dependency injection and reactive programming features to manage authentication state.

Finnaly, we update our routing modules:

**library-routing.module.ts**

```typescript
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BookComponent } from "./components/book/book.component";
import { LibraryComponent } from "./components/library/library.component";

const routes: Routes = [
  { path: "", component: LibraryComponent },
  { path: "books/:id", component: BookComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LibraryRoutingModule {}
```

- `{ path: "", component: LibraryComponent }`  
  This means when the user navigates to the root URL (no path), the `LibraryComponent` will be shown.

**app.routes.ts**

```typescript
import { Routes } from "@angular/router";
import { authGuard } from "./auth.guard";

export const routes: Routes = [
  {
    path: "library",
    loadChildren: () => import("./modules/library/library.module").then((m) => m.LibraryModule),
    canActivate: [authGuard],
  },
  { path: "", redirectTo: "/library", pathMatch: "full" },
  { path: "**", redirectTo: "/library", pathMatch: "full" },
];
```

- `routes: Routes = [...]`: Declares an array of route objects, which Angular uses to determine which component or module to load based on the URL path.

- First route object:

  - `path: "library"`: When the URL path is library, this route is activated.
  - `loadChildren`: Uses lazy loading to load the `LibraryModule` only when the library route is accessed. This improves performance by not loading the module until needed.
  - `canActivate: [authGuard]`: Protects the route using an authentication guard. Only users who pass the `authGuard` check can access this route.

- Second route object:

  - `path: ""`: When the URL path is empty (the root path), the user is redirected to library.
  - `redirectTo: "/library"`: Specifies the redirect target.
  - `pathMatch: "full"`: Ensures the redirect only happens when the full path is empty.

- Third route object:
  - `path: "**"`: This is a wildcard route that matches any path not previously matched.
  - `redirectTo: "/library"`: Redirects all unknown paths to library.
  - `pathMatch: "full"`: Ensures the redirect applies to the full unmatched path.

Now, when we try navigating on our app `http://127.0.0.1:4200`, we will redirect on our `keycloak` login page. So, we need going to keycloak admin console and insert e new user into the `library-realm`.

Go to "Users" and select `Create new user" button.

![Add new user](/docs/images/part14_6.png)

Insert `Username` and enable `Email verified`. Click on `Create`.

![Add new user](/docs/images/part14_7.png)

Now go on `Credentials` tab and click on `Set password`. Finally, set and confirm your password and disable `Temporary` flag, so, click on `Save` button and confirm your actions.

![Set user Password](/docs/images/part14_8.png)

Now we can to login on our app. After login, Keycloak could ask to insert e-mail, first name and last name, we submit al request data.

Now we will logged in and redirect on `/library` route.

![Frontend Login](/docs/images/part14_9.png)

## Webservice Authentication

Now we need to integrate a new `Authenticator` class into Django, in fact, all our operations are unprotected, so, anyone can access and insert, update or delete our data.

First, we need to protect our services using `DEFAULT_PERMISSION_CLASSES` inside our `settings.py`. Add the following into `REST_FRAMEWORK` setting.

```python
# ... exsting code ...
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    # ...
}
# ... exsting code ...
```

You can obtain some effet adding the property `permission_classes` into your `ViewSet` classes.

_Example:_

```python
# ... exsting code ...
from rest_framework import permissions

class AuthorViewSet(viewsets.ModelViewSet):
  # ... exsting code ...
  permission_classes = [permissions.IsAuthenticated]
```

The `permission_classes` property overwrites `DEFAUL_PERMISSION_CLASSES` setting.

Now when you open your app, you will get an error that you do not have permission to access the data.

![Permission Error](/docs/images/part14_10.png)
