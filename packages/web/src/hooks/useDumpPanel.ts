/**
 * The read-only runs: "Start dump" and "Dump all selectors", for one line of
 * cameras. The 4.x/Nano tab is the only user, and it runs under the modern
 * family (`modern-4x`), always.
 *
 * The camera is still asked which family it is (`chooseActingProfile` → core's
 * `identifyCamera`: the version, then — only when that build can be read — one
 * plain arm, one token arm and one read). A camera whose answer is some other
 * family is REFUSED before anything is read, with the reason and the tab that
 * does cover it. There is no way to pick a family by hand: the page's one
 * family is the one it reads, and the version gate still applies on top.
 *
 * A REFUSAL IS SHOWN, NOT JUST LOGGED. "The camera would not say which build it
 * runs" and "this build has no read command" are answers the user has to act
 * on, and they end the run before anything is read, so the panel keeps them in
 * `refusal` for the view to put in front of the user.
 *
 * Cancelling is not a failure. Core stops the selector loop and still returns a
 * complete result — the partial image, a manifest that records which windows
 * ran, and a README — so the archive is built and downloaded either way. That
 * is what the Cancel button has promised since the original page: "will save
 * whatever has been read so far".
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CancelledError,
  SeekDevice,
  SeekError,
  errorMessage,
  isoStamp,
  identityGate,
  readRunningFirmware,
  runDump,
  runSweep,
  type ProfileId,
  type WorkflowContext,
} from '@seek-fw/core';
import { reportInUseElsewhere } from '../lib/camera-lock';
import { downloadArchive, mib } from '../lib/download';
import { logHint } from '../lib/hints';
import { firmwareLineOf } from '../lib/family-line';
import { t, tEnglish } from '@/i18n';
import { ROUTE_LABEL } from '@/lib/routing';
import {
  chooseActingProfile,
  refusalOf,
  withPageMessage,
  type ActingProfile,
  type Refusal,
} from '../lib/identify';
import {
  asOptionsFailure,
  readOptions,
  type OptionsFailure,
  type OptionsForm,
} from '../lib/options';
import { yieldToUi } from '../lib/yield-to-ui';
import { useReporter, type ReporterHandle } from './useReporter';
import type { DeviceHandle } from './useDevice';
import type { Runner } from './useRunner';

export type DumpMode = 'dump' | 'sweep';

export interface DumpPanelParams {
  readonly id: string;
  readonly runner: Runner;
  readonly device: DeviceHandle;
  readonly form: OptionsForm;
  /**
   * The one family this panel reads. A camera the probe places under another
   * family is refused before anything is read.
   */
  readonly profileId: ProfileId;
  /** `seek_flash4m_`, as the original named the archive. */
  readonly dirPrefix: string;
  readonly sweepPrefix: string;
  readonly onOptionsFailure: (failure: OptionsFailure | null) => void;
}

export interface DumpPanelApi {
  readonly reporter: ReporterHandle;
  readonly running: boolean;
  /** What the last run acted under, once that was settled; null before, or after a refusal. */
  readonly acting: ActingProfile | null;
  /** Why the last run was refused before it read anything, or null. */
  readonly refusal: Refusal | null;
  /**
   * True once any panel's session on this camera sent the unlock token (the identify probe's authenticated arm, or
   * a dump's own): the camera then stays unlocked until it is swapped or power-cycled. The flag is the device's,
   * shared by every panel (TESTING.md 42.57, 42.59). The page says so; nothing is gated on it.
   */
  readonly unlockNote: boolean;
  start: (mode: DumpMode) => Promise<void>;
  cancel: () => void;
}

/**
 * The refusal for a camera that the probe places under another family. Nothing
 * has been read at this point, so it is a statement about the camera, and it
 * names the tab that does cover it.
 */
function notThisFamily(id: string, name: string): SeekError {
  const tab = (): string => ROUTE_LABEL.preserve;
  const english =
    id === 'generic'
      ? tEnglish('v4:refusal.generic', { tab: tEnglish('app:tab.preserve') })
      : tEnglish('v4:refusal.otherFamily', { name, id, tab: tEnglish('app:tab.preserve') });
  return withPageMessage(
    new SeekError('family/unsupported', english, { detail: { family: id } }),
    () =>
      id === 'generic'
        ? t('v4:refusal.generic', { tab: tab() })
        : t('v4:refusal.otherFamily', { name, id, tab: tab() }),
  );
}

/**
 * The refusal for a 0.x or 1.x camera on this tab. It is decided on the version
 * alone, before the family questions: those send three BeginFirmwareUpgrade
 * arms and a window read, which a camera of the other line must not see.
 */
function lineRefusal(version: string): SeekError {
  return withPageMessage(
    new SeekError(
      'family/unsupported',
      tEnglish('v4:refusal.legacyLine', { version, tab: tEnglish('app:tab.preserve') }),
      { detail: { version } },
    ),
    () => t('v4:refusal.legacyLine', { version, tab: ROUTE_LABEL.preserve }),
  );
}

