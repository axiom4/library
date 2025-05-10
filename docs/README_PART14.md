# A Full Test Application Using Django and Angular (Part 14) - Keycloak Integration

In this chapter, we address a crucial aspect of modern web applications: API security. Protecting APIs ensures that only authorized users can access and modify data.

To achieve this, we use **Keycloak**, an open-source Identity and Access Management (IAM) solution. Keycloak provides robust authentication and authorization features, simplifying the implementation of standard security mechanisms such as OAuth 2.0 and OpenID Connect.

Keycloak integration will occur on two fronts:

1.  **Frontend (Angular):** We configure the Angular application to interact with Keycloak, enabling users to authenticate and obtain access tokens for secure backend API calls. The `keycloak-angular` library facilitates this integration.
2.  **Backend (Django):** We protect Django APIs so that a valid access token issued by Keycloak is required for every request. Django will validate these tokens and extract user and role information, enabling fine-grained access control based on Keycloak roles.

The following steps detail how to configure Keycloak, integrate the Angular client, and secure Django views.

## Keycloak Installation

First, create a new schema in MySQL (see part 3). Open your terminal and log in to MySQL:

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

Add a new user `keycloak` and set a password:

```sql
mysql> CREATE USER keycloak@'%' IDENTIFIED BY 'keycloak';
Query OK, 0 rows affected (0,14 sec)
```

Create a new schema `keycloak`:

```sql
mysql> CREATE DATABASE keycloak;
Query OK, 1 row affected (0,01 sec)
```

Grant privileges on the new schema to the `keycloak` user:

```sql
mysql> GRANT ALL PRIVILEGES ON keycloak.* TO keycloak@'%';
Query OK, 0 rows affected (0,02 sec)
```

Reload privileges:

```sql
mysql> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0,01 sec)
```

Now, install Keycloak. To quickly set up a development environment using Docker, update your `docker-compose.yml` file:

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

Define the environment file `environments/keycloak.env`:

```bash
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=keycloak
KC_DB=mysql
KC_DB_URL_HOST=mysql
KC_DB_URL_DATABASE=keycloak
KC_DB_USERNAME=keycloak
KC_DB_PASSWORD=keycloak
```

Deploy Keycloak:

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

