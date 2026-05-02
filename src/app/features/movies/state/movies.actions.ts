import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { Movie } from '../types';
import { MOVIES_API_ACTIONS_SOURCE, MOVIES_PAGE_ACTIONS_SOURCE } from './movies.constants';

export const MoviesPageActions = createActionGroup({
  source: MOVIES_PAGE_ACTIONS_SOURCE,
  events: {
    'Load Popular': props<{ page: number }>(),
    Search: props<{ query: string; page: number }>(),
    'Load More': emptyProps(),
    'Clear Search': emptyProps(),
    'Apply Filters': props<{ genreIds: number[]; sortBy: string }>(),
    'Clear Filters': emptyProps(),
  },
});

export const MoviesApiActions = createActionGroup({
  source: MOVIES_API_ACTIONS_SOURCE,
  events: {
    'Load Success': props<{ movies: Movie[]; page: number; totalPages: number }>(),
    'Load Failure': props<{ error: string }>(),
    'Append Success': props<{ movies: Movie[]; page: number; totalPages: number }>(),
  },
});
