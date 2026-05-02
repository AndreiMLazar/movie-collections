import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  ViewChild,
} from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import type { Movie } from '../../types';

const ITEM_SIZE = 384; // card height (360px) + gap (24px)
const MIN_BUFFER = 768;
const MAX_BUFFER = 1536;

const BP = {
  xs: '(max-width: 599px)',
  sm: '(min-width: 600px) and (max-width: 899px)',
  md: '(min-width: 900px) and (max-width: 1199px)',
  lg: '(min-width: 1200px)',
};

@Component({
  selector: 'app-movie-grid',
  imports: [ScrollingModule, MovieCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movie-grid.component.html',
  styleUrl: './movie-grid.component.scss',
})
export class MovieGridComponent {
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  readonly #bp = inject(BreakpointObserver);

  readonly movies = input.required<Movie[]>();
  readonly hasMore = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly resetScrollTrigger = input<number>(0);
  readonly addToCollection = output<Movie>();
  readonly movieClick = output<Movie>();
  readonly loadMore = output<void>();

  readonly itemSize = ITEM_SIZE;
  readonly minBuffer = MIN_BUFFER;
  readonly maxBuffer = MAX_BUFFER;

  constructor() {
    effect(() => {
      this.resetScrollTrigger();
      this.viewport?.scrollToIndex(0);
    });
  }

  #getCols(): number {
    if (this.#bp.isMatched(BP.xs)) return 2;
    if (this.#bp.isMatched(BP.sm)) return 3;
    if (this.#bp.isMatched(BP.md)) return 4;
    return 5;
  }

  readonly movieRows = computed(() => {
    const cols = this.#getCols();
    const all = this.movies();
    const rows: Movie[][] = [];
    for (let i = 0; i < all.length; i += cols) {
      rows.push(all.slice(i, i + cols));
    }
    return rows;
  });

  trackByRow(index: number): number {
    return index;
  }

  trackByMovie(_: number, movie: Movie): number {
    return movie.id;
  }

  onScrolledIndexChange(firstVisibleRow: number): void {
    const rows = this.movieRows();
    const threshold = Math.max(0, rows.length - 3);
    if (firstVisibleRow >= threshold && this.hasMore() && !this.loading()) {
      this.loadMore.emit();
    }
  }
}
