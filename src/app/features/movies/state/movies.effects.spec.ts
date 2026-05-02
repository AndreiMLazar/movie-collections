import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';

import { TmdbService } from '../services/tmdb.service';
import { MoviesPageActions, MoviesApiActions } from './movies.actions';
import {
  loadPopularMovies,
  searchMovies,
  applyFiltersEffect,
  loadMoreMovies,
} from './movies.effects';
import {
  selectCurrentPage,
  selectSearchQuery,
  selectSelectedGenreIds,
  selectSortBy,
} from './movies.reducer';
import type { PageResult } from '@shared/types';
import type { Movie } from '../types';

const mockMovies: Movie[] = [
  {
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
  },
];

const mockPageResult: PageResult<Movie> = {
  results: mockMovies,
  page: 1,
  totalPages: 5,
  totalResults: 50,
};

function makeTmdbMock(partial: Partial<TmdbService> = {}): TmdbService {
  return {
    getPopularMovies: jest.fn().mockReturnValue(of(mockPageResult)),
    searchMovies: jest.fn().mockReturnValue(of(mockPageResult)),
    discoverMovies: jest.fn().mockReturnValue(of(mockPageResult)),
    getMovieDetails: jest.fn(),
    getPosterUrl: jest.fn(),
    getBackdropUrl: jest.fn(),
    ...partial,
  } as unknown as TmdbService;
}

