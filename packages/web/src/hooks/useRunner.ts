/**
 * Mutual exclusion for the long operations, and the one `AbortController` a
 * Cancel button flips.
 *
 * The original had a page-global `running` flag plus a `cancelRequested`
 * boolean that every loop polled. This is the same rule — one operation at a
 * time, across both views — expressed as a signal the workflows already accept.
 *
 * Across TABS the rule is the camera lock (`lib/camera-lock.ts`): a task that
 * talks to the camera runs only while this page holds it, and holds it until
 * the task settles. A tab that cannot have it starts nothing and says so.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { withCameraLock } from '../lib/camera-lock';

/** What `start` did. */
export type StartOutcome =
  /** The task ran. It may still have failed or been cancelled; that is its own to report. */
  | 'ran'
  /** Something else is already running in this page; nothing was started. */
  | 'busy'
  /** Another tab or window holds the camera; nothing was started and nothing was sent. */
  | 'in-use-elsewhere';

export interface StartOptions {
  /**
   * Whether the task talks to the camera. It does unless the caller says
   * otherwise, so a new task is locked by default. Such a task runs only while
   * this page holds the cross-tab camera lock. The tasks that never touch the
   * camera (an offline decrypt, loading a run file, packaging an image) pass
   * false, so they neither wait for another tab nor block one.
   */
  readonly camera?: boolean;
}

export interface Runner {
  /** Id of the panel currently running something, or null. */
  readonly active: string | null;
  readonly busy: boolean;
  /** Cancel has been pressed and the run has not finished unwinding yet. */
  readonly cancelling: boolean;
  /** Runs `task` unless something else is already running, here or (for a camera task) in another tab. */
  start: (
    id: string,
    task: (signal: AbortSignal) => Promise<void>,
    options?: StartOptions,
  ) => Promise<StartOutcome>;
  cancel: () => void;
}

export function useRunner(): Runner {
  const [active, setActive] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const activeRef = useRef<string | null>(null);

  const start = useCallback(
    async (
      id: string,
      task: (signal: AbortSignal) => Promise<void>,
      options: StartOptions = {},
    ): Promise<StartOutcome> => {
      if (activeRef.current !== null) return 'busy';
      activeRef.current = id;
      const ownController = new AbortController();
      controller.current = ownController;
      /* Shown as running only once the lock is held, so a page refused the
       * camera never flickers into "busy". */
      const run = async (): Promise<void> => {
        setActive(id);
        setCancelling(false);
        await task(ownController.signal);
      };
      try {
        if (options.camera === false) {
          await run();
          return 'ran';
        }
        const outcome = await withCameraLock(run);
        return outcome.ran ? 'ran' : 'in-use-elsewhere';
      } finally {
        activeRef.current = null;
        controller.current = null;
        setActive(null);
        setCancelling(false);
      }
    },
    [],
  );

  const cancel = useCallback((): void => {
    if (controller.current === null) return;
    setCancelling(true);
    controller.current.abort();
  }, []);

  /* A run holds the USB interface and may be part-way through a flash write;
   * closing the tab under it is worth a confirmation, as it was originally. */
  useEffect(() => {
    if (active === null) return;
    const onBeforeUnload = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [active]);

  return useMemo(
    () => ({ active, busy: active !== null, cancelling, start, cancel }),
    [active, cancelling, start, cancel],
  );
}
