# AI notes

Five decisions made during AI-assisted development of this project. The entire codebase was built with GitHub Copilot (Claude Sonnet 4.6) across two sessions — one for architecture and scaffolding, one for features, bug fixes, and documentation.

Each entry below is: what I prompted, what came back, what I changed, and why.

---

## [Entry 1] Action event name constants

**Prompt:** "The action events like 'Create Collection' from collections.actions.ts should also be constants and reused."

**AI output:** Seven `COLLECTIONS_EVENT_*` string constants added to `collections.constants.ts`, each typed `as const`. The `collections.actions.ts` file was updated to import them and use computed property keys like `[COLLECTIONS_EVENT_CREATE_COLLECTION]` inside the `createActionGroup` call.

**My changes:** None. Used as-is.

**Why:** The action event strings were hardcoded directly in `createActionGroup`. If you ever need to compare against an action type at runtime or reference an event name outside the reducer, you're copying a string literal from memory. Constants make them searchable and refactorable from one place.

---

## [Entry 2] animate.enter / animate.leave migration

**Prompt:** "Don't use [@modalFade], use the new animate.enter and animate.leave. Remove provideAnimations."

**AI output (first attempt):** Kept `@angular/animations` imports and `provideAnimations()`, just reformatted the trigger definition.

**What I did:** Rejected it. The whole point was to drop the trigger-based API entirely.

**AI output (second attempt):** Removed all `@angular/animations` imports and `provideAnimations()`. Added `animate.enter="modal-enter"` and `animate.leave="modal-leave"` attributes directly on the `.modal-backdrop` element in both modal templates. Added `.modal-enter` and `.modal-leave` CSS classes with matching `@keyframes` in each component's SCSS file.

**My changes:** Verified no animation imports remained anywhere in the codebase.

**Why:** Angular 21 has a compiler-native animation API that reads `animate.enter` / `animate.leave` HTML attributes and applies the named CSS class on mount and unmount. No provider, no `BrowserAnimationsModule`, no trigger syntax. The first AI attempt missed this entirely and tried to preserve the old approach.

---

## [Entry 3] @defer vs @if for the modal null crash

**Prompt:** Fix `TypeError: Cannot read properties of null (reading 'title')` that crashes when closing the add-to-collection modal.

**AI output (first attempt):** Wrapped the modal in `@defer (when selectedMovie() !== null)`.

**What I did:** Pushed back. `@defer` defers initial render, but it does not destroy the view when the condition returns to `false`. So when `selectedMovie` is set to `null` after closing, the component stays mounted and tries to read `movie().title` on a null value.

**AI output (second attempt):** Switched to `@if (selectedMovie())`. This unmounts the component when `selectedMovie` is null, so there is no mounted component left to crash.

**My changes:** Used as-is.

**Why:** `@defer` is for deferring load, not conditional presence. This is exactly what `@if` is for. The first suggestion was technically valid syntax but wrong for the problem.

---

## [Entry 4] Movie data snapshot in the collection model

**Prompt:** Collection detail page shows "Movie #123" instead of real movie info.

**AI output:** Added a `CollectionMovie` type (`id`, `title`, `posterPath`, `voteAverage`, `genreIds`, `releaseDate`) and a `movieDetails: CollectionMovie[]` field to the `Collection` model. When `addMovieToCollection` is dispatched, the action carries a full `movieData: CollectionMovie` payload. The reducer appends it to `movieDetails`. The collection detail page iterates `movieDetails` directly.

**My changes:** Added a migration in the reducer for collections loaded from localStorage before `movieDetails` existed: `{ ...c, movieDetails: c.movieDetails ?? [] }`. This prevents older stored data from breaking.

**Why:** The movies NgRx slice only holds the current page. Once you search or load more, earlier pages are gone from the store. Cross-feature lookup would miss data or require caching every fetched movie. Storing a snapshot at add-time is simpler. The downside is stale data if TMDB updates a movie's metadata, but that is acceptable for this scope.

---

## [Entry 5] Output rename: close → closed

**Prompt:** ESLint error — `@angular-eslint/no-output-native`: "Output 'close' is not allowed because it can conflict with standard DOM events."

**AI output:** Renamed `close = output<void>()` to `closed = output<void>()` in three components (`AddToCollectionModalComponent`, `CreateCollectionModalComponent`, `MovieDetailModalComponent`). Updated all template bindings from `(close)="..."` to `(closed)="..."` in the parent templates.

**My changes:** Used as-is.

**Why:** `close` is a native DOM event. The linting rule exists to prevent the output from shadowing the native event, which can cause subtle bugs when events bubble. `closed` is unambiguous and matches common Angular modal conventions.
