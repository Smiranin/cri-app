import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'chronology',
    loadComponent: () => import('./pages/chronology/chronology.component').then(m => m.ChronologyComponent),
  },
  {
    path: 'favorites',
    loadComponent: () => import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent),
  },
  {
    path: 'trailer/:trailerId',
    loadComponent: () =>
      import('./components/trailer-preview/trailer-preview.component').then(m => m.TrailerPreviewComponent),
  },
  {
    path: '**',
    redirectTo: '/home',
  },
];