You can access the Keycloak admin console at [http://127.0.0.1:8080](http://127.0.0.1:8080).

![Keycloak Login Page](/docs/images/part14_1.png)

## Configuring Keycloak

A **realm** in Keycloak is an isolated space for managing users, roles, groups, and clients. Each realm is independent, allowing you to manage multiple applications or environments within the same Keycloak instance.

### Creating a New Realm: `library-realm`

To organize users, roles, and clients for your application:

1. **Log in to the Keycloak Admin Console**  
   Open [http://127.0.0.1:8080](http://127.0.0.1:8080) and log in using the admin credentials from the environment file.

2. **Create the Realm**
   - Click `Manage realms` in the sidebar.
   - Click `Create realm`.
   - Enter `library-realm` as the **Realm Name**.
   - Optionally, add a description.
   - Click **Create**.

![New Keycloak Realm](/docs/images/part14_2.png)

Your new realm `library-realm` is now ready. You can now configure clients, roles, and users within this realm.

### Creating a New Client: `library-web`

A **client** in Keycloak represents an application or service that interacts with the Keycloak server to authenticate users and obtain security tokens. Clients can be frontend applications (like Angular or React apps), backend services, or any system that needs to use Keycloak for authentication and authorization. Defining a client allows Keycloak to manage how users log in to your application, what permissions they have, and how tokens are issued.

#### Steps to Create a New Client: `library-web`

To allow your frontend application to authenticate users via Keycloak, you need to create a new public client:

1. **Navigate to Clients**

   - Ensure you are in the `library-realm`.
   - Click **Clients** in the sidebar.

2. **Create the Client**
   - Click `Create client`.
   - In `General Settings`:
     - `Client type`: `OpenID Connect`
     - `Client ID`: `library-web`
     - `Client Name`: `Library Web`
     - Click **Next**.

![New Client](/docs/images/part14_3.png)

- In `Capability config`:
  - Set `Client Authentication` to `off`.
  - In `Authentication Flow`, select only `Standard Flow`.
  - Click **Next**.

![New Client](/docs/images/part14_4.png)

- In `Login settings`:
  - Set `Valid redirect URIs` to `*`.
  - Set `Web origins` to `*`.
  - Click **Save**.

![New Client](/docs/images/part14_5.png)

Your `library-web` client is now configured. This client allows your Angular frontend to redirect users to Keycloak for authentication and receive tokens for secure API calls.

## Configure Keycloak-Angular

To integrate the Angular 19 frontend with Keycloak using `keycloak-angular` and the `library-web` client:

### 1. Install Dependencies

```bash
# npm install keycloak-angular keycloak-js


added 100 packages, and audited 1119 packages in 2s

183 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### 2. Add keycloak enviromments in `environments.development.ts`

Edit `environments.development.ts` and add keycloak config:

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

Add `silent-check-sso.html` in the `public` directory:

```html
<!DOCTYPE html>
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

Generate an Angular guard:

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

### 5. Protect Routes in Your Router

Apply the guard to protected routes:

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

## Use Keycloak in Components

Update your app to manage authentication and evaluate user roles.

Update `library.component.html`:

```html
<h2>Books</h2>

<app-books-list></app-books-list>

<hr />
<div class="library-footer">
  <a mat-raised-button color="primary" (click)="openAddBookDialog()"> <mat-icon>add</mat-icon> Add New Book </a>
</div>

<app-library-notification></app-library-notification>
```

Update imports in `library.component.ts`:

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
})
```

Update `app.component.html`:

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

Go to "Users" and click `Create new user`.

![Add new user](/docs/images/part14_6.png)

Enter a username, enable `Email verified`, and click `Create`.

![Add new user](/docs/images/part14_7.png)

Go to the `Credentials` tab, click `Set password`, set and confirm the password, disable the `Temporary` flag, and click `Save`.

![Set user Password](/docs/images/part14_8.png)

Now you can log in to the app. After login, Keycloak may prompt for email, first name, and last name. Submit the required data.

You will be logged in and redirected to the `/library` route.

![Frontend Login](/docs/images/part14_9.png)

## Webservice Authentication

Next, integrate an `Authenticator` class into Django to protect your APIs.

First, protect your services using `DEFAULT_PERMISSION_CLASSES` in `settings.py`:

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

Alternatively, set `permission_classes` in your `ViewSet` classes:

```python
# ... exsting code ...
from rest_framework import permissions

class AuthorViewSet(viewsets.ModelViewSet):
  # ... exsting code ...
  permission_classes = [permissions.IsAuthenticated]
```

The `permission_classes` property overwrites `DEFAULT_PERMISSION_CLASSES` setting.

Now when you open your app, you will get an error that you do not have permission to access the data.

![Permission Error](/docs/images/part14_10.png)

### Install `python-keycloak` Library

Install the library:

```bash
# pip install python-keycloak
Collecting python-keycloak
  Using cached python_keycloak-5.5.0-py3-none-any.whl.metadata (6.0 kB)
Collecting aiofiles>=24.1.0 (from python-keycloak)
  Using cached aiofiles-24.1.0-py3-none-any.whl.metadata (10 kB)
Collecting async-property>=0.2.2 (from python-keycloak)
  Using cached async_property-0.2.2-py2.py3-none-any.whl.metadata (5.3 kB)
Collecting deprecation>=2.1.0 (from python-keycloak)
  Using cached deprecation-2.1.0-py2.py3-none-any.whl.metadata (4.6 kB)
Collecting httpx>=0.23.2 (from python-keycloak)
  Using cached httpx-0.28.1-py3-none-any.whl.metadata (7.1 kB)
Collecting jwcrypto>=1.5.4 (from python-keycloak)
  Using cached jwcrypto-1.5.6-py3-none-any.whl.metadata (3.1 kB)
Collecting requests>=2.20.0 (from python-keycloak)
  Using cached requests-2.32.3-py3-none-any.whl.metadata (4.6 kB)
Collecting requests-toolbelt>=0.6.0 (from python-keycloak)
  Using cached requests_toolbelt-1.0.0-py2.py3-none-any.whl.metadata (14 kB)
Collecting packaging (from deprecation>=2.1.0->python-keycloak)
  Using cached packaging-25.0-py3-none-any.whl.metadata (3.3 kB)
Collecting anyio (from httpx>=0.23.2->python-keycloak)
  Using cached anyio-4.9.0-py3-none-any.whl.metadata (4.7 kB)
Collecting certifi (from httpx>=0.23.2->python-keycloak)
  Using cached certifi-2025.4.26-py3-none-any.whl.metadata (2.5 kB)
