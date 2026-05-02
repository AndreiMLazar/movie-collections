import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  PLATFORM_ID,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { isPlatformBrowser, CurrencyPipe, DecimalPipe, SlicePipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { TmdbService } from '../../services';
import { TMDB_IMAGE_SIZES } from '@core/constants';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';
import type { Movie, MovieDetails } from '../../types';

@Component({
  selector: 'app-movie-detail-modal',
  imports: [DecimalPipe, SlicePipe, CurrencyPipe, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movie-detail-modal.component.html',
  styleUrl: './movie-detail-modal.component.scss',
})
export class MovieDetailModalComponent {
  readonly #tmdb = inject(TmdbService);
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly movie = input.required<Movie>();
  readonly closed = output<void>();
  readonly addToCollectionClick = output<Movie>();

  readonly details = toSignal<MovieDetails | null>(
    toObservable(this.movie).pipe(switchMap((m) => this.#tmdb.getMovieDetails(m.id))),
    { initialValue: null }
  );

  readonly backdropUrl = computed(() =>
    this.#tmdb.getBackdropUrl(this.movie().backdropPath, TMDB_IMAGE_SIZES.original)
  );

  readonly posterUrl = computed(() =>
    this.#tmdb.getPosterUrl(this.movie().posterPath, TMDB_IMAGE_SIZES.posterMd)
  );

  readonly director = computed(
    () => this.details()?.credits.crew.find((c) => c.job === 'Director')?.name ?? null
  );

  readonly topCast = computed(() => this.details()?.credits.cast.slice(0, 6) ?? []);

  readonly ratingColor = computed(() => {
    const r = this.movie().voteAverage;
    if (r >= 7) return 'high';
    if (r >= 5) return 'mid';
    return 'low';
  });

  formatRuntime(mins: number | null | undefined): string {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('detail-modal-backdrop')) {
      this.closed.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.#isBrowser) {
      this.closed.emit();
    }
  }
}
