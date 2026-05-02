export type SortOrder = 'name' | 'recent';

/** Minimal snapshot stored inside each collection so the detail page
 *  can render movie cards without needing the movies slice to be loaded. */
export interface CollectionMovie {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
  releaseDate: string;
  overview: string;
}

export interface Collection {
  id: string;
  name: string;
  movieIds: number[];
  /** Movie snapshots stored when a movie is added to the collection. */
  movieDetails: CollectionMovie[];
  sortOrder: SortOrder;
  createdAt: string;
}