Collecting httpcore==1.* (from httpx>=0.23.2->python-keycloak)
  Using cached httpcore-1.0.9-py3-none-any.whl.metadata (21 kB)
Collecting idna (from httpx>=0.23.2->python-keycloak)
  Using cached idna-3.10-py3-none-any.whl.metadata (10 kB)
Collecting h11>=0.16 (from httpcore==1.*->httpx>=0.23.2->python-keycloak)
  Using cached h11-0.16.0-py3-none-any.whl.metadata (8.3 kB)
Collecting cryptography>=3.4 (from jwcrypto>=1.5.4->python-keycloak)
  Using cached cryptography-44.0.3-cp39-abi3-macosx_10_9_universal2.whl.metadata (5.7 kB)
Requirement already satisfied: typing-extensions>=4.5.0 in /Users/rgiannetto/Developer/library/venv/lib/python3.12/site-packages (from jwcrypto>=1.5.4->python-keycloak) (4.13.2)
Collecting cffi>=1.12 (from cryptography>=3.4->jwcrypto>=1.5.4->python-keycloak)
  Using cached cffi-1.17.1-cp312-cp312-macosx_11_0_arm64.whl.metadata (1.5 kB)
Collecting pycparser (from cffi>=1.12->cryptography>=3.4->jwcrypto>=1.5.4->python-keycloak)
  Using cached pycparser-2.22-py3-none-any.whl.metadata (943 bytes)
Collecting charset-normalizer<4,>=2 (from requests>=2.20.0->python-keycloak)
  Downloading charset_normalizer-3.4.2-cp312-cp312-macosx_10_13_universal2.whl.metadata (35 kB)
Collecting urllib3<3,>=1.21.1 (from requests>=2.20.0->python-keycloak)
  Using cached urllib3-2.4.0-py3-none-any.whl.metadata (6.5 kB)
Collecting sniffio>=1.1 (from anyio->httpx>=0.23.2->python-keycloak)
  Using cached sniffio-1.3.1-py3-none-any.whl.metadata (3.9 kB)
