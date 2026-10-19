/**
 * The shell: the masthead, the support banner, the five-tab nav and the Connect
 * panel that the camera tabs share — then whichever tab the hash selects.
 *
 * All the state that outlives a tab lives here (the device, the run lock, the
 * options form), so switching tabs mid-run does not disturb anything. The
 * Decrypt File/Slot tab uses no camera, so it shows neither the Connect panel
 * nor the USB support banner.
 */

import { useCallback, useMemo, useState, type ReactElement } from 'react';
import { AppHeader } from './components/AppHeader';
import { ConnectSection } from './components/ConnectSection';
import { Prose } from './components/Prose';
import { SupportBanner } from './components/SupportBanner';
import { useConnectionTest } from './hooks/useConnectionTest';
import { useDevice } from './hooks/useDevice';
import { useDumpPanel } from './hooks/useDumpPanel';
import { useInfoPanel } from './hooks/useInfoPanel';
import { useOfflineDecrypt } from './hooks/useOfflineDecrypt';
import { usePreservePanel } from './hooks/usePreservePanel';
import { useRunner } from './hooks/useRunner';
import { useSlotFileDecrypt } from './hooks/useSlotFileDecrypt';
import { useSlotsPanel } from './hooks/useSlotsPanel';
import { reportInUseElsewhere, withCameraLock } from './lib/camera-lock';
import { DEFAULT_OPTIONS_FORM, type OptionsFailure, type OptionsForm } from './lib/options';
import { useRoute } from './lib/routing';
import { detectSupport, readBrowserEnvironment, type SupportStatus } from './lib/support';
import { DecryptView } from './views/DecryptView';
import { InfoView } from './views/InfoView';
import { PreserveView } from './views/PreserveView';
import { SlotsView } from './views/SlotsView';
import { V4View } from './views/V4View';

export interface AppProps {
  /** Injectable so the render tests can drive every environment. */
  readonly support?: SupportStatus;
}

