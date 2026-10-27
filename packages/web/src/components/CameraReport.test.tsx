/**
 * The Info tab's report shows the upgrade target warning under the upgrade target row, for both warned cases
 * (TESTING.md 42.50 and 42.67). The warning is information only: the report offers no gate.
 */

import { describe, expect, it } from 'vitest';
import {
  detectedReportOf,
  getProfile,
  keyReportRows,
  lastStartReportOf,
  type DeviceState,
} from '@seek-fw/core';
import { render } from '@/test-helpers';
import { fakeDeviceState } from '../test-fixtures';
import { BLOCK_1_2016, deviceState2016 } from '../test-slots';
import { CameraReport } from './CameraReport';

const WARNING = 'nothing here stops an upgrade';

describe('CameraReport: the upgrade target warning', () => {
  it('shows the recovery warning when the camera runs recovery and its own upgrade writes B', async () => {
    const state = await fakeDeviceState();
    /* 4.8.2.1 under boot word 2: R runs, and B holds the same bootable image as R. */
    const same = 'f96ac57eda75bca2';
    const byKey = new Map(state.byKey);
    byKey.set('b', {
      ...state.byKey.get('b')!,
      present: true,
      blank: false,
      bootability: 'bootable',
      sha256: same,
    });
    byKey.set('r', {
      ...state.byKey.get('r')!,
      present: true,
      blank: false,
      bootability: 'bootable',
      sha256: same,
    });
    const recovery = { ...state, byKey, boot: { booted: 'r', target: 'b' } } as DeviceState;
    const { container, unmount } = render(<CameraReport state={recovery} />);
    expect(container.textContent).toContain('The camera is running its recovery bank');
    expect(container.textContent).toContain(
      'its own upgrade writes Slot B, which it is not running',
    );
    expect(container.textContent).toContain(WARNING);
    unmount();
  });

  it('shows no warning when the upgrade target is the other bank', async () => {
    const state = await fakeDeviceState();
    const otherBank = { ...state, boot: { booted: 'a', target: 'b' } } as DeviceState;
    const { container, unmount } = render(<CameraReport state={otherBank} />);
    expect(container.textContent).not.toContain(WARNING);
    unmount();
  });
});

describe('CameraReport: the active-slot word on 4.9.x (TESTING.md 42.89)', () => {
  it('shows the Last start row on a 4.9.x read, as seek-fw info prints it', async () => {
    const state = await fakeDeviceState();
    const read: DeviceState = {
      ...state,
      profile: getProfile('modern-4x'),
      version: '4.9.1.15',
      activeSlotWord: 2,
    };
    const { container, unmount } = render(<CameraReport state={read} />);
    expect(container.textContent).toContain('Last start');
    expect(container.textContent).toContain(lastStartReportOf(read) ?? 'missing');
    expect(lastStartReportOf(read)).toBe(
      'the camera reports it entered recovery R (active-slot word 2)',
    );
    unmount();
  });

  it('shows none on 4.8.x, whose word is 0 whatever runs', async () => {
    const state = await fakeDeviceState();
    const read: DeviceState = {
      ...state,
      profile: getProfile('modern-4x'),
      version: '4.8.2.1',
      activeSlotWord: 0,
    };
    const { container, unmount } = render(<CameraReport state={read} />);
    expect(container.textContent).not.toContain('Last start');
    unmount();
  });
});

