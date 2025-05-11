# A Full Test Application Using Django and Angular (Part 15) - Roles

In this section, we will modify our application to manage roles and permissions using Keycloak. Integrating Keycloak will allow us to centralize user authentication and authorization, assign specific roles, and securely and scalably control access to the various features of the application.

We will start by updating our application to display a toolbar that allows users to log out or view their profile. Next, we will integrate role management into our "Guard", enabling us to grant full or partial access to the library's features based on the user's role.

## Logout function

Let's open our `app.componet.html` and update it as following:

```html
<mat-toolbar *ngIf="authenticated" color="primary">
  <button mat-icon-button aria-label="Home" routerLink="/library">
    <mat-icon>menu_book</mat-icon>
  </button>
  <span>{{ title }}</span>
  <span class="spacer"></span>
  <a href="{{ profile_url }}" class="profile-link">
    <span class="username">{{ username }}</span>
  </a>
  <button mat-icon-button class="logout-button" (click)="logout()" matTooltip="Logout" aria-label="Logout">
    <mat-icon>logout</mat-icon>
  </button>
</mat-toolbar>

<div class="library">
  <router-outlet></router-outlet>
</div>
```

In `app.component.ts`:

```typescript
import { Component, effect, OnInit } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";
import Keycloak from "keycloak-js";
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType, typeEventArgs, ReadyArgs } from "keycloak-angular";
import { inject } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  imports: [RouterOutlet, RouterLink, MatIconModule, MatToolbarModule, MatButtonModule, NgIf],
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
  username: string | undefined;
  profile_url: string | undefined;

  constructor() {
    effect(() => {
      const keycloakEvent = this.keycloakSignal();

      console.log("Keycloak event:", keycloakEvent);

      this.keycloakStatus = keycloakEvent.type;

      if (this.keycloakStatus === KeycloakEventType.Ready) {
        this.authenticated = typeEventArgs<ReadyArgs>(keycloakEvent.args);
        this.profile_url = this.keycloak.createAccountUrl();
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
          console.log("Keycloak token parsed:", this.keycloak.tokenParsed);
          this.username = this.keycloak.tokenParsed?.["preferred_username"];

          this.authenticated = true;
        }
      });
    } else {
      if (this.keycloak.token) {
        console.log("Keycloak token:", this.keycloak.token);
        this.username = this.keycloak.tokenParsed?.["preferred_username"];
        console.log("Keycloak token parsed:", this.keycloak.tokenParsed);
      }
    }
  }

  logout() {
    this.keycloak.logout().then(() => {
      this.authenticated = false;
    });
  }
}
```

Essentially, we have created two new properties: `username` and `profile_url`, and we have assigned their values as follows:

```typescript
this.username = this.keycloak.tokenParsed?.["preferred_username"];
```

and

```typescript
this.profile_url = this.keycloak.createAccountUrl();
```

Finally, we have created the `logout()` method, which will allow us to handle the corresponding event:

```typescript
  logout() {
    this.keycloak.logout().then(() => {
      this.authenticated = false;
    });
  }
```

Finally, we have updated our view to display this new information on a toolbar.

Per migliorare la visualizzazione abbiamo aggiornato il nostro foglio `style.scss`:

```scss
@use "@angular/material" as mat;

:root {
  @include mat.divider-overrides(
    (
      color: white,
    )
  );
  @include mat.progress-bar-overrides(
    (
      active-indicator-color: rgb(188, 180, 180),
      track-color: white,
    )
  );
}

html,
body {
  height: 100%;
}
body {
  margin: 0;
  font-family: Roboto, "Helvetica Neue", sans-serif;
} /* You can add global styles to this file, and also import other style files */

h1 {
  color: #333;
  text-align: center;
}

a {
  color: red;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

a:visited {
  color: red;
}

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

.library {
  display: block;
  justify-content: center;
  align-items: left;
  width: 1200px;
  margin: 0 auto;
  margin-top: 20px;
  border: #333 solid 1px;
  border-radius: 5px;
  padding: 20px;
  background-color: #f9f9f9;
}

.library h2 {
  display: inline-block;
  text-align: left;
  color: #333;
  width: 200px;
}

.search-form-field {
  float: right;
  width: 250px;
}

.library-footer {
  margin: 20px 0 0 0;
  width: 100%;
  text-align: right;
}

.full-width {
  width: 100%;
  margin-top: 1rem;
}

/* Ensure mat-dialog-content has enough space */
mat-dialog-content {
  padding-top: 20px;
}

.notification {
  position: fixed;
  bottom: 1em;
  right: 1em;
  width: 300px;
  padding: 20px;
  background-color: #f44336;
  color: white;
  z-index: 100000;
  border-radius: 10px;
  border: 1px solid black;
  box-shadow: 0 2px 4px 0x0c0c0c85;
  transition: opacity 0.3s ease-in-out;
}
.notification.success {
  background-color: #4caf50;
}
.notification.error {
  background-color: #f44336;
}
.notification.info {
  background-color: #2196f3;
}
.notification.warning {
  background-color: #ffaa29;
}

.notification-header {
  font-weight: bold;
  font-size: 1.2em;
  display: flex;
  height: 30px;
  text-shadow: 1px 1px 1px #0c0c0c85;
}

.notification-header .close-btn {
  top: 5px;
  right: 5px;
  cursor: pointer;
  position: absolute;
  color: white;
}

.notification-header .close-btn:hover {
  color: white;
}

.notification-content {
  margin: 1em 0;
  min-height: 50px;
  text-shadow: 1px 1px 1px #0c0c0c85;
}

.add-author-card {
  margin-top: 20px;
}

.spacer {
  flex: 1 1 auto;
}

.username {
  color: #333;
  font-size: 0.8em;
}

.username:before {
  content: "@";
}

.profile-link a:hover {
  color: #333;
  text-decoration: underline;
}
```

