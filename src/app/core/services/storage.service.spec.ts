import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '@core/constants';
import type { Collection } from '@features/collections/types';

const sampleCollections: Collection[] = [
  {
    id: 'col-1',
    name: 'Favorites',
    movieIds: [1, 2],
    movieDetails: [],
    sortOrder: 'recent',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

function setupService(platformId: string = 'browser'): StorageService {
  TestBed.configureTestingModule({
    providers: [StorageService, { provide: PLATFORM_ID, useValue: platformId }],
  });
  return TestBed.inject(StorageService);
}

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('when running in browser', () => {
    let service: StorageService;

    beforeEach(() => {
      service = setupService('browser');
    });

    describe('saveCollections', () => {
      it('serializes collections to localStorage', () => {
        service.saveCollections(sampleCollections);
        const raw = localStorage.getItem(STORAGE_KEYS.collections);
        expect(raw).not.toBeNull();
        expect(JSON.parse(raw!)).toEqual(sampleCollections);
      });

      it('persists an empty array to localStorage', () => {
        service.saveCollections([]);
        const raw = localStorage.getItem(STORAGE_KEYS.collections);
        expect(JSON.parse(raw!)).toEqual([]);
      });
    });

    describe('loadCollections', () => {
      it('returns collections previously saved to localStorage', () => {
        localStorage.setItem(STORAGE_KEYS.collections, JSON.stringify(sampleCollections));
        const result = service.loadCollections();
        expect(result).toEqual(sampleCollections);
      });

      it('returns an empty array when nothing is stored', () => {
        const result = service.loadCollections();
        expect(result).toEqual([]);
      });

      it('returns an empty array when stored JSON is invalid', () => {
        localStorage.setItem(STORAGE_KEYS.collections, 'not-valid-json{{{');
        const result = service.loadCollections();
        expect(result).toEqual([]);
      });

      it('returns an empty array when stored value is not an array', () => {
        localStorage.setItem(STORAGE_KEYS.collections, JSON.stringify({ id: 'not-an-array' }));
        const result = service.loadCollections();
        expect(result).toEqual([]);
      });
    });

    describe('round-trip persistence', () => {
      it('saves and then loads the same collections', () => {
        service.saveCollections(sampleCollections);
        const loaded = service.loadCollections();
        expect(loaded).toEqual(sampleCollections);
      });

      it('overwrites previous data on subsequent saves', () => {
        service.saveCollections(sampleCollections);
        service.saveCollections([]);
        const loaded = service.loadCollections();
        expect(loaded).toEqual([]);
      });
    });
  });

  describe('when running on the server (non-browser)', () => {
    let service: StorageService;

    beforeEach(() => {
      service = setupService('server');
    });

    it('saveCollections does not write to localStorage', () => {
      service.saveCollections(sampleCollections);
      expect(localStorage.getItem(STORAGE_KEYS.collections)).toBeNull();
    });

    it('loadCollections returns an empty array', () => {
      localStorage.setItem(STORAGE_KEYS.collections, JSON.stringify(sampleCollections));
      const result = service.loadCollections();
      expect(result).toEqual([]);
    });
  });
});
