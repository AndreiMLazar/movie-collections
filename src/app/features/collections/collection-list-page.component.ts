import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectCollections } from './state/collections.reducer';
import { CollectionCardComponent } from './components/collection-card/collection-card.component';
import { CreateCollectionModalComponent } from './components/create-collection-modal/create-collection-modal.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-collection-list-page',
  imports: [CollectionCardComponent, CreateCollectionModalComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './collection-list-page.component.html',
  styleUrl: './collection-list-page.component.scss',
})
export class CollectionListPageComponent {
  readonly #store = inject(Store);

  readonly collections = this.#store.selectSignal(selectCollections);
  readonly showCreateModal = signal(false);
}
