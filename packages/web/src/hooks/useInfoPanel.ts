/**
 * "Read the camera" — the Info tab's one read, the same one `seek-fw info` makes (TESTING.md 42.64).
 *
 * The identify probe first (`identifyCamera`: the version, a plain and an authenticated arm of a
 * protected bank, and a read of a bank open on every line), then core's `readDeviceInfo` under the
 * family the probe names, and the re-read under a family whose cipher differs (`profileToRereadUnder`,
 * the rule the slots page and the CLI share). The identity gate decides whether anything is read past
 * the version: a camera it refuses is shown with the reason, and nothing else is sent.
 *
 * The probe's authenticated arm sends the unlock token, so the read unlocks the camera until a power
 * cycle. The device seat records that (TESTING.md 42.59); the page shows the note, with no special case.
 * The read writes nothing.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CancelledError,
  SeekDevice,
  errorMessage,
  identifyCamera,
  profileToRereadUnder,
  readDeviceInfo,
  type DeviceState,
  type IdentityGate,
} from '@seek-fw/core';
import { reportInUseElsewhere } from '../lib/camera-lock';
import { logHint } from '../lib/hints';
import { probeLine } from '../lib/identify';
import { readOptions, type OptionsForm } from '../lib/options';
import { useReporter, type ReporterHandle } from './useReporter';
import type { DeviceHandle } from './useDevice';
import type { Runner } from './useRunner';

export const INFO_READ_PANEL_ID = 'info-read';

export interface InfoPanelParams {
  readonly runner: Runner;
  readonly device: DeviceHandle;
  readonly form: OptionsForm;
}

/** What the read found, and what that allows. */
export interface InfoReading {
  /** `major.minor.patch.build` as the camera reported it, or null. */
  readonly version: string | null;
  /** The build date string that came with it, or null. */
  readonly buildString: string | null;
  /** The gate's verdict: `permitsArming` says whether the dump and slots tabs can read this build. */
  readonly gate: IdentityGate;
  /**
   * The camera's analysis, as `seek-fw info` builds it. Null when the gate refused the build, so that
   * nothing was read past the version.
   */
  readonly state: DeviceState | null;
}

export interface InfoPanelApi {
  readonly reporter: ReporterHandle;
  readonly reading: boolean;
  /** The last read for this camera, or null. Dropped when the camera changes. */
  readonly result: InfoReading | null;
  /**
   * True when a panel's session on this camera has sent the unlock token. This read sends it too (the
   * identify probe), so after a read the note shows here as well (TESTING.md 42.59).
   */
  readonly unlockNote: boolean;
  read: () => Promise<void>;
  cancel: () => void;
}

export function useInfoPanel(params: InfoPanelParams): InfoPanelApi {
  const { runner, device, form } = params;
  const reporter = useReporter('Not read yet.');
  const [result, setResult] = useState<InfoReading | null>(null);
  const reading = runner.active === INFO_READ_PANEL_ID;

  /* One camera's answer is not the next camera's: a connect, a disconnect or a
   * swap drops it. */
  useEffect(() => {
    setResult(null);
  }, [device.generation]);

  const read = useCallback(async (): Promise<void> => {
    const outcome = await runner.start(INFO_READ_PANEL_ID, async (signal) => {
      reporter.reset('Reading ...');
      setResult(null);
      let transport: ReturnType<DeviceHandle['makeTransport']> | null = null;
      let client: SeekDevice | null = null;
      try {
        const options = readOptions(form);
        transport = device.makeTransport({
          recipient: options.recipient,
          onWarning: (message) => {
            reporter.reporter.log(message, 'warn');
          },
        });
        client = new SeekDevice(transport, { reporter: reporter.reporter, signal });
        await transport.open();

        const identification = await identifyCamera(client);
        for (const note of identification.probe.notes) reporter.reporter.log(`  ${note}`, 'detail');
        const { probe, detection, gate } = identification;
        const version = probe.firmwareVersion;
        const buildString = probe.buildString;

        if (version === null) {
          reporter.log(probe.notes[0] ?? 'the camera did not report its firmware version', 'warn');
          reporter.setStatus('No version reported.');
          setResult({ version, buildString, gate, state: null });
          return;
        }
        reporter.log(`firmware ${version}${buildString ? `  ${buildString}` : ''}`, 'ok');
        if (!gate.permitsArming) {
          reporter.setStatus(
            `Read. Firmware ${version} is older than 0.8.0.0 — nothing else was read.`,
          );
          setResult({ version, buildString, gate, state: null });
          return;
        }

        const best = detection.best.profile;
        reporter.log(probeLine(detection), detection.ambiguous ? 'warn' : 'detail');
        let state = await readDeviceInfo(
          { device: client, profile: best, detection, reporter: reporter.reporter, signal },
          {},
        );
        const better = profileToRereadUnder(state, false);
        if (better !== null) {
          reporter.log(
            `the evidence identifies this camera as ${better.name} (${better.id}), whose cipher ` +
              'differs from the one this read used — reading again under it',
            'warn',
          );
          state = await readDeviceInfo(
            {
              device: client,
              profile: better,
              detection: state.detection,
              reporter: reporter.reporter,
              signal,
            },
            {},
          );
        }
        setResult({ version, buildString, gate, state });
        reporter.setStatus(`Read. Firmware ${version}.`);
      } catch (error) {
        if (error instanceof CancelledError) {
          reporter.log('cancelled', 'warn');
          reporter.setStatus('Cancelled.');
        } else {
          reporter.log(`ERROR: ${errorMessage(error)}`, 'error');
          logHint(reporter.log, error);
          reporter.setStatus('Failed — see the log above.');
        }
      } finally {
        if (transport !== null) await transport.close();
        /* This read's own session sent the token (TESTING.md 42.59), so the camera is unlocked for the page. */
        if (client?.unlockTokenAccepted === true && transport !== null) {
          device.markUnlocked(transport);
        }
        reporter.flush();
      }
    });
    if (outcome === 'in-use-elsewhere') reportInUseElsewhere(reporter);
  }, [device, form, reporter, runner]);

  const cancel = useCallback((): void => {
    runner.cancel();
    reporter.setStatus('Cancelling ...');
    reporter.log('cancel requested', 'warn');
  }, [reporter, runner]);

  const unlockNote = device.unlocked;

  return useMemo(
    () => ({ reporter, reading, result, read, cancel, unlockNote }),
    [reporter, reading, result, read, cancel, unlockNote],
  );
}
