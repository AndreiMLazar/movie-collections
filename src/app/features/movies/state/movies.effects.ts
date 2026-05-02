import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { TmdbService } from '../services/tmdb.service';
import { MoviesApiActions, MoviesPageActions } from './movies.actions';
import {
  selectCurrentPage,
  selectSearchQuery,
  selectSelectedGenreIds,
  selectSortBy,
} from './movies.reducer';

@Injectable()
export class MoviesEffects {
  private readonly actions$ = inject(Actions);
  private readonly tmdb = inject(TmdbService);
  private readonly store = inject(Store);

  loadPopularMovies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MoviesPageActions.loadPopular),
      withLatestFrom(this.store.select(selectSortBy), this.store.select(selectSelectedGenreIds)),
      switchMap(([{ page }, sortBy, genreIds]) =>
        this.tmdb.discoverMovies(sortBy, genreIds, page).pipe(
          map(({ results, page: p, totalPages }) =>
            MoviesApiActions.loadSuccess({ movies: results, page: p, totalPages })
          ),
          catchError((err: unknown) =>
            of(MoviesApiActions.loadFailure({ error: extractMessage(err) }))
          )
        )
      )
    )
  );

  searchMovies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MoviesPageActions.search),
      switchMap(({ query, page }) =>
        this.tmdb.searchMovies(query, page).pipe(
          map(({ results, page: p, totalPages }) =>
            MoviesApiActions.loadSuccess({ movies: results, page: p, totalPages })
          ),
          catchError((err: unknown) =>
            of(MoviesApiActions.loadFailure({ error: extractMessage(err) }))
          )
        )
      )
    )
  );

  applyFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MoviesPageActions.applyFilters, MoviesPageActions.clearFilters),
      switchMap((action) => {
        const genreIds = 'genreIds' in action ? action.genreIds : [];
        const sortBy = 'sortBy' in action ? action.sortBy : 'popularity.desc';
        return this.tmdb.discoverMovies(sortBy, genreIds, 1).pipe(
          map(({ results, page, totalPages }) =>
            MoviesApiActions.loadSuccess({ movies: results, page, totalPages })
          ),
          catchError((err: unknown) =>
            of(MoviesApiActions.loadFailure({ error: extractMessage(err) }))
          )
        );
      })
    )
  );

  loadMoreMovies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MoviesPageActions.loadMore),
      withLatestFrom(
        this.store.select(selectCurrentPage),
        this.store.select(selectSearchQuery),
        this.store.select(selectSortBy),
        this.store.select(selectSelectedGenreIds)
      ),
      exhaustMap(([, currentPage, query, sortBy, genreIds]) => {
        const nextPage = currentPage + 1;
        const source$ = query.trim()
          ? this.tmdb.searchMovies(query, nextPage)
          : this.tmdb.discoverMovies(sortBy, genreIds, nextPage);

        return source$.pipe(
          map(({ results, page, totalPages }) =>
            MoviesApiActions.appendSuccess({ movies: results, page, totalPages })
          ),
          catchError((err: unknown) =>
            of(MoviesApiActions.loadFailure({ error: extractMessage(err) }))
          )
        );
      })
    )
  );
}

function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'An unexpected error occurred.';
}
