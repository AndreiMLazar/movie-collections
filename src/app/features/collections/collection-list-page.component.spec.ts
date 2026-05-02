import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideStore } from '@ngrx/store';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { CollectionListPageComponent } from './collection-list-page.component';
import { collectionsFeature } from './state/collections.reducer';
import { CollectionsActions } from './state/collections.actions';

describe('CollectionListPageComponent', () => {
  let store: Store;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionListPageComponent],
      providers: [
        provideRouter([]),
        provideStore({ [collectionsFeature.name]: collectionsFeature.reducer }),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
  });

  it('shows empty state when there are no collections', () => {
    const fixture = TestBed.createComponent(CollectionListPageComponent);
    fixture.detectChanges();

    const emptyState = fixture.debugElement.query(By.css('app-empty-state'));
    expect(emptyState).toBeTruthy();
  });

  it('renders a collection card for each collection in the store', () => {
    store.dispatch(CollectionsActions.createCollection({ name: 'Horror' }));
    store.dispatch(CollectionsActions.createCollection({ name: 'Comedy' }));

    const fixture = TestBed.createComponent(CollectionListPageComponent);
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('app-collection-card'));
    expect(cards).toHaveLength(2);
  });

  it('opens the create modal when "New Collection" is clicked', () => {
    const fixture = TestBed.createComponent(CollectionListPageComponent);
    fixture.detectChanges();

    const btn: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.collections-page__create-btn'
    );
    btn.click();
    fixture.detectChanges();

    const modal = fixture.debugElement.query(By.css('app-create-collection-modal'));
    expect(modal).toBeTruthy();
  });

  it('dispatches deleteCollection when a card is deleted', () => {
    store.dispatch(CollectionsActions.createCollection({ name: 'Sci-Fi' }));

    const fixture = TestBed.createComponent(CollectionListPageComponent);
    fixture.detectChanges();

    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const deleteBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.collection-card__delete'
    );
    deleteBtn.click();
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: CollectionsActions.deleteCollection.type })
    );
  });
});
