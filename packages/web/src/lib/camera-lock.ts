/**
 * One camera operation at a time across every tab and window of the browser.
 *
 * WHY. Inside one page the runner already allows one operation at a time. A
 * second tab or window is a second page with a runner of its own, and nothing
 * on the USB side stops it. Chrome lets every page of the origin open the
 * device. The second page's `claimInterface` is refused with the same
 * NetworkError a system driver causes, and core's transport then talks to the
 * device anyway, on the device recipient (`isPlatformClaimRefusal`,
 * packages/core/src/protocol/webusb.ts). That fallback is right for the case
 * it was built for, a kernel driver or another program holding the interface,
 * and it stays. But a second tab is not that case. Two tabs dumping at once
 * each ended "Done" with a wrong, short image and no warning, and a second tab
 * could read in the middle of a Preserve write.
 *
 * THE LOCK. Every runner task that talks to the camera runs inside one
 * exclusive Web Lock, `CAMERA_LOCK`, requested with `ifAvailable`. A page that
 * cannot have it at once neither waits nor queues: it runs nothing, sends
 * nothing (no open, no claim, no transfer), and says the camera is in use
 * elsewhere. Web Locks are shared by every page of one origin in one browser
 * profile, which is the set of pages that share the USB grants. The browser
 * releases a page's locks when the page goes away (closed, reloaded, navigated
 * away, crashed), so a tab that is gone can never leave the camera locked.
 *
 * PER OPERATION, NOT PER CONNECTION. The lock is held for exactly as long as
 * one runner task: a connection test, a dump or sweep, a device-info read, a
 * flash write, or a Preserve phase. A phase holds it through its resets and
 * re-enumerations too, because those happen inside the one task (the opener
 * ladder rides through them). A tab that only has the camera selected holds
 * nothing, so an idle tab left open never locks the camera away from the tab
 * the user is working in. Between two Preserve phases nothing is held. That
 * matches what one tab already allows: the run file is the run's memory, and
 * each phase re-checks the camera's version and bank when it opens.
 *
 * It is one lock for the whole browser, not one per camera. This camera has no
 * USB serial number and two units share a vid/pid, so there is no identity to
 * key a per-camera lock on.
 *
 * WHAT IT DOES NOT COVER. Another origin (the hosted page and a local dev
 * server), another browser profile, another browser and the CLI each have
 * their own locks or none. Against those, the platform's own claim is the only
 * guard there is, as before.
 *
 * WITHOUT THE API. Where `navigator.locks` is missing (jsdom; a Chromium older
 * than 69, while WebUSB arrived in 61) or refuses the request (a page with an
 * opaque origin), the task runs unlocked. That is how the page behaved before
 * the lock existed. One tab is still safe, through its own runner; two tabs
 * are back to the old risk.
 */

/** The lock's name. Locks are per origin, so this needs no origin of its own. */
export const CAMERA_LOCK = 'seek-fw:camera';

/** What a refused page's panel shows: its status line, then its log line. */
export const IN_USE_ELSEWHERE_STATUS =
  'The camera is in use in another tab or window — finish or close it there first.';
export const IN_USE_ELSEWHERE_LOG =
  'the camera is in use in another tab or window of this browser — finish the run there, or ' +
  'close that tab, then try again here; nothing was sent to the camera from this tab';

interface MaybeLocksNavigator {
  readonly locks?: LockManager;
}

/** `navigator.locks`, or null where this browser (or jsdom) has none. */
export function getLockManager(): LockManager | null {
  if (typeof navigator === 'undefined') return null;
  return (navigator as unknown as MaybeLocksNavigator).locks ?? null;
}

export type CameraLockOutcome<T> =
  | { readonly ran: true; readonly value: T }
  /** Another page holds the camera; `task` was never called. */
  | { readonly ran: false };

/**
 * Runs `task` holding the camera lock, or does not run it at all when another
 * page holds the lock. The lock is released when `task` settles, however it
 * settles: finished, cancelled (an aborted task unwinds and returns or throws)
 * or failed (its rejection is passed on unchanged, after the release).
 */
export async function withCameraLock<T>(
  task: () => Promise<T>,
  locks: LockManager | null = getLockManager(),
): Promise<CameraLockOutcome<T>> {
  if (locks === null) return { ran: true, value: await task() };
  /* An object, so the flow analysis sees the callback set it. */
  const request = { entered: false };
  try {
    return await locks.request(
      CAMERA_LOCK,
      { mode: 'exclusive', ifAvailable: true },
      async (lock): Promise<CameraLockOutcome<T>> => {
        request.entered = true;
        if (lock === null) return { ran: false };
        return { ran: true, value: await task() };
      },
    );
  } catch (error) {
    /* A failure from inside the task is the task's own. A request the lock
     * manager refused before granting or denying anything (a SecurityError on
     * an opaque origin) is the same as having no lock manager. */
    if (request.entered) throw error;
    return { ran: true, value: await task() };
  }
}

/** Tells the user, in the panel they pressed, why nothing happened. */
export function reportInUseElsewhere(rep: {
  log: (text: string, level?: 'info') => void;
  setStatus: (text: string) => void;
}): void {
  rep.log(IN_USE_ELSEWHERE_LOG, 'info');
  rep.setStatus(IN_USE_ELSEWHERE_STATUS);
}
