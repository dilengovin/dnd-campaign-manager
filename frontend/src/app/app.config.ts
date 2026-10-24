import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Route params arrive as component inputs — the Campaign detail and edit
    // screens take their `:id` that way.
    provideRouter(routes, withComponentInputBinding())
  ]
};