Using cached python_keycloak-5.5.0-py3-none-any.whl (77 kB)
Using cached aiofiles-24.1.0-py3-none-any.whl (15 kB)
Using cached async_property-0.2.2-py2.py3-none-any.whl (9.5 kB)
Using cached deprecation-2.1.0-py2.py3-none-any.whl (11 kB)
Using cached httpx-0.28.1-py3-none-any.whl (73 kB)
Using cached httpcore-1.0.9-py3-none-any.whl (78 kB)
Using cached h11-0.16.0-py3-none-any.whl (37 kB)
Using cached jwcrypto-1.5.6-py3-none-any.whl (92 kB)
Using cached cryptography-44.0.3-cp39-abi3-macosx_10_9_universal2.whl (6.7 MB)
Using cached cffi-1.17.1-cp312-cp312-macosx_11_0_arm64.whl (178 kB)
Using cached requests-2.32.3-py3-none-any.whl (64 kB)
Downloading charset_normalizer-3.4.2-cp312-cp312-macosx_10_13_universal2.whl (199 kB)
Using cached idna-3.10-py3-none-any.whl (70 kB)
Using cached urllib3-2.4.0-py3-none-any.whl (128 kB)
Using cached certifi-2025.4.26-py3-none-any.whl (159 kB)
Using cached requests_toolbelt-1.0.0-py2.py3-none-any.whl (54 kB)
Using cached anyio-4.9.0-py3-none-any.whl (100 kB)
Using cached sniffio-1.3.1-py3-none-any.whl (10 kB)
Using cached packaging-25.0-py3-none-any.whl (66 kB)
Using cached pycparser-2.22-py3-none-any.whl (117 kB)
Installing collected packages: async-property, urllib3, sniffio, pycparser, packaging, idna, h11, charset-normalizer, certifi, aiofiles, requests, httpcore, deprecation, cffi, anyio, requests-toolbelt, httpx, cryptography, jwcrypto, python-keycloak
Successfully installed aiofiles-24.1.0 anyio-4.9.0 async-property-0.2.2 certifi-2025.4.26 cffi-1.17.1 charset-normalizer-3.4.2 cryptography-44.0.3 deprecation-2.1.0 h11-0.16.0 httpcore-1.0.9 httpx-0.28.1 idna-3.10 jwcrypto-1.5.6 packaging-25.0 pycparser-2.22 python-keycloak-5.5.0 requests-2.32.3 requests-toolbelt-1.0.0 sniffio-1.3.1 urllib3-2.4.0
```

Upgrade `requirements.txt`

```bash
# pip freeze > requirements.txt
```

Now, configure a new `library-api` client in your `library-realm` via the Keycloak admin console.

![New Client library-api](/docs/images/part14_11.png)

In `General Settings`:

- **Client type**: `OpenID Connect`
- **ClientID**: `library-api`
- **Name**: `Library api`
- Click `Next`

![library-api capability config](/docs/images/part14_12.png)

In `Capability config`:

- Enable `Client authentication`
- Enable `Authorization`
- In `Authorization flow`, select:
  - **Standard flow**
  - **OAuth 2.0 Device Authorization Grant**
- Click `Next`

![library-api Login settings](/docs/images/part14_13.png)

In `Login settings`:

- Set `Valid redirect URIs` to `*`
- Set `Web origins` to `*`
- Click **Save**

![library-api Login settings](/docs/images/part14_14.png)

In the `library-api` client, open the `Credentials` tab and copy the `Client Secret`.

We have configured Keycloak client to use `introspection`.

## Keycloak Integration Overview

**Keycloak Introspection**

Keycloak's **introspection** endpoint allows an application to verify and obtain information about an access token.

**Why use introspection?**
It is an endpoint exposed by Keycloak (compliant with the OAuth2 standard) that allows an application to send a token and receive a response indicating whether the token is valid, expired, revoked, and what permissions or user information it contains.

- **Why is it useful?**  
  The backend (Django API) often receives requests with a token. Instead of blindly trusting the token, it can ask Keycloak if the token is still valid and obtain details such as the user, roles, expiration, etc.

**Example Flow:**

1. User authenticates via Keycloak and obtains an access token.
2. User sends the token to the Django backend.
3. Django calls Keycloak's introspection endpoint with the token.
4. Keycloak responds with the token's status and associated information.
5. Django accepts or rejects the request based on the response.

**Note:** Introspection adds a network call, which may slightly slow down requests compared to local validation.

**Summary Diagram:**

```mermaid
sequenceDiagram
    participant Angular App as Angular App
    participant Keycloak as Keycloak
    participant Django API as Django API
    Angular App ->> Keycloak: Authenticate (OIDC)
    Keycloak ->> Angular App: Obtain Access Token
    loop For Each Request
        alt If Token is Active
            Angular App ->> Django API: Send Token in API Request
            Django API ->> Keycloak: Introspect/Validate Token
            alt If Token is Valid
                Keycloak ->> Django API: User/Role Info
                Django API -->> Django API: Elaborate Data
                Django API ->> Angular App: Respond with Data
            else If Token is not Valid
                Keycloak ->> Django API: Send HTTP ERROR - Invalid Token
                Django API ->> Angular App: Send 403 Forbidden to Angular App
            end
        else If token has expired
            Angular App ->> Keycloak: Use Refresh Token to Request new Access Token
            Keycloak ->> Angular App: Obtain Access Token
        end
    end
