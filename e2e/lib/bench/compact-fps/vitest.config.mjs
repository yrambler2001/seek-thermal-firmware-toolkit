// The Compact frame measurer's unit tests. Opt-in and camera-free: run with
//   npx vitest run --config e2e/lib/bench/compact-fps/vitest.config.mjs
// (the root config only runs packages/*, and the e2e config only *.e2e.ts).
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'compact-fps',
    root: new URL('.', import.meta.url).pathname,
    include: ['*.test.mjs'],
    environment: 'node',
  },
});
