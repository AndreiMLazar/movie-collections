import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TmdbService } from './tmdb.service';

describe('TmdbService', () => {
  let service: TmdbService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TmdbService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TmdbService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getPopularMovies requests the correct URL with page param', () => {
    service.getPopularMovies(2).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url.includes('/movie/popular') && r.params.get('page') === '2'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ page: 2, total_pages: 10, total_results: 200, results: [] });
  });

  it('getPopularMovies uses page 1 by default', () => {
    service.getPopularMovies().subscribe();

    const req = httpMock.expectOne(
      (r) => r.url.includes('/movie/popular') && r.params.get('page') === '1'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ page: 1, total_pages: 5, total_results: 50, results: [] });
  });

  it('searchMovies includes query and page params', () => {
    service.searchMovies('inception', 1).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url.includes('/search/movie') &&
        r.params.get('query') === 'inception' &&
        r.params.get('page') === '1'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ page: 1, total_pages: 5, total_results: 50, results: [] });
  });

  it('searchMovies uses page 1 by default', () => {
    service.searchMovies('matrix').subscribe();

    const req = httpMock.expectOne(
      (r) => r.url.includes('/search/movie') && r.params.get('page') === '1'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ page: 1, total_pages: 2, total_results: 20, results: [] });
  });

  it('maps TmdbMovieDto snake_case to Movie camelCase', (done) => {
    service.getPopularMovies(1).subscribe((result) => {
      const movie = result.results[0];
      expect(movie.posterPath).toBe('/poster.jpg');
      expect(movie.voteAverage).toBe(8.5);
      expect(movie.releaseDate).toBe('2010-07-16');
      done();
    });

    const req = httpMock.expectOne((r) => r.url.includes('/movie/popular'));
    req.flush({
      page: 1,
      total_pages: 1,
      total_results: 1,
      results: [
        {
          id: 27205,
          title: 'Inception',
          poster_path: '/poster.jpg',
          backdrop_path: '/backdrop.jpg',
          vote_average: 8.5,
          vote_count: 30000,
          genre_ids: [28, 12],
          overview: 'A dream within a dream.',
          release_date: '2010-07-16',
          popularity: 99.9,
        },
      ],
    });
  });

  it('getPosterUrl returns placeholder for null path', () => {
    expect(service.getPosterUrl(null)).toContain('poster-placeholder');
  });

  it('getPosterUrl builds correct URL with size', () => {
    const url = service.getPosterUrl('/abc.jpg', 'w342');
    expect(url).toMatch(/\/w342\/abc\.jpg$/);
  });

  it('getPosterUrl uses default size (w342) when no size is provided', () => {
    const url = service.getPosterUrl('/default.jpg');
    expect(url).toContain('w342');
    expect(url).toContain('/default.jpg');
  });

  it('getBackdropUrl returns empty string for null path', () => {
    expect(service.getBackdropUrl(null)).toBe('');
  });

  it('getBackdropUrl builds a correct URL for a valid path', () => {
    const url = service.getBackdropUrl('/back.jpg', 'w780');
    expect(url).toMatch(/\/w780\/back\.jpg$/);
  });

  it('discoverMovies requests the correct URL with sortBy and page params', () => {
    service.discoverMovies('revenue.desc', [], 2).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url.includes('/discover/movie') &&
        r.params.get('sort_by') === 'revenue.desc' &&
        r.params.get('page') === '2'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ page: 2, total_pages: 8, total_results: 80, results: [] });
  });

  it('discoverMovies uses page 1 by default', () => {
    service.discoverMovies('popularity.desc', []).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url.includes('/discover/movie') && r.params.get('page') === '1'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ page: 1, total_pages: 3, total_results: 30, results: [] });
  });

  it('discoverMovies includes with_genres param when genreIds are provided', () => {
    service.discoverMovies('popularity.desc', [28, 12], 1).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url.includes('/discover/movie') && r.params.get('with_genres') === '28,12'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ page: 1, total_pages: 3, total_results: 30, results: [] });
  });

  it('discoverMovies omits with_genres param when no genres are provided', () => {
    service.discoverMovies('popularity.desc', [], 1).subscribe();

    const req = httpMock.expectOne((r) => r.url.includes('/discover/movie'));
    expect(req.request.params.has('with_genres')).toBe(false);
    req.flush({ page: 1, total_pages: 1, total_results: 10, results: [] });
  });

  it('getMovieDetails requests the correct URL and maps camelCase response', (done) => {
    service.getMovieDetails(27205).subscribe((details) => {
      expect(details.id).toBe(27205);
      expect(details.runtime).toBe(148);
      expect(details.tagline).toBe('Your mind is the scene of the crime.');
      expect(details.budget).toBe(160000000);
      expect(details.revenue).toBe(836836967);
      expect(details.genres).toEqual([{ id: 28, name: 'Action' }]);
      expect(details.credits.cast[0].profilePath).toBe('/profile.jpg');
      expect(details.credits.crew[0].job).toBe('Director');
      done();
    });

    const req = httpMock.expectOne(
      (r) => r.url.includes('/movie/27205') && r.params.get('append_to_response') === 'credits'
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      id: 27205,
      title: 'Inception',
      poster_path: '/inception.jpg',
      backdrop_path: '/backdrop.jpg',
      vote_average: 8.8,
      vote_count: 30000,
      genres: [{ id: 28, name: 'Action' }],
      overview: 'A dream within a dream.',
      release_date: '2010-07-16',
      popularity: 99.9,
      runtime: 148,
      tagline: 'Your mind is the scene of the crime.',
      homepage: 'https://www.warnerbros.com/inception',
      budget: 160000000,
      revenue: 836836967,
      credits: {
        cast: [
          {
            id: 6193,
            name: 'Leonardo DiCaprio',
            character: 'Cobb',
            profile_path: '/profile.jpg',
            order: 0,
          },
        ],
        crew: [
          {
            id: 525,
            name: 'Christopher Nolan',
            job: 'Director',
            department: 'Directing',
          },
        ],
      },
    });
  });

  it('getMovieDetails handles null posterPath and backdropPath', (done) => {
    service.getMovieDetails(1).subscribe((details) => {
      expect(details.posterPath).toBeNull();
      expect(details.backdropPath).toBeNull();
      done();
    });

    const req = httpMock.expectOne((r) => r.url.includes('/movie/1'));
    req.flush({
      id: 1,
      title: 'No Images Movie',
      poster_path: null,
      backdrop_path: null,
      vote_average: 5.0,
      vote_count: 100,
      genres: [],
      overview: '',
      release_date: '2020-01-01',
      popularity: 10,
      runtime: null,
      tagline: '',
      homepage: '',
      budget: 0,
      revenue: 0,
      credits: { cast: [], crew: [] },
    });
  });
});