```

**Legend:**

- **Angular App:** Authenticates users via Keycloak and attaches the access token to API requests.
- **Django API:** Receives requests, validates tokens (using introspection if needed), and enforces permissions.
- **Keycloak Server:** Handles authentication, issues tokens, and provides user/role information.

This diagram summarizes the authentication and authorization flow, with Keycloak as the central identity provider.

### Update Django Settings

Add Keycloak properties to your `django.env`:

```bash
KEYCLOAK_SERVER_URL=http://127.0.0.1:8080/
KEYCLOAK_REALM=library-realm
KEYCLOAK_CLIENT_ID=library-api
KEYCLOAK_CLIENT_SECRET_KEY=[UPDATE WITH KEYCLOAK CLIENT SECRET]
```

In `settings.py`:

```python
KEYCLOAK_CONFIG = {
    'KEYCLOAK_SERVER_URL': django_env('KEYCLOAK_SERVER_URL'),
    'KEYCLOAK_REALM': django_env('KEYCLOAK_REALM'),
    'KEYCLOAK_CLIENT_ID': django_env('KEYCLOAK_CLIENT_ID'),
    'KEYCLOAK_CLIENT_SECRET_KEY': django_env('KEYCLOAK_CLIENT_SECRET_KEY')
}
```

Now, create a new `Authentication` class to manage and validate `Bearer Token`s generated by Keycloak.

#### Purpose of an Authentication Class in Django

An **Authentication Class** in Django REST Framework identifies the user making an API request by analyzing credentials (tokens, headers, etc.) and determines if the user is authenticated.

**Why is it important?**

- Protects APIs by ensuring only authenticated users can access resources.
- Supports different authentication methods by changing or adding Authentication Classes.
- Provides user information to views and permission checks.

**How does it work?**

- Every API request passes through the Authentication Class.
- If valid credentials are present, a user object is associated with the request.
- If credentials are missing or invalid, the request is rejected with an authentication error (HTTP 401 Unauthorized).

**In our case**, we implement a custom Authentication Class that validates Keycloak tokens via introspection, so only those with a valid token can access the Django APIs.

> #### What is a Bearer Token and What Is It Used For?
>
> A **Bearer Token** is an access token used to authenticate and authorize requests to a protected API. Whoever possesses this token (the "bearer") can access protected resources.
>
> **Usage:**
>
> - Issued by an authentication system (such as Keycloak) after successful login.
> - Included in the `Authorization` header of every HTTP request:
>
> ```
> Authorization: Bearer <token>
> ```
>
> - Allows the backend to identify the user and verify permissions.
> - Commonly used in OAuth 2.0 and OpenID Connect.
>
> The Bearer Token is the key that allows a client to prove its identity and access protected APIs securely.

With this theoretical foundation, we can now implement the necessary code to make our application work.

## Implementing Keycloak Authentication in Django

Let's implement a custom authentication class in Django REST Framework that validates Keycloak tokens using the introspection endpoint.

### 1. Create the Authentication Class

Create a new file, for example, `library_rest/library_rest/authentications.py` in your Django app:

```python
from rest_framework import authentication
from rest_framework import exceptions

from keycloak import KeycloakOpenID
import keycloak.exceptions

from django.conf import settings

from datetime import datetime
from django.utils import timezone
import json
from django.contrib.auth.models import AbstractBaseUser


from drf_spectacular.extensions import OpenApiAuthenticationExtension


class KeyCloakAuthenticationSchema(OpenApiAuthenticationExtension):
    # full import path OR class ref
    target_class = 'IpBlocker.authentication.KeyCloakAuthentication'
    name = 'KeyCloakAuthentication'  # name used in the schema

    def get_security_definition(self, auto_schema):
        return {
            'type': 'apiKey',
            'in': 'header',
            'name': 'api_key',
        }


class KeyCloakAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        access_token = request.META.get('HTTP_AUTHORIZATION')

        if not access_token:
            return None

        access_token = access_token.replace("Bearer ", "")

        try:
            keycloak_openid = KeycloakOpenID(
                server_url=settings.KEYCLOAK_CONFIG['KEYCLOAK_SERVER_URL'],
                client_id=settings.KEYCLOAK_CONFIG['KEYCLOAK_CLIENT_ID'],
                realm_name=settings.KEYCLOAK_CONFIG['KEYCLOAK_REALM'],
                client_secret_key=settings.KEYCLOAK_CONFIG['KEYCLOAK_CLIENT_SECRET_KEY']
            )

            user_info = keycloak_openid.userinfo(
                access_token
            )

            token_info = keycloak_openid.introspect(access_token)

        except keycloak.exceptions.KeycloakAuthenticationError:
            raise exceptions.AuthenticationFailed('Invalid token')
        except keycloak.exceptions.KeycloakGetError as e:
            JSON = json.loads(e.response_body.decode('utf8'))
            raise exceptions.AuthenticationFailed(
                'Keycloak error: {}'.format(JSON['error']))
        except keycloak.exceptions.KeycloakConnectionError:
            raise exceptions.AuthenticationFailed(
                'Keycloak connection error')

        # user = User(is_authenticated=True)
        class User(object):
            pass

        user = User()
        user.username = user_info['preferred_username']
        user.email = user_info['email']
        user.first_name = user_info['given_name']
        user.last_name = user_info['family_name']
        user.is_superuser = False
        user.is_staff = False
        user.is_active = True
        user.is_authenticated = True
        user.last_login = timezone.now()
        user.user_info = user_info
        user.token_info = token_info

        return (user, None)
