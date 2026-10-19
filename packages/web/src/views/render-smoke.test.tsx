/**
 * One render test per tab view: the controls are on the page, they are real
 * controls, and what each one says about the camera is what the page knows.
 *
 * The views are rendered from stubs of their hook APIs, so each test states the
 * state it wants and nothing else. The hooks themselves are tested in hooks/.
 */

import { describe, expect, it } from 'vitest';
import { DecryptView } from './DecryptView';
import { InfoView } from './InfoView';
import { V4View } from './V4View';
import type { DumpPanelApi } from '@/hooks/useDumpPanel';
import type { InfoPanelApi, InfoReading } from '@/hooks/useInfoPanel';
import type { OfflineDecryptApi } from '@/hooks/useOfflineDecrypt';
import type { SlotFileApi } from '@/hooks/useSlotFileDecrypt';
import { useReporter, type ReporterHandle } from '@/hooks/useReporter';
import { DEFAULT_OPTIONS_FORM } from '@/lib/options';
import { detectProfile, getProfile, identityGate } from '@seek-fw/core';
import type { SlotFileDecryption } from '@seek-fw/core';
import { buttonByText, render, renderHook } from '@/test-helpers';

function reporters(count: number): readonly ReporterHandle[] {
  const { result } = renderHook(() => Array.from({ length: count }, () => useReporter()));
  return result.current;
}

function dumpStub(
  reporter: ReporterHandle,
  identity: Pick<DumpPanelApi, 'acting' | 'refusal'> = { acting: null, refusal: null },
  unlockNote = false,
): DumpPanelApi {
  return {
    reporter,
    running: false,
    ...identity,
    unlockNote,
    start: () => Promise.resolve(),
    cancel: () => undefined,
  };
}

function infoStub(reporter: ReporterHandle, result: InfoReading | null = null): InfoPanelApi {
  return {
    reporter,
    reading: false,
    result,
    read: () => Promise.resolve(),
    cancel: () => undefined,
  };
}

function offlineStub(reporter: ReporterHandle): OfflineDecryptApi {
  return {
    reporter,
    running: false,
    detection: null,
    decryptFile: () => Promise.resolve(),
    cancel: () => undefined,
  };
}

function slotFileStub(overrides: Partial<SlotFileApi> = {}): SlotFileApi {
  return {
    busy: false,
    file: null,
    result: null,
    refusal: null,
    inputSha256: null,
    readError: null,
    downloadName: null,
    decrypt: () => Promise.resolve(),
    download: () => undefined,
    ...overrides,
  };
}

function renderV4(dump: DumpPanelApi, connected = false) {
  return render(
    <V4View
      dump={dump}
      connected={connected}
      busy={false}
      options={DEFAULT_OPTIONS_FORM}
      onOptionsChange={() => undefined}
      optionsInvalidField={null}
      optionsErrorMessage={null}
    />,
  );
}

