# A Full Test Application Using Django and Angular (Part 15) - Roles

In this section, we will modify our application to manage roles and permissions using Keycloak. Integrating Keycloak will allow us to centralize user authentication and authorization, assign specific roles, and securely and scalably control access to the various features of the application.

We will start by updating our application to display a toolbar that allows users to log out or view their profile. Next, we will integrate role management into our "Guard", enabling us to grant full or partial access to the library's features based on the user's role.

## Logout function

Let's open our `app.componet.html` and update it as follows:

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

To improve the appearance, we updated our `style.scss` file:

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

Now, let's update `auth.guard.ts` to correctly manage our roles:

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

We need to update our `routing` by setting the correct role in the `data` property. We will use the `view-books` role name, so our `app.routes.ts` will be updated as follows:

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

- Select the `view-books` role, then click the `Assign` button.

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
# echo "[ YOUR TOKEN ]" | jq -R 'split(".") | .[1] | @base64d | fromjson'
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

Let's create a new Python module `library_rest/decorators.py` and define it as follows:

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

### Add `@keycloak_role_required` decorator to our ViewSet

To apply the role decorator to our viewset, simply add `@keycloak_role_required('view-books')` above the methods in your ViewSet that require role-based protection. To restrict access to the `list` method of a Django REST Framework ViewSet, we can do the following:

```python
# ... existing code ...

class BookViewSet(viewsets.ModelViewSet):
    # ... existing code ...

    @keycloak_role_required("view-books")
    def list(self, request):
        """
        Lists all book instances.

        This method overrides the default `list` method to enforce that the requesting user
        has the "view-books" role via the `keycloak_role_required` decorator. If the user
        has the required role, it returns a list of all books; otherwise, access is denied.

        Args:
          request: The HTTP request object.

        Returns:
          Response: A DRF Response object containing the serialized list of books or an error message.
        """
        return super().list(request)

```

This ensures that only users with the `view-books` role assigned in Keycloak can access the `list` endpoint. You can apply the decorator to other methods (such as `create`, `update`, or `destroy`) as needed, depending on the required permissions for each operation.

> ### Explain: How to override ViewSet methods in Django REST Framework
>
> To customize the behavior of a ViewSet, you can **override** its methods. The most common methods you can override are:
>
> - `list(self, request)`: for listing objects (GET on collection)
> - `retrieve(self, request, pk=None)`: for retrieving a single object (GET on detail)
> - `create(self, request)`: for creation (POST)
> - `update(self, request, pk=None)`: for updating (PUT)
> - `partial_update(self, request, pk=None)`: for updating (PATCH) only used fields.
> - `destroy(self, request, pk=None)`: for deletion (DELETE)
>
> **Example of overriding the `list` method:**
>
> ```python
> class BookViewSet(viewsets.ModelViewSet):
>   queryset = Book.objects.all()
>   serializer_class = BookSerializer
>
>   def list(self, request):
>     # Custom logic here
>     print("Book list requested")
>     return super().list(request)
> ```
>
> You can add decorators (like `@keycloak_role_required`) above these methods to apply specific permission checks.
>
> **Note:** Remember to call `super().list(request)` (or the corresponding method) if you want to keep the standard behavior in addition to your customizations.

Now, we can test our backend by updating `@keycloak_role_required("view-books")` to `@keycloak_role_required("view-library")`.
We get an error as expected.

![Backend Role Error](/docs/images/part15_11.png)

Now that you know what to do, implement two new roles in Keycloak: `create-book` and `create-author`. Finally, create the group `library-administrators` and assign to it the roles `view-books`, `create-book`, and `create-author`.

![library-administrators group](/docs/images/part15_12.png)

Now we update our `ViewSet` to manage `view-books` privilege for readonly methods: `list` and `retrieve`, otherwise, for write methods: `create`, `update`, `partial_update` and `destroy` we assign respectively `create-book` for `BookViewSet` and `create-author` for `AuthorViewSet`. Here is the complete code:

```python
# file: library_rest/library/views/book_view_set.py

from rest_framework import viewsets
from library.models.book import Book
from library.serializers.book_serializer import BookSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from library.pagination import LibraryPagination
from library_rest.decorators import keycloak_role_required


class BookViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Book instances.

    This viewset provides the following features:
    - List, retrieve, create, update, and delete operations for Book objects.
    - Filtering by 'title', 'author', and 'publication_date'.
    - Searching by 'title', 'author__last_name', and 'author__first_name'.
    - Ordering by 'title', 'author', and 'publication_date' (default ordering by 'title').
    - Pagination using the custom LibraryPagination class.
    - Access to endpoints is restricted by Keycloak roles.

    Attributes:
      queryset (QuerySet): The queryset of all Book objects.
      serializer_class (Serializer): The serializer class for Book objects.
      filter_backends (list): The list of filter backends for filtering, searching, and ordering.
      filterset_fields (list): Fields available for filtering.
      search_fields (list): Fields available for search.
      ordering_fields (list): Fields available for ordering.
      ordering (list): Default ordering.
      pagination_class (Pagination): The pagination class used for paginating results.

    Methods:
      list(request, *args, **kwargs): Returns a paginated list of books, restricted by 'view-books' role.
      retrieve(request, pk=None, *args, **kwargs): Retrieves a book by pk, restricted by 'view-books' role.
      create(request, *args, **kwargs): Creates a new book, restricted by 'create-book' role.
      update(request, pk=None, *args, **kwargs): Updates a book, restricted by 'create-book' role.
      destroy(request, pk=None, *args, **kwargs): Deletes a book, restricted by 'create-book' role.
      partial_update(request, pk=None, *args, **kwargs): Partially updates a book, restricted by 'create-book' role.
    """

    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['title', 'author', 'publication_date']
    search_fields = ['title', 'author__last_name', 'author__first_name']
    ordering_fields = ['title', 'author', 'publication_date']
    ordering = ['title']
    pagination_class = LibraryPagination

    @keycloak_role_required("view-books")
    def list(self, request):
        """
        Lists all book instances.

        This method overrides the default `list` method to enforce that the requesting user
        has the "view-books" role via the `keycloak_role_required` decorator. If the user
        has the required role, it returns a list of all books; otherwise, access is denied.

        Args:
          request: The HTTP request object.

        Returns:
          Response: A DRF Response object containing the serialized list of books or an error message.
        """
        return super().list(request)

    @keycloak_role_required("view-books")
    def retrieve(self, request, pk=None):
        """
        Retrieves a specific book instance by its primary key (pk).

        This method overrides the default `retrieve` method to enforce that the requesting user
        has the "view-books" role via the `keycloak_role_required` decorator. If the user
        has the required role, it returns the details of the specified book; otherwise, access is denied.

        Args:
          request: The HTTP request object.
          pk: The primary key of the book instance to retrieve.

        Returns:
          Response: A DRF Response object containing the serialized book details or an error message.
        """
        return super().retrieve(request, pk)

    @keycloak_role_required("create-book")
    def create(self, request):
        """
        Creates a new book instance.

        This method overrides the default `create` method to enforce that the requesting user
        has the "create-book" role via the `keycloak_role_required` decorator. If the user
        has the required role, it creates a new book; otherwise, access is denied.

        Args:
          request: The HTTP request object containing the book data.

        Returns:
          Response: A DRF Response object containing the serialized book details or an error message.
        """
        return super().create(request)

    @keycloak_role_required("create-book")
    def update(self, request, pk=None):
        """
        Updates an existing book instance.

        This method overrides the default `update` method to enforce that the requesting user
        has the "create-book" role via the `keycloak_role_required` decorator. If the user
        has the required role, it updates the specified book; otherwise, access is denied.

        Args:
          request: The HTTP request object containing the updated book data.
          pk: The primary key of the book instance to update.

        Returns:
          Response: A DRF Response object containing the serialized book details or an error message.
        """
        return super().update(request, pk)

    @keycloak_role_required("create-book")
    def destroy(self, request, pk=None):
        """
        Deletes a specific book instance by its primary key (pk).

        This method overrides the default `destroy` method to enforce that the requesting user
        has the "create-book" role via the `keycloak_role_required` decorator. If the user
        has the required role, it deletes the specified book; otherwise, access is denied.

        Args:
          request: The HTTP request object.
          pk: The primary key of the book instance to delete.

        Returns:
          Response: A DRF Response object indicating success or failure of the deletion.
        """
        return super().destroy(request, pk)

    @keycloak_role_required("create-book")
    def partial_update(self, request, pk=None):
        """
        Partially updates an existing book instance.

        This method overrides the default `partial_update` method to enforce that the requesting user
        has the "create-book" role via the `keycloak_role_required` decorator. If the user
        has the required role, it partially updates the specified book; otherwise, access is denied.

        Args:
          request: The HTTP request object containing the updated book data.
          pk: The primary key of the book instance to update.

        Returns:
          Response: A DRF Response object containing the serialized book details or an error message.
        """
        return super().partial_update(request, pk)
```