```

The code defines two Python classes for authentication via Keycloak in our Django application:

### 1. `KeyCloakAuthenticationSchema`

- **Purpose:** Extends `OpenApiAuthenticationExtension` to document the authentication schema in OpenAPI/Swagger.
- **Properties:**
  - `target_class`: points to the actual authentication class.
  - `name`: the name used in the schema.
- **Method `get_security_definition`:**  
  Returns a dictionary describing the authentication type as `apiKey`, specifying that the key is located in the HTTP header with the name `api_key`.

### 2. `KeyCloakAuthentication`

- **Purpose:** Extends `authentication.BaseAuthentication` to implement authentication via Keycloak.
- **Method `authenticate`:**
  1. Retrieves the access token from the request's `Authorization` header.
  2. If the token is not present, returns `None` (no authenticated user).
  3. Removes the "Bearer " prefix from the token.
  4. Creates a `KeycloakOpenID` instance using settings from the configuration file.
  5. Retrieves user information (`userinfo`) and token information (`introspect`) from Keycloak.
  6. Handles various authentication and connection errors, returning appropriate errors.
  7. Dynamically creates a `User` object and populates its attributes with data obtained from Keycloak.
  8. Returns a tuple `(user, None)` as required by Django's authentication system.

### 2. Register the Authentication Class

In our `settings.py`, update the REST framework authentication classes:

```python
REST_FRAMEWORK = {
  'DEFAULT_AUTHENTICATION_CLASSES': [
      'library_rest.authentications.KeyCloakAuthentication',
      'rest_framework.authentication.SessionAuthentication',
      'rest_framework.authentication.BasicAuthentication',
  ],
  # ... other settings ...
}
```

Now we need to ensure that a `Bearer token` is sent with REST calls to our API service whenever a resource requires authentication. The `keycloak-angular` library already provides a way to integrate an `Interceptor` class for this purpose.

### What is an Interceptor

An **Interceptor** in Angular is a class that implements the `HttpInterceptor` interface and allows you to intercept and modify all HTTP requests and responses made by the application. Interceptors are commonly used to:

- Automatically add authentication headers (such as the Bearer token) to every API request.
- Handle global HTTP errors.
- Modify or log requests and responses.

In the context of `keycloak-angular`, an interceptor is used to insert the access token obtained from Keycloak into the `Authorization` header of every request to protected APIs, ensuring that only authenticated users can access backend resources.

**How it works:**

1. The user logs in via Keycloak and obtains an access token.
2. Every time the application makes an HTTP request to the backend, the interceptor automatically adds the `Authorization: Bearer <token>` header.
3. The backend can then validate the token and authorize access to the requested resources.

This approach makes the integration between frontend and backend transparent and secure.

Edit `app.config.ts` as follow:

```typescript
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { ApiModule, Configuration, ConfigurationParameters } from "./modules/core/api/v1";
import { environment } from "../environments/environment.development";
import { provideHttpClient, withFetch, withInterceptors, withXsrfConfiguration } from "@angular/common/http";

import {
  provideKeycloak,
  withAutoRefreshToken,
  AutoRefreshTokenService,
  UserActivityService,
  createInterceptorCondition,
  IncludeBearerTokenCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  includeBearerTokenInterceptor,
} from "keycloak-angular";

export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    basePath: environment.api_url,
  };
  return new Configuration(params);
}

const regex = new RegExp(`^(${environment.api_url})(/.*)?$`, "i");

const urlCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: regex,
  bearerPrefix: "Bearer",
});

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
        sessionTimeout: 1000 * 60 * 60, // 1 hour
      }),
    ],
    providers: [AutoRefreshTokenService, UserActivityService],
  });

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloakAngular(),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [urlCondition], // <-- Note that multiple conditions might be added.
    },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(ApiModule.forRoot(apiConfigFactory)),
    provideHttpClient(
      withFetch(),
      withXsrfConfiguration({
        cookieName: "CUSTOM_XSRF_TOKEN",
        headerName: "X-Custom-Xsrf-Header",
      }),
      withInterceptors([includeBearerTokenInterceptor])
    ),
  ],
};
```

```typescript
const regex = new RegExp(`^(${environment.api_url})(/.*)?$`, "i");
```

Create a new regular expression (`regex`). The regular expression is designed to match any URL that starts with the value of `environment.api_url`, optionally followed by a slash `/` and anything else. The **'i' flag** makes the search case-insensitive.

```typescript
const urlCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: regex,
  bearerPrefix: "Bearer",
});
```

Create a condition (`urlCondition`) for an interceptor (likely HTTP). Pass an object with two properties:

- `urlPattern`: the regex just created, which is used to identify the URLs to which the condition should apply.
- `bearerPrefix`: the string `'Bearer'`, probably used to add an authentication token in the Authorization header of HTTP requests.

This code defines a rule to intercept all HTTP requests going to the API specified in `environment.api_url` and, for these, applies logic that likely adds a Bearer token for authentication.

```typescript
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [urlCondition], // <-- Note that multiple conditions might be added.
    },
