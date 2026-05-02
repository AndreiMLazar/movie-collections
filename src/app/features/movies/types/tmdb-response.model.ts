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

/** Raw TMDB /movie/{id} response shape (with credits appended) */
export interface TmdbMovieDetailsRaw {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  overview: string;
  release_date: string;
  popularity: number;
  runtime: number | null;
  tagline: string;
  homepage: string;
  budget: number;
  revenue: number;
  credits: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
      order: number;
    }[];
    crew: { id: number; name: string; job: string; department: string }[];
  };
}
