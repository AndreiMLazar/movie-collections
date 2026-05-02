import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MOVIE_GENRES, MOVIE_SORT_OPTIONS } from '../../constants';
import type { SortOption } from '../../constants';
import { MoviesPageActions } from '../../state/movies.actions';
import {
  selectHasActiveFilters,
  selectSelectedGenreIds,
  selectSortBy,
} from '../../state/movies.reducer';

@Component({
  selector: 'app-movie-filters',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movie-filters.component.html',
  styleUrl: './movie-filters.component.scss',
})
export class MovieFiltersComponent {
  readonly #store = inject(Store);

  readonly selectedGenreIds = this.#store.selectSignal(selectSelectedGenreIds);
  readonly sortBy = this.#store.selectSignal(selectSortBy);
  readonly hasActiveFilters = this.#store.selectSignal(selectHasActiveFilters);

  readonly pendingGenreIds = signal<number[]>([]);
  readonly pendingSortBy = signal<string>('popularity.desc');

  readonly sortOptions: SortOption[] = MOVIE_SORT_OPTIONS;

  readonly genreEntries = computed(() =>
    Object.entries(MOVIE_GENRES).map(([id, name]) => ({
      id: Number(id),
      name,
    }))
  );

  constructor() {
    effect(() => {
      this.pendingGenreIds.set([...this.selectedGenreIds()]);
      this.pendingSortBy.set(this.sortBy());
    });
  }

  isGenreSelected(id: number): boolean {
    return this.pendingGenreIds().includes(id);
  }

  toggleGenre(id: number): void {
    const current = this.pendingGenreIds();
    const updated = current.includes(id) ? current.filter((g) => g !== id) : [...current, id];
    this.pendingGenreIds.set(updated);
    this.#store.dispatch(
      MoviesPageActions.applyFilters({ genreIds: updated, sortBy: this.pendingSortBy() })
    );
  }

  onSortChange(sortBy: string): void {
    this.pendingSortBy.set(sortBy);
    this.#store.dispatch(
      MoviesPageActions.applyFilters({ genreIds: this.pendingGenreIds(), sortBy })
    );
  }

  clearFilters(): void {
    this.#store.dispatch(MoviesPageActions.clearFilters());
  }
}
