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
