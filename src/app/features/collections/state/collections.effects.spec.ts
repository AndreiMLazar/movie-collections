import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';

import { StorageService } from '@core/services';
import { CollectionsActions } from './collections.actions';
import { selectCollections } from './collections.reducer';
import { loadCollectionsFromStorage, persistCollections } from './collections.effects';
import type { Collection } from '../types';

const collectionA: Collection = {
  id: 'col-a',
  name: 'Action',
  movieIds: [1, 2],
  movieDetails: [],
  sortOrder: 'recent',
  createdAt: '2024-01-01T00:00:00.000Z',
};

function makeStorageMock(collections: Collection[] = []): StorageService {
  return {
    loadCollections: jest.fn().mockReturnValue(collections),
    saveCollections: jest.fn(),
  } as unknown as StorageService;
}

describe('Collections Effects', () => {
  describe('loadCollectionsFromStorage', () => {
    it('dispatches loadCollectionsFromStorage with data from StorageService', (done) => {
      const storageMock = makeStorageMock([collectionA]);

      TestBed.configureTestingModule({
        providers: [{ provide: StorageService, useValue: storageMock }],
      });

      TestBed.runInInjectionContext(loadCollectionsFromStorage).subscribe((action) => {
        expect(storageMock.loadCollections).toHaveBeenCalled();
        expect(action).toEqual(
          CollectionsActions.loadCollectionsFromStorage({ collections: [collectionA] })
        );
        done();
      });
    });

    it('dispatches loadCollectionsFromStorage with empty array when storage is empty', (done) => {
      const storageMock = makeStorageMock([]);

      TestBed.configureTestingModule({
        providers: [{ provide: StorageService, useValue: storageMock }],
      });

      TestBed.runInInjectionContext(loadCollectionsFromStorage).subscribe((action) => {
        expect(action).toEqual(CollectionsActions.loadCollectionsFromStorage({ collections: [] }));
        done();
      });
    });
  });

  describe('persistCollections', () => {
    let actions$: Observable<Action>;

    const persistActions = [
      {
        name: 'createCollection',
        action: CollectionsActions.createCollection({ name: 'Drama' }),
      },
      {
        name: 'deleteCollection',
        action: CollectionsActions.deleteCollection({ id: 'col-a' }),
      },
      {
        name: 'addMovieToCollection',
        action: CollectionsActions.addMovieToCollection({ collectionId: 'col-a', movieId: 99 }),
      },
      {
        name: 'removeMovieFromCollection',
        action: CollectionsActions.removeMovieFromCollection({ collectionId: 'col-a', movieId: 1 }),
      },
      {
        name: 'updateCollectionSort',
        action: CollectionsActions.updateCollectionSort({ id: 'col-a', sortOrder: 'name' }),
      },
    ];

    persistActions.forEach(({ name, action }) => {
      it(`calls saveCollections when ${name} is dispatched`, (done) => {
        const storageMock = makeStorageMock();

        TestBed.configureTestingModule({
          providers: [
            provideMockActions(() => actions$),
            provideMockStore({
              selectors: [{ selector: selectCollections, value: [collectionA] }],
            }),
            { provide: StorageService, useValue: storageMock },
          ],
        });

        actions$ = of(action);

        TestBed.runInInjectionContext(persistCollections).subscribe(() => {
          expect(storageMock.saveCollections).toHaveBeenCalledWith([collectionA]);
          done();
        });
      });
    });

    it('does not call saveCollections for a non-persist action', () => {
      const storageMock = makeStorageMock();

      TestBed.configureTestingModule({
        providers: [
          provideMockActions(() => of(CollectionsActions.setSelectedCollection({ id: 'col-a' }))),
          provideMockStore({
            selectors: [{ selector: selectCollections, value: [collectionA] }],
          }),
          { provide: StorageService, useValue: storageMock },
        ],
      });

      // Subscribe but the effect should not emit (non-matching action)
      let callCount = 0;
      TestBed.runInInjectionContext(persistCollections).subscribe(() => {
        callCount++;
      });

      expect(callCount).toBe(0);
      expect(storageMock.saveCollections).not.toHaveBeenCalled();
    });
  });
});