```python
# file: library_rest/library/views/author_view_set.py

from rest_framework import viewsets
from library.models import Author
from library.serializers import AuthorSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from library.pagination import LibraryPagination
from library_rest.decorators import keycloak_role_required


class AuthorViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Author instances.

    This viewset provides the following features:
    - Lists, retrieves, creates, updates, and deletes Author objects.
    - Supports filtering by 'first_name', 'last_name', and 'citizenship'.
    - Allows searching by 'first_name' and 'last_name'.
    - Supports ordering by 'first_name' and 'last_name', with default ordering by 'last_name' then 'first_name'.
    - Uses a custom pagination class (LibraryPagination).

    Attributes:
        queryset (QuerySet): The queryset of Author objects.
        serializer_class (Serializer): The serializer class for Author objects.
        filter_backends (list): The list of filter backends for filtering, ordering, and searching.
        search_fields (list): Fields to enable search functionality.
        ordering_fields (list): Fields that can be used for ordering results.
        ordering (list): Default ordering for the queryset.
        filterset_fields (list): Fields that can be used for filtering results.
        pagination_class (Pagination): The pagination class to use for paginating results.

    Methods:
        list(request, *args, **kwargs): Returns a paginated list of authors.
        retrieve(request, pk=None, *args, **kwargs): Retrieves a specific author by primary key (pk).
        create(request, *args, **kwargs): Creates a new author instance.
        update(request, pk=None, *args, **kwargs): Updates an existing author instance.
        destroy(request, pk=None, *args, **kwargs): Deletes an author instance by primary key (pk).
        partial_update(request, pk=None, *args, **kwargs): Partially updates an existing author instance.
    """

    queryset = Author.objects.all()
    serializer_class = AuthorSerializer

    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]

    search_fields = ['first_name', 'last_name']
    ordering_fields = ['first_name', 'last_name']
    ordering = ['last_name', 'first_name']
    filterset_fields = ['first_name', 'last_name', 'citizenship']
    pagination_class = LibraryPagination

    @keycloak_role_required("view-books")
    def list(self, request):
        """
        Lists all author instances.

        This method overrides the default `list` method to provide a custom implementation
        for listing author instances. It returns a paginated list of authors.

        Args:
            request: The HTTP request object.

        Returns:
            Response: A DRF Response object containing the serialized list of authors.
        """
        return super().list(request)

    @keycloak_role_required("view-books")
    def retrieve(self, request, pk=None):
        """
        Retrieves a specific author instance.

        This method overrides the default `retrieve` method to provide a custom implementation
        for retrieving an author instance by its primary key (pk).

        Args:
            request: The HTTP request object.
            pk: The primary key of the author instance to retrieve.

        Returns:
            Response: A DRF Response object containing the serialized author instance.
        """
        return super().retrieve(request, pk)

    @keycloak_role_required("create-author")
    def create(self, request):
        """
        Creates a new book instance.

        This method overrides the default `create` method to enforce that the requesting user
        has the "create-author" role via the `keycloak_role_required` decorator. If the user
        has the required role, it creates a new book; otherwise, access is denied.

        Args:
          request: The HTTP request object containing the book data.

        Returns:
          Response: A DRF Response object containing the serialized book details or an error message.
        """
        return super().create(request)

    @keycloak_role_required("create-author")
    def update(self, request, pk=None):
        """
        Updates an existing book instance.

        This method overrides the default `update` method to enforce that the requesting user
        has the "create-author" role via the `keycloak_role_required` decorator. If the user
        has the required role, it updates the specified book; otherwise, access is denied.

        Args:
          request: The HTTP request object containing the updated book data.
          pk: The primary key of the book instance to update.

        Returns:
          Response: A DRF Response object containing the serialized book details or an error message.
        """
        return super().update(request, pk)

    @keycloak_role_required("create-author")
    def destroy(self, request, pk=None):
        """
        Deletes a specific book instance by its primary key (pk).

        This method overrides the default `destroy` method to enforce that the requesting user
        has the "create-author" role via the `keycloak_role_required` decorator. If the user
        has the required role, it deletes the specified book; otherwise, access is denied.

        Args:
          request: The HTTP request object.
          pk: The primary key of the book instance to delete.

        Returns:
          Response: A DRF Response object indicating success or failure of the deletion.
        """
        return super().destroy(request, pk)

    @keycloak_role_required("create-author")
    def partial_update(self, request, pk=None):
        """
        Partially updates an existing book instance.

        This method overrides the default `partial_update` method to enforce that the requesting user
        has the "create-author" role via the `keycloak_role_required` decorator. If the user
        has the required role, it partially updates the specified book; otherwise, access is denied.

        Args:
          request: The HTTP request object containing the updated book data.
          pk: The primary key of the book instance to update.

        Returns:
          Response: A DRF Response object containing the serialized book details or an error message.
        """
        return super().partial_update(request, pk)
```

