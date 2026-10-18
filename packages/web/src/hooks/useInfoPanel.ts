/**
 * "Read firmware version" — the Info tab's one read, and the only thing it does
 * to the camera.
 *
 * It is the identity read every other tab starts with and nothing more: the
 * version the camera reports (`readRunningFirmware`, read-only), judged by the
 * same gate that decides whether any tab may arm a window (`identityGate`).
 * No selector is armed, no slot is read and nothing is written.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CancelledError,
  SeekDevice,
  errorMessage,
  identityGate,
  readRunningFirmware,
  type IdentityGate,
} from '@seek-fw/core';
import { reportInUseElsewhere } from '../lib/camera-lock';
import { logHint } from '../lib/hints';
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

/** What the version read found, and what that allows. */
export interface InfoReading {
  /** `major.minor.patch.build` as the camera reported it, or null. */
  readonly version: string | null;
  /** The build date string that came with it, or null. */
  readonly buildString: string | null;
  /** The gate's verdict: `permitsArming` says whether the dump and slots tabs can read this build. */
  readonly gate: IdentityGate;
}

export interface InfoPanelApi {
  readonly reporter: ReporterHandle;
  readonly reading: boolean;
  /** The last read for this camera, or null. Dropped when the camera changes. */
  readonly result: InfoReading | null;
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
      try {
        const options = readOptions(form);
        transport = device.makeTransport({
          recipient: options.recipient,
          onWarning: (message) => {
            reporter.reporter.log(message, 'warn');
          },
        });
        const client = new SeekDevice(transport, { reporter: reporter.reporter, signal });
        await transport.open();
        const running = await readRunningFirmware(client);
        const gate = identityGate(running);
        setResult({ version: running.version, buildString: running.buildString, gate });
        if (running.version === null) {
          reporter.log(running.note, 'warn');
          reporter.setStatus('No version reported.');
        } else {
          reporter.log(
            `firmware ${running.version}${running.buildString ? `  ${running.buildString}` : ''}`,
            'ok',
          );
          reporter.setStatus(
            gate.permitsArming
              ? `Read. Firmware ${running.version}.`
              : `Read. Firmware ${running.version} is older than 0.8.0.0 — no tab reads it.`,
          );
        }
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

  return useMemo(
    () => ({ reporter, reading, result, read, cancel }),
    [reporter, reading, result, read, cancel],
  );
}
