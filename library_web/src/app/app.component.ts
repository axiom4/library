import { Component, effect, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Keycloak from 'keycloak-js';
import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  typeEventArgs,
  ReadyArgs,
} from 'keycloak-angular';
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
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
  title = 'Library';
  authenticated = false;
  keycloakStatus: string | undefined;
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  constructor() {
    effect(() => {
      const keycloakEvent = this.keycloakSignal();

      console.log('Keycloak event:', keycloakEvent);

      this.keycloakStatus = keycloakEvent.type;

      if (this.keycloakStatus === KeycloakEventType.Ready) {
        this.authenticated = typeEventArgs<ReadyArgs>(keycloakEvent.args);
        console.log('Keycloak is ready:', this.authenticated);
      } else if (this.keycloakStatus === KeycloakEventType.AuthLogout) {
        this.authenticated = false;
      } else {
        console.log('Keycloak status:', this.keycloakStatus);
      }
    });
  }

  ngOnInit(): void {
    if (!this.keycloak.authenticated) {
      this.keycloak.login().then(() => {
        if (this.keycloak.authenticated && this.keycloak.token) {
          console.log('Keycloak token:', this.keycloak.token);

          this.authenticated = true;
        }
      });
    } else {
      if (this.keycloak.token) {
        console.log('Keycloak token:', this.keycloak.token);
      }
    }
  }
}