Now, if you try to add a new book and your user is in the `library-readers` group, you will get an error.

![library-readers add error](/docs/images/part15_13.png)

## Angular, Role-based functionality

Finally, we want our frontend application to show, according to the user's roles, the buttons to add books or authors.

### Angular: Conditionally Display Buttons Based on Roles

To achieve this, we need to:

1. **Expose user roles in the Angular app**  
   After login, extract the user's roles from the Keycloak token and store them in a property (e.g., `realmRoles`).

2. **Create a helper method to check for roles**  
   Add a method in your component to check if the user has a specific role.

3. **Use `*ngIf` in your templates**  
   Show or hide buttons based on the user's roles.

#### Example Implementation

**In your `your.component.ts` (or a relevant component):**

```typescript
import Keycloak from "keycloak-js";
// ... other imports

export class YourComponent implements OnInit {
  // ... existing properties
  userRoles: string[] = [];

  ngOnInit(): void {
    // ... existing logic
    if (this.keycloak.token) {
      // Extract realm roles from the token
      this.realmRoles = this.keycloak.tokenParsed?.["realm_access"]?.["roles"] || [];
    }
  }

  hasRole(role: string): boolean {
    return this.realmRoles.includes(role);
  }
}
```

**In your template (e.g., `your.component.html` or a feature component):**

```html
<!-- Show "Add Book" button only if user has 'create-book' role -->
<button mat-raised-button color="primary" *ngIf="hasRole('create-book')">Add Book</button>

<!-- Show "Add Author" button only if user has 'create-author' role -->
<button mat-raised-button color="accent" *ngIf="hasRole('create-author')">Add Author</button>
```

You can use the `hasRole` method anywhere in your templates to conditionally display UI elements based on the user's roles.

**Result:**

