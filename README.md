# Movie Collections Manager

Browse TMDB's catalogue, curate personal movie collections, and persist everything in `localStorage` — no backend required. Built with Angular 21, NgRx 21, and a dark cinema-themed design system.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 — standalone components, signals, SSR-ready |
| State management | NgRx 21 — `createFeature`, injectable effect classes |
| HTTP | Angular `HttpClient` with `withFetch()`, TMDB REST API |
| Persistence | `localStorage` via `StorageService` (SSR-safe) |
| Styling | Pure SCSS + BEM, custom design token system |
| Testing | Jest 30 + jest-preset-angular, jsdom |
| Linting / formatting | ESLint 10 + angular-eslint + Prettier |
| SSR | `@angular/ssr` + Express 5 |

---

## Getting started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- A free [TMDB API key](https://developer.themoviedb.org/docs/getting-started)

### 1. Clone and install

```bash
git clone https://github.com/AndreiMLazar/movie-collections.git
cd movie-collections
npm install
```

### 2. Configure the TMDB API key

Create a `.env` file in the project root:

```env
TMDB_API_KEY=your_api_key_here
```

`scripts/set-env.js` injects this value as a global constant at build time, replacing the `TMDB_API_KEY` placeholder in `src/environments/environment.ts`. The `.env` file is in `.gitignore` and is never committed.

### 3. Start the development server

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200). The root path redirects to `/movies`.

---

## Available scripts

| Script | Description |
|---|---|
| `npm start` | Dev server with live reload |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run watch` | Incremental dev build in watch mode |
| `npm test` | Run all Jest tests |
| `npm run test:coverage` | Tests with Istanbul coverage report |
| `npm run test:watch` | Tests in interactive watch mode |
| `npm run lint` | ESLint across all TypeScript sources |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run format` | Prettier over TS, HTML, SCSS, and JSON |
| `npm run format:check` | Prettier check (CI-friendly) |
| `npm run serve:ssr:movie-collections` | Serve the SSR build locally |

---

## Features

### `/movies` — Browse

- Paginated grid of popular movies fetched from TMDB's `/discover/movie` endpoint
- **Genre filter** and **sort order** sent as query params to the API — filters the full TMDB catalogue, not just the loaded page
- **Real-time search** (350 ms debounce) against `/search/movie`
- "Load More" appends the next page without resetting the list
- **Movie detail modal** — poster, backdrop, overview, runtime, budget, revenue, cast — opens on card click, closes on Escape or backdrop click
- **Add to Collection** modal — pick one or more existing collections directly from the movie card

### `/collections` — Manage collections

- Grid of all saved collections displayed as cards
- **Create** a new collection via modal (name required)
- **Delete** a collection in one click

### `/collections/:id` — Collection detail

- Full list of movies in the collection with poster, title, release year, and vote average
- **Remove** individual movies
- **Sort** by title (A→Z) or date added (newest first)
- Collection data is a snapshot stored at add-time, so the detail page never requires an extra network request

---

## State management

Each feature owns its NgRx slice via `createFeature`. Application state is split as follows:

```
store
├── movies
│   ├── list           Movie[]
│   ├── page           number
│   ├── totalPages     number
│   ├── searchQuery    string
│   ├── selectedGenreIds  number[]
│   ├── sortBy         string
│   ├── loading        boolean
│   └── error          string | null
└── collections
    ├── collections    Collection[]
    └── selectedId     string | null
```

**Modal open/close state** is kept in local component signals — it would add noise to the action log without providing cross-component value.

**Persistence strategy:** After every mutating `CollectionsActions` dispatch (create, delete, add movie, remove movie, sort change), the `CollectionsEffects.persistCollections$` effect writes the current state to `localStorage`. On startup, `loadCollectionsFromStorage$` hydrates the store in one synchronous dispatch. The reducer guards against stale stored data by defaulting missing fields.

**API filtering vs client-side filtering:** Genre and sort filters hit TMDB's `/discover/movie` with query params rather than filtering in a selector. The movie list is paginated — client-side filtering would only see the current page, not the full catalogue.

