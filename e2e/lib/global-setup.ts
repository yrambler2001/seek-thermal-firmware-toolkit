/**
 * Runs once in the vitest main process, around the whole e2e run.
 *
 * It names this process as the run that holds the camera lock
 * (`preflight.ts`), in an environment variable every worker inherits, and
 * removes the lock when the run ends. The workers cannot do that themselves:
 * vitest ends them without running their `exit` hooks.
 */

import { releaseCameraLock } from './preflight.js';

export default function setup(): () => void {
  const run = process.pid;
  process.env.SEEK_E2E_RUN_PID = String(run);
  /* A run interrupted before its teardown still lets go as the process exits. */
  const release = (): void => {
    releaseCameraLock(run);
  };
  process.once('exit', release);
  return release;
}
