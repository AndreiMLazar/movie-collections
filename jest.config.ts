import type { Config } from 'jest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createCjsPreset } = require('jest-preset-angular/presets') as typeof import('jest-preset-angular/presets');

const preset = createCjsPreset();

export default {
  displayName: 'movie-collections',
  ...preset,
  globals: {
    TMDB_API_KEY: 'test-api-key',
  },
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@features/(.*)$': '<rootDir>/src/app/features/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@env/(.*)$': '<rootDir>/src/environments/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  transformIgnorePatterns: ['node_modules/(?!@angular|@ngrx)'],
  collectCoverageFrom: [
    'src/app/features/**/state/*.ts',
    'src/app/features/**/services/*.ts',
    'src/app/core/services/*.ts',
    '!src/**/index.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/main.server.ts',
  ],
  coverageThreshold: {
    global: { lines: 60 },
  },
} satisfies Config;
