import {
  selectCollectionById,
  selectCollectionsContainingMovie,
  selectMovieIdsForCollection,
  selectSelectedCollection,
} from './collections.reducer';
import type { Collection } from '../types';

const colA: Collection = {
  id: 'col-a',
  name: 'Action',
  movieIds: [1, 2, 3],
  movieDetails: [],
  sortOrder: 'recent',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const colB: Collection = {
  id: 'col-b',
  name: 'Sci-Fi',
  movieIds: [2, 4],
  movieDetails: [],
  sortOrder: 'name',
  createdAt: '2024-02-01T00:00:00.000Z',
};

const collections = [colA, colB];

describe('collectionsSelectors', () => {
  describe('selectCollectionById', () => {
    it('returns the matching collection', () => {
      const result = selectCollectionById('col-a').projector(collections);
      expect(result).toEqual(colA);
    });

    it('returns null for an unknown id', () => {
      const result = selectCollectionById('unknown').projector(collections);
      expect(result).toBeNull();
    });
  });

  describe('selectCollectionsContainingMovie', () => {
    it('returns collections that contain the given movieId', () => {
      const result = selectCollectionsContainingMovie(2).projector(collections);
      expect(result).toHaveLength(2);
      expect(result.map((c: Collection) => c.id)).toEqual(['col-a', 'col-b']);
    });

    it('returns an empty array if no collection contains the movie', () => {
      const result = selectCollectionsContainingMovie(999).projector(collections);
      expect(result).toHaveLength(0);
    });
  });

  describe('selectMovieIdsForCollection', () => {
    it('returns movieIds for a known collection', () => {
      const result = selectMovieIdsForCollection('col-a').projector(collections);
      expect(result).toEqual([1, 2, 3]);
    });

    it('returns an empty array for an unknown collection id', () => {
      const result = selectMovieIdsForCollection('unknown').projector(collections);
      expect(result).toEqual([]);
    });
  });

  describe('selectSelectedCollection', () => {
    it('returns the collection when selectedCollectionId matches', () => {
      const result = selectSelectedCollection.projector(collections, 'col-a');
      expect(result).toEqual(colA);
    });

    it('returns null when selectedCollectionId is null', () => {
      const result = selectSelectedCollection.projector(collections, null);
      expect(result).toBeNull();
    });

    it('returns null when selectedCollectionId does not match any collection', () => {
      const result = selectSelectedCollection.projector(collections, 'unknown-id');
      expect(result).toBeNull();
    });
  });
});
