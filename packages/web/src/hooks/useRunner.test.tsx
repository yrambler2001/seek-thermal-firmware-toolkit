/**
 * The runner across tabs. Two runners rendered in one jsdom are two tabs of
 * one browser: they share `navigator.locks`, as two tabs of one origin share
 * the browser's lock manager. A camera task in one refuses the other's, which
 * then runs nothing and is not shown as running; the lock is let go however
 * the task ends; and the tasks that never touch the camera are not locked.
 */

import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, type HookHandle } from '../test-helpers';
import { deferred, installLocks, removeLocks, type FakeLocks } from '../test-locks';
import { useRunner, type Runner, type StartOutcome } from './useRunner';

let locks: FakeLocks;
const mounted: HookHandle<Runner>[] = [];

function tab(): HookHandle<Runner> {
  const handle = renderHook(() => useRunner());
  mounted.push(handle);
  return handle;
}

/** Starts a camera task in `runner` that runs until the returned `finish` is called. */
async function holdCamera(runner: HookHandle<Runner>): Promise<{
  finish: () => void;
  done: Promise<StartOutcome>;
}> {
  const gate = deferred();
  let done: Promise<StartOutcome> = Promise.resolve('busy');
  act(() => {
    done = runner.result.current.start('dump', () => gate.promise);
  });
  await vi.waitFor(() => {
    expect(locks.isHeld()).toBe(true);
  });
  return { finish: gate.resolve, done };
}

beforeEach(() => {
  locks = installLocks();
});

afterEach(() => {
  for (const handle of mounted.splice(0)) handle.unmount();
  removeLocks();
});

describe('useRunner across tabs', () => {
  it('refuses a camera task while another tab runs one: nothing runs, nothing shows busy', async () => {
    const tab1 = tab();
    const tab2 = tab();
    const held = await holdCamera(tab1);
    expect(tab1.result.current.active).toBe('dump');

    const task = vi.fn(() => Promise.resolve());
    let outcome: StartOutcome | null = null;
    await act(async () => {
      outcome = await tab2.result.current.start('dump', task);
    });
    expect(outcome).toBe('in-use-elsewhere');
    expect(task).not.toHaveBeenCalled();
    expect(tab2.result.current.busy).toBe(false);
    expect(tab2.result.current.active).toBeNull();

    await act(async () => {
      held.finish();
      expect(await held.done).toBe('ran');
    });
    expect(locks.isHeld()).toBe(false);
    await act(async () => {
      outcome = await tab2.result.current.start('dump', task);
    });
    expect(outcome).toBe('ran');
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('lets go of the camera when the task is cancelled', async () => {
    const tab1 = tab();
    const tab2 = tab();
    let done: Promise<StartOutcome> = Promise.resolve('busy');
    act(() => {
      done = tab1.result.current.start(
        'preserve:phase:read-build',
        (signal) =>
          new Promise<void>((resolve) => {
            signal.addEventListener('abort', () => {
              resolve();
            });
          }),
      );
    });
    await vi.waitFor(() => {
      expect(locks.isHeld()).toBe(true);
    });

    act(() => {
      tab1.result.current.cancel();
    });
    await act(async () => {
      expect(await done).toBe('ran');
    });
    expect(locks.isHeld()).toBe(false);
    await act(async () => {
      expect(await tab2.result.current.start('test', () => Promise.resolve())).toBe('ran');
    });
  });

  it('lets go of the camera when the task fails, and the failure still reaches the caller', async () => {
    const tab1 = tab();
    const tab2 = tab();
    await act(async () => {
      await expect(
        tab1.result.current.start('fwinfo', () => Promise.reject(new Error('stalled'))),
      ).rejects.toThrow('stalled');
    });
    expect(locks.isHeld()).toBe(false);
    expect(tab1.result.current.busy).toBe(false);
    await act(async () => {
      expect(await tab2.result.current.start('fwinfo', () => Promise.resolve())).toBe('ran');
    });
  });

  it('does not lock the tasks that never touch the camera', async () => {
    const tab1 = tab();
    const tab2 = tab();
    const held = await holdCamera(tab1);

    const offline = vi.fn(() => Promise.resolve());
    await act(async () => {
      expect(await tab2.result.current.start('offline', offline, { camera: false })).toBe('ran');
    });
    expect(offline).toHaveBeenCalledTimes(1);
    /* ... and holding nothing, it never kept the camera from anyone. */
    expect(locks.requests.filter((request) => request.granted)).toHaveLength(1);

    await act(async () => {
      held.finish();
      await held.done;
    });
  });

  it('still answers busy inside one tab, before asking for the lock', async () => {
    const tab1 = tab();
    const held = await holdCamera(tab1);
    const requests = locks.requests.length;
    await act(async () => {
      expect(await tab1.result.current.start('manual', () => Promise.resolve())).toBe('busy');
    });
    expect(locks.requests).toHaveLength(requests);
    await act(async () => {
      held.finish();
      await held.done;
    });
  });

  it('runs camera tasks unlocked where the browser has no navigator.locks', async () => {
    removeLocks();
    const tab1 = tab();
    const task = vi.fn(() => Promise.resolve());
    await act(async () => {
      expect(await tab1.result.current.start('dump', task)).toBe('ran');
    });
    expect(task).toHaveBeenCalledTimes(1);
  });
});
