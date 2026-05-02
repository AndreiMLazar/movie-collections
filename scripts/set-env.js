// @ts-check
// Reads .env and launches ng serve with build-time --define flags.
// No secret files are ever written to disk.
// Run via: npm start

const fs    = require('fs');
const path  = require('path');
const { spawn } = require('child_process');

const root    = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env');

/** @type {Record<string, string>} */
const env = {};

if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
}

const tmdbApiKey = env['NG_APP_TMDB_API_KEY'] ?? '';

if (!tmdbApiKey) {
  console.warn('[set-env] WARNING: NG_APP_TMDB_API_KEY is not set in .env');
}

// Pass the key as an esbuild --define flag. The identifier TMDB_API_KEY is
// replaced inline at build time — no intermediate file with secrets is created.
const args = [
  'ng', 'serve',
  '--define', `TMDB_API_KEY='${tmdbApiKey}'`,
];

console.log('[set-env] Launching ng serve with build-time define (no secrets written to disk)');

const proc = spawn('npx', args, {
  stdio: 'inherit',
  shell: true,
  cwd: root,
});

proc.on('error', (err) => {
  console.error('[set-env] Failed to start ng serve:', err);
  process.exit(1);
});

proc.on('close', (code) => process.exit(code ?? 0));