- Users in the `library-readers` group will not see the "Add Book" or "Add Author" buttons.
- Users in the `library-administrators` group (with `create-book` and `create-author` roles) will see the buttons and be able to use the related features.

This approach ensures your frontend UI is consistent with your backend permissions, providing a secure and user-friendly experience.

This the final code of our `LibraryComponent` and `AddNewBookComponent`:

**LibraryComponent**

```html
<h2>Books</h2>

<app-books-list></app-books-list>

<hr />
<div class="library-footer">
  <a mat-raised-button color="primary" (click)="openAddBookDialog()" *ngIf="hasRole('create-book')">
    <mat-icon>add</mat-icon>
    Add New Book
  </a>
</div>

<app-library-notification></app-library-notification>
```

```typescript
import { Component, inject, OnInit } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

import { MatDialog } from "@angular/material/dialog";
import { AddNewBookComponent } from "../add-new-book/add-new-book.component";
import { BooksListComponent } from "../books-list/books-list.component";
import { LibraryBooksListUpdateService } from "../../services/library-books-list-update.service";
import { LibraryNotificationComponent } from "../library-notification/library-notification.component";

import Keycloak from "keycloak-js";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-library",
  imports: [MatButtonModule, MatIconModule, BooksListComponent, LibraryNotificationComponent, NgIf],
  templateUrl: "./library.component.html",
  styleUrl: "./library.component.scss",
})
export class LibraryComponent implements OnInit {
  keycloak = inject(Keycloak);
  realmRoles: string[] = [];

  constructor(public dialog: MatDialog, private readonly booksListUpdateService: LibraryBooksListUpdateService) {}

  ngOnInit(): void {
    if (this.keycloak.token) {
      // Extract realm roles from the token
      this.realmRoles = this.keycloak.tokenParsed?.["realm_access"]?.["roles"] || [];
      console.log("Realm roles:", this.realmRoles);
    }
  }

  /**
   * Opens a dialog window containing the AddNewBookComponent.
   * Configures the dialog's width.
   */
  openAddBookDialog(): void {
    const dialogRef = this.dialog.open(AddNewBookComponent, {
      width: "700px",
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
      if (result) {
        this.booksListUpdateService.updateBooksList();
        console.log("Dialog result:", result);
      }
    });
  }

  /**
   * Checks if the current user has the specified role.
   *
   * @param role - The name of the role to check for.
   * @returns `true` if the user has the specified role, otherwise `false`.
   */
  hasRole(role: string): boolean {
    return this.realmRoles.includes(role);
  }
}
```

**AddNewBookComponent**

```html
<h2 mat-dialog-title>Add New Book</h2>
<mat-dialog-content>
  <form [formGroup]="addBookForm" id="addBookForm">
    <!-- Title Field -->
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Title</mat-label>
      <input matInput formControlName="title" placeholder="Enter book title" required />
      <mat-error *ngIf="addBookForm.get('title')?.hasError('required')"> Title is required </mat-error>
    </mat-form-field>

    <!-- Author Field -->
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Author</mat-label>
      <input matInput formControlName="author" placeholder="Enter author name" required [matAutocomplete]="auto" />
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn">
        @for (author of filteredOptions | async; track author.id) {
        <mat-option [value]="author"> {{ author.first_name }} {{ author.last_name }} </mat-option>
        }
      </mat-autocomplete>
      <mat-hint align="end" *ngIf="hasRole('create-author')">
        <strong>
          <a mat-button (click)="toggleNewAuthor()"> @if (!newAuthor) { Add new author } @else { Select existing author } </a>
        </strong>
      </mat-hint>
      <mat-error *ngIf="addBookForm.get('author')?.hasError('required')"> Author is required </mat-error>
    </mat-form-field>

    <div *ngIf="newAuthor">
      <app-add-new-author (authorCancelled)="onAuthorCancelled()" (authorAdded)="onAuthorAdded($event)"></app-add-new-author>
    </div>

    <!-- Publication Date Field -->
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Publication Date</mat-label>
      <input matInput [matDatepicker]="picker" formControlName="publication_date" placeholder="Choose a date" required />
      <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker #picker></mat-datepicker>
      <mat-error *ngIf="addBookForm.get('publication_date')?.hasError('required')"> Publication Date is required </mat-error>
    </mat-form-field>
  </form>
</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button (click)="onCancel()">Cancel</button>
  <!-- Bind the form submission to the form element's submit event -->
  <button mat-raised-button color="primary" type="submit" form="addBookForm" [disabled]="!addBookForm.valid" (click)="onSubmit()">Add Book</button>
</mat-dialog-actions>
```

