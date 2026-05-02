import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { STORAGE_KEYS } from '@core/constants';
import type { Collection } from '@features/collections/types';

@Injectable({ providedIn: 'root' })
export class StorageService {
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  saveCollections(collections: Collection[]): void {
    if (!this.#isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEYS.collections, JSON.stringify(collections));
    } catch {
      // localStorage may be unavailable (private mode, quota exceeded)
    }
  }

  loadCollections(): Collection[] {
    if (!this.#isBrowser) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.collections);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as Collection[]) : [];
    } catch {
      return [];
    }
  }
}
