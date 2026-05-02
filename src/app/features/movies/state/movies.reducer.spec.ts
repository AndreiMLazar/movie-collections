import {
  moviesFeature,
  selectHasMore,
  selectIsSearching,
  selectHasActiveFilters,
} from './movies.reducer';
import { MoviesPageActions, MoviesApiActions } from './movies.actions';
import type { MoviesState } from '../types';

const { reducer } = moviesFeature;

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

const movie1 = {
  id: 1,
  title: 'Inception',
  posterPath: '/inception.jpg',
  backdropPath: '/backdrop.jpg',
  voteAverage: 8.8,
  voteCount: 30000,
  genreIds: [28, 12],
  overview: 'A dream within a dream.',
  releaseDate: '2010-07-16',
  popularity: 99.9,
};

const movie2 = {
  id: 2,
  title: 'The Matrix',
  posterPath: '/matrix.jpg',
  backdropPath: null,
  voteAverage: 8.7,
  voteCount: 25000,
  genreIds: [28, 878],
  overview: 'What is the Matrix?',
  releaseDate: '1999-03-31',
  popularity: 88.8,
};

describe('moviesReducer', () => {
  describe('initial state', () => {
    it('returns the initial state for an unknown action', () => {
      const state = reducer(undefined, { type: '__unknown_action__' });
      expect(state).toEqual(initialState);
    });
  });

  describe('loadPopular', () => {
    it('sets loading to true and clears error', () => {
      const stateWithError: MoviesState = {
        ...initialState,
        loading: false,
        error: 'Previous error',
      };
      const state = reducer(stateWithError, MoviesPageActions.loadPopular({ page: 1 }));
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('search', () => {
    it('sets loading to true and clears error', () => {
      const stateWithError: MoviesState = {
        ...initialState,
        loading: false,
        error: 'Previous error',
      };
      const state = reducer(
        stateWithError,
        MoviesPageActions.search({ query: 'inception', page: 1 })
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('clearSearch', () => {
    it('resets searchQuery, movies, currentPage, and totalPages', () => {
      const stateWithSearch: MoviesState = {
        ...initialState,
        searchQuery: 'inception',
        movies: [movie1],
        currentPage: 3,
        totalPages: 10,
      };
      const state = reducer(stateWithSearch, MoviesPageActions.clearSearch());
      expect(state.searchQuery).toBe('');
      expect(state.movies).toEqual([]);
      expect(state.currentPage).toBe(0);
      expect(state.totalPages).toBe(1);
    });

    it('does not change loading or error state', () => {
      const stateLoading: MoviesState = { ...initialState, loading: true, error: null };
      const state = reducer(stateLoading, MoviesPageActions.clearSearch());
      expect(state.loading).toBe(true);
    });
  });

  describe('applyFilters', () => {
    it('sets genreIds and sortBy, resets movies and page, sets loading to true', () => {
      const stateWithMovies: MoviesState = {
        ...initialState,
        movies: [movie1],
        currentPage: 3,
        totalPages: 10,
      };
      const state = reducer(
        stateWithMovies,
        MoviesPageActions.applyFilters({ genreIds: [28, 12], sortBy: 'revenue.desc' })
      );
      expect(state.selectedGenreIds).toEqual([28, 12]);
      expect(state.sortBy).toBe('revenue.desc');
      expect(state.movies).toEqual([]);
      expect(state.currentPage).toBe(0);
      expect(state.totalPages).toBe(1);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('clearFilters', () => {
    it('resets genreIds and sortBy to defaults, clears movies and page, sets loading', () => {
      const stateWithFilters: MoviesState = {
        ...initialState,
        selectedGenreIds: [28],
        sortBy: 'revenue.desc',
        movies: [movie1],
        currentPage: 2,
        totalPages: 8,
        error: 'Some error',
      };
      const state = reducer(stateWithFilters, MoviesPageActions.clearFilters());
      expect(state.selectedGenreIds).toEqual([]);
      expect(state.sortBy).toBe('popularity.desc');
      expect(state.movies).toEqual([]);
      expect(state.currentPage).toBe(0);
      expect(state.totalPages).toBe(1);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('loadMore', () => {
    it('sets loading to true without clearing movies', () => {
      const stateWithMovies: MoviesState = {
        ...initialState,
        movies: [movie1],
        currentPage: 1,
        totalPages: 5,
      };
      const state = reducer(stateWithMovies, MoviesPageActions.loadMore());
      expect(state.loading).toBe(true);
      expect(state.movies).toEqual([movie1]);
      expect(state.currentPage).toBe(1);
    });
  });

  describe('loadSuccess', () => {
    it('replaces movies array, updates page info, and sets loading to false', () => {
      const stateLoading: MoviesState = { ...initialState, loading: true, movies: [movie1] };
      const state = reducer(
        stateLoading,
        MoviesApiActions.loadSuccess({ movies: [movie2], page: 2, totalPages: 10 })
      );
      expect(state.movies).toEqual([movie2]);
      expect(state.currentPage).toBe(2);
      expect(state.totalPages).toBe(10);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('appendSuccess', () => {
    it('appends movies to existing list, updates page info, and sets loading to false', () => {
      const stateLoading: MoviesState = {
        ...initialState,
        movies: [movie1],
        currentPage: 1,
        totalPages: 5,
        loading: true,
      };
      const state = reducer(
        stateLoading,
        MoviesApiActions.appendSuccess({ movies: [movie2], page: 2, totalPages: 5 })
      );
      expect(state.movies).toEqual([movie1, movie2]);
      expect(state.currentPage).toBe(2);
      expect(state.totalPages).toBe(5);
      expect(state.loading).toBe(false);
    });
  });

  describe('loadFailure', () => {
    it('sets error message and clears loading flag', () => {
      const stateLoading: MoviesState = { ...initialState, loading: true };
      const state = reducer(stateLoading, MoviesApiActions.loadFailure({ error: 'Network error' }));
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
    });

    it('does not modify the movies array', () => {
      const stateLoading: MoviesState = { ...initialState, movies: [movie1], loading: true };
      const state = reducer(stateLoading, MoviesApiActions.loadFailure({ error: 'API down' }));
      expect(state.movies).toEqual([movie1]);
    });
  });
});

describe('moviesSelectors (extra)', () => {
  describe('selectHasMore', () => {
    it('returns true when currentPage is less than totalPages', () => {
      expect(selectHasMore.projector(1, 5)).toBe(true);
    });

    it('returns false when currentPage equals totalPages', () => {
      expect(selectHasMore.projector(5, 5)).toBe(false);
    });

    it('returns false when currentPage exceeds totalPages', () => {
      expect(selectHasMore.projector(6, 5)).toBe(false);
    });
  });

  describe('selectIsSearching', () => {
    it('returns true when searchQuery has content', () => {
      expect(selectIsSearching.projector('inception')).toBe(true);
    });

    it('returns false for an empty string', () => {
      expect(selectIsSearching.projector('')).toBe(false);
    });

    it('returns false for a whitespace-only string', () => {
      expect(selectIsSearching.projector('   ')).toBe(false);
    });
  });

  describe('selectHasActiveFilters', () => {
    it('returns true when genre IDs are selected', () => {
      expect(selectHasActiveFilters.projector([28, 12], 'popularity.desc')).toBe(true);
    });

    it('returns true when sortBy is not the default', () => {
      expect(selectHasActiveFilters.projector([], 'revenue.desc')).toBe(true);
    });

    it('returns false when no genre IDs and sortBy is default', () => {
      expect(selectHasActiveFilters.projector([], 'popularity.desc')).toBe(false);
    });

    it('returns true when both genres and custom sort are set', () => {
      expect(selectHasActiveFilters.projector([28], 'vote_average.desc')).toBe(true);
    });
  });
});
