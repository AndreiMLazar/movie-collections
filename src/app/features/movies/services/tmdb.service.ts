import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import type { Movie } from '../types';
import type { MovieDetails } from '../types';
import type { TmdbPageResult } from '../types';
import type { PageResult } from '@shared/types';
import { TMDB_IMAGE_SIZES } from '@core/constants';
import type { TmdbImageSize } from '@core/constants';
import type { TmdbMovieDetailsRaw } from '../types';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  readonly #http = inject(HttpClient);
  readonly #apiKey = environment.tmdbApiKey;
  readonly #baseUrl = environment.tmdbBaseUrl;
  readonly #imageBaseUrl = environment.tmdbImageBaseUrl;

  getPopularMovies(page = 1): Observable<PageResult<Movie>> {
    const params = new HttpParams().set('api_key', this.#apiKey).set('page', page);

    return this.#http
      .get<TmdbPageResult>(`${this.#baseUrl}/movie/popular`, { params })
      .pipe(map(this.#mapPageResult));
  }

  searchMovies(query: string, page = 1): Observable<PageResult<Movie>> {
    const params = new HttpParams()
      .set('api_key', this.#apiKey)
      .set('query', query)
      .set('page', page);

    return this.#http
      .get<TmdbPageResult>(`${this.#baseUrl}/search/movie`, { params })
      .pipe(map(this.#mapPageResult));
  }

  discoverMovies(sortBy: string, genreIds: number[], page = 1): Observable<PageResult<Movie>> {
    let params = new HttpParams()
      .set('api_key', this.#apiKey)
      .set('sort_by', sortBy)
      .set('page', page)
      .set('include_adult', 'false');

    if (genreIds.length > 0) {
      params = params.set('with_genres', genreIds.join(','));
    }

    return this.#http
      .get<TmdbPageResult>(`${this.#baseUrl}/discover/movie`, { params })
      .pipe(map(this.#mapPageResult));
  }

  getMovieDetails(id: number): Observable<MovieDetails> {
    const params = new HttpParams()
      .set('api_key', this.#apiKey)
      .set('append_to_response', 'credits');

    return this.#http.get<TmdbMovieDetailsRaw>(`${this.#baseUrl}/movie/${id}`, { params }).pipe(
      map((raw) => ({
        id: raw.id,
        title: raw.title,
        posterPath: raw.poster_path,
        backdropPath: raw.backdrop_path,
        voteAverage: raw.vote_average,
        voteCount: raw.vote_count,
        genreIds: raw.genres.map((g) => g.id),
        genres: raw.genres,
        overview: raw.overview,
        releaseDate: raw.release_date,
        popularity: raw.popularity,
        runtime: raw.runtime,
        tagline: raw.tagline,
        homepage: raw.homepage,
        budget: raw.budget,
        revenue: raw.revenue,
        credits: {
          cast: raw.credits.cast.map((c) => ({
            id: c.id,
            name: c.name,
            character: c.character,
            profilePath: c.profile_path,
            order: c.order,
          })),
          crew: raw.credits.crew.map((c) => ({
            id: c.id,
            name: c.name,
            job: c.job,
            department: c.department,
          })),
        },
      }))
    );
  }

  getPosterUrl(path: string | null, size: TmdbImageSize = TMDB_IMAGE_SIZES.posterMd): string {
    if (!path) return '/poster-placeholder.svg';
    return `${this.#imageBaseUrl}/${size}${path}`;
  }

  getBackdropUrl(path: string | null, size: TmdbImageSize = TMDB_IMAGE_SIZES.backdropMd): string {
    if (!path) return '';
    return `${this.#imageBaseUrl}/${size}${path}`;
  }

  #mapPageResult(raw: TmdbPageResult): PageResult<Movie> {
    return {
      page: raw.page,
      totalPages: raw.total_pages,
      totalResults: raw.total_results,
      results: raw.results.map((dto) => ({
        id: dto.id,
        title: dto.title,
        posterPath: dto.poster_path,
        backdropPath: dto.backdrop_path,
        voteAverage: dto.vote_average,
        voteCount: dto.vote_count,
        genreIds: dto.genre_ids,
        overview: dto.overview,
        releaseDate: dto.release_date,
        popularity: dto.popularity,
      })),
    };
  }
}
