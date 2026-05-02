# Movie Collections Manager

A take-home challenge project built with Angular 21, NgRx 21, and a dark cinema-themed UI.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Angular 21 (standalone, signals) |
| State management | NgRx 21 (`createFeature`, functional effects) |
| Styling | Pure SCSS + BEM methodology |
| Testing | Jest + jest-preset-angular |
| HTTP | Angular `HttpClient` with TMDB API |
| Persistence | `localStorage` via `StorageService` |

---

## Getting started

### Prerequisites

- Node.js >= 20
- npm >= 10
- A [TMDB API key](https://developer.themoviedb.org/docs/getting-started)

### 1. Clone and install

```bash
git clone <repo-url>
cd movie-collections-challenge
npm install
```

### 2. Configure the TMDB API key

Create a `.env` file in the project root:

```
TMDB_API_KEY=your_api_key_here
```

The development build reads `process.env['TMDB_API_KEY']` via `environment.development.ts`. Do not commit `.env` — it is already in `.gitignore`.

### 3. Start the development server

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200).

---

## Available scripts

| Script | Description |
|---|---|
| `npm start` | Start dev server (live reload) |
| `npm run build` | Production build |
| `npm test` | Run all Jest tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:watch` | Run tests in watch mode |

---

## Features

### Movies page (`/movies`)
- Browse popular movies from TMDB (paginated, "Load More")
- Filter by genre and sort order
- Real-time search with 350 ms debounce
- Movie detail modal (closes on Escape or backdrop click)
- Add any movie to one or more collections via a modal

### Collections list (`/collections`)
- View all saved collections as cards
- Create a new collection via modal
- Delete a collection with one click

### Collection detail (`/collections/:id`)
- See all movies in the collection with poster, title, year, and rating
- Remove individual movies
- Sort movies by name or date added

---

## Project structure

```
src/
├── app/
│   ├── core/
│   │   ├── constants/      # API URLs, storage keys
│   │   └── services/       # StorageService
│   ├── features/
│   │   ├── movies/
│   │   │   ├── components/ # MovieCard, MovieGrid, MovieSearch, AddToCollectionModal
│   │   │   ├── constants/  # MOVIE_GENRES
│   │   │   ├── services/   # TmdbService
│   │   │   ├── state/      # NgRx actions, reducer, effects
│   │   │   └── types/      # Movie, MoviesState, TmdbMovieDto
│   │   └── collections/
│   │       ├── components/ # CollectionCard, CreateCollectionModal
│   │       ├── state/      # NgRx actions, reducer, effects, constants
│   │       └── types/      # Collection, CollectionMovie, CollectionsState
│   └── shared/
│       ├── components/     # Spinner, ErrorBanner, EmptyState
│       └── types/          # PageResult<T>
└── styles/
    ├── _variables.scss     # Design tokens (SCSS vars + CSS custom properties)
    ├── _mixins.scss        # glass(), respond-to(), hover-lift()
    ├── _reset.scss
    └── _typography.scss
```

---

## Testing

Tests live next to the files they cover. Run all of them with `npm test`.

```
collections.reducer.spec.ts              — 8 reducer tests
collections.selectors.spec.ts           — 4 selector tests
collection-list-page.component.spec.ts  — 4 component tests
tmdb.service.spec.ts                    — 4 service and mapping tests
```
