/**
 * "Test connection" — the original's cheapest possible proof that the browser
 * can actually talk to the camera: open, ask for the operation mode and the
 * error code, close. Two read opcodes, nothing written.
 */

import { useCallback, useMemo } from 'react';
import { SeekDevice, errorMessage, hex } from '@seek-fw/core';
import { reportInUseElsewhere } from '../lib/camera-lock';
import { logHint } from '../lib/hints';
import { readOptions, type OptionsForm } from '../lib/options';
import type { DeviceHandle } from './useDevice';
import type { ReporterHandle } from './useReporter';
import type { Runner } from './useRunner';
import type { Route } from '../lib/routing';

export const TEST_PANEL_ID = 'test';

/** What the page suggests once the transport works, per tab. */
const READY_LINE: Readonly<Record<Route, string>> = {
  info: 'transport works — press "Read firmware version" to see what this camera is running',
  preserve: 'transport works — run a step in the preserve wizard when you are ready',
  v4: 'transport works — ready to dump',
  decrypt: 'transport works — this tab does not need the camera',
  slots: 'transport works — press "Read slots" to see the three firmware banks',
};

export interface ConnectionTestParams {
  readonly runner: Runner;
  readonly device: DeviceHandle;
  readonly form: OptionsForm;
  readonly reporter: ReporterHandle;
  readonly route: Route;
}

export interface ConnectionTestApi {
  readonly testing: boolean;
  test: () => Promise<void>;
}

export function useConnectionTest(params: ConnectionTestParams): ConnectionTestApi {
  const { runner, device, form, reporter, route } = params;

  const test = useCallback(async (): Promise<void> => {
    const outcome = await runner.start(TEST_PANEL_ID, async (signal) => {
      let transport: ReturnType<DeviceHandle['makeTransport']> | null = null;
      try {
        const options = readOptions(form);
        transport = device.makeTransport({
          recipient: options.recipient,
          onWarning: (message) => {
            reporter.log(message, 'warn');
          },
        });
        const client = new SeekDevice(transport, { reporter: reporter.reporter, signal });
        await transport.open();
        const info = transport.info;
        reporter.log(
          `opened; recipient=${info.recipient}` +
            (info.claimedInterface ? ' (interface 0 claimed)' : ' (no claim)'),
          'detail',
        );
        const mode = await client.getOperationMode();
        const code = await client.getErrorCode();
        reporter.log(
          `GetOperationMode -> ${mode === null ? 'no data' : hex(mode)}, ` +
            `GetErrorCode -> ${code === null ? 'no data' : hex(code)}`,
          code ? 'warn' : 'ok',
        );
        reporter.log(READY_LINE[route], 'ok');
      } catch (error) {
        /* The likeliest failure here is a claim the browser cannot make,
         * and that one is fixed off the page — by a udev rule, by Zadig, or
         * by quitting whatever else holds the camera. */
        reporter.log(`test failed: ${errorMessage(error)}`, 'error');
        logHint(reporter.log, error);
      } finally {
        if (transport !== null) await transport.close();
      }
    });
    if (outcome === 'in-use-elsewhere') reportInUseElsewhere(reporter);
  }, [device, form, reporter, route, runner]);

  return useMemo(() => ({ testing: runner.active === TEST_PANEL_ID, test }), [runner.active, test]);
}
