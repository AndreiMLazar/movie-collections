import type { Collection } from './collection.model';

export interface CollectionsState {
  collections: Collection[];
  selectedCollectionId: string | null;
}
