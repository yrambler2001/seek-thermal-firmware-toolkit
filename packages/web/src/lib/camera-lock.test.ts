/**
 * The camera lock on its own: one page at a time holds it, a page that cannot
 * have it runs nothing, it is let go however the task ends, and a browser
 * without Web Locks still runs the task.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { deferred, installLocks, removeLocks } from '../test-locks';
import { CAMERA_LOCK, getLockManager, withCameraLock } from './camera-lock';

afterEach(() => {
  removeLocks();
});

describe('withCameraLock', () => {
  it('runs the task holding the lock, and lets go when it finishes', async () => {
    const locks = installLocks();
    let heldInside = false;
    const outcome = await withCameraLock(() => {
      heldInside = locks.isHeld(CAMERA_LOCK);
      return Promise.resolve(42);
    });
    expect(outcome).toEqual({ ran: true, value: 42 });
    expect(heldInside).toBe(true);
    expect(locks.isHeld()).toBe(false);
  });

  it('refuses a second page while the first holds it, without calling its task', async () => {
    const locks = installLocks();
    const first = deferred();
    const tab1 = withCameraLock(() => first.promise);
    await vi.waitFor(() => {
      expect(locks.isHeld()).toBe(true);
    });

    const task2 = vi.fn(() => Promise.resolve('read'));
    expect(await withCameraLock(task2)).toEqual({ ran: false });
    expect(task2).not.toHaveBeenCalled();

    first.resolve();
    expect(await tab1).toEqual({ ran: true, value: undefined });
    expect(locks.isHeld()).toBe(false);
    /* Once the first page lets go, the second gets the camera. */
    expect(await withCameraLock(task2)).toEqual({ ran: true, value: 'read' });
    expect(locks.requests.map((request) => request.granted)).toEqual([true, false, true]);
  });

  it('lets go when the task fails, and passes the failure on', async () => {
    const locks = installLocks();
    await expect(withCameraLock(() => Promise.reject(new Error('camera gone')))).rejects.toThrow(
      'camera gone',
    );
    expect(locks.isHeld()).toBe(false);
    expect((await withCameraLock(() => Promise.resolve('next'))).ran).toBe(true);
  });

  it('does not run a failed task a second time', async () => {
    installLocks();
    const task = vi.fn(() => Promise.reject(new Error('stalled')));
    await expect(withCameraLock(task)).rejects.toThrow('stalled');
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('runs the task unlocked where navigator.locks is missing (jsdom, older browsers)', async () => {
    removeLocks();
    expect(getLockManager()).toBeNull();
    expect(await withCameraLock(() => Promise.resolve('unlocked'))).toEqual({
      ran: true,
      value: 'unlocked',
    });
  });

  it('treats a lock manager that refuses the request outright as no lock manager', async () => {
    const refusing = {
      request: () => Promise.reject(new DOMException('opaque origin', 'SecurityError')),
    } as unknown as LockManager;
    const task = vi.fn(() => Promise.resolve('ran'));
    expect(await withCameraLock(task, refusing)).toEqual({ ran: true, value: 'ran' });
    expect(task).toHaveBeenCalledTimes(1);
  });
});
