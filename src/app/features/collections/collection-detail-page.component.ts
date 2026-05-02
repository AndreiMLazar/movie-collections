import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { KeyValuePipe, DecimalPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { TmdbService, MOVIE_GENRES } from '@features/movies';
import { SORT_ORDER_LABELS } from './constants';
import { selectCollections, CollectionsActions } from './state';
import { SortOrder } from './types';
import type { CollectionMovie } from './types';

@Component({
  selector: 'app-collection-detail-page',
  imports: [RouterLink, KeyValuePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './collection-detail-page.component.html',
  styleUrl: './collection-detail-page.component.scss',
})
export class CollectionDetailPageComponent {
  readonly #store = inject(Store);
  readonly #tmdb = inject(TmdbService);
  readonly #destroyRef = inject(DestroyRef);

  /** Bound from route via withComponentInputBinding() */
  readonly id = input<string>('');

  readonly #collections = this.#store.selectSignal(selectCollections);

  readonly collection = computed(() => this.#collections().find((c) => c.id === this.id()));

  /** Details fetched on-demand for legacy entries that have no stored snapshot. */
  readonly #fetchedDetails = signal<Map<number, CollectionMovie>>(new Map());
  readonly #fetchingIds = new Set<number>();

  /** Pairs each movieId with its detail snapshot (stored or fetched). */
  readonly movieItems = computed(() => {
    const col = this.collection();
    if (!col) return [];
    const storedMap = new Map(col.movieDetails.map((m) => [m.id, m]));
    const fetched = this.#fetchedDetails();
    return col.movieIds.map((id) => ({
      id,
      details: storedMap.get(id) ?? fetched.get(id) ?? null,
    }));
  });

  constructor() {
    effect(() => {
      const missing = this.movieItems().filter(
        (item) => item.details === null && !this.#fetchingIds.has(item.id)
      );
      missing.forEach((item) => {
        this.#fetchingIds.add(item.id);
        this.#tmdb
          .getMovieDetails(item.id)
          .pipe(takeUntilDestroyed(this.#destroyRef))
          .subscribe((d) => {
            this.#fetchedDetails.update((map) => {
              const next = new Map(map);
              next.set(d.id, {
                id: d.id,
                title: d.title,
                posterPath: d.posterPath,
                voteAverage: d.voteAverage,
                voteCount: d.voteCount,
                genreIds: d.genreIds,
                releaseDate: d.releaseDate,
                overview: d.overview,
              });
              return next;
            });
          });
      });
    });
  }

  readonly sortLabels = SORT_ORDER_LABELS;
  readonly genres = MOVIE_GENRES;

  getPosterUrl(path: string | null): string {
    return this.#tmdb.getPosterUrl(path);
  }

  ratingColor(avg: number): 'high' | 'mid' | 'low' {
    if (avg >= 7) return 'high';
    if (avg >= 5) return 'mid';
    return 'low';
  }

  setSortOrder(sortOrder: SortOrder): void {
    const id = this.id();
    if (id) {
      this.#store.dispatch(CollectionsActions.updateCollectionSort({ id, sortOrder }));
    }
  }

  removeMovie(movieId: number): void {
    const collectionId = this.id();
    if (collectionId) {
      this.#store.dispatch(CollectionsActions.removeMovieFromCollection({ collectionId, movieId }));
    }
  }
}
