import { Routes } from '@angular/router';

/**
 * Application routing configuration with lazy-loaded components.
 *
 * This configuration defines all application routes using Angular's lazy loading
 * feature for optimal performance. Each route loads its component only when accessed,
 * reducing the initial bundle size and improving application startup time.
 *
 * Available routes:
 * - `/home` - Main page displaying top-rated movies
 * - `/chronology` - Timeline view of movies organized by decades
 * - `/favorites` - User's favorite movies collection
 * - `/trailer/:trailerId` - Movie trailer preview modal
 *
 * All routes use standalone components for modern Angular architecture.
 *
 * @example
 * ```typescript
 * // Navigation in components
 * this.router.navigate(['/home']);
 * this.router.navigate(['/trailer', movie.id]);
 *
 * // Template navigation
 * <a routerLink="/chronology">View Timeline</a>
 * <a [routerLink]="['/trailer', movie.id]">Watch Trailer</a>
 * ```
 */
export const routes: Routes = [
  {
    // Root path redirects to home page
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    // Home page - displays top-rated movies
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    // Chronology page - movies organized by decades in timeline format
    path: 'chronology',
    loadComponent: () => import('./pages/chronology/chronology.component').then(m => m.ChronologyComponent),
  },
  {
    // Favorites page - user's saved favorite movies
    path: 'favorites',
    loadComponent: () => import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent),
  },
  {
    // Trailer preview - modal-style component for playing movie trailers
    path: 'trailer/:trailerId',
    loadComponent: () =>
      import('./components/trailer-preview/trailer-preview.component').then(m => m.TrailerPreviewComponent),
  },
  {
    // Wildcard route - redirects any unknown routes to home
    path: '**',
    redirectTo: '/home',
  },
];
