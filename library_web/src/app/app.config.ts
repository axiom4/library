import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  ApiModule,
  Configuration,
  ConfigurationParameters,
} from './modules/core/api/v1';
import { environment } from '../environments/environment.development';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
  withXsrfConfiguration,
} from '@angular/common/http';
import {
  DefaultOAuthInterceptor,
  provideOAuthClient,
} from 'angular-oauth2-oidc';

export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    basePath: environment.api_url,
  };
  return new Configuration(params);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(ApiModule.forRoot(apiConfigFactory)),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DefaultOAuthInterceptor,
      multi: true,
    },
    provideHttpClient(
      withFetch(),
      withXsrfConfiguration({
        cookieName: 'CUSTOM_XSRF_TOKEN',
        headerName: 'X-Custom-Xsrf-Header',
      }),
      withInterceptorsFromDi()
    ),
    provideOAuthClient({
      resourceServer: {
        allowedUrls: [environment.api_url],
        sendAccessToken: true,
      },
    }),
  ],
};
