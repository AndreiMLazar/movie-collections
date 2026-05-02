import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { Movie } from '../types';
import {
  MOVIES_API_ACTIONS_SOURCE,
  MOVIES_API_EVENT_APPEND_SUCCESS,
  MOVIES_API_EVENT_LOAD_FAILURE,
  MOVIES_API_EVENT_LOAD_SUCCESS,
  MOVIES_EVENT_APPLY_FILTERS,
  MOVIES_EVENT_CLEAR_FILTERS,
  MOVIES_EVENT_CLEAR_SEARCH,
  MOVIES_EVENT_LOAD_MORE,
  MOVIES_EVENT_LOAD_POPULAR,
  MOVIES_EVENT_SEARCH,
  MOVIES_PAGE_ACTIONS_SOURCE,
} from './movies.constants';

export const MoviesPageActions = createActionGroup({
  source: MOVIES_PAGE_ACTIONS_SOURCE,
  events: {
    [MOVIES_EVENT_LOAD_POPULAR]: props<{ page: number }>(),
    [MOVIES_EVENT_SEARCH]: props<{ query: string; page: number }>(),
    [MOVIES_EVENT_LOAD_MORE]: emptyProps(),
    [MOVIES_EVENT_CLEAR_SEARCH]: emptyProps(),
    [MOVIES_EVENT_APPLY_FILTERS]: props<{ genreIds: number[]; sortBy: string }>(),
    [MOVIES_EVENT_CLEAR_FILTERS]: emptyProps(),
  },
});

export const MoviesApiActions = createActionGroup({
  source: MOVIES_API_ACTIONS_SOURCE,
  events: {
    [MOVIES_API_EVENT_LOAD_SUCCESS]: props<{ movies: Movie[]; page: number; totalPages: number }>(),
    [MOVIES_API_EVENT_LOAD_FAILURE]: props<{ error: string }>(),
    [MOVIES_API_EVENT_APPEND_SUCCESS]: props<{ movies: Movie[]; page: number; totalPages: number }>(),
  },
});
