import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import type { MoviesState } from '../types';
import { MoviesApiActions, MoviesPageActions } from './movies.actions';
import { MOVIES_FEATURE_KEY } from './movies.constants';

const initialState: MoviesState = {
  movies: [],
  searchQuery: '',
  currentPage: 0,
  totalPages: 1,
  loading: false,
  error: null,
  selectedGenreIds: [],
  sortBy: 'popularity.desc',
};

export const moviesFeature = createFeature({
  name: MOVIES_FEATURE_KEY,
  reducer: createReducer(
    initialState,

    on(MoviesPageActions.loadPopular, MoviesPageActions.search, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),

    on(MoviesPageActions.clearSearch, (state) => ({
      ...state,
      searchQuery: '',
      movies: [],
      currentPage: 0,
      totalPages: 1,
    })),

    on(MoviesPageActions.applyFilters, (state, { genreIds, sortBy }) => ({
      ...state,
      selectedGenreIds: genreIds,
      sortBy,
      movies: [],
      currentPage: 0,
      totalPages: 1,
      loading: true,
      error: null,
    })),

    on(MoviesPageActions.clearFilters, (state) => ({
      ...state,
      selectedGenreIds: [],
      sortBy: 'popularity.desc',
      movies: [],
      currentPage: 0,
      totalPages: 1,
      loading: true,
      error: null,
    })),

    on(MoviesPageActions.loadMore, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),

    on(MoviesApiActions.loadSuccess, (state, { movies, page, totalPages }) => ({
      ...state,
      movies,
      currentPage: page,
      totalPages,
      loading: false,
      error: null,
    })),

    on(MoviesApiActions.appendSuccess, (state, { movies, page, totalPages }) => ({
      ...state,
      movies: [...state.movies, ...movies],
      currentPage: page,
      totalPages,
      loading: false,
      error: null,
    })),

    on(MoviesApiActions.loadFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    }))
  ),
  extraSelectors: ({
    selectCurrentPage,
    selectTotalPages,
    selectSearchQuery,
    selectSelectedGenreIds,
    selectSortBy,
  }) => ({
    selectHasMore: createSelector(
      selectCurrentPage,
      selectTotalPages,
      (page, total) => page < total
    ),
    selectIsSearching: createSelector(selectSearchQuery, (q) => q.trim().length > 0),
    selectHasActiveFilters: createSelector(
      selectSelectedGenreIds,
      selectSortBy,
      (genreIds, sortBy) => genreIds.length > 0 || sortBy !== 'popularity.desc'
    ),
  }),
});

export const {
  name,
  reducer,
  selectMoviesState,
  selectMovies,
  selectSearchQuery,
  selectCurrentPage,
  selectTotalPages,
  selectLoading,
  selectError,
  selectSelectedGenreIds,
  selectSortBy,
  selectHasMore,
  selectIsSearching,
  selectHasActiveFilters,
} = moviesFeature;
