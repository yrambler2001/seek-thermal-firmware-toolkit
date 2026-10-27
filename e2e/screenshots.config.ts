import { defineConfig } from 'vitest/config';

import e2e from './vitest.config.js';

/**
 * The README's screenshots — `npm run screenshots`. OPT-IN ONLY: the file it
 * runs, `readme-screenshots.ts`, is not a `*.e2e.ts`, so no `npm run e2e*`
 * script (nor `npm test`) loads it, and nothing but this config rewrites the
 * images in `.github/readme/`.
 *
 * The e2e config otherwise as it is: the same alias, the camera lock's
 * global setup, one file and one test at a time.
 */
export default defineConfig({
  ...e2e,
  test: {
    ...e2e.test,
    name: 'readme-screenshots',
    include: ['readme-screenshots.ts'],
  },
});
