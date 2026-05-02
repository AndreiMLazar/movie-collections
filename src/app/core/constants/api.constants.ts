export const TMDB_BASE_URL = 'https://api.themoviedb.org/3' as const;
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p' as const;

export const TMDB_IMAGE_SIZES = {
  posterSm: 'w185',
  posterMd: 'w342',
  posterLg: 'w500',
  posterXl: 'w780',
  backdropMd: 'w780',
  backdropLg: 'w1280',
  original: 'original',
} as const;

export type TmdbImageSize = (typeof TMDB_IMAGE_SIZES)[keyof typeof TMDB_IMAGE_SIZES];
