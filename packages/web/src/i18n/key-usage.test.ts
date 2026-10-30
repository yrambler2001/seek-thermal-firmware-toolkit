/**
 * Every English key is used, and every key the code names exists.
 *
 * The types already refuse `t('ns:missing')` for a literal key. This catches
 * what they cannot see: a key no source file names any more (a dead key a
 * translator would translate for nothing), a key named in a string the types
 * do not check, and the keys the code builds from a template string, which are
 * listed in DYNAMIC with what fills them. The `core` namespace is keyed by
 * core's message codes and core-messages.test.ts checks it both ways.
 */

import { describe, expect, it } from 'vitest';
import { ROUTES } from '@/lib/routing';
import { en } from './locales/en';

/** The page's source, test files and the dictionaries themselves left out. */
const SOURCES: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>('../**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }),
  ).filter(([path]) => !/\.test\.tsx?$|\/test-[\w-]+\.tsx?$|\/i18n\/locales\//.test(path)),
);
const SOURCE = Object.values(SOURCES).join('\n');

/** Keys the code builds from a template string, with every value the template is filled with. */
const DYNAMIC: readonly { readonly template: string; readonly keys: readonly string[] }[] = [
  /* App.tsx: rich(`app:intro.${route}`) */
  { template: 'app:intro.${route}', keys: ROUTES.map((route) => `app:intro.${route}`) },
  /* lib/routing.ts: t(`app:tab.${route}`) */
  { template: 'app:tab.${route}', keys: ROUTES.map((route) => `app:tab.${route}`) },
];

const PAGE_NAMESPACES = Object.keys(en).filter((namespace) => namespace !== 'core');

function pageKeys(): string[] {
  return PAGE_NAMESPACES.flatMap((namespace) =>
    Object.keys(en[namespace as keyof typeof en]).map((key) => `${namespace}:${key}`),
  );
}

describe('the English keys', () => {
  it('found the source files', () => {
    expect(Object.keys(SOURCES).length).toBeGreaterThan(50);
    expect(SOURCE).toContain("t('app:connect.test')");
  });

  it('are each named somewhere in the page’s source (no dead key)', () => {
    const dynamic = new Set(DYNAMIC.flatMap((entry) => entry.keys));
    const dead = pageKeys().filter(
      (key) =>
        !dynamic.has(key) && !new RegExp(`['"\`]${key.replace(/\./g, '\\.')}['"\`]`).test(SOURCE),
    );
    expect(dead).toEqual([]);
  });

  it('cover every key a template string builds, and every template is still in the source', () => {
    const all = new Set(pageKeys());
    for (const { template, keys } of DYNAMIC) {
      expect(SOURCE, template).toContain(`\`${template}\``);
      expect(keys.filter((key) => !all.has(key))).toEqual([]);
    }
  });

  it('cover every `namespace:key` string the source names', () => {
    const all = new Set([
      ...pageKeys(),
      ...Object.keys(en.core).map((code) => `core:${code}`),
      /* Not keys: usePreservePanel's LOAD_PANEL_ID, the run panel id of the run-file load. */
      'preserve:load',
    ]);
    const pattern = new RegExp(
      `['"\`]((?:${PAGE_NAMESPACES.join('|')}):[A-Za-z][\\w.]*)['"\`]`,
      'g',
    );
    const named = [...SOURCE.matchAll(pattern)].map((match) => match[1] ?? '');
    expect([...new Set(named.filter((key) => !all.has(key)))]).toEqual([]);
  });
});