describe('V4View', () => {
  it('shows the unlock note after a dump that sent the token, and no note otherwise', () => {
    const [a, b] = reporters(2);
    const quiet = renderV4(dumpStub(a!), true);
    expect(quiet.container.textContent).not.toContain('stays unlocked');
    quiet.unmount();

    const { container, unmount } = renderV4(dumpStub(b!, undefined, true), true);
    const note = [...container.querySelectorAll('[data-slot="alert"]')].find((el) =>
      el.textContent.includes('stays unlocked'),
    );
    expect(note?.textContent).toContain('the camera stays unlocked until a power cycle');
    expect(note?.textContent).toContain('power-cycle it before you use them');
    /* information only: the dump can still be started */
    expect(buttonByText(container, 'Start dump').disabled).toBe(false);
    unmount();
  });

  it('puts Start dump on the page, and Dump all selectors inside Options', () => {
    const [a] = reporters(1);
    const { container, unmount } = renderV4(dumpStub(a!));

    expect(buttonByText(container, 'Start dump').disabled).toBe(true);
    const sweep = buttonByText(container, 'Dump all selectors (0x00–0xFF)');
    expect(sweep.disabled).toBe(true);
    const spoiler = sweep.closest('details');
    expect(spoiler?.querySelector('summary')?.textContent).toContain('Options');

    for (const id of [
      'optChunk',
      'optGapFill',
      'optRetries',
      'optRetryDelay',
      'optRecipient',
      'optDecrypt',
    ]) {
      expect(container.querySelector(`#${id}`), id).toBeTruthy();
      expect(container.querySelector(`label[for="${id}"]`), `label for ${id}`).toBeTruthy();
    }
    /* One run, one console. */
    expect(container.querySelectorAll('[role="progressbar"]').length).toBe(1);
    /* Nothing is asked yet, so nothing is claimed about the camera. */
    expect(container.textContent).not.toContain('Detected camera');
    expect(container.querySelector('[role="alert"]')).toBeNull();
    unmount();
  });

  it('has no family selector and no hand-picked dump', () => {
    const [a] = reporters(1);
    const { container, unmount } = renderV4(dumpStub(a!), true);
    expect(container.querySelector('#manualProfile')).toBeNull();
    expect(container.textContent).not.toContain('Dump as this family');
    expect(container.textContent).not.toContain('Choose the firmware family yourself');
    unmount();
  });

  it('puts a refusal in front of the user, with the reason and what to do', () => {
    const [a] = reporters(1);
    const { container, unmount } = renderV4(
      dumpStub(a!, {
        acting: null,
        refusal: {
          code: 'profile/unsupported',
          message:
            'The camera looks like Legacy locked firmware (legacy-auth), not a 4.x/Nano camera, ' +
            'and this tab reads only 4.x/Nano. Nothing was read.',
          hint: 'Nothing was read or written.',
        },
      }),
    );
    const alert = container.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Not read: this camera cannot be read this way.');
    expect(alert?.textContent).toContain('not a 4.x/Nano camera');
    expect(alert?.textContent).toContain('Nothing was read or written.');
    unmount();
  });

  it('shows what the camera said it is once it has been asked', () => {
    const [a] = reporters(1);
    const detection = detectProfile({
      firmwareVersion: '4.18.2.0',
      plainSelectorRefused: false,
    });
    const { container, unmount } = renderV4(
      dumpStub(a!, {
        refusal: null,
        acting: {
          profile: getProfile('modern-4x'),
          detection,
          firmwareVersion: '4.18.2.0',
          buildString: 'Feb 13 2020',
        },
      }),
      true,
    );
    expect(container.textContent).toContain('Detected camera');
    expect(container.textContent).toContain('4.18.2.0');
    expect(container.textContent).toContain(getProfile('modern-4x').name);
    unmount();
  });
});

describe('InfoView', () => {
  it('reads the version only with a camera, and says so without one', () => {
    const [a] = reporters(1);
    const off = render(<InfoView info={infoStub(a!)} connected={false} busy={false} />);
    expect(buttonByText(off.container, 'Read firmware version').disabled).toBe(true);
    expect(off.container.textContent).toContain('Connect the camera above first');
    off.unmount();

    const on = render(<InfoView info={infoStub(a!)} connected busy={false} />);
    expect(buttonByText(on.container, 'Read firmware version').disabled).toBe(false);
    expect(buttonByText(on.container, 'Cancel').disabled).toBe(true);
    on.unmount();
  });

  it('names the line and the tab for a 4.x camera', () => {
    const [a] = reporters(1);
    const { container, unmount } = render(
      <InfoView
        info={infoStub(a!, {
          version: '4.18.2.0',
          buildString: 'Feb 13 2020',
          gate: identityGate({ version: '4.18.2.0', buildString: 'Feb 13 2020', note: '' }),
        })}
        connected
        busy={false}
      />,
    );
    const panel = container.textContent;
    expect(panel).toContain('What the camera reports');
    expect(panel).toContain('4.18.2.0');
    expect(panel).toContain('4.x / Nano');
    expect(panel).toContain('Dump & decrypt 4.x/Nano');
    expect(container.querySelector('a[href="#/v4"]')).toBeTruthy();
    unmount();
  });

  it('names the 0.x/1.x tab for a 2016 camera', () => {
    const [a] = reporters(1);
    const { container, unmount } = render(
      <InfoView
        info={infoStub(a!, {
          version: '1.0.3.0',
          buildString: 'Jul  6 2016 17:04:49',
          gate: identityGate({ version: '1.0.3.0', buildString: null, note: '' }),
        })}
        connected
        busy={false}
      />,
    );
    expect(container.textContent).toContain('0.x / 1.x: the 2014 and 2016 cameras');
    expect(container.querySelector('a[href="#/preserve"]')).toBeTruthy();
    unmount();
  });

  it('says what no tab will do, for a build older than 0.8.0.0', () => {
    const [a] = reporters(1);
    const { container, unmount } = render(
      <InfoView
        info={infoStub(a!, {
          version: '0.3.0.1',
          buildString: null,
          gate: identityGate({ version: '0.3.0.1', buildString: null, note: '' }),
        })}
        connected
        busy={false}
      />,
    );
    expect(container.textContent).toContain('No tab reads this build.');
    expect(container.textContent).toContain('0.3.0.1');
    unmount();
  });

  it('says so when the camera did not report a version', () => {
    const [a] = reporters(1);
    const { container, unmount } = render(
      <InfoView
        info={infoStub(a!, {
          version: null,
          buildString: null,
          gate: identityGate({ version: null, buildString: null, note: 'no answer' }),
        })}
        connected
        busy={false}
      />,
    );
    expect(container.textContent).toContain('The camera did not report its firmware version.');
    unmount();
  });
});

