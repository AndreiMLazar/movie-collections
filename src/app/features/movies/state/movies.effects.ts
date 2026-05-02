import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom, exhaustMap } from 'rxjs/operators';
import { TmdbService } from '../services/tmdb.service';
import { MoviesApiActions, MoviesPageActions } from './movies.actions';
import {
  selectCurrentPage,
  selectSearchQuery,
  selectSelectedGenreIds,
  selectSortBy,
} from './movies.reducer';

export const loadPopularMovies = createEffect(
  (actions$ = inject(Actions), tmdb = inject(TmdbService), store = inject(Store)) =>
    actions$.pipe(
      ofType(MoviesPageActions.loadPopular),
      withLatestFrom(store.select(selectSortBy), store.select(selectSelectedGenreIds)),
      switchMap(([{ page }, sortBy, genreIds]) =>
        tmdb.discoverMovies(sortBy, genreIds, page).pipe(
          map(({ results, page: p, totalPages }) =>
            MoviesApiActions.loadSuccess({ movies: results, page: p, totalPages })
          ),
          catchError((err: unknown) =>
            of(MoviesApiActions.loadFailure({ error: extractMessage(err) }))
          )
        )
      )
    ),
  { functional: true }
);

export const searchMovies = createEffect(
  (actions$ = inject(Actions), tmdb = inject(TmdbService)) =>
    actions$.pipe(
      ofType(MoviesPageActions.search),
      switchMap(({ query, page }) =>
        tmdb.searchMovies(query, page).pipe(
          map(({ results, page: p, totalPages }) =>
            MoviesApiActions.loadSuccess({ movies: results, page: p, totalPages })
          ),
          catchError((err: unknown) =>
            of(MoviesApiActions.loadFailure({ error: extractMessage(err) }))
          )
        )
      )
    ),
  { functional: true }
);

export const applyFiltersEffect = createEffect(
  (actions$ = inject(Actions), tmdb = inject(TmdbService)) =>
    actions$.pipe(
      ofType(MoviesPageActions.applyFilters, MoviesPageActions.clearFilters),
      switchMap((action) => {
        const genreIds = 'genreIds' in action ? action.genreIds : [];
        const sortBy = 'sortBy' in action ? action.sortBy : 'popularity.desc';
        return tmdb.discoverMovies(sortBy, genreIds, 1).pipe(
          map(({ results, page, totalPages }) =>
            MoviesApiActions.loadSuccess({ movies: results, page, totalPages })
          ),
          catchError((err: unknown) =>
            of(MoviesApiActions.loadFailure({ error: extractMessage(err) }))
          )
        );
      })
    ),
  { functional: true }
);

export const loadMoreMovies = createEffect(
  (actions$ = inject(Actions), tmdb = inject(TmdbService), store = inject(Store)) =>
    actions$.pipe(
      ofType(MoviesPageActions.loadMore),
      withLatestFrom(
        store.select(selectCurrentPage),
        store.select(selectSearchQuery),
        store.select(selectSortBy),
        store.select(selectSelectedGenreIds)
      ),
      exhaustMap(([, currentPage, query, sortBy, genreIds]) => {
        const nextPage = currentPage + 1;
        const source$ = query.trim()
          ? tmdb.searchMovies(query, nextPage)
          : tmdb.discoverMovies(sortBy, genreIds, nextPage);

        return source$.pipe(
          map(({ results, page, totalPages }) =>
            MoviesApiActions.appendSuccess({ movies: results, page, totalPages })
          ),
          catchError((err: unknown) =>
            of(MoviesApiActions.loadFailure({ error: extractMessage(err) }))
          )
        );
      })
    ),
  { functional: true }
);

function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'An unexpected error occurred.';
}
