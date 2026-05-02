/** Raw TMDB /movie/popular and /search/movie response shapes */
export interface TmdbMovieDto {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  overview: string;
  release_date: string;
  popularity: number;
}

export interface TmdbPageResult {
  page: number;
  results: TmdbMovieDto[];
  total_pages: number;
  total_results: number;
}
