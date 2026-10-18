// The seek-fps checker's unit tests: the frame decode, the FPS windows, the camera port on a fake camera and
// the command line. Camera-free and emulator-free. Run with
//   npx vitest run --config e2e/lib/bench/seek-fps/vitest.config.mjs
// (the root config only runs packages/*, and the e2e config only *.e2e.ts).
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  /* the root's node_modules, not one inside this folder */
  cacheDir: fileURLToPath(new URL('../../../../node_modules/.vite/seek-fps', import.meta.url)),
  resolve: {
    alias: {
      '@seek-fw/core': fileURLToPath(
        new URL('../../../../packages/core/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    name: 'seek-fps',
    root: new URL('.', import.meta.url).pathname,
    include: ['*.test.ts'],
    environment: 'node',
  },
});
