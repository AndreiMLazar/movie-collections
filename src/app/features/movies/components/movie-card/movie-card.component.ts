import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  inject,
  input,
  output,
} from '@angular/core';
import { DecimalPipe, SlicePipe, isPlatformBrowser } from '@angular/common';
import { TmdbService } from '../../services';
import { MOVIE_GENRES } from '../../constants';
import type { Movie } from '../../types';

const MAX_TILT = 12; // degrees

@Component({
  selector: 'app-movie-card',
  imports: [DecimalPipe, SlicePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
})
export class MovieCardComponent {
  readonly #tmdb = inject(TmdbService);
  readonly #el = inject(ElementRef<HTMLElement>);
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly movie = input.required<Movie>();
  readonly addToCollectionClick = output<Movie>();
  readonly movieClick = output<Movie>();

  readonly genres = MOVIE_GENRES;

  get posterUrl(): string {
    return this.#tmdb.getPosterUrl(this.movie().posterPath);
  }

  get ratingColor(): string {
    const r = this.movie().voteAverage;
    if (r >= 7) return 'high';
    if (r >= 5) return 'mid';
    return 'low';
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (!this.#isBrowser) return;
    const rect = this.#el.nativeElement.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const rotX = (-dy * MAX_TILT).toFixed(2);
    const rotY = (dx * MAX_TILT).toFixed(2);
    const shineX = (((dx + 1) / 2) * 100).toFixed(1);
    const shineY = (((dy + 1) / 2) * 100).toFixed(1);
    const el = this.#el.nativeElement;
    el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
    el.style.setProperty('--shine-x', `${shineX}%`);
    el.style.setProperty('--shine-y', `${shineY}%`);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (!this.#isBrowser) return;
    const el = this.#el.nativeElement;
    el.style.transform = '';
    el.style.removeProperty('--shine-x');
    el.style.removeProperty('--shine-y');
  }
}
