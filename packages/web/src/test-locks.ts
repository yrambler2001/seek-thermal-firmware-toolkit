/**
 * A Web Locks manager for the tests, installed as `navigator.locks`.
 *
 * jsdom has no `navigator.locks`. Two hooks rendered in one jsdom stand for
 * two tabs of one browser: they share the one navigator, as two tabs of one
 * origin share the browser's lock manager. This fake grants exclusive locks
 * with `ifAvailable` (the only kind the app asks for), hands `null` to a
 * request that cannot have the lock at once, and releases a lock when its
 * callback's promise settles — the three things the camera lock relies on.
 */

import { CAMERA_LOCK } from './lib/camera-lock';

export class FakeLocks {
  private readonly held = new Set<string>();
  /** Every request, in order: its name, and whether it was granted. */
  readonly requests: { readonly name: string; readonly granted: boolean }[] = [];

  isHeld(name: string = CAMERA_LOCK): boolean {
    return this.held.has(name);
  }

  async request<T>(
    name: string,
    options: LockOptions,
    callback: (lock: Lock | null) => T | PromiseLike<T>,
  ): Promise<T> {
    /* A browser answers a request in a later task, never synchronously. */
    await Promise.resolve();
    if (options.ifAvailable !== true) throw new Error('the fake grants only ifAvailable requests');
    if (this.held.has(name)) {
      this.requests.push({ name, granted: false });
      return callback(null);
    }
    this.held.add(name);
    this.requests.push({ name, granted: true });
    try {
      return await callback({ name, mode: options.mode ?? 'exclusive' });
    } finally {
      this.held.delete(name);
    }
  }

  query(): Promise<LockManagerSnapshot> {
    return Promise.resolve({
      held: [...this.held].map((name) => ({ name, mode: 'exclusive' as const })),
      pending: [],
    });
  }

  /** This fake, as the DOM type the app reads `navigator.locks` as. */
  asLockManager(): LockManager {
    return this as unknown as LockManager;
  }
}

/** Puts a fresh `FakeLocks` on `navigator.locks` and returns it. */
export function installLocks(): FakeLocks {
  const locks = new FakeLocks();
  Object.defineProperty(navigator, 'locks', { value: locks, configurable: true });
  return locks;
}

/** Takes `navigator.locks` away again: jsdom's own state, no lock manager. */
export function removeLocks(): void {
  Object.defineProperty(navigator, 'locks', { value: undefined, configurable: true });
}

/** A promise and the function that settles it. */
export function deferred<T = void>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}
