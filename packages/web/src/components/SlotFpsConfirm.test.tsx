/**
 * The frame-rate patch's confirmation: what it says (the bank, the rate change, the zip the bank is saved in
 * first, that its decrypted file is the way back, and that a browser cannot see a download reach the disk),
 * and that a bank the camera boots now, or recovery, needs the same tick a write needs before the confirm can
 * be pressed.
 */

import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SlotFpsConfirm, type FpsOffer, type SlotFpsConfirmProps } from './SlotFpsConfirm';
import { buttonByText, render } from '../test-helpers';

const OFFER = {
  status: 'offer',
  patch: { id: 'compact_32k-1.3.0.0-to32' },
  fromHz: 8,
  toHz: 32,
  sites: [{ offset: 0xb964, before: 0x24, after: 0x22 }],
  sumWord: { offset: 0x238, before: 0 },
} as unknown as FpsOffer;

const FREE = { booted: false, recovery: false, bootUnnamed: false };

/** Core's sentence for the backup, as the view passes it (backupPlanText). */
const BACKUP_TEXT =
  'Before anything is written, slot B (as stored, and decrypted) is read again and saved in one zip with ' +
  'a note of what each file is: seek_backup_<time>_SN_v1.3.0.0_bank-B_before-fps-patch.zip.';

function setup(overrides: Partial<SlotFpsConfirmProps> = {}): ReturnType<typeof render> & {
  onConfirm: ReturnType<typeof vi.fn>;
  onCancel: ReturnType<typeof vi.fn>;
} {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const handle = render(
    <SlotFpsConfirm
      open
      slotName="slot B"
      offer={OFFER}
      version="1.3.0.0"
      risk={FREE}
      backupText={BACKUP_TEXT}
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />,
  );
  return { ...handle, onConfirm, onCancel };
}

function dialog(): HTMLElement {
  const node = document.body.querySelector<HTMLElement>('[role="alertdialog"]');
  if (node === null) throw new Error('the confirmation is not open');
  return node;
}

describe('the frame-rate patch confirmation', () => {
  it('states the boot warning beside the confirmation, and does not gate the confirmation by it', () => {
    const { unmount } = setup({
      bootWarning: {
        runs: 'r',
        word: 2,
        idle: ['a'],
        paragraphs: [
          'The camera boots recovery R. The boot-config word is 2, so the bootloader tries recovery R first.',
          'Patch recovery R too (the bank that runs): that is what makes the frame-rate patch take effect.',
        ],
      },
    });
    const text = dialog().textContent;
    expect(text).toContain('The camera boots recovery R.');
    expect(text).toContain('Patch recovery R too (the bank that runs)');
    expect(buttonByText(dialog(), 'Yes — patch slot B').disabled).toBe(false);
    unmount();
  });

  it('says nothing about a boot when no warning is given', () => {
    const { unmount } = setup();
    expect(dialog().textContent).not.toContain('The camera boots');
    unmount();
  });

  it('says the bank, the build, the rate change, and that the rate is untested on hardware', () => {
    const { unmount } = setup();
    const text = dialog().textContent;
    expect(text).toContain('Make slot B run at 32 FPS?');
    expect(text).toContain('holds firmware 1.3.0.0');
    expect(text).toContain('makes its image run at 32 Hz instead of 8 Hz');
    expect(text).toContain('1 byte(s) of the image');
    expect(text).not.toContain('UNTESTED on hardware');
    unmount();
  });

  it('prints the 4.9.1.15 rate as 18, in the title and the body', () => {
    const measured = {
      ...OFFER,
      patch: { id: 'compact_pro-4.9.1.15' },
      fromHz: 9,
      toHz: 18,
    } as unknown as FpsOffer;
    const { unmount } = setup({ slotName: 'slot A', version: '4.9.1.15', offer: measured });
    const text = dialog().textContent;
    expect(text).toContain('Make slot A run at 18 FPS?');
    expect(text).toContain(
      'slot A holds firmware 4.9.1.15, and this makes its image run at 18 Hz instead of 9 Hz.',
    );
    unmount();
  });

  it('says the bank is saved first in one zip download, named, and that its decrypted file is the way back', () => {
    const { unmount } = setup();
    const text = dialog().textContent;
    expect(text).toContain(BACKUP_TEXT);
    expect(text).toContain('The zip is downloaded automatically, before anything is sent.');
    expect(text).toContain('check your downloads folder for it');
    expect(text).toContain(
      'The decrypted file in that zip is the way back: to undo the patch, write it with "Flash decrypted image" on slot B.',
    );
    expect(text).not.toMatch(/choose where|save dialog|There is no restore button/);
    unmount();
  });

  it('asks for the tick on the bank the camera boots, and the confirm stays off until it is ticked', () => {
    const { onConfirm, unmount } = setup({ risk: { ...FREE, booted: true } });
    const box = document.body.querySelector<HTMLInputElement>('#slot-fps-ack');
    expect(box).not.toBeNull();
    expect(buttonByText(document.body, 'Yes — patch slot B').disabled).toBe(true);
    act(() => {
      box?.click();
    });
    act(() => {
      buttonByText(document.body, 'Yes — patch slot B').click();
    });
    expect(onConfirm).toHaveBeenCalledWith(true);
    unmount();
  });

  it('confirms a free bank without the tick, and cancels without sending anything', () => {
    const free = setup();
    expect(document.body.querySelector('#slot-fps-ack')).toBeNull();
    act(() => {
      buttonByText(document.body, 'Yes — patch slot B').click();
    });
    expect(free.onConfirm).toHaveBeenCalledWith(false);
    free.unmount();

    const cancelled = setup();
    act(() => {
      buttonByText(document.body, 'Cancel').click();
    });
    expect(cancelled.onCancel).toHaveBeenCalled();
    expect(cancelled.onConfirm).not.toHaveBeenCalled();
    cancelled.unmount();
  });
});