```typescript
// src/app/modules/library/components/add-new-book/add-new-book.component.ts
import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { Author, BookRequest, LibraryAuthorsListRequestParams, LibraryBooksCreateRequestParams, LibraryService } from "../../../core/api/v1"; // Adjust path as needed
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatAutocompleteModule } from "@angular/material/autocomplete";

import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, MatNativeDateModule, NativeDateAdapter } from "@angular/material/core";
import { CommonModule, NgIf } from "@angular/common";
import { MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions } from "@angular/material/dialog";
import { map, Observable, startWith, switchMap } from "rxjs";
import { LibraryNotificationService } from "../../services/library-notification.service";
import { AddNewAuthorComponent } from "../add-new-author/add-new-author.component";

import Keycloak from "keycloak-js";

@Component({
  selector: "app-add-new-book",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatAutocompleteModule,
    AddNewAuthorComponent,
    NgIf,
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
  ],
  templateUrl: "./add-new-book.component.html",
  styleUrls: ["./add-new-book.component.scss"],
})
/**
 * Component for adding a new book to the library.
 *
 * This component provides a form for entering book details, including title, author, and publication date.
 * It features an autocomplete input for selecting authors, which fetches matching authors from the backend as the user types.
 * Upon form submission, the component validates the input, formats the data as required by the API, and sends a request to create the new book.
 * The dialog is closed upon successful creation or cancellation.
 *
 * @remarks
 * - Uses Angular Reactive Forms for form handling and validation.
 * - Integrates with the `LibraryService` to fetch authors and create books.
 * - Utilizes Angular Material Dialog for modal functionality.
 * - Implements an autocomplete feature for author selection.
 *
 * @see LibraryService
 */
export class AddNewBookComponent implements OnInit {
  addBookForm!: FormGroup;
  filteredOptions: Observable<Author[]> | undefined;
  newAuthor = false;
  authorControl = new FormControl("", Validators.required);
  keycloak = inject(Keycloak);
  realmRoles: string[] = [];

  /**
   * Initializes a new instance of the AddNewBookComponent.
   *
   * @param fb - The FormBuilder service used to create and manage reactive forms.
   * @param dialogRef - Reference to the dialog opened for adding a new book.
   * @param libraryService - Service for interacting with the library's data and operations.
   */
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddNewBookComponent>,
    private libraryService: LibraryService,
    private libraryNotificationService: LibraryNotificationService
  ) {}

  /**
   * Initializes the add book form and sets up the filtered options for the author autocomplete.
   *
   * - Creates a reactive form group with controls for title, author, and publication date.
   * - Sets up an observable (`filteredOptions`) that listens to changes in the author input,
   *   and filters the available author options accordingly.
   * - Uses `startWith` to initialize the filter and `switchMap` to handle asynchronous filtering logic.
   */
  ngOnInit(): void {
    this.addBookForm = this.fb.group({
      title: ["", Validators.required],
      author: this.authorControl,
      publication_date: ["", Validators.required],
    });

    this.filteredOptions = this.authorControl.valueChanges.pipe(
      startWith(""),
      switchMap((value) => {
        if (typeof value === "string") {
          return this._filter(value);
        }
        return [[]];
      })
    );

    if (this.keycloak.token) {
      // Extract realm roles from the token
      this.realmRoles = this.keycloak.tokenParsed?.["realm_access"]?.["roles"] || [];
      console.log("Realm roles:", this.realmRoles);
    }
  }

  /**
   * Formats an Author object into a display string.
   *
   * @param author - The Author object to format.
   * @returns The author's full name as a string, or an empty string if the author or first name is not provided.
   */
  displayFn(author: Author): string {
    return author ? author.first_name + " " + author.last_name : "";
  }

  /**
   * Filters authors based on the provided name by querying the library service.
   *
   * @param name - The search string used to filter authors.
   * @returns An Observable emitting an array of Author objects matching the search criteria.
   */
  private _filter(name: string): Observable<Author[]> {
    const params: LibraryAuthorsListRequestParams = {
      search: name,
      pageSize: 3,
    };

    return this.libraryService.libraryAuthorsList(params).pipe(map((data) => (data && Array.isArray(data.results) ? data.results : [])));
  }

  /**
   * Handles the form submission. If the form is valid, it formats the data,
   * calls the library service to create the book, and closes the dialog on success.
   */
  onSubmit(): void {
    console.log("Form submitted:", this.addBookForm.value);

    if (this.addBookForm.valid) {
      // Ensure date is formatted correctly if needed by the API (e.g., YYYY-MM-DD)
      const formattedDate = this.formatDate(this.addBookForm.value.publication_date);

      const bookRequest: BookRequest = {
        title: this.addBookForm.value.title,
        author: this.addBookForm.value.author ? this.addBookForm.value.author.id : null,
        publication_date: formattedDate,
      };

      const bookData: LibraryBooksCreateRequestParams = {
        bookRequest: bookRequest,
      };

      this.libraryService.libraryBooksCreate(bookData).subscribe({
        next: (response) => {
          console.log("Book added successfully", response);
          this.libraryNotificationService.notify({
            message: "Book added successfully",
            type: "success",
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          const errorMessage = error?.error || {};

          let errorMessageString = "<br><br>";

          for (const key in errorMessage) {
            errorMessageString += `<strong>${key}</strong>: ${errorMessage[key]}<br><br>`;
          }

          // Handle error response
          this.libraryNotificationService.notify({
            message: "Error adding book \n" + errorMessageString,
            type: "error",
            duration: 3000,
          });
        },
      });
    } else {
      this.addBookForm.markAllAsTouched();
    }
  }

  /**
   * Closes the dialog without submitting the form.
   */
  onCancel(): void {
    this.dialogRef.close(); // Close dialog without passing any data
  }

  /**
   * Helper function to format a Date object into 'YYYY-MM-DD' string format.
   * @param date - The date to format.
   * @returns The formatted date string.
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }

  toggleNewAuthor(): void {
    // Logic to add a new author
    // This could involve opening another dialog or navigating to an author creation page
    console.log("Add new author clicked");
    this.newAuthor = !this.newAuthor; // Toggle the new author form visibility

    if (this.newAuthor) {
      this.authorControl.setValue(""); // Clear the author control value
      this.authorControl.disable(); // Enable the author control when adding a new author
    } else {
      this.authorControl.enable(); // Disable the author control when adding a new author
    }
  }

  onAuthorCancelled() {
    this.newAuthor = false; // Reset the new author form visibility
    this.authorControl.enable(); // Re-enable the author control
  }

  onAuthorAdded(author: Author) {
    console.log("Author added:", author);
    this.newAuthor = false; // Reset the new author form visibility
    this.addBookForm.controls["author"].setValue(author);

    this.authorControl.enable(); // Re-enable the author control
  }

  hasRole(role: string): boolean {
    return this.realmRoles.includes(role);
  }
}
```

Now our application correctly manages roles. You can experiment by creating new roles or by adding, removing, or moving a role from one group to another.  
Note: Keycloak allows you to assign multiple groups to the same user. Try to see how the application's behavior changes in these cases.

![Full Role Based Application](/docs/images/part15_14.png)