describe('DecryptView', () => {
  function renderDecrypt(slotFile: SlotFileApi, busy = false) {
    const [a] = reporters(1);
    return render(<DecryptView offline={offlineStub(a!)} slotFile={slotFile} busy={busy} />);
  }

  it('offers both file pickers with no camera, and no camera control at all', () => {
    const { container, unmount } = renderDecrypt(slotFileStub());
    expect(buttonByText(container, 'Choose dump file…').disabled).toBe(false);
    expect(buttonByText(container, 'Choose slot file…').disabled).toBe(false);
    expect(container.textContent).not.toContain('Read firmware version');
    expect(container.textContent).not.toContain('Connect device');
    unmount();
  });

  it('holds the pickers while a camera run is busy', () => {
    const { container, unmount } = renderDecrypt(slotFileStub(), true);
    expect(buttonByText(container, 'Choose slot file…').disabled).toBe(true);
    unmount();
  });

  it('shows a refusal with its reason, and nothing to download', () => {
    const { container, unmount } = renderDecrypt(
      slotFileStub({
        file: { name: 'short.bin', size: 100 },
        refusal: 'a firmware bank is 65536 B (64 KiB); this file is 100 B',
        inputSha256: 'c'.repeat(64),
      }),
    );
    expect(container.textContent).toContain('Not decrypted: short.bin is not a firmware slot');
    expect(container.textContent).toContain('this file is 100 B');
    expect(container.textContent).not.toContain('Download');
    unmount();
  });

  it('shows an erased bank as empty, not as a failure', () => {
    const { container, unmount } = renderDecrypt(
      slotFileStub({
        file: { name: 'bank-B.bin', size: 65536 },
        result: {
          status: 'empty',
          notes: ['empty, nothing to decrypt: all 65536 B read as 0xFF (an erased bank)'],
        } as unknown as SlotFileDecryption,
      }),
    );
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(container.textContent).toContain('bank-B.bin is an erased bank.');
    unmount();
  });

  it('shows the decrypted image with its key, size and SHA-256, and offers the download', () => {
    const decrypted = {
      status: 'decrypted',
      plain: new Uint8Array(0x8000),
      plainSha256: 'd'.repeat(64),
      header: { version: '4.18.2.0' },
      profile: { id: 'modern', name: 'Compact Pro 4.x', detected: true },
      key: {
        method: 'cryptanalytic',
        key: '00112233445566778899aabbccddeeff',
        whiteningK: 0x13579bdf,
        whiteningEvidence: 'plaintext',
        acceptanceSum: 0xffff,
        matchesProfile: true,
        named: null,
      },
      notes: ['decrypted 32768 B under the key solved from this bank'],
    } as unknown as SlotFileDecryption;
    const { container, unmount } = renderDecrypt(
      slotFileStub({
        file: { name: 'bank-A.bin', size: 65536 },
        result: decrypted,
        inputSha256: 'e'.repeat(64),
        downloadName: 'bank-A_decrypted.bin',
      }),
    );
    const text = container.textContent;
    expect(text).toContain('Decrypted firmware slot');
    expect(text).toContain('00112233445566778899aabbccddeeff');
    expect(text).toContain('0x13579bdf');
    expect(text).toContain('32,768 B');
    expect(text).toContain('d'.repeat(64));
    expect(text).toContain('e'.repeat(64));
    expect(text).toContain('0x0000ffff');
    expect(text).toContain('Compact Pro 4.x');
    expect(buttonByText(container, 'Download bank-A_decrypted.bin')).toBeTruthy();
    unmount();
  });

  it('says a read failure is not a refusal', () => {
    const { container, unmount } = renderDecrypt(
      slotFileStub({ file: { name: 'gone.bin', size: 0 }, readError: 'NotReadableError' }),
    );
    expect(container.textContent).toContain('The file could not be read.');
    unmount();
  });
});
