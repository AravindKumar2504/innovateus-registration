import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.mts'],
    // netlify dev writes bundled copies of the functions (tests included)
    // under .netlify/ — never collect those.
    exclude: ['**/node_modules/**', '**/.netlify/**', '**/dist/**'],
  },
});