export function App({ support }: AppProps = {}): ReactElement {
  const route = useRoute();
  const status = useMemo(() => support ?? detectSupport(readBrowserEnvironment()), [support]);

  const device = useDevice();
  const runner = useRunner();
  const [options, setOptions] = useState<OptionsForm>(DEFAULT_OPTIONS_FORM);
  const [optionsFailure, setOptionsFailure] = useState<OptionsFailure | null>(null);

  const onOptionsFailure = useCallback((failure: OptionsFailure | null): void => {
    setOptionsFailure(failure);
  }, []);

  const info = useInfoPanel({ runner, device, form: options });

  /* The 4.x/Nano tab: the camera is asked which family it is, and this tab reads
   * only the modern family. There is no other family to pick. */
  const dump = useDumpPanel({
    id: 'dump',
    runner,
    device,
    form: options,
    profileId: 'modern-4x',
    dirPrefix: 'seek_flash4m_',
    sweepPrefix: 'seek_selectors_',
    onOptionsFailure,
  });

  const preserve = usePreservePanel({ runner, device, form: options });

  const slots = useSlotsPanel({ runner, device, form: options, onOptionsFailure });

  const offline = useOfflineDecrypt({ id: 'offline', runner });
  const slotFile = useSlotFileDecrypt();

  /* The original routed the Connect panel's own log lines into whichever
   * tab's main panel was showing. Same rule — on the wizard, the step that is
   * running, since that is where a mid-run Connect pick belongs. The Decrypt tab
   * has no Connect panel, so it never receives one. */
  const viewReporter =
    route === 'preserve'
      ? preserve.phaseReporters[preserve.activePhase ?? 'read-build']
      : route === 'slots'
        ? slots.reporter
        : route === 'v4'
          ? dump.reporter
          : info.reporter;
  const { testing, test } = useConnectionTest({
    runner,
    device,
    form: options,
    reporter: viewReporter,
    route,
  });

  const onConnect = useCallback((): void => {
    void device.connect().then((outcome) => {
      if (outcome.kind === 'connected') {
        viewReporter.log(`selected ${outcome.description}`, 'ok');
      } else if (outcome.kind === 'cancelled') {
        viewReporter.log('no device chosen', 'detail');
      } else {
        viewReporter.log(`could not open the device chooser: ${outcome.message}`, 'error');
      }
    });
  }, [device, viewReporter]);

  /* Forgetting revokes the grant for every tab of this origin, and Chrome
   * closes the camera in each of them, so a Forget here would pull it from
   * under a run in another tab. It takes the camera lock for the moment it
   * needs, like any operation (lib/camera-lock.ts), and while another tab
   * holds the camera it is refused the same way. */
  const onForget = useCallback((): void => {
    void withCameraLock(() => device.forget()).then((locked) => {
      if (!locked.ran) {
        reportInUseElsewhere(viewReporter);
        return;
      }
      const outcome = locked.value;
      if (outcome.kind === 'failed') viewReporter.log(`forget failed: ${outcome.message}`, 'error');
      else viewReporter.log('device permission revoked', 'detail');
    });
  }, [device, viewReporter]);

  const usesCamera = route !== 'decrypt';

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader route={route} connected={device.device !== null} canUseUsb={status.canUseUsb} />

      <main className="mx-auto w-full max-w-[64rem] space-y-4 px-4 pt-5 pb-20 sm:px-6">
        <Prose className="max-w-[62ch]">
          {route === 'v4' ? (
            <p>
              Makes a read-only copy of the 4&nbsp;MiB SPI flash of a <strong>4.x or Nano</strong>{' '}
              camera over WebUSB and decrypts any firmware images it finds. Everything runs locally
              in your browser — nothing is uploaded anywhere. <strong>Read-only:</strong> this tab
              issues no flash write, erase, upload, commit, or reset command. A camera on another
              firmware line is refused before anything is read.
            </p>
          ) : route === 'preserve' ? (
            <p>
              For <strong>0.x and 1.x</strong> cameras (the 2014 and 2016 builds). Makes a{' '}
              <strong>complete</strong> copy of the camera&apos;s 4&nbsp;MiB flash — including the
              parts a normal dump cannot reach — and then puts the camera back exactly as it was. It
              backs up what it can read, briefly patches the firmware so the rest can be read, dumps
              everything, restores the original and checks it. Everything runs locally in your
              browser. <strong>Two of the steps write to flash</strong>, and each asks you first.
            </p>
          ) : route === 'decrypt' ? (
            <p>
              Decrypts firmware you already have, on this computer: a whole flash dump, or one
              64&nbsp;KiB firmware slot. <strong>No camera is used</strong>, so this works with
              nothing plugged in, and in browsers that have no USB access. The file is read here and
              never uploaded.
            </p>
          ) : route === 'slots' ? (
            <p>
              Reads the camera&apos;s three firmware banks — A, B and the recovery bank R — and
              shows what each holds, which one the camera boots, and what this build can do with it,
              with the device&apos;s running firmware and keys beside them. Everything runs locally
              in your browser. <strong>This tab writes to flash:</strong> it can flash one bank from
              a decrypted image or from raw bytes, and asks before every write.
            </p>
          ) : (
            <p>
              Reads the connected camera the way <code>seek-fw info</code> does: its firmware, the
              family it answers as, how it boots, its keys and every bank. It tells you which of the
              other tabs covers it, and says in plain words what each tab is for.{' '}
              <strong>Nothing is written to flash on this tab.</strong>
            </p>
          )}
        </Prose>

        {usesCamera && <SupportBanner status={status} />}

        {usesCamera && (
          <ConnectSection
            description={device.description}
            connected={device.device !== null}
            canUseUsb={status.canUseUsb}
            canForget={device.canForgetDevice}
            busy={runner.busy}
            testing={testing}
            unlocked={device.unlocked}
            onConnect={onConnect}
            onTest={() => {
              void test();
            }}
            onForget={onForget}
          />
        )}

        {route === 'info' ? (
          <InfoView info={info} connected={device.device !== null} busy={runner.busy} />
        ) : route === 'preserve' ? (
          <PreserveView
            preserve={preserve}
            connected={device.device !== null}
            busy={runner.busy}
            onConnect={onConnect}
          />
        ) : route === 'v4' ? (
          <V4View
            dump={dump}
            connected={device.device !== null}
            busy={runner.busy}
            options={options}
            onOptionsChange={setOptions}
            optionsInvalidField={optionsFailure?.field ?? null}
            optionsErrorMessage={optionsFailure?.message ?? null}
          />
        ) : route === 'decrypt' ? (
          <DecryptView offline={offline} slotFile={slotFile} busy={runner.busy} />
        ) : (
          <SlotsView slots={slots} connected={device.device !== null} busy={runner.busy} />
        )}
      </main>
    </div>
  );
}
