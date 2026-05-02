import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { CollectionsActions } from '../../state/collections.actions';
import { TmdbService, MOVIE_GENRES } from '@features/movies';
import type { Collection } from '../../types';

@Component({
  selector: 'app-collection-card',
  imports: [RouterLink, SlicePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './collection-card.component.html',
  styleUrl: './collection-card.component.scss',
})
export class CollectionCardComponent {
  readonly #store = inject(Store);
  readonly #tmdb = inject(TmdbService);

  readonly collection = input.required<Collection>();

  readonly previewMovies = computed(() => this.collection().movieDetails.slice(0, 3));
  readonly remainingCount = computed(() => Math.max(0, this.collection().movieIds.length - 3));

  readonly avgRating = computed(() => {
    const details = this.collection().movieDetails;
    if (details.length === 0) return null;
    const sum = details.reduce((acc, m) => acc + m.voteAverage, 0);
    return sum / details.length;
  });

  readonly topGenres = computed(() => {
    const details = this.collection().movieDetails;
    const counts = new Map<number, number>();
    details.forEach((m) => m.genreIds.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1)));
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => MOVIE_GENRES[id])
      .filter(Boolean);
  });

  readonly createdLabel = computed(() =>
    new Date(this.collection().createdAt).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })
  );

  getPosterUrl(path: string | null): string {
    return this.#tmdb.getPosterUrl(path);
  }

  onDelete(): void {
    this.#store.dispatch(CollectionsActions.deleteCollection({ id: this.collection().id }));
  }
}
