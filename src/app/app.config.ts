import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';

/**
 * Main application configuration object.
 *
 * This configuration defines the core providers and settings for the Angular application.
 * It sets up essential services like routing, zone configuration, and other global providers.
 *
 * Configuration includes:
 * - Zone.js change detection with event coalescing for performance
 * - Router configuration with component input binding for reactive route parameters
 *
 * @example
 * ```typescript
 * // Used in main.ts
 * bootstrapApplication(AppComponent, appConfig)
 *   .catch(err => console.error(err));
 * ```
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Enable optimized change detection with event coalescing
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Configure router with component input binding for signal-based route parameters
    provideRouter(routes, withComponentInputBinding()),
  ],
};
