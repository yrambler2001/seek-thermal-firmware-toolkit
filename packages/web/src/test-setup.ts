/**
 * jsdom already gives us `crypto.subtle`, `URL.createObjectURL` and
 * `Blob.arrayBuffer`, so the only thing missing is React's act() opt-in.
 *
 * Every test starts in English, whatever the machine's locale: the tests
 * assert the English source text. Only main.tsx detects a language, and no
 * test imports it; `resetI18n()` undoes any switch a previous test made. It is
 * imported inside the hook, not at the top: a top-level import would load the
 * language registry before a test file's `vi.mock('./languages')` could
 * replace it (src/i18n/i18n.test.tsx does that).
 */

import { beforeEach } from 'vitest';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

beforeEach(async () => {
  const { resetI18n } = await import('./i18n');
  resetI18n();
});