describe('Movies Effects', () => {
  let actions$: Observable<Action>;
  let tmdbService: TmdbService;

  describe('loadPopularMovies', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideMockActions(() => actions$),
          provideMockStore({
            selectors: [
              { selector: selectSortBy, value: 'popularity.desc' },
              { selector: selectSelectedGenreIds, value: [] },
            ],
          }),
          { provide: TmdbService, useFactory: makeTmdbMock },
        ],
      });
      tmdbService = TestBed.inject(TmdbService);
    });

    it('calls discoverMovies and dispatches loadSuccess on success', (done) => {
      actions$ = of(MoviesPageActions.loadPopular({ page: 1 }));

      TestBed.runInInjectionContext(loadPopularMovies).subscribe((action) => {
        expect(tmdbService.discoverMovies).toHaveBeenCalledWith('popularity.desc', [], 1);
        expect(action).toEqual(
          MoviesApiActions.loadSuccess({
            movies: mockMovies,
            page: 1,
            totalPages: 5,
          })
        );
        done();
      });
    });

    it('dispatches loadFailure when discoverMovies throws an Error', (done) => {
      (tmdbService.discoverMovies as jest.Mock).mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      actions$ = of(MoviesPageActions.loadPopular({ page: 1 }));

      TestBed.runInInjectionContext(loadPopularMovies).subscribe((action) => {
        expect(action).toEqual(MoviesApiActions.loadFailure({ error: 'Network error' }));
        done();
      });
    });

    it('dispatches loadFailure with generic message for non-Error throws', (done) => {
      (tmdbService.discoverMovies as jest.Mock).mockReturnValue(
        throwError(() => 'raw string error')
      );
      actions$ = of(MoviesPageActions.loadPopular({ page: 1 }));

      TestBed.runInInjectionContext(loadPopularMovies).subscribe((action) => {
        expect(action).toEqual(MoviesApiActions.loadFailure({ error: 'raw string error' }));
        done();
      });
    });

    it('dispatches loadFailure with fallback message when thrown value is not an Error or string', (done) => {
      (tmdbService.discoverMovies as jest.Mock).mockReturnValue(throwError(() => ({ code: 500 })));
      actions$ = of(MoviesPageActions.loadPopular({ page: 1 }));

      TestBed.runInInjectionContext(loadPopularMovies).subscribe((action) => {
        expect(action).toEqual(
          MoviesApiActions.loadFailure({ error: 'An unexpected error occurred.' })
        );
        done();
      });
    });
  });

  describe('searchMovies', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideMockActions(() => actions$),
          { provide: TmdbService, useFactory: makeTmdbMock },
        ],
      });
      tmdbService = TestBed.inject(TmdbService);
    });

    it('calls tmdb.searchMovies with query and page, dispatches loadSuccess', (done) => {
      actions$ = of(MoviesPageActions.search({ query: 'inception', page: 1 }));

      TestBed.runInInjectionContext(searchMovies).subscribe((action) => {
        expect(tmdbService.searchMovies).toHaveBeenCalledWith('inception', 1);
        expect(action).toEqual(
          MoviesApiActions.loadSuccess({
            movies: mockMovies,
            page: 1,
            totalPages: 5,
          })
        );
        done();
      });
    });

    it('dispatches loadFailure when searchMovies throws', (done) => {
      (tmdbService.searchMovies as jest.Mock).mockReturnValue(
        throwError(() => new Error('Search failed'))
      );
      actions$ = of(MoviesPageActions.search({ query: 'bad', page: 1 }));

      TestBed.runInInjectionContext(searchMovies).subscribe((action) => {
        expect(action).toEqual(MoviesApiActions.loadFailure({ error: 'Search failed' }));
        done();
      });
    });
  });

  describe('applyFiltersEffect', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideMockActions(() => actions$),
          { provide: TmdbService, useFactory: makeTmdbMock },
        ],
      });
      tmdbService = TestBed.inject(TmdbService);
    });

    it('calls discoverMovies with selected genres and sort when applyFilters is dispatched', (done) => {
      actions$ = of(MoviesPageActions.applyFilters({ genreIds: [28, 12], sortBy: 'revenue.desc' }));

      TestBed.runInInjectionContext(applyFiltersEffect).subscribe((action) => {
        expect(tmdbService.discoverMovies).toHaveBeenCalledWith('revenue.desc', [28, 12], 1);
        expect(action).toEqual(
          MoviesApiActions.loadSuccess({ movies: mockMovies, page: 1, totalPages: 5 })
        );
        done();
      });
    });

    it('calls discoverMovies with default sort and no genres when clearFilters is dispatched', (done) => {
      actions$ = of(MoviesPageActions.clearFilters());

      TestBed.runInInjectionContext(applyFiltersEffect).subscribe((action) => {
        expect(tmdbService.discoverMovies).toHaveBeenCalledWith('popularity.desc', [], 1);
        expect(action).toEqual(
          MoviesApiActions.loadSuccess({ movies: mockMovies, page: 1, totalPages: 5 })
        );
        done();
      });
    });

    it('dispatches loadFailure when discoverMovies throws', (done) => {
      (tmdbService.discoverMovies as jest.Mock).mockReturnValue(
        throwError(() => new Error('Discover failed'))
      );
      actions$ = of(MoviesPageActions.applyFilters({ genreIds: [], sortBy: 'popularity.desc' }));

      TestBed.runInInjectionContext(applyFiltersEffect).subscribe((action) => {
        expect(action).toEqual(MoviesApiActions.loadFailure({ error: 'Discover failed' }));
        done();
      });
    });
  });

  describe('loadMoreMovies', () => {
    describe('when not searching (no search query)', () => {
      beforeEach(() => {
        TestBed.configureTestingModule({
          providers: [
            provideMockActions(() => actions$),
            provideMockStore({
              selectors: [
                { selector: selectCurrentPage, value: 2 },
                { selector: selectSearchQuery, value: '' },
                { selector: selectSortBy, value: 'popularity.desc' },
                { selector: selectSelectedGenreIds, value: [28] },
              ],
            }),
            { provide: TmdbService, useFactory: makeTmdbMock },
          ],
        });
        tmdbService = TestBed.inject(TmdbService);
      });

      it('calls discoverMovies with nextPage and dispatches appendSuccess', (done) => {
        const appendResult: PageResult<Movie> = { ...mockPageResult, page: 3 };
        (tmdbService.discoverMovies as jest.Mock).mockReturnValue(of(appendResult));

        actions$ = of(MoviesPageActions.loadMore());

        TestBed.runInInjectionContext(loadMoreMovies).subscribe((action) => {
          expect(tmdbService.discoverMovies).toHaveBeenCalledWith('popularity.desc', [28], 3);
          expect(action).toEqual(
            MoviesApiActions.appendSuccess({ movies: mockMovies, page: 3, totalPages: 5 })
          );
          done();
        });
      });
    });

    describe('when searching (has search query)', () => {
      beforeEach(() => {
        TestBed.configureTestingModule({
          providers: [
            provideMockActions(() => actions$),
            provideMockStore({
              selectors: [
                { selector: selectCurrentPage, value: 1 },
                { selector: selectSearchQuery, value: 'matrix' },
                { selector: selectSortBy, value: 'popularity.desc' },
                { selector: selectSelectedGenreIds, value: [] },
              ],
            }),
            { provide: TmdbService, useFactory: makeTmdbMock },
          ],
        });
        tmdbService = TestBed.inject(TmdbService);
      });

      it('calls searchMovies with nextPage and dispatches appendSuccess', (done) => {
        const appendResult: PageResult<Movie> = { ...mockPageResult, page: 2 };
        (tmdbService.searchMovies as jest.Mock).mockReturnValue(of(appendResult));

        actions$ = of(MoviesPageActions.loadMore());

        TestBed.runInInjectionContext(loadMoreMovies).subscribe((action) => {
          expect(tmdbService.searchMovies).toHaveBeenCalledWith('matrix', 2);
          expect(action).toEqual(
            MoviesApiActions.appendSuccess({ movies: mockMovies, page: 2, totalPages: 5 })
          );
          done();
        });
      });
    });

    describe('error handling', () => {
      beforeEach(() => {
        TestBed.configureTestingModule({
          providers: [
            provideMockActions(() => actions$),
            provideMockStore({
              selectors: [
                { selector: selectCurrentPage, value: 1 },
                { selector: selectSearchQuery, value: '' },
                { selector: selectSortBy, value: 'popularity.desc' },
                { selector: selectSelectedGenreIds, value: [] },
              ],
            }),
            { provide: TmdbService, useFactory: makeTmdbMock },
          ],
        });
        tmdbService = TestBed.inject(TmdbService);
      });

      it('dispatches loadFailure when the request fails', (done) => {
        (tmdbService.discoverMovies as jest.Mock).mockReturnValue(
          throwError(() => new Error('Load more failed'))
        );
        actions$ = of(MoviesPageActions.loadMore());

        TestBed.runInInjectionContext(loadMoreMovies).subscribe((action) => {
          expect(action).toEqual(MoviesApiActions.loadFailure({ error: 'Load more failed' }));
          done();
        });
      });
    });
  });
});