describe('CameraReport on the 2016 Compact PRO (TESTING.md 42.84)', () => {
  it('says the booted bank is the bootloader’s record, and names the next start', async () => {
    const state = deviceState2016(await fakeDeviceState());
    const { container, unmount } = render(<CameraReport state={state} />);
    const text = container.textContent;
    expect(text).toContain(
      'Slot A — the bank the bootloader entered at this start, as it records it',
    );
    /* The word is the Last start row's, in the CLI's words (TESTING.md 42.89). */
    expect(text).toContain('Last start');
    expect(text).toContain('the camera reports it entered slot A (active-slot word 0)');
    expect(text).not.toContain('as it records it (active-slot word');
    expect(text).toContain('Next start');
    expect(text).toContain(
      'Slot A — the boot-config word is 0xFFFFFFFF, so the bootloader tries slot A first, and it holds an image the bootloader accepts',
    );
    expect(text).not.toContain('not a boot record');
    /* The Firmware family panel's score is the one taken after the read, and says so (TESTING.md 42.86). */
    expect(text).toContain(detectedReportOf(state.detection));
    expect(detectedReportOf(state.detection)).toMatch(
      /^.+ \(score \d\.\d\d after the read, from the evidence below(; ambiguous)?\)$/,
    );
    /* The profile in words, never its code name (TESTING.md 42.103): the code name is in --json only. */
    expect(detectedReportOf(state.detection).startsWith(state.detection.best.profile.name)).toBe(
      true,
    );
    expect(text).not.toContain(`${state.profile.id} —`);
    unmount();
  });

  it('names the check key, says the key table is refused, and says the store key is the check key', async () => {
    const state = deviceState2016(await fakeDeviceState());
    const { container, unmount } = render(<CameraReport state={state} />);
    const text = container.textContent;
    expect(text).toContain('Check key');
    expect(text).toContain(
      `key block 1 ${BLOCK_1_2016} (the Compact PRO 1.0.3.x 9 Hz pair's block 1), named from slot A, the bank the camera reports it entered after the bootloader's check`,
    );
    expect(text).toContain(
      'not read — the bootloader block (0x14000000) is refused on every channel on this line',
    );
    expect(text).toContain(
      'key block 1: the application stores every bank it writes under the key its bootloader checks',
    );
    /* The page's rows are core's rows, labelled with a capital: the CLI prints the same words. */
    for (const [label, value] of keyReportRows(state)) {
      expect(text).toContain(label.charAt(0).toUpperCase() + label.slice(1));
      expect(text).toContain(value);
    }
    expect(text).not.toContain('Key A');
    expect(text).not.toContain('candidate(s), none confirmed');
    unmount();
  });

  it('says the banks are written one at a time, with no whole-image gate and no "flashing disabled"', async () => {
    const state = deviceState2016(await fakeDeviceState());
    const { container, unmount } = render(<CameraReport state={state} />);
    const text = container.textContent;
    expect(text).toContain(
      "One bank at a time: the Slots tab writes or patches one bank of this camera, each bank staged under its image's own key block 0, and each write asks first.",
    );
    expect(text).not.toContain('whole-image');
    expect(text).not.toContain('flashing disabled');
    expect(text).not.toContain('does not support flashing');
    expect(text).not.toContain('key table could not be confirmed');
    expect(text).not.toContain('The Slots tab refuses every bank');
    unmount();
  });

  it('lists a reason that refuses every bank for the slot writer, and only that one', async () => {
    const base = deviceState2016(await fakeDeviceState());
    const refused: DeviceState = {
      ...base,
      bankWriteRefusals: ['no slot decrypts to the 0x00000000 acceptance sum'],
    };
    const { container, unmount } = render(<CameraReport state={refused} />);
    const text = container.textContent;
    expect(text).toContain('The Slots tab refuses every bank of this camera:');
    expect(text).toContain('no slot decrypts to the 0x00000000 acceptance sum');
    expect(text).not.toContain('does not support flashing');
    unmount();
  });

  it('says the check key is inferred, as the CLI does, when it was named from a bank entered unchecked', async () => {
    const base = deviceState2016(await fakeDeviceState());
    const checkKey = base.checkKey;
    if (checkKey == null) throw new Error('the fixture names a check key');
    const state: DeviceState = { ...base, checkKey: { ...checkKey, from: 'r', inferred: true } };
    const { container, unmount } = render(<CameraReport state={state} />);
    const text = container.textContent;
    expect(text).toContain(
      'inferred from recovery R, the bank the camera reports it entered: the bootloader enters that bank ' +
        'without its check, and runs it under the key it checks the other banks under',
    );
    for (const [, value] of keyReportRows(state)) expect(text).toContain(value);
    unmount();
  });

  it('says why, when the camera does not say which bank it entered', async () => {
    const state = deviceState2016(await fakeDeviceState(), { checkKeyNamed: false });
    const { container, unmount } = render(<CameraReport state={state} />);
    const text = container.textContent;
    expect(text).toContain(
      "not named — the camera's active-slot word (fw info roots, selector 10) could not be read",
    );
    expect(text).toContain(
      'not known — the boot-config word is 0xFFFFFFFF, so the bootloader tries slot A first, but slot A could not be checked: the key its bootloader checks a bank under was not named, so the bank that runs is not known',
    );
    unmount();
  });
});
