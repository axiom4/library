import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment.development';

export const authConfig: AuthConfig = {
  issuer: `${environment.keycloak.url}/realms/${environment.keycloak.realm}`,
  redirectUri: window.location.origin + '/',
  clientId: environment.keycloak.client_id,
  responseType: 'code',
  scope: 'openid profile email offline_access',
  showDebugInformation: true,
  requireHttps: false, // Dev only
};
