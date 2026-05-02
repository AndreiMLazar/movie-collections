import { collectionsFeature } from './collections.reducer';
import { CollectionsActions } from './collections.actions';
import type { CollectionsState } from '../types';

const { reducer } = collectionsFeature;

const emptyState: CollectionsState = {
  collections: [],
  selectedCollectionId: null,
};

const collectionA = {
  id: 'col-a',
  name: 'Action',
  movieIds: [1, 2],
  movieDetails: [],
  sortOrder: 'recent' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
};

const stateWithOne: CollectionsState = {
  collections: [collectionA],
  selectedCollectionId: null,
};

describe('collectionsReducer', () => {
  describe('createCollection', () => {
    it('adds a new collection with empty movieIds', () => {
      const next = reducer(emptyState, CollectionsActions.createCollection({ name: 'Drama' }));
      expect(next.collections).toHaveLength(1);
      expect(next.collections[0].name).toBe('Drama');
      expect(next.collections[0].movieIds).toEqual([]);
    });
  });

  describe('deleteCollection', () => {
    it('removes the collection by id', () => {
      const next = reducer(stateWithOne, CollectionsActions.deleteCollection({ id: 'col-a' }));
      expect(next.collections).toHaveLength(0);
    });

    it('resets selectedCollectionId when the selected collection is deleted', () => {
      const state = { ...stateWithOne, selectedCollectionId: 'col-a' };
      const next = reducer(state, CollectionsActions.deleteCollection({ id: 'col-a' }));
      expect(next.selectedCollectionId).toBeNull();
    });
  });

  describe('addMovieToCollection', () => {
    it('appends a movieId to the matching collection', () => {
      const next = reducer(
        stateWithOne,
        CollectionsActions.addMovieToCollection({ collectionId: 'col-a', movieId: 99 })
      );
      expect(next.collections[0].movieIds).toContain(99);
    });

    it('does not duplicate an already-added movie', () => {
      const next = reducer(
        stateWithOne,
        CollectionsActions.addMovieToCollection({ collectionId: 'col-a', movieId: 1 })
      );
      expect(next.collections[0].movieIds.filter((id) => id === 1)).toHaveLength(1);
    });

    it('does not mutate a non-matching collection when adding to another', () => {
      const colB = { ...collectionA, id: 'col-b', name: 'Sci-Fi', movieIds: [] as number[] };
      const state: CollectionsState = {
        collections: [collectionA, colB],
        selectedCollectionId: null,
      };
      const next = reducer(
        state,
        CollectionsActions.addMovieToCollection({ collectionId: 'col-a', movieId: 99 })
      );
      expect(next.collections[1].movieIds).toHaveLength(0);
    });

    it('falls back to empty array for movieDetails when collection has undefined movieDetails and movieData is provided', () => {
      const movieData = {
        id: 99,
        title: 'Test',
        posterPath: null,
        voteAverage: 7,
        voteCount: 100,
        genreIds: [],
        releaseDate: '2020-01-01',
        overview: 'Overview',
      };
      const legacyCollection = {
        ...collectionA,
        movieDetails: undefined,
      } as unknown as typeof collectionA;
      const state: CollectionsState = {
        collections: [legacyCollection],
        selectedCollectionId: null,
      };
      const next = reducer(
        state,
        CollectionsActions.addMovieToCollection({ collectionId: 'col-a', movieId: 99, movieData })
      );
      expect(next.collections[0].movieDetails).toEqual([movieData]);
    });

    it('falls back to empty array for movieDetails when collection has undefined movieDetails and no movieData', () => {
      const legacyCollection = {
        ...collectionA,
        movieDetails: undefined,
      } as unknown as typeof collectionA;
      const state: CollectionsState = {
        collections: [legacyCollection],
        selectedCollectionId: null,
      };
      const next = reducer(
        state,
        CollectionsActions.addMovieToCollection({ collectionId: 'col-a', movieId: 99 })
      );
      expect(next.collections[0].movieDetails).toEqual([]);
    });
  });

  describe('removeMovieFromCollection', () => {
    it('removes the movieId from the matching collection', () => {
      const next = reducer(
        stateWithOne,
        CollectionsActions.removeMovieFromCollection({ collectionId: 'col-a', movieId: 1 })
      );
      expect(next.collections[0].movieIds).not.toContain(1);
    });

    it('does not mutate a non-matching collection when removing from another', () => {
      const colB = { ...collectionA, id: 'col-b', name: 'Sci-Fi', movieIds: [1, 2] as number[] };
      const state: CollectionsState = {
        collections: [collectionA, colB],
        selectedCollectionId: null,
      };
      const next = reducer(
        state,
        CollectionsActions.removeMovieFromCollection({ collectionId: 'col-a', movieId: 1 })
      );
      expect(next.collections[1].movieIds).toEqual([1, 2]);
    });
  });

  describe('updateCollectionSort', () => {
    it('updates the sortOrder for the target collection', () => {
      const next = reducer(
        stateWithOne,
        CollectionsActions.updateCollectionSort({ id: 'col-a', sortOrder: 'name' })
      );
      expect(next.collections[0].sortOrder).toBe('name');
    });

    it('does not affect other collections when updating sort', () => {
      const colB = { ...collectionA, id: 'col-b', name: 'Drama' };
      const state: CollectionsState = {
        collections: [collectionA, colB],
        selectedCollectionId: null,
      };
      const next = reducer(
        state,
        CollectionsActions.updateCollectionSort({ id: 'col-a', sortOrder: 'name' })
      );
      expect(next.collections[1].sortOrder).toBe('recent');
    });
  });

  describe('addMovieToCollection with movieData snapshot', () => {
    it('appends movieData to movieDetails when provided', () => {
      const movieData = {
        id: 99,
        title: 'Interstellar',
        posterPath: '/inter.jpg',
        voteAverage: 8.6,
        voteCount: 20000,
        genreIds: [18, 878],
        releaseDate: '2014-11-05',
        overview: 'A journey through space.',
      };
      const next = reducer(
        stateWithOne,
        CollectionsActions.addMovieToCollection({ collectionId: 'col-a', movieId: 99, movieData })
      );
      expect(next.collections[0].movieDetails).toContainEqual(movieData);
    });

    it('does not add movieData when movie is already in collection', () => {
      const movieData = {
        id: 1,
        title: 'Existing',
        posterPath: null,
        voteAverage: 7.0,
        voteCount: 5000,
        genreIds: [28],
        releaseDate: '2022-01-01',
        overview: 'Already added.',
      };
      const next = reducer(
        stateWithOne,
        CollectionsActions.addMovieToCollection({ collectionId: 'col-a', movieId: 1, movieData })
      );
      // movieIds should remain the same
      expect(next.collections[0].movieIds.filter((id) => id === 1)).toHaveLength(1);
    });
  });

  describe('removeMovieFromCollection removes movieDetails snapshot', () => {
    it('removes the matching movieDetails entry alongside the movieId', () => {
      const movieData = {
        id: 1,
        title: 'Existing',
        posterPath: null,
        voteAverage: 7.0,
        voteCount: 5000,
        genreIds: [28],
        releaseDate: '2022-01-01',
        overview: 'Already added.',
      };
      const stateWithDetails: CollectionsState = {
        collections: [{ ...collectionA, movieDetails: [movieData] }],
        selectedCollectionId: null,
      };
      const next = reducer(
        stateWithDetails,
        CollectionsActions.removeMovieFromCollection({ collectionId: 'col-a', movieId: 1 })
      );
      expect(next.collections[0].movieDetails).toHaveLength(0);
    });
  });

  describe('setSelectedCollection', () => {
    it('sets selectedCollectionId to the provided id', () => {
      const next = reducer(emptyState, CollectionsActions.setSelectedCollection({ id: 'col-a' }));
      expect(next.selectedCollectionId).toBe('col-a');
    });

    it('sets selectedCollectionId to null when null is passed', () => {
      const state: CollectionsState = { ...emptyState, selectedCollectionId: 'col-a' };
      const next = reducer(state, CollectionsActions.setSelectedCollection({ id: null }));
      expect(next.selectedCollectionId).toBeNull();
    });
  });

  describe('deleteCollection preserves selectedCollectionId when a different collection is deleted', () => {
    it('does not reset selectedCollectionId for unrelated delete', () => {
      const colB = { ...collectionA, id: 'col-b', name: 'Drama' };
      const state: CollectionsState = {
        collections: [collectionA, colB],
        selectedCollectionId: 'col-a',
      };
      const next = reducer(state, CollectionsActions.deleteCollection({ id: 'col-b' }));
      expect(next.selectedCollectionId).toBe('col-a');
    });
  });

  describe('loadCollectionsFromStorage', () => {
    it('loads collections from storage into the state', () => {
      const next = reducer(
        emptyState,
        CollectionsActions.loadCollectionsFromStorage({ collections: [collectionA] })
      );
      expect(next.collections).toHaveLength(1);
      expect(next.collections[0].id).toBe('col-a');
    });

    it('migrates old collections missing movieDetails by adding an empty array', () => {
      const legacyCollection = {
        ...collectionA,
        movieDetails: undefined,
      } as unknown as typeof collectionA;
      const next = reducer(
        emptyState,
        CollectionsActions.loadCollectionsFromStorage({ collections: [legacyCollection] })
      );
      expect(next.collections[0].movieDetails).toEqual([]);
    });

    it('preserves existing movieDetails during migration', () => {
      const movieData = {
        id: 1,
        title: 'T',
        posterPath: null,
        voteAverage: 5,
        voteCount: 100,
        genreIds: [],
        releaseDate: '',
        overview: '',
      };
      const enrichedCollection = { ...collectionA, movieDetails: [movieData] };
      const next = reducer(
        emptyState,
        CollectionsActions.loadCollectionsFromStorage({ collections: [enrichedCollection] })
      );
      expect(next.collections[0].movieDetails).toEqual([movieData]);
    });
  });
});
