# Architecture notes

## Folder structure

The project uses a feature-based layout under `src/app/`:

```
src/app/
├── core/            — app-wide services (StorageService) and constants (API base URL, storage key)
├── features/
│   ├── movies/      — TMDB service, NgRx state, movies page, movie card, search, modals
│   └── collections/ — NgRx state, collection list page, collection detail page, card, modals
└── shared/          — Spinner, ErrorBanner, EmptyState components and shared types
```

Each feature has its own `state/`, `components/`, `services/`, and `types/` subdirectories. The `movies` feature does not import from `collections` state and vice versa. The one exception is `AddToCollectionModalComponent`, which lives under `movies/components/` but dispatches `CollectionsActions` — that crossing is intentional and limited to a single dispatch call.

---

## State: NgRx vs signals

Shared and persistent data goes in NgRx. Modal open/close and other transient UI state stays as component signals.

NgRx covers the movies list, pagination, search query, loading and error state, and all collection data (movie IDs, movie snapshots, sort order). Signals cover whether a modal is open, which movie was clicked, and debounce state inside the search component.

The split keeps the NgRx action log useful. Opening a modal should not appear there. Signals also work cleanly with `ChangeDetectionStrategy.OnPush` without needing an `async` pipe.

---

## Effects and API integration

The movies feature has three functional effects in one file. `loadPopularMovies` and `searchMovies` both use `switchMap` so a new request cancels any in-flight one. `applyFiltersEffect` handles genre/sort changes and re-fetches. There is also a `loadMore` effect that uses `exhaustMap` to ignore rapid repeated clicks.

The collections feature has two effects. `loadCollectionsFromStorage` runs once on startup and dispatches the stored data into the store. `persistCollections` listens for any mutating action and writes the current state to localStorage after every change. Both use the `{ functional: true }` pattern with `inject()`.

---

## Persistence

Collections are written to localStorage after every mutating action (create, delete, add movie, remove movie, sort change) via the `persistCollections` effect. On app start, `loadCollectionsFromStorage` reads from storage and dispatches the result.

The reducer handles a migration case: if a collection was saved before the `movieDetails` field was added to the model, the missing field defaults to an empty array on load. This prevents old stored data from breaking the detail page.

---

## Trade-off: movie data snapshot vs live lookup

When a movie is added to a collection, the action carries a full `CollectionMovie` snapshot (title, poster path, rating, genres, release date). The reducer stores this in `movieDetails: CollectionMovie[]` on the collection.

The alternative is looking up a movie by ID in the movies NgRx slice. That does not work reliably because the slice only holds the current paginated page. Searching or loading more discards earlier pages. Caching every fetched movie or making a separate API call per movie in the detail page would both work but add complexity that is not justified for this scope.

The snapshot duplicates data and goes stale if TMDB updates metadata. In a production feature I would add a per-movie endpoint call in the collection detail page instead, and only fall back to the snapshot when the call fails.

---

## Animation

Both modal components use Angular 21's compiler-native animation API. The `.modal-backdrop` element carries `animate.enter="modal-enter"` and `animate.leave="modal-leave"` attributes. The named CSS classes are defined in each component's SCSS file alongside the `@keyframes` blocks. No `provideAnimations()`, no `@angular/animations` imports, no trigger syntax.

---

## Path aliases

| Alias | Resolves to |
|---|---|
| `@core/*` | `src/app/core/*` |
| `@features/*` | `src/app/features/*` |
| `@shared/*` | `src/app/shared/*` |
| `@env/*` | `src/environments/*` |

Configured in both `tsconfig.json` and `jest.config.ts` (`moduleNameMapper`).
