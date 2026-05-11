import { inject, Injectable } from '@angular/core';
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

@Injectable()
export class CollectionsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly storage = inject(StorageService);

  /** On app init, hydrate state from localStorage */
  loadCollectionsFromStorage$ = createEffect(
    () => {
      const collections = this.storage.loadCollections();
      return of(CollectionsActions.loadCollectionsFromStorage({ collections }));
    },
    { dispatch: true }
  );

  /** After every mutating action, persist to localStorage */
  persistCollections$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(...PERSIST_ACTIONS),
        withLatestFrom(this.store.select(selectCollections)),
        tap(([, cols]) => this.storage.saveCollections(cols))
      ),
    { dispatch: false }
  );
}
