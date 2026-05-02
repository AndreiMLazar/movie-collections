import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { routes } from './app.routes';
import { moviesFeature } from './features/movies/state/movies.reducer';
import { collectionsFeature } from './features/collections/state/collections.reducer';
import { MoviesEffects } from './features/movies/state/movies.effects';
import { CollectionsEffects } from './features/collections/state/collections.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    provideStore({
      [moviesFeature.name]: moviesFeature.reducer,
      [collectionsFeature.name]: collectionsFeature.reducer,
    }),
    provideEffects(MoviesEffects, CollectionsEffects),
  ],
};
