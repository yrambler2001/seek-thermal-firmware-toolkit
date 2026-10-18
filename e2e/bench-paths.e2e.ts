/**
 * The bench's path rules (`e2e/lib/power-switch.ts`). Pure: no hardware, no environment.
 *
 *   npx vitest run --config e2e/vitest.config.ts bench-paths.e2e
 *
 * The defect they pin (TESTING.md 42.21): the switch project was found as `REPO_ROOT/../..`,
 * which is the sibling of the main checkout only when the run is in the main checkout. In a
 * worktree (`<checkout>/.claude/worktrees/<name>`) it pointed at `<checkout>/.claude/`, the
 * switch's ENOENT then named node and no path.
 */

import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { mainCheckoutRoot, switchProjectDir } from './lib/power-switch.js';

const CHECKOUT = path.join(
  '/Users',
  'someone',
  'things',
  'a.noindex',
  'seek',
  'seek-thermal-firmware-backup',
);

describe('mainCheckoutRoot', () => {
  it('is the root itself in the main checkout', () => {
    expect(mainCheckoutRoot(CHECKOUT)).toBe(CHECKOUT);
  });

  it('is the checkout above a worktree under .claude/worktrees', () => {
    const worktree = path.join(CHECKOUT, '.claude', 'worktrees', 'agent-aae9e4d31b5487745');
    expect(mainCheckoutRoot(worktree)).toBe(CHECKOUT);
  });

  it('keeps a path whose name only contains the word worktrees', () => {
    const odd = path.join('/Users', 'someone', 'worktrees-notes', 'repo');
    expect(mainCheckoutRoot(odd)).toBe(odd);
  });
});

describe('switchProjectDir', () => {
  const saved = process.env.SEEK_E2E_SWITCH_DIR;

  beforeEach(() => {
    delete process.env.SEEK_E2E_SWITCH_DIR;
  });

  afterEach(() => {
    if (saved === undefined) delete process.env.SEEK_E2E_SWITCH_DIR;
    else process.env.SEEK_E2E_SWITCH_DIR = saved;
  });

  it('is the sibling of the main checkout, the same from a worktree', () => {
    const fromCheckout = switchProjectDir();
    expect(fromCheckout.endsWith(path.join('a.noindex', 'usb-port-switch-rp2040'))).toBe(true);
    expect(fromCheckout).not.toContain(`${path.sep}.claude${path.sep}`);
  });

  it('is SEEK_E2E_SWITCH_DIR when that is set', () => {
    process.env.SEEK_E2E_SWITCH_DIR = '/elsewhere/switch';
    expect(switchProjectDir()).toBe('/elsewhere/switch');
  });
});
