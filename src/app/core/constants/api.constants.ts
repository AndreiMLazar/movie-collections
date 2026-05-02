export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const TMDB_IMAGE_SIZES = {
  posterSm: 'w185',
  posterMd: 'w342',
  posterLg: 'w500',
  posterXl: 'w780',
  backdropMd: 'w780',
  backdropLg: 'w1280',
  original: 'original',
};

export type TmdbImageSize = (typeof TMDB_IMAGE_SIZES)[keyof typeof TMDB_IMAGE_SIZES];