```

- **provide:** Specifies the injection token (`INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG`). This is used to identify the configuration you want to provide to Angular's Dependency Injection system.
- **useValue:** Here you assign a static value that will be used when someone requests `INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG`.
- **[urlCondition]:** is our regular expression that allows intercepting all calls that should go to our Django services.

The line:

```typescript
withInterceptors([includeBearerTokenInterceptor]);
```

- **withInterceptors**: is a function that allows you to add one or more "interceptors" to HTTP requests. An interceptor is a piece of code that can modify or observe a request or response before it is sent or received.
- **[includeBearerTokenInterceptor]**: is an array containing an interceptor called `includeBearerTokenInterceptor`. This interceptor, as the name suggests, adds a "Bearer" token (typically used for OAuth2 authentication) to the Authorization header of each HTTP request.

Now, open your web application and use your browser's debug console to inspect the HTTP headers sent in requests to your API.

```http
GET /library/books?ordering=title&page=1&page_size=5 HTTP/1.1
Host: 127.0.0.1:8000
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:137.0) Gecko/20100101 Firefox/137.0
Accept: application/json
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br, zstd
Referer: http://127.0.0.1:4200/
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJMUEZvd2RMbFRNUWRoOWhMZjM3ZFk5WUpGYXBEVURnNGE5Q3FUS1VHbkhNIn0.eyJleHAiOjE3NDYzNzE5NTIsImlhdCI6MTc0NjM3MTY1MiwiYXV0aF90aW1lIjoxNzQ2MzcxNjUyLCJqdGkiOiJvbnJ0YWM6NGE3YWYwMzAtYzM2Ny00MjZjLWFhN2EtZmI4MzUzYjQ0ZmE3IiwiaXNzIjoiaHR0cDovLzEyNy4wLjAuMTo4MDgwL3JlYWxtcy9saWJyYXJ5LXJlYWxtIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImRjYTI2ZTdjLTVjNmEtNGY3NC1hYjI5LTA5YWI5M2IwZDIwOCIsInR5cCI6IkJlYXJlciIsImF6cCI6ImxpYnJhcnktd2ViIiwic2lkIjoiMTgwYTU1ZDQtZGQ2Zi00NzFhLWJlMGYtMTlhNjJjYjA4MzhjIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLWxpYnJhcnktcmVhbG0iLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IlJpY2NhcmRvIEdpYW5uZXR0byIsInByZWZlcnJlZF91c2VybmFtZSI6ImF4aW9tNCIsImdpdmVuX25hbWUiOiJSaWNjYXJkbyIsImZhbWlseV9uYW1lIjoiR2lhbm5ldHRvIiwiZW1haWwiOiJyZ2lhbm5ldHRvQGdtYWlsLmNvbSJ9.mtCK6Nfff1gozkYsZiicdmSAGrsbL-UJmfLKyL3Nz8PL06m_jxIeSIF0Lc4qTFNTwlpykWemb86kWCgIQp7NjhLBLZXAFwxtcpoI99AdebhlQS5EMhoQrX7A1xENqc9a-aPfOTjbo9jBm_xVLijxJRYolXgbxa8t7NEC7JM5E0vYs52Up5y3gz1uhbz-KRhr1f9BeuwX7P1E6mCHDZxZ13_z4cWlgyycXJhg0JgSCIBPWkLceR59fCYiSC13VoeVoiBTAP8s8NfUEWmCsRpqAK3jb2zd-AHPbrRNdyo9WPyrwz8Uf50FyBtQgywNrKj5blHJee_MJMffSEDyWz0a6A
Origin: http://127.0.0.1:4200
DNT: 1
Sec-GPC: 1
Connection: keep-alive
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-site
Priority: u=4
Pragma: no-cache
Cache-Control: no-cache
```

As we can see, an `Authorization` header is now included with the required Bearer token to validate our identity. Note that, as requested, the Authorization header is present only in requests directed to our Django application.

Now our application works correctly.