export function useDumpPanel(params: DumpPanelParams): DumpPanelApi {
  const { id, runner, device, form, profileId, dirPrefix, sweepPrefix, onOptionsFailure } = params;
  const reporter = useReporter();
  const running = runner.active === id;
  const [acting, setActing] = useState<ActingProfile | null>(null);
  const [refusal, setRefusal] = useState<Refusal | null>(null);
  /* The camera's unlock flag is the device's, shared with every panel (TESTING.md 42.59). */
  const unlockNote = device.unlocked;

  /* What one camera said is not what the next one will: a connect, a
   * disconnect or a swap drops it, as the flash view drops its analysis. */
  useEffect(() => {
    setActing(null);
    setRefusal(null);
  }, [device.generation]);

  const execute = useCallback(
    async (mode: DumpMode, signal: AbortSignal): Promise<void> => {
      const options = readOptions(form);
      const transport = device.makeTransport({
        recipient: options.recipient,
        onWarning: (message) => {
          reporter.reporter.log(message, 'warn');
        },
      });
      const client = new SeekDevice(transport, { reporter: reporter.reporter, signal });
      const dumpOptions = {
        chunk: options.chunk,
        gapFill: options.gapFill,
        retries: options.retries,
        retryDelayMs: options.retryDelayMs,
        decrypt: options.decrypt,
      };
      const dirName = `${mode === 'sweep' ? sweepPrefix : dirPrefix}${isoStamp()}`;

      try {
        await transport.open();
        const running = await readRunningFirmware(client);
        if (
          running.version !== null &&
          firmwareLineOf(running.version) === 'legacy' &&
          identityGate(running).permitsArming
        ) {
          throw lineRefusal(running.version);
        }
        const operation = mode === 'sweep' ? 'dump all selectors' : 'dump';
        const chosen = await chooseActingProfile(client, operation, (text, level) => {
          reporter.reporter.log(text, level);
        });
        setActing(chosen);
        if (chosen.profile.id !== profileId)
          throw notThisFamily(chosen.profile.id, chosen.profile.name);
        const ctx: WorkflowContext = {
          device: client,
          profile: chosen.profile,
          detection: chosen.detection,
          reporter: reporter.reporter,
          signal,
        };
        const result =
          mode === 'sweep' ? await runSweep(ctx, dumpOptions) : await runDump(ctx, dumpOptions);

        reporter.setStatus(t('v4:status.building'));
        await yieldToUi();
        const archive = downloadArchive(dirName, result.artifacts);
        reporter.reporter.log('');
        reporter.reporter.log(
          `downloaded ${archive.fileName} — ${String(archive.fileCount)} files, ` +
            `${mib(archive.bytes)} MiB`,
          'ok',
        );

        /* The original's exact closing line, including the "(cancelled)" the
         * partial archive earns. */
        if ('selectorsArmed' in result) {
          const [first, last] = chosen.profile.sweepRange;
          reporter.reporter.progress(
            1,
            1,
            t(result.cancelled ? 'v4:status.sweepDoneCancelled' : 'v4:status.sweepDone', {
              armed: result.selectorsArmed,
              total: last - first + 1,
              withData: result.selectorsWithData,
            }),
          );
        } else {
          /* A window the build's own table reaches and that did not come
           * back is not a gap, it is a failed read: core logged each one and
           * gap-filled it, and the manifest lists it. The archive is still
           * worth keeping, so this is a warning, not a failure, but "Done"
           * alone would read as a complete copy, which it is not. */
          const missing = result.windowsExpected - result.windowsRead;
          const incomplete = !result.cancelled && missing > 0;
          if (incomplete) {
            reporter.reporter.log(
              `incomplete: ${String(missing)} of the ${String(result.windowsExpected)} windows ` +
                'this build can read did not come back (their lines are above) and are ' +
                'gap-filled in the image — run the dump again for a complete copy',
              'warn',
            );
          }
          reporter.reporter.progress(
            1,
            1,
            t(
              incomplete
                ? 'v4:status.dumpDoneIncomplete'
                : result.cancelled
                  ? 'v4:status.dumpDoneCancelled'
                  : 'v4:status.dumpDone',
              { read: result.windowsRead, expected: result.windowsExpected },
            ),
          );
        }
      } finally {
        /* Read before the close, whatever the run's result: a refused or cancelled
         * run that got as far as the identify probe has still sent the token. */
        if (client.unlockTokenAccepted) device.markUnlocked(client.transport);
        await transport.close();
      }
    },
    [device, dirPrefix, form, profileId, reporter, sweepPrefix],
  );

  const start = useCallback(
    async (mode: DumpMode): Promise<void> => {
      const outcome = await runner.start(id, async (signal) => {
        reporter.reset(t('v4:status.starting'));
        onOptionsFailure(null);
        setActing(null);
        setRefusal(null);
        try {
          await execute(mode, signal);
        } catch (error) {
          const failure = asOptionsFailure(error);
          if (failure !== null) onOptionsFailure(failure);
          /* A dump no longer throws on cancel, but anything deeper still can. */
          if (error instanceof CancelledError) {
            reporter.log('cancelled — nothing was packaged', 'warn');
            reporter.setStatus(t('shared:status.cancelled'));
            return;
          }
          const refused = refusalOf(error);
          if (refused !== null) {
            setActing(null);
            setRefusal(refused);
          }
          reporter.log(`ERROR: ${errorMessage(error)}`, 'error');
          logHint(reporter.log, error);
          reporter.setStatus(
            refused === null ? t('shared:status.failedSeeLog') : t('v4:status.refused'),
          );
        } finally {
          reporter.flush();
        }
      });
      if (outcome === 'in-use-elsewhere') reportInUseElsewhere(reporter);
    },
    [execute, id, onOptionsFailure, reporter, runner],
  );

  const cancel = useCallback((): void => {
    runner.cancel();
    reporter.setStatus(t('v4:status.cancelling'));
    reporter.log('cancel requested', 'warn');
  }, [reporter, runner]);

  return useMemo(
    () => ({ reporter, running, acting, refusal, unlockNote, start, cancel }),
    [reporter, running, acting, refusal, unlockNote, start, cancel],
  );
}
