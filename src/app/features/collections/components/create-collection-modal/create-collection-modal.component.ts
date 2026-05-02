import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CollectionsActions } from '../../state/collections.actions';

@Component({
  selector: 'app-create-collection-modal',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-collection-modal.component.html',
  styleUrl: './create-collection-modal.component.scss',
})
export class CreateCollectionModalComponent {
  readonly #store = inject(Store);

  readonly closed = output<void>();

  name = '';

  create(): void {
    const trimmed = this.name.trim();
    if (!trimmed) return;
    this.#store.dispatch(CollectionsActions.createCollection({ name: trimmed }));
    this.closed.emit();
  }
}
