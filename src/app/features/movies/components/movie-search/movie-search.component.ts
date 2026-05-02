import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MoviesPageActions } from '../../state/movies.actions';

@Component({
  selector: 'app-movie-search',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movie-search.component.html',
  styleUrl: './movie-search.component.scss',
})
export class MovieSearchComponent {
  readonly #store = inject(Store);
  #debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly query = signal('');

  onQueryChange(value: string): void {
    this.query.set(value);
    if (this.#debounceTimer) clearTimeout(this.#debounceTimer);
    this.#debounceTimer = setTimeout(() => {
      const trimmed = value.trim();
      if (trimmed) {
        this.#store.dispatch(MoviesPageActions.search({ query: trimmed, page: 1 }));
      } else {
        this.#store.dispatch(MoviesPageActions.clearSearch());
        this.#store.dispatch(MoviesPageActions.loadPopular({ page: 1 }));
      }
    }, 350);
  }

  clear(): void {
    this.query.set('');
    if (this.#debounceTimer) clearTimeout(this.#debounceTimer);
    this.#store.dispatch(MoviesPageActions.clearSearch());
    this.#store.dispatch(MoviesPageActions.loadPopular({ page: 1 }));
  }
}
