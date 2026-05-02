# AI notes

Five decisions made during AI-assisted development of this project. The entire codebase was built with GitHub Copilot (Claude Sonnet 4.6) across a few parallel sessions — architecture (with features), UI, testing, bug fixes, and documentation.

Each entry below is: what I prompted, what came back, what I changed, and why.

---

## [Entry 1] Architecture plan

**Prompt:** `/senior-architect` Read `#file:ViaBill` Movie Collections Challenge.md and draft a comprehensive detailed plan. Use context7 to research the tech stack. We would like to use pure SCSS for this coding challenge. Ask questions.

**AI output:** A comprehensive plan with details about the tech stack, folder structure (domain driven), routes, SCSS, documentation and more.

**My changes:** I chose to pursuit BEM naming conventions for `HTML/SCSS` files. I wanted a visual direction of dark purple with red/ping accent UI. I wanted to keep local Angular signals for UI state and `NgRx` for shared / services states. I also wanted barrel files for nicer imports.

**Why:** For me, these decisions (BEM, signals/NgRx, folder structure) represent clean code.

---

## [Entry 2] animate.enter / animate.leave migration

**Prompt:** "Don't use [@modalFade], use the new animate.enter and animate.leave. Remove provideAnimations."

**AI output (first attempt):** Kept `@angular/animations` imports and `provideAnimations()`, just reformatted the trigger definition.

**What I did:** Rejected it. The whole point was to drop the trigger-based API entirely.

**AI output (second attempt):** Removed all `@angular/animations` imports and `provideAnimations()`. Added `animate.enter="modal-enter"` and `animate.leave="modal-leave"` attributes directly on the `.modal-backdrop` element in both modal templates. Added `.modal-enter` and `.modal-leave` CSS classes with matching `@keyframes` in each component's SCSS file.

**My changes:** Verified no animation imports remained anywhere in the codebase.

**Why:** Angular 21 has a compiler-native animation API that reads `animate.enter` / `animate.leave` HTML attributes and applies the named CSS class on mount and unmount. No provider, no `BrowserAnimationsModule`, no trigger syntax. The first AI attempt missed this entirely and tried to preserve the old approach.

---

## [Entry 3] Movie data snapshot in the collection model

**Prompt:** Collection detail page shows "Movie #123" instead of real movie info.

**AI output:** Added a `CollectionMovie` type (`id`, `title`, `posterPath`, `voteAverage`, `genreIds`, `releaseDate`) and a `movieDetails: CollectionMovie[]` field to the `Collection` model. When `addMovieToCollection` is dispatched, the action carries a full `movieData: CollectionMovie` payload. The reducer appends it to `movieDetails`. The collection detail page iterates `movieDetails` directly.

**My changes:** Added a migration in the reducer for collections loaded from localStorage before `movieDetails` existed: `{ ...c, movieDetails: c.movieDetails ?? [] }`.

**Why:** The movies NgRx slice only holds the current page. Once you search or load more, earlier pages are gone from the store. Cross-feature lookup would miss data or require caching every fetched movie. Storing a snapshot at add-time is simpler. The downside is stale data if TMDB updates a movie's metadata, but that is acceptable for this scope.

---

## [Entry 4] Prettier + lint

**Prompt:** Add prettier and linting. Use context7 mcp for documentation

**AI output:** Added `eslint` and `eslint-plugin-priettier` packages and cofigs like `eslint.config.js`, `.prettierrc`, `.prettierignore` and `package.json` scripts.

**My changes:** Used as-is.

**Why:** The codebase was starting to have weird spacing and imports issues.

---

## [Entry 5] Testing suite enhanced

**Prompt:** Create a comprehensive plan to expand and enhance the unit tests and their coverage. Use context7 mcp for documentation and research the codebase deeply. When you finish the plan, start implementing it.

**AI output:** Created a full plan and implemented the spec files.

**My changes:** Told it to cover all the lines and remove barrel files from coverages.

**Why:** Barrel files provide no potential test scenarios.