---

## Project structure

```
src/
├── app/
│   ├── core/
│   │   ├── constants/          # TMDB_BASE_URL, TMDB_IMAGE_SIZES, STORAGE_KEYS
│   │   └── services/
│   │       └── storage.service.ts   # SSR-safe localStorage wrapper
│   ├── features/
│   │   ├── movies/
│   │   │   ├── components/
│   │   │   │   ├── movie-card/
│   │   │   │   ├── movie-grid/
│   │   │   │   ├── movie-search/
│   │   │   │   ├── movie-filters/
│   │   │   │   ├── movie-detail-modal/
│   │   │   │   └── add-to-collection-modal/
│   │   │   ├── constants/      # MOVIE_GENRES, MOVIE_SORT_OPTIONS
│   │   │   ├── services/
│   │   │   │   └── tmdb.service.ts  # getPopularMovies, searchMovies, discoverMovies, getMovieDetails
│   │   │   ├── state/          # NgRx actions, reducer, effects (+ specs)
│   │   │   └── types/          # Movie, MovieDetails, MoviesState, TmdbMovieDto
│   │   └── collections/
│   │       ├── components/
│   │       │   ├── collection-card/
│   │       │   └── create-collection-modal/
│   │       ├── state/          # NgRx actions, reducer, effects, selectors (+ specs)
│   │       └── types/          # Collection, CollectionMovie, SortOrder, CollectionsState
│   └── shared/
│       ├── components/
│       │   ├── spinner/
│       │   ├── error-banner/
│       │   └── empty-state/
│       └── types/
│           └── pagination.model.ts  # PageResult<T>
└── styles/
    ├── _variables.scss   # Design tokens — palette, spacing scale, radii, typography
    ├── _mixins.scss      # glass(), respond-to(), hover-lift()
    ├── _reset.scss
    └── _typography.scss
```

Path aliases configured in `tsconfig.json` and Jest's `moduleNameMapper`:

| Alias | Resolves to |
|---|---|
| `@core/*` | `src/app/core/*` |
| `@features/*` | `src/app/features/*` |
| `@shared/*` | `src/app/shared/*` |
| `@env/*` | `src/environments/*` |

---

## Design system

The UI uses a dark cinema palette defined entirely in `src/styles/_variables.scss` and exposed as SCSS variables:

| Token | Value | Purpose |
|---|---|---|
| `$color-bg` | `#0d0b14` | Page background |
| `$color-surface` | `#16122a` | Cards and modals |
| `$color-accent` | `#e0195a` | Primary actions |
| `$color-purple` | `#6c3fc5` | Secondary accent, borders |
| `$color-text` | `#f0eaf8` | Body copy |
| `$color-star` | `#f5c518` | Rating stars |
| `$color-success` | `#2dd4a7` | Confirmation states |
| `$color-error` | `#ff4d6d` | Error states |

---

## Testing

Tests live next to the files they cover. Coverage is collected from all state, service, and core service files.

| Spec file | What it covers |
|---|---|
| `collections.reducer.spec.ts` | Reducer purity — create, delete, add/remove movie, sort, hydration |
| `collections.selectors.spec.ts` | Derived selectors — collection lookup, selected collection |
| `collections.effects.spec.ts` | Effect — storage hydration on init, persist on mutation |
| `movies.reducer.spec.ts` | Reducer — load, search, append, filter, error handling |
| `movies.effects.spec.ts` | Effects — TMDB calls, filter/search switchMap cancellation |
| `collection-list-page.component.spec.ts` | Component rendering and store interaction |
| `tmdb.service.spec.ts` | HTTP mapping — DTO → domain model, image URL construction |
| `storage.service.spec.ts` | localStorage read/write, SSR guard, malformed JSON handling |

Run the full suite:

```bash
npm test
```

Run with coverage:

```bash
npm run test:coverage
# Report written to coverage/lcov-report/index.html
```
