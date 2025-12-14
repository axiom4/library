import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet,
    RouterLink,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
  ],
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
  username: string | undefined;
  profile_url: string | undefined;

  private oauthService = inject(OAuthService);

  constructor() {
    this.configureOAuth();
  }

  private configureOAuth() {
    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      if (this.oauthService.hasValidAccessToken()) {
        this.authenticated = true;
        const claims = this.oauthService.getIdentityClaims() as any;
        this.username = claims['preferred_username'];
      }
    });
    this.oauthService.setupAutomaticSilentRefresh();
  }

  ngOnInit(): void {}

  login() {
    this.oauthService.initCodeFlow();
  }

  logout() {
    this.oauthService.logOut();
    this.authenticated = false;
  }
}
