/**
 * The slot page's confirmation. Same bar as the flash view's: a real modal, the
 * original's words, Cancel first, one deliberate press. The one addition is the
 * checkbox a booted or recovery bank needs, which must be ticked before the
 * confirm can be pressed, and which is what goes to the write.
 */

import { act, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SlotWriteConfirm, type SlotWriteConfirmProps } from './SlotWriteConfirm';
import { buttonByText, render } from '../test-helpers';

function setup(overrides: Partial<Pick<SlotWriteConfirmProps, 'risk' | 'open'>> = {}): ReturnType<
  typeof render
> & {
  onConfirm: ReturnType<typeof vi.fn>;
  onCancel: ReturnType<typeof vi.fn>;
} {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const handle = render(
    <SlotWriteConfirm
      open={overrides.open ?? true}
      fileName="fw_decrypted.bin"
      slotName="slot B"
      slotAddress="0x14060000"
      risk={overrides.risk ?? { booted: false, recovery: false }}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );
  return { ...handle, onConfirm, onCancel };
}

function dialog(): HTMLElement {
  const node = document.body.querySelector<HTMLElement>('[role="alertdialog"]');
  if (node === null) throw new Error('no alert dialog is open');
  return node;
}

function checkbox(): HTMLInputElement | null {
  return document.body.querySelector<HTMLInputElement>('#slot-write-ack');
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SlotWriteConfirm', () => {
  it('states the write in the same words as the flash view, and names the bank', () => {
    const { unmount } = setup();
    const node = dialog();
    expect(node.textContent).toContain('Write fw_decrypted.bin to slot B at 0x14060000?');
    expect(node.textContent).toContain(
      "This erases a 64 KiB block of the camera's flash and programs it at slot B.",
    );
    expect(node.textContent).toContain(
      'If the image does not run, the camera cannot be recovered over USB — only with SWD/J-Link or an SPI programmer.',
    );
    expect(node.textContent).toContain('No reset is sent.');
    unmount();
  });

  it('asks for no checkbox on a standby bank, and confirms with one press', () => {
    const { onConfirm, onCancel, unmount } = setup();
    expect(checkbox()).toBeNull();
    act(() => {
      buttonByText(document.body, 'Yes — write to slot B').click();
    });
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith(false);
    expect(onCancel).not.toHaveBeenCalled();
    unmount();
  });

  it('lands focus on Cancel, never on the confirm', () => {
    const { unmount } = setup();
    expect(document.activeElement).toBe(buttonByText(document.body, 'Cancel'));
    expect(document.activeElement).not.toBe(buttonByText(document.body, 'Yes — write to slot B'));
    unmount();
  });

  it('backs out on Escape and on Cancel without writing', () => {
    const first = setup();
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(first.onCancel).toHaveBeenCalledTimes(1);
    expect(first.onConfirm).not.toHaveBeenCalled();
    first.unmount();

    const second = setup();
    act(() => {
      buttonByText(document.body, 'Cancel').click();
    });
    expect(second.onCancel).toHaveBeenCalledTimes(1);
    expect(second.onConfirm).not.toHaveBeenCalled();
    second.unmount();
  });

  it('keeps the confirm off until the booted-bank checkbox is ticked', () => {
    const { onConfirm, unmount } = setup({ risk: { booted: true, recovery: false } });
    const confirm = buttonByText(document.body, 'Yes — write to slot B');
    expect(confirm.disabled).toBe(true);
    expect(dialog().textContent).toContain('slot B is the bank this camera boots now.');

    act(() => {
      checkbox()?.click();
    });
    expect(buttonByText(document.body, 'Yes — write to slot B').disabled).toBe(false);

    act(() => {
      buttonByText(document.body, 'Yes — write to slot B').click();
    });
    expect(onConfirm).toHaveBeenCalledWith(true);
    unmount();
  });

  it('asks the same tick for the recovery bank, with its own words', () => {
    const { unmount } = setup({ risk: { booted: false, recovery: true } });
    expect(dialog().textContent).toContain('the last-resort copy the bootloader falls back to');
    expect(checkbox()).not.toBeNull();
    expect(buttonByText(document.body, 'Yes — write to slot B').disabled).toBe(true);
    unmount();
  });

  it('clears the tick on the way out, so the next write asks again', () => {
    /* The page keeps this dialog mounted and only toggles `open`, so the tick
     * has to be reset by the dialog itself, not by a fresh mount. */
    const onConfirm = vi.fn();
    function Harness(): ReturnType<typeof SlotWriteConfirm> {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
            }}
          >
            reopen
          </button>
          <SlotWriteConfirm
            open={open}
            fileName="fw_decrypted.bin"
            slotName="slot B"
            slotAddress="0x14060000"
            risk={{ booted: true, recovery: false }}
            onConfirm={(acknowledged) => {
              onConfirm(acknowledged);
              setOpen(false);
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />
        </>
      );
    }
    const { container, unmount } = render(<Harness />);
    act(() => {
      checkbox()?.click();
    });
    act(() => {
      buttonByText(document.body, 'Yes — write to slot B').click();
    });
    expect(onConfirm).toHaveBeenCalledWith(true);

    act(() => {
      buttonByText(container, 'reopen').click();
    });
    expect(buttonByText(document.body, 'Yes — write to slot B').disabled).toBe(true);
    expect(checkbox()?.checked).toBe(false);
    unmount();
  });

  it('stays out of the document until it is opened', () => {
    const { unmount } = setup({ open: false });
    expect(document.body.querySelector('[role="alertdialog"]')).toBeNull();
    unmount();
  });
});
