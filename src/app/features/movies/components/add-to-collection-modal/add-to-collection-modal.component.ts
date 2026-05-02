import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectCollections } from '@features/collections/state/collections.reducer';
import { CollectionsActions } from '@features/collections/state/collections.actions';
import type { Movie } from '@features/movies/types';
import type { CollectionMovie } from '@features/collections/types';

@Component({
  selector: 'app-add-to-collection-modal',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-to-collection-modal.component.html',
  styleUrl: './add-to-collection-modal.component.scss',
})
export class AddToCollectionModalComponent {
  readonly #store = inject(Store);

  readonly movie = input.required<Movie>();
  readonly closed = output<void>();
  readonly collections = this.#store.selectSignal(selectCollections);

  newName = '';

  addTo(collectionId: string): void {
    const m = this.movie();
    const movieData: CollectionMovie = {
      id: m.id,
      title: m.title,
      posterPath: m.posterPath,
      voteAverage: m.voteAverage,
      voteCount: m.voteCount,
      genreIds: m.genreIds,
      releaseDate: m.releaseDate,
      overview: m.overview,
    };
    this.#store.dispatch(
      CollectionsActions.addMovieToCollection({ collectionId, movieId: m.id, movieData })
    );
    this.closed.emit();
  }

  createAndAdd(): void {
    const name = this.newName.trim();
    if (!name) return;
    this.#store.dispatch(CollectionsActions.createCollection({ name }));
    Promise.resolve().then(() => {
      const cols = this.collections();
      const created = cols.find((c) => c.name === name);
      if (created) {
        const m = this.movie();
        const movieData: CollectionMovie = {
          id: m.id,
          title: m.title,
          posterPath: m.posterPath,
          voteAverage: m.voteAverage,
          voteCount: m.voteCount,
          genreIds: m.genreIds,
          releaseDate: m.releaseDate,
          overview: m.overview,
        };
        this.#store.dispatch(
          CollectionsActions.addMovieToCollection({
            collectionId: created.id,
            movieId: m.id,
            movieData,
          })
        );
      }
      this.newName = '';
      this.closed.emit();
    });
  }
}
