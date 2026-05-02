// Build-time constants injected via `ng serve/build --define`.
// Values are replaced by esbuild at compile time — they never exist at runtime.
// See: https://angular.dev/tools/cli/build-system-migration#build-time-value-replacement-with-define

/** TMDB API key — injected at build time, never written to a file on disk. */
declare const TMDB_API_KEY: string;
