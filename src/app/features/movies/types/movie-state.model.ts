import type { Movie } from './movie.model';

export interface MoviesState {
  movies: Movie[];
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  selectedGenreIds: number[];
  sortBy: string;
}
