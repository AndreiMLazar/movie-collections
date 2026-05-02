import { createActionGroup, props } from '@ngrx/store';
import type { Collection, CollectionMovie, SortOrder } from '../types';
import {
  COLLECTIONS_ACTIONS_SOURCE,
  COLLECTIONS_EVENT_ADD_MOVIE_TO_COLLECTION,
  COLLECTIONS_EVENT_CREATE_COLLECTION,
  COLLECTIONS_EVENT_DELETE_COLLECTION,
  COLLECTIONS_EVENT_LOAD_COLLECTIONS_FROM_STORAGE,
  COLLECTIONS_EVENT_REMOVE_MOVIE_FROM_COLLECTION,
  COLLECTIONS_EVENT_SET_SELECTED_COLLECTION,
  COLLECTIONS_EVENT_UPDATE_COLLECTION_SORT,
} from './collections.constants';

export const CollectionsActions = createActionGroup({
  source: COLLECTIONS_ACTIONS_SOURCE,
  events: {
    [COLLECTIONS_EVENT_CREATE_COLLECTION]: props<{ name: string }>(),
    [COLLECTIONS_EVENT_DELETE_COLLECTION]: props<{ id: string }>(),
    [COLLECTIONS_EVENT_ADD_MOVIE_TO_COLLECTION]: props<{
      collectionId: string;
      movieId: number;
      movieData?: CollectionMovie;
    }>(),
    [COLLECTIONS_EVENT_REMOVE_MOVIE_FROM_COLLECTION]: props<{
      collectionId: string;
      movieId: number;
    }>(),
    [COLLECTIONS_EVENT_SET_SELECTED_COLLECTION]: props<{ id: string | null }>(),
    [COLLECTIONS_EVENT_UPDATE_COLLECTION_SORT]: props<{ id: string; sortOrder: SortOrder }>(),
    [COLLECTIONS_EVENT_LOAD_COLLECTIONS_FROM_STORAGE]: props<{ collections: Collection[] }>(),
  },
});
