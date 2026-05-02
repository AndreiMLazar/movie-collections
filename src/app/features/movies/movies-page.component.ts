import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { MoviesPageActions } from './state/movies.actions';
import {
  selectMovies,
  selectLoading,
  selectError,
  selectHasMore,
  selectIsSearching,
  selectHasActiveFilters,
  selectSelectedGenreIds,
  selectSortBy,
} from './state/movies.reducer';
import { MovieGridComponent } from './components/movie-grid/movie-grid.component';
import { MovieSearchComponent } from './components/movie-search/movie-search.component';
import { MovieFiltersComponent } from './components/movie-filters/movie-filters.component';
import { AddToCollectionModalComponent } from './components/add-to-collection-modal/add-to-collection-modal.component';
import { MovieDetailModalComponent } from './components/movie-detail-modal';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '@shared/components/error-banner/error-banner.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import type { Movie } from './types';

@Component({
  selector: 'app-movies-page',
  imports: [
    MovieGridComponent,
    MovieSearchComponent,
    MovieFiltersComponent,
    AddToCollectionModalComponent,
    MovieDetailModalComponent,
    SpinnerComponent,
    ErrorBannerComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movies-page.component.html',
  styleUrl: './movies-page.component.scss',
})
export class MoviesPageComponent implements OnInit {
  readonly #store = inject(Store);

  readonly movies = this.#store.selectSignal(selectMovies);
  readonly loading = this.#store.selectSignal(selectLoading);
  readonly error = this.#store.selectSignal(selectError);
  readonly hasMore = this.#store.selectSignal(selectHasMore);
  readonly isSearching = this.#store.selectSignal(selectIsSearching);
  readonly hasActiveFilters = this.#store.selectSignal(selectHasActiveFilters);
  readonly selectedGenreIds = this.#store.selectSignal(selectSelectedGenreIds);
  readonly sortBy = this.#store.selectSignal(selectSortBy);

  readonly selectedMovie = signal<Movie | null>(null);
  readonly selectedDetailMovie = signal<Movie | null>(null);
  readonly filtersOpen = signal(false);
  readonly resetScrollTrigger = signal(0);

  constructor() {
    effect(() => {
      // Track filter changes to reset scroll position
      this.selectedGenreIds();
      this.sortBy();
      untracked(() => {
        this.resetScrollTrigger.update((v) => v + 1);
      });
    });
  }

  ngOnInit(): void {
    this.#store.dispatch(MoviesPageActions.loadPopular({ page: 1 }));
  }

  toggleFilters(): void {
    this.filtersOpen.update((v) => !v);
  }

  openModal(movie: Movie): void {
    this.selectedMovie.set(movie);
  }

  closeModal(): void {
    this.selectedMovie.set(null);
  }

  openDetail(movie: Movie): void {
    this.selectedDetailMovie.set(movie);
  }

  closeDetail(): void {
    this.selectedDetailMovie.set(null);
  }

  loadMore(): void {
    this.#store.dispatch(MoviesPageActions.loadMore());
  }
}
