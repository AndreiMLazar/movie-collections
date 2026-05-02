# Architecture notes

## Folder structure

`src/app/features/` has two subdirectories: `movies/` and `collections/`. Each owns its state, components, services, and types. Shared UI (Spinner, ErrorBanner, EmptyState) and app-wide services (StorageService, API constants) are separate under `shared/` and `core/`.

The one cross-feature dependency is `AddToCollectionModalComponent`. It lives in `movies/` but dispatches a collections action. I kept it there because it's triggered from the movies page, and the coupling is a single dispatch call, not a structural one.

---

## State vs component state

NgRx holds anything that outlives a single component or needs to be persisted: the movies list, pagination, search query, loading state, and all collection data. Whether a modal is open or which movie was clicked stays in a local signal.

I kept modal state out of NgRx because the action log becomes noise if it records "user opened modal." Signals are also easier to reason about when there are no side effects involved.

---

## Handling persistence

After every mutating collections action (create, delete, add, remove, sort change), a `persistCollections` effect writes to localStorage. On startup, `loadCollectionsFromStorage` reads it back and dispatches one hydration action.

The reducer handles old stored data: any collection missing `movieDetails` gets it defaulted to `[]` on load. Added this after I changed the model mid-development, and it saved me from having to wipe localStorage manually.

---

## Trade-off: snapshot vs live lookup

When a movie is added to a collection, I store a snapshot of its data (title, poster, rating, genres, release date) directly on the collection. The detail page reads from that.

The other option is looking up movies by ID in the movies NgRx slice, but that slice only holds the current page. Navigate away or search, and the data is gone. Caching every fetched movie would work but felt out of scope. The snapshot is stale if TMDB changes its data, which I'm fine accepting here. In a real feature I'd hit a per-movie endpoint from the detail page instead.

---

## Trade-off: API filtering vs client-side filtering

Genre filtering and sort order go through TMDB's `/discover/movie` endpoint. The params are passed as query strings and the API returns an already-filtered page. The alternative was fetching everything and filtering in the reducer or a selector.

I went with the API approach because the movie list is paginated. If you load 20 movies and filter client-side, you're filtering 20 results, not the full catalogue. The API knows about all 500,000 movies; the client doesn't. The cost is an extra network request every time a filter changes, but that's the right trade-off when the dataset doesn't fit in memory. I'd only consider client-side filtering if the full dataset was small enough to fetch once upfront.