Now, we update `auth.guard.ts` to manage oue roles correctly:

```typescript
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AuthGuardData, createAuthGuard } from "keycloak-angular";

const isAccessAllowed = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot, authData: AuthGuardData): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;

  const requiredRole = route.data["role"];

  if (!requiredRole) {
    return false;
  }

  const hasRequiredRole = (role: string): boolean => Object.values(grantedRoles.realmRoles).some((roles) => roles.includes(role));

  if (authenticated && hasRequiredRole(requiredRole)) {
    return true;
  }

  return false;
};

export const authGuard: CanActivateFn = createAuthGuard<CanActivateFn>(isAccessAllowed);
```

The code defines an **authentication guard**. Think of a guard as a bouncer at a club door. Before someone can enter a specific part of your application (a route), this guard checks if they have the necessary permissions.

Here's a step-by-step explanation:

1.  **Imports**:

    - `ActivatedRouteSnapshot`, `CanActivateFn`, `RouterStateSnapshot`, `UrlTree`: These are standard Angular routing building blocks.
      - `ActivatedRouteSnapshot`: Contains information about the route that is being activated (like URL segments, parameters, and data).
      - `CanActivateFn`: This is the type for a function that Angular's router will call to decide if a route can be activated.
      - `RouterStateSnapshot`: Represents the state of the router at a moment in time.
      - `UrlTree`: A representation of a URL, often used for redirecting the user.
    - `AuthGuardData`, `createAuthGuard` from `keycloak-angular`: These are specific to the `keycloak-angular` library, which helps integrate Keycloak (an open-source identity and access management solution) with Angular.
      - `AuthGuardData`: An object provided by `keycloak-angular` that contains authentication status (`authenticated`) and the roles granted to the user (`grantedRoles`).
      - `createAuthGuard`: A helper function from `keycloak-angular` to easily create an Angular route guard using custom logic.

