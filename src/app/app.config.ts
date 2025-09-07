import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Enable optimized change detection with event coalescing
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Configure router with component input binding for signal-based route parameters
    provideRouter(routes, withComponentInputBinding()),
  ],
};
