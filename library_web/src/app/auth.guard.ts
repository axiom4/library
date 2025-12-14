import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

function getJwtClaims(token: string): any {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const oauthService = inject(OAuthService);

  if (oauthService.hasValidAccessToken()) {
    const requiredRole = route.data['role'];
    if (requiredRole) {
      const accessToken = oauthService.getAccessToken();
      const claims = getJwtClaims(accessToken);
      const realmAccess = claims ? claims['realm_access'] : null;
      const realmRoles = realmAccess ? realmAccess['roles'] : [];

      if (Array.isArray(realmRoles) && realmRoles.includes(requiredRole)) {
        return true;
      }
      return false;
    }
    return true;
  }

  oauthService.initCodeFlow();
  return false;
};
