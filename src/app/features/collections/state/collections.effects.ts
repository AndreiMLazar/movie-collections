import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';
import { StorageService } from '@core/services';
import { CollectionsActions } from './collections.actions';
import { selectCollections } from './collections.reducer';

const PERSIST_ACTIONS = [
  CollectionsActions.createCollection,
  CollectionsActions.deleteCollection,
  CollectionsActions.addMovieToCollection,
  CollectionsActions.removeMovieFromCollection,
  CollectionsActions.updateCollectionSort,
];

/** On app init, hydrate state from localStorage */
export const loadCollectionsFromStorage = createEffect(
  () => {
    const storage = inject(StorageService);
    const collections = storage.loadCollections();
    return of(CollectionsActions.loadCollectionsFromStorage({ collections }));
  },
  { functional: true, dispatch: true }
);

/** After every mutating action, persist to localStorage */
export const persistCollections = createEffect(
  (actions$ = inject(Actions), store = inject(Store), storage = inject(StorageService)) =>
    actions$.pipe(
      ofType(...PERSIST_ACTIONS),
      withLatestFrom(store.select(selectCollections)),
      tap(([, cols]) => storage.saveCollections(cols))
    ),
  { functional: true, dispatch: false }
);
