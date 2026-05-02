import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import type { CollectionsState } from '../types';
import { CollectionsActions } from './collections.actions';
import { COLLECTIONS_FEATURE_KEY } from './collections.constants';

const initialState: CollectionsState = {
  collections: [],
  selectedCollectionId: null,
};

export const collectionsFeature = createFeature({
  name: COLLECTIONS_FEATURE_KEY,
  reducer: createReducer(
    initialState,

    on(CollectionsActions.loadCollectionsFromStorage, (state, { collections }) => ({
      ...state,
      // Migrate data that was stored before movieDetails was introduced
      collections: collections.map((c) => ({ ...c, movieDetails: c.movieDetails ?? [] })),
    })),

    on(CollectionsActions.createCollection, (state, { name }) => ({
      ...state,
      collections: [
        ...state.collections,
        {
          id: crypto.randomUUID(),
          name,
          movieIds: [],
          movieDetails: [],
          sortOrder: 'recent' as const,
          createdAt: new Date().toISOString(),
        },
      ],
    })),

    on(CollectionsActions.deleteCollection, (state, { id }) => ({
      ...state,
      collections: state.collections.filter((c) => c.id !== id),
      selectedCollectionId: state.selectedCollectionId === id ? null : state.selectedCollectionId,
    })),

    on(CollectionsActions.addMovieToCollection, (state, { collectionId, movieId, movieData }) => ({
      ...state,
      collections: state.collections.map((c) =>
        c.id === collectionId && !c.movieIds.includes(movieId)
          ? {
              ...c,
              movieIds: [...c.movieIds, movieId],
              movieDetails: movieData
                ? [...(c.movieDetails ?? []), movieData]
                : (c.movieDetails ?? []),
            }
          : c
      ),
    })),

    on(CollectionsActions.removeMovieFromCollection, (state, { collectionId, movieId }) => ({
      ...state,
      collections: state.collections.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              movieIds: c.movieIds.filter((id) => id !== movieId),
              movieDetails: c.movieDetails.filter((m) => m.id !== movieId),
            }
          : c
      ),
    })),

    on(CollectionsActions.setSelectedCollection, (state, { id }) => ({
      ...state,
      selectedCollectionId: id,
    })),

    on(CollectionsActions.updateCollectionSort, (state, { id, sortOrder }) => ({
      ...state,
      collections: state.collections.map((c) => (c.id === id ? { ...c, sortOrder } : c)),
    }))
  ),

  extraSelectors: ({ selectCollections, selectSelectedCollectionId }) => ({
    selectCollectionById: (id: string) =>
      createSelector(selectCollections, (cols) => cols.find((c) => c.id === id) ?? null),

    selectSelectedCollection: createSelector(
      selectCollections,
      selectSelectedCollectionId,
      (cols, id) => (id ? (cols.find((c) => c.id === id) ?? null) : null)
    ),

    selectMovieIdsForCollection: (id: string) =>
      createSelector(selectCollections, (cols) => cols.find((c) => c.id === id)?.movieIds ?? []),

    selectCollectionsContainingMovie: (movieId: number) =>
      createSelector(selectCollections, (cols) => cols.filter((c) => c.movieIds.includes(movieId))),
  }),
});

export const {
  name,
  reducer,
  selectCollectionsState,
  selectCollections,
  selectSelectedCollectionId,
  selectCollectionById,
  selectSelectedCollection,
  selectMovieIdsForCollection,
  selectCollectionsContainingMovie,
} = collectionsFeature;
