import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    name: 'web',
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./src/test-setup.ts'],
    /* CSS imports are empty under test, except a `?raw` import: index-html.test.ts
     * reads the dark tokens out of styles.css to check the favicon's colours. */
    css: { include: [/\.css\?raw$/] },
  },
});
