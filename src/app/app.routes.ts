import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'movies',
    pathMatch: 'full',
  },
  {
    path: 'movies',
    loadComponent: () =>
      import('./features/movies/movies-page.component').then((m) => m.MoviesPageComponent),
  },
  {
    path: 'collections',
    loadComponent: () =>
      import('./features/collections/collection-list-page.component').then(
        (m) => m.CollectionListPageComponent
      ),
  },
  {
    path: 'collections/:id',
    loadComponent: () =>
      import('./features/collections/collection-detail-page.component').then(
        (m) => m.CollectionDetailPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'movies',
  },
];