2.  **`isAccessAllowed` Function**:

    - This is an `async` function that contains the core logic for deciding if access should be granted. It takes three arguments:
      - `route: ActivatedRouteSnapshot`: Information about the route the user is trying to access.
      - `state: RouterStateSnapshot`: Information about the overall router state.
      - `authData: AuthGuardData`: Data from Keycloak about the user's authentication status and roles.
    - It returns a `Promise<boolean | UrlTree>`:

      - `true`: If access is allowed.
      - `false`: If access is denied.
      - `UrlTree`: If access is denied and you want to redirect the user to a different route (e.g., a login page). This specific function only returns `true` or `false`.

    - **Inside `isAccessAllowed`**:
      - `const { authenticated, grantedRoles } = authData;`: This line destructures the `authData` object to easily access `authenticated` (a boolean indicating if the user is logged in) and `grantedRoles` (an object containing the user's roles).
      - `const requiredRole = route.data['role'];`: It tries to get a `role` from the `data` property of the route. This means when you define your routes in Angular, you'd specify which role is needed to access that route. For example:
        ```typescript
        // In your routing module
        {
          path: 'admin-panel',
          component: AdminPanelComponent,
          canActivate: [authGuard], // Our guard
          data: { role: 'admin' } // The required role
        }
        ```
      - `if (!requiredRole) { return false; }`: If the route definition doesn't specify a `requiredRole` in its `data` object, access is denied. This is a safety measure.
      - `const hasRequiredRole = (role: string): boolean => ...;`: This is a helper function to check if the user has the `requiredRole`.
        - `Object.values(grantedRoles.realmRoles)`: `grantedRoles` from Keycloak usually has a structure like `{ realmRoles: { 'your-client-id': ['role1', 'role2'] } }` or similar. This line gets an array of role arrays.
        - `.some((roles) => roles.includes(role))`: It then checks if _any_ of these role arrays include the `requiredRole`. The `.some()` method stops and returns `true` as soon as it finds a match.
      - `if (authenticated && hasRequiredRole(requiredRole)) { return true; }`: This is the main check. Access is granted (`return true`) **only if** the user is `authenticated` AND they `hasRequiredRole`.
      - `return false;`: If any of the above conditions are not met, access is denied.

3.  **`authGuard: CanActivateFn`**:
    - `export const authGuard: CanActivateFn = createAuthGuard<CanActivateFn>(isAccessAllowed);`
    - This line creates the actual Angular guard function named `authGuard`.
    - It uses the `createAuthGuard` helper from `keycloak-angular`.
    - You pass your custom logic function (`isAccessAllowed`) to `createAuthGuard`. `keycloak-angular` will then handle the interaction with Keycloak (like ensuring the Keycloak adapter is initialized) and then call your `isAccessAllowed` function with the necessary `authData`.
    - The `export` keyword makes this `authGuard` available to be imported and used in your Angular routing configuration.

**In summary:**

This code sets up a route guard (`authGuard`) that uses Keycloak to check two things before allowing a user to access a route:

1.  Is the user logged in (`authenticated`)?
2.  Does the user have the specific `role` required for that route (as defined in the route's `data` property)?

If both conditions are true, the user can proceed to the route. Otherwise, access is denied. This is a common pattern for implementing role-based access control in web applications.

We need updating out `routing` by setting in `data` property the correct role. We will use `view-books` role name, so, the our `app.routes.ts` will be updated as following:

```typescript
import { Routes } from "@angular/router";
import { authGuard } from "./auth.guard";

export const routes: Routes = [
  {
    path: "library",
    loadChildren: () => import("./modules/library/library.module").then((m) => m.LibraryModule),
    canActivate: [authGuard],
    data: { role: "view-books" },
  },
  { path: "", redirectTo: "/library", pathMatch: "full" },
  { path: "**", redirectTo: "/library", pathMatch: "full" },
];
```

Now, when navigating through our application, we will not be able to see any books because Keycloak does not assign the required role to the user.

![No Data](/docs/images/part15_1.png)

## Configuring Roles and Groups in Keycloak

To allow users to access the protected features of the application, we will configure roles and assign them to a group called `library-readers`. Users who need to view books will be added to this group, simplifying permission management.

Here are the main steps:

1. **Access the Keycloak Administration Console**  
   Go to your Keycloak URL and log in as an administrator.

2. **Select the Correct Realm**  
   Make sure you are in the realm used by your application.

3. **Create the Required Role**

![Roles](/docs/images/part15_2.png)

- In the sidebar menu, go to **Roles**.
- Click on **Create Role**.
- Enter the role name (for example, `view-books`) and save.

![Create Role](/docs/images/part15_3.png)

4. **Create the `library-readers` Group**

![Groups](/docs/images/part15_4.png)

- Go to **Groups**.
- Click on **New Group** and enter the name `library-readers`.
- Save the group.

![Create Group](/docs/images/part15_5.png)

5. **Assign the Role to the Group**

![Assign Role](/docs/images/part15_6.png)

- Select the `library-readers` group.
- Go to the group's **Roles** tab.
- Click on **Assign Roles** button.
- Change Filter from `Filter by clients` to `Filter by realm roles`.

![Roles Filter](/docs/images/part15_7.png)

- select the `view-books` role, then `Assign` button.

![Role assign](/docs/images/part15_8.png)

6. **Add the User to the Group**

- Go to **Users** and select the user who should be able to view books.
- In the **Groups** tab, click on **Join Groups** and select `library-readers`.

![Group assign](/docs/images/part15_9.png)

7. **Verify the Configuration**  
   After assigning the user to the group, log out and log back in as the user in the application. The user should now be able to access the sections protected by the guard requiring the `view-books` role.

This configuration allows you to centrally and scalably manage user permissions: simply add or remove users from the `library-readers` group to grant or revoke access to the book viewing features.

Now our application works correctly.

![Group assign](/docs/images/part15_10.png)

Now let's verify our token. To do this, copy your token and run the following command in the terminal:

```bash
# echo "[ YOUR TIKEN ]" | jq -R 'split(".") | .[1] | @base64d | fromjson'
{
  "exp": 1746901020,
  "iat": 1746900720,
  "auth_time": 1746900700,
  "jti": "onrtac:60f25a5e-44bd-4453-a1da-e822972013b9",
  "iss": "http://127.0.0.1:8080/realms/library-realm",
  "aud": "account",
  "sub": "dca26e7c-5c6a-4f74-ab29-09ab93b0d208",
  "typ": "Bearer",
  "azp": "library-web",
  "sid": "4d8d5e63-e5bf-406f-9a35-222e71fa57ff",
  "acr": "0",
  "allowed-origins": [
    "*"
  ],
  "realm_access": {
    "roles": [
      "default-roles-library-realm",
      "offline_access",
      "view-books",      // <--- OUR ROLE
      "uma_authorization"
    ]
  },
  "resource_access": {
    "account": {
      "roles": [
        "manage-account",
        "manage-account-links",
        "view-profile"
      ]
    }
  },
  "scope": "openid email profile",
  "email_verified": true,
  "name": "XXX",
  "preferred_username": "xxx",
  "given_name": "XXX",
  "family_name": "XXX",
  "email": "XXX"
}
```

As we can see, within the Keycloak JWT token, roles are present in two distinct properties: `realm_access` and `resource_access`. Let's see the difference.

### `realm_access`

- Contains the **roles** assigned to the user at the **realm** level (i.e., global for the entire authentication domain).
- These roles are valid for all applications/clients that are part of that realm.
- Example:
  ```json
  "realm_access": {
    "roles": [
      "default-roles-library-realm",
      "offline_access",
      "view-books",
      "uma_authorization"
    ]
  }
  ```
- If your backend checks whether the user has the `view-books` role, it will find it here.

### `resource_access`

- Contains the **roles** assigned to the user but **specific to each client** (application) registered in Keycloak.
- It is a map where the key is the client name and the value is the list of roles for that application.
- Example:
  ```json
  "resource_access": {
    "account": {
      "roles": [
        "manage-account",
        "manage-account-links",
        "view-profile"
      ]
    }
  }
  ```
- If you have roles that are valid only for a certain application (e.g., `admin` only for the `library-web` client), you will find them here.

---

**In summary:**

- Use `realm_access` for global roles valid throughout the realm.
- Use `resource_access` for roles specific to a single application/client.

This distinction allows you to manage permissions both globally and per application in a flexible way.

## Keycloak Roles Management in Django

To leverage Keycloak roles within your Django backend, you need to extract and interpret the roles from the JWT token sent by the frontend. This allows your Django application to enforce role-based access control (RBAC) on API endpoints.

Let's create new python module `library_rest/decorators.py` and define as following:

```python
# file: library_rest/decorators.py

from functools import wraps
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status


def keycloak_role_required(required_role):
    """
    Decorator to enforce that the requesting user has a specific Keycloak realm role.

    Args:
        required_role (str): The name of the required Keycloak realm role.

    Returns:
        function: A decorator that wraps a Django REST Framework view function.

    Behavior:
        - Checks if the authenticated user possesses the specified Keycloak realm role.
        - If DEBUG is active and user is superuser, bypass role checks.
        - If the user has the required role, the view function is executed.
        - If the user does not have the required role, returns a 403 Forbidden response.
        - If there is an error accessing the token or roles, returns a 401 Unauthorized response.

    Usage:
        @keycloak_role_required('admin')
        def my_func(request):
        ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):

            if settings.DEBUG and request.request.user.is_superuser:
                return view_func(request, *args, **kwargs)

            try:
                realm_roles = request.request.user.token_info['realm_access'].get('roles', [
                ])

                if required_role in realm_roles:
                    return view_func(request, *args, **kwargs)
                else:
                    return Response({"detail": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)
            except Exception:
                return Response({"detail": "Invalid token."}, status=status.HTTP_401_UNAUTHORIZED)
        return _wrapped_view
    return decorator
```

The decorator is used to check that the user has a specific role before allowing the execution of a function (typically a view in a web application, such as Django or DRF).

Here is a step-by-step explanation:

1. **Definition of the decorator**  
   The `decorator` function takes `view_func` as a parameter, which is the function you want to decorate (for example, a view).

2. **Internal function `_wrapped_view`**  
   This function wraps the original view and intercepts the call. It receives `request`, `*args`, and `**kwargs` to maintain compatibility with any view.

3. **Superuser Bypass (in DEBUG)**  
   If Django is running in `DEBUG` mode and the user is a superuser, the view is executed without role checks. This is useful for local development and testing.

4. **Role extraction**  
   It tries to extract the authenticated user's roles from `request.request.user.token_info['realm_access']['roles']`. If the key is not found, it returns an empty list.

5. **Required role check**  
   If the required role (`required_role`) is present among the user's roles, the view is executed normally.  
   Otherwise, it returns an HTTP 403 (Forbidden) response with a permission denied message.

6. **Exception handling**  
   If something goes wrong (for example, the token is invalid or some information is missing), it returns an HTTP 401 (Unauthorized) response.

7. **Returning the decorator**  
   Finally, the `decorator` function returns `_wrapped_view`, which replaces the original view.
